const Service = require("../models/Service.js");
const Order = require("../models/Order.js");
const Category = require("../models/Category.js");
const {
  buildPreferenceSummary,
  getGuestPreferenceSummary,
  getOwnerKey,
  getPreferenceDoc,
} = require("./behaviorService.js");
const {
  buildFilterKey,
  getRecommendationCache,
  saveRecommendationCache,
} = require("./recommendationCacheService.js");
const {
  getLatestRecommendationTrendSnapshot,
  getTrendSnapshotBoost,
} = require("./recommendationTrendService.js");
const mongoose = require("mongoose");
const {
  getSeasonFromMonth,
  isHolidayLike,
  normalizeTagList,
  normalizeText,
} = require("../utils/seasonHelper.js");

const FINAL_LIMIT = 5;
const AI_RERANK_CANDIDATE_LIMIT = 20;
const AI_RERANK_BONUS_MAX = 20;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_BASE_URL =
  process.env.GEMINI_BASE_URL ||
  "https://generativelanguage.googleapis.com/v1beta";

// Giảm sức ảnh hưởng của hành vi cũ để hành vi gần đây được ưu tiên hơn.
const getSignalRecencyMultiplier = (createdAt) => {
  if (!createdAt) {
    return 1;
  }

  const ageInDays = Math.max(
    0,
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (ageInDays <= 7) return 1;
  if (ageInDays <= 30) return 0.8;
  if (ageInDays <= 90) return 0.55;
  return 0.35;
};

const SEASON_KEYWORDS = {
  summer: [
    "beach",
    "sea",
    "island",
    "dao",
    "đảo",
    "bien",
    "biển",
    "resort",
    "relax",
    "relaxation",
    "snorkeling",
    "phu quoc",
    "nha trang",
    "da nang",
    "vung tau",
    "halong",
    "ha long",
  ],
  winter: [
    "dalat",
    "da lat",
    "sapa",
    "mountain",
    "hill",
    "highland",
    "cold",
    "resort",
    "luxury",
    "retreat",
    "nui",
    "núi",
  ],
  autumn: ["peaceful", "mist", "nature", "eco", "trek", "forest"],
  rainy: ["indoor", "spa", "resort", "wellness", "hot spring", "museum"],
};

// Suy ra nhãn thời tiết mặc định theo mùa hiện tại.
const getCurrentWeatherTagFromSeason = (season) => {
  if (season === "summer") return "hot";
  if (season === "winter") return "cool";
  if (season === "autumn") return "all";
  return "all";
};

// Chuẩn hóa text thành key ngắn gọn để so khớp preference.
const normalizePreferenceKey = (value) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "unknown";

// Lấy ra các preference có điểm cao nhất từ map/object.
const getTopPreferenceKeys = (mapValue, limit = 3) => {
  if (!mapValue) return [];

  const entries =
    mapValue instanceof Map
      ? Array.from(mapValue.entries())
      : Object.entries(mapValue);

  return entries
    .map(([key, score]) => ({
      key,
      score: Number(score || 0),
    }))
    .filter((item) => item.key && item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// Kiểm tra tour có hợp mùa hay không dựa trên seasonTags.
const matchesSeasonTag = (serviceTags, season) => {
  if (!Array.isArray(serviceTags) || !season || season === "all") {
    return false;
  }

  if (season === "autumn") {
    return serviceTags.includes("autumn") || serviceTags.includes("rainy");
  }

  if (season === "rainy") {
    return serviceTags.includes("rainy") || serviceTags.includes("autumn");
  }

  return serviceTags.includes(season);
};

// Tính điểm nền từ featured, rating, review, view và booking.
const buildBaseScore = (serviceObject, bookingCount) => {
  const featuredScore = serviceObject.featured ? 65 : 0;
  const ratingScore = Number(serviceObject.rating || 0) * 20;
  const reviewScore = Number(serviceObject.reviewCount || 0) * 3;
  const viewScore = Number(serviceObject.viewCount || 0) * 0.5;
  const bookingScore = Number(bookingCount || 0) * 4;

  return featuredScore + ratingScore + reviewScore + viewScore + bookingScore;
};

// Tính điểm khớp theo bộ lọc người dùng chọn.
const buildFilterScore = (serviceObject, context) => {
  const categoryFilter = normalizeText(context.category);
  const locationFilter = normalizeText(context.location);
  const budgetRange = normalizeText(context.budgetRange);
  const season = normalizeText(context.season);
  const weatherTag = normalizeText(context.weatherTag);
  const categoryName = normalizeText(serviceObject?.category?.categoryName);
  const categorySlug = normalizeText(serviceObject?.category?.slug);
  const serviceLocation = normalizeText(serviceObject.location);
  const serviceBudget = normalizeText(serviceObject.budgetRange);
  const seasonTags = normalizeTagList(serviceObject.seasonTags);
  const weatherTags = normalizeTagList(serviceObject.weatherTags);

  let score = 0;

  if (categoryFilter) {
    if (
      categoryName.includes(categoryFilter) ||
      categorySlug.includes(categoryFilter)
    ) {
      score += 18;
    }
  }

  if (locationFilter && serviceLocation.includes(locationFilter)) {
    score += 10;
  }

  if (budgetRange && serviceBudget === budgetRange) {
    score += 8;
  }

  if (season && matchesSeasonTag(seasonTags, season)) {
    score += 8;
  }

  if (weatherTag && weatherTag !== "all" && weatherTags.includes(weatherTag)) {
    score += 8;
  }

  return score;
};

// Tính điểm xu hướng theo lượt book/view/review và độ mới của tour.
const buildTrendScore = (serviceObject, bookingCount, trendSnapshot = null) => {
  const bookingBoost = Math.min(18, Math.log1p(Number(bookingCount || 0)) * 6);
  const viewBoost = Math.min(
    12,
    Math.log1p(Number(serviceObject.viewCount || 0)) * 2.5,
  );
  const reviewBoost = Math.min(
    10,
    Math.log1p(Number(serviceObject.reviewCount || 0)) * 3,
  );
  const ratingBoost = Number(serviceObject.rating || 0) >= 4 ? 6 : 0;
  const featuredBoost = serviceObject.featured ? 4 : 0;
  const recencyBoost = (() => {
    const createdAt = new Date(serviceObject.createdAt || 0).getTime();
    const ageInDays = Math.max(
      1,
      (Date.now() - createdAt) / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, 8 - Math.min(8, ageInDays / 14));
  })();

  const baseTrend =
    bookingBoost +
    viewBoost +
    reviewBoost +
    ratingBoost +
    featuredBoost +
    recencyBoost;
  const snapshotBoost = getTrendSnapshotBoost(trendSnapshot, serviceObject);

  return baseTrend + snapshotBoost;
};

// Tính điểm theo mùa và thời tiết hiện tại.
const buildSeasonalScore = (serviceObject, context) => {
  const season = normalizeText(context.season);
  const weatherTag = normalizeText(context.weatherTag);
  const month = Number(context.month || 0);
  const seasonTags = normalizeTagList(serviceObject.seasonTags);
  const weatherTags = normalizeTagList(serviceObject.weatherTags);
  const bestMonths = Array.isArray(serviceObject.bestMonths)
    ? serviceObject.bestMonths
    : [];
  const serviceText = normalizeText(
    [
      serviceObject.serviceName,
      serviceObject.location,
      serviceObject?.category?.categoryName,
      serviceObject?.category?.slug,
      serviceObject.description,
      serviceObject.seasonTags?.join(" "),
      serviceObject.weatherTags?.join(" "),
    ]
      .filter(Boolean)
      .join(" "),
  );

  let score = 0;

  if (season && matchesSeasonTag(seasonTags, season)) {
    score += 12;
  }

  if (weatherTag && weatherTag !== "all" && weatherTags.includes(weatherTag)) {
    score += 8;
  }

  if (month && bestMonths.includes(month)) {
    score += 6;
  }

  if (season === "summer") {
    if (SEASON_KEYWORDS.summer.some((keyword) => serviceText.includes(keyword))) {
      score += 8;
    }
  }

  if (season === "winter") {
    if (SEASON_KEYWORDS.winter.some((keyword) => serviceText.includes(keyword))) {
      score += 8;
    }
  }

  if (season === "autumn") {
    if (SEASON_KEYWORDS.autumn.some((keyword) => serviceText.includes(keyword))) {
      score += 5;
    }
  }

  if (season === "rainy") {
    if (SEASON_KEYWORDS.rainy.some((keyword) => serviceText.includes(keyword))) {
      score += 5;
    }
  }

  return score;
};

// Tính điểm cá nhân hóa dựa trên lịch sử hành vi của user/guest.
const buildPersonalPreferenceScore = (serviceObject, context) => {
  const preference = context.preference || {};
  const strength = getPreferenceStrength(preference);
  if (strength <= 0) {
    return 0;
  }

  const preferenceCategoryKeys = (preference.topCategories || []).map((item) =>
    normalizePreferenceKey(item.key),
  );
  const preferenceLocationKeys = (preference.topLocations || []).map((item) =>
    normalizePreferenceKey(item.key),
  );
  const preferenceBudgetKeys = (preference.topBudgets || []).map((item) =>
    normalizePreferenceKey(item.key),
  );
  const preferenceSeasonKeys = (preference.topSeasons || []).map((item) =>
    normalizePreferenceKey(item.key),
  );

  const serviceCategoryKey = normalizePreferenceKey(
    serviceObject?.category?.categoryName || serviceObject?.category?.slug,
  );
  const serviceLocationKey = normalizePreferenceKey(serviceObject.location);
  const serviceBudgetKey = normalizePreferenceKey(serviceObject.budgetRange);
  const serviceSeasonTags = normalizeTagList(serviceObject.seasonTags);
  const serviceCategoryNameKey = normalizePreferenceKey(
    serviceObject?.category?.categoryName || "",
  );

  let score = 0;

  const categoryRank = preferenceCategoryKeys.indexOf(serviceCategoryKey);
  if (categoryRank >= 0) {
    score += (60 - categoryRank * 12) * strength;
    if (categoryRank === 0) {
      score += 10 * strength;
    }
  }

  const locationRank = preferenceLocationKeys.indexOf(serviceLocationKey);
  if (locationRank >= 0) {
    score += (24 - locationRank * 6) * strength;
  }

  const budgetRank = preferenceBudgetKeys.indexOf(serviceBudgetKey);
  if (budgetRank >= 0) {
    score += (18 - budgetRank * 4) * strength;
  }

  if (preferenceSeasonKeys.some((key) => serviceSeasonTags.includes(key))) {
    score += 12 * strength;
  }

  const recentSignals = Array.isArray(preference.recentSignals)
    ? preference.recentSignals
    : [];
  const recentMatchScore = recentSignals.reduce((accumulator, signal) => {
    const signalCategory = normalizePreferenceKey(signal?.category);
    const signalLocation = normalizePreferenceKey(signal?.location);
    const signalBudget = normalizePreferenceKey(signal?.budgetRange);
    const signalSeason = normalizePreferenceKey(signal?.season);
    const recencyMultiplier = getSignalRecencyMultiplier(signal?.createdAt);
    const actionMultiplier =
      signal?.actionType === "book"
        ? 4
        : signal?.actionType === "rating"
          ? 3.5
          : signal?.actionType === "favorite"
            ? 2.5
            : signal?.actionType === "search"
              ? 1.8
              : 1;

    if (signalCategory === serviceCategoryKey || signalCategory === serviceCategoryNameKey) {
      return accumulator + recencyMultiplier * actionMultiplier;
    }

    if (signalLocation === serviceLocationKey) {
      return accumulator + recencyMultiplier * (actionMultiplier * 0.8);
    }

    if (signalBudget === serviceBudgetKey) {
      return accumulator + recencyMultiplier * (actionMultiplier * 0.6);
    }

    if (signalSeason && serviceSeasonTags.includes(signalSeason)) {
      return accumulator + recencyMultiplier * (actionMultiplier * 0.7);
    }

    return accumulator;
  }, 0);

  if (recentMatchScore > 0) {
    score += Math.min(30, recentMatchScore * 3.5) * strength;
  }

  const actionCounts = preference.actionCounts || {};
  const interactionBoost = Math.min(
    22,
    Number(actionCounts.view || 0) * 0.12 +
      Number(actionCounts.search || 0) * 0.3 +
      Number(actionCounts.favorite || 0) * 0.32 +
      Number(actionCounts.book || 0) * 0.42 +
      Number(actionCounts.rating || 0) * 0.35,
  );

  score += interactionBoost * strength;

  return score;
};

// Gom số lượt booking theo từng service để dùng khi xếp hạng.
const buildBookingCountMap = async () => {
  const counts = await Order.aggregate([
    {
      $group: {
        _id: "$serviceId",
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    counts.map((item) => [String(item._id), Number(item.count || 0)]),
  );
};

// Chuyển category nhập vào thành ObjectId nếu cần.
const resolveCategoryFilter = async (categoryInput) => {
  const normalized = normalizeText(categoryInput);
  if (!normalized) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(categoryInput)) {
    return categoryInput;
  }

  const categoryDoc = await Category.findOne({
    $or: [
      { slug: normalized },
      { categoryName: categoryInput },
      { categoryName: { $regex: `^${categoryInput}$`, $options: "i" } },
      { slug: { $regex: `^${normalized}$`, $options: "i" } },
    ],
  }).select("_id");

  return categoryDoc?._id || null;
};

// Đo mức độ đủ dữ liệu của hồ sơ hành vi.
const getPreferenceStrength = (preference) => {
  const total = Number(preference?.actionCounts?.total || 0);
  if (total < 3) {
    return 0;
  }

  return Math.min(1.5, 0.75 + total / 20);
};

// Bỏ các metadata tạm trước khi trả service ra response.
// Bỏ markdown code fence và lấy phần JSON từ phản hồi của AI.
// Xu ly chuoi tra ve tu AI, loai bo code fence va tach phan JSON ra.
const extractJsonPayload = (text = "") => {
  const raw = String(text || "").trim();
  if (!raw) {
    return null;
  }

  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : raw;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace < 0 || lastBrace < 0 || lastBrace <= firstBrace) {
    return null;
  }

  return candidate.slice(firstBrace, lastBrace + 1);
};

// Chuyển dữ liệu tour thành input gọn để gửi cho Gemini rerank.
// Rut gon du lieu tour va ngu canh thanh payload de gui cho Gemini rerank.
const buildAiRerankPayload = ({
  services = [],
  context = {},
  trendSnapshot = null,
}) => {
  const topTrendingServices = Array.isArray(trendSnapshot?.topServices)
    ? trendSnapshot.topServices.slice(0, 10).map((item) => ({
        serviceId: String(item.serviceId || ""),
        rank: Number(item.rank || 0),
        score: Number(item.score || 0),
      }))
    : [];

  const candidateServices = services.map((service, index) => ({
    serviceId: String(service._id || service.serviceId || ""),
    serviceName: service.serviceName || "",
    category: service?.category?.categoryName || service?.category?.slug || "",
    location: service.location || "",
    budgetRange: service.budgetRange || "",
    rating: Number(service.rating || 0),
    reviewCount: Number(service.reviewCount || 0),
    viewCount: Number(service.viewCount || 0),
    featured: Boolean(service.featured),
    recommendationScore: Number(service.recommendationScore || 0),
    baseScore: Number(service.baseScore || 0),
    filterScore: Number(service.filterScore || 0),
    trendScore: Number(service.trendScore || 0),
    seasonalScore: Number(service.seasonalScore || 0),
    personalPreferenceScore: Number(service.personalPreferenceScore || 0),
    rank: index + 1,
  }));

  return {
    userType: context.ownerType || "guest",
    userId: context.userId || "",
    guestId: context.guestId || "",
    month: context.month || "",
    season: context.season || "",
    weatherTag: context.weatherTag || "",
    budgetRange: context.budgetRange || "",
    category: context.category || "",
    location: context.location || "",
    actionCounts: context.preference?.actionCounts || {},
    topCategories: context.preference?.topCategories || [],
    topLocations: context.preference?.topLocations || [],
    topBudgets: context.preference?.topBudgets || [],
    topSeasons: context.preference?.topSeasons || [],
    recentSignals: Array.isArray(context.preference?.recentSignals)
      ? context.preference.recentSignals.slice(0, 20)
      : [],
    topTrendingServices,
    candidateServices,
  };
};

// Tạo prompt để Gemini chỉ xếp hạng lại danh sách tour có sẵn.
// Tao prompt cu the de Gemini chi duoc sap xep lai danh sach tour co san.
const buildAiRerankPrompt = (payload) => [
  {
    role: "user",
    parts: [
      {
        text: `Ban la AI reranker cho he thong goi y tour. Chi duoc xep hang lai danh sach tour da duoc cung cap, khong duoc tao tour moi.

Uu tien theo thu tu:
1) lich su nguoi dung
2) filter hien tai
3) trend
4) mua/thoi tiet
5) base score

Neu user co lich su book/rating manh thi uu tien so thich ca nhan hon trend. Neu du lieu lich su it thi uu tien trend + mua/thoi tiet + filter.
Tra ve JSON hop le, khong them giai thich ngoai JSON.

Hay xep hang lai danh sach tour duoi day cho recommendation.

Thong tin boi canh:
${JSON.stringify(
  {
    userType: payload.userType,
    userId: payload.userId,
    guestId: payload.guestId,
    month: payload.month,
    season: payload.season,
    weatherTag: payload.weatherTag,
    budgetRange: payload.budgetRange,
    category: payload.category,
    location: payload.location,
    actionCounts: payload.actionCounts,
    topCategories: payload.topCategories,
    topLocations: payload.topLocations,
    topBudgets: payload.topBudgets,
    topSeasons: payload.topSeasons,
    recentSignals: payload.recentSignals,
    topTrendingServices: payload.topTrendingServices,
  },
  null,
  2,
)}

Danh sach tour ung vien:
${JSON.stringify(payload.candidateServices, null, 2)}

Quy dinh output:
{
  "rankedTours": [
    {
      "serviceId": "string"
    }
  ]
}

Chi tra ve JSON hop le.`,
      },
    ],
  },
];

// Gọi Gemini qua REST để lấy thứ tự rerank.
// Goi Gemini bang REST de lay thu tu uu tien moi.
const callGeminiRerank = async (payload) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const fetchFn = globalThis.fetch;
  if (typeof fetchFn !== "function") {
    throw new Error("Fetch API is not available in this runtime");
  }

  const response = await fetchFn(
    `${GEMINI_BASE_URL}/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: buildAiRerankPrompt(payload),
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Gemini rerank request failed with status ${response.status}: ${errorText}`,
    );
  }

  const body = await response.json();
  const candidateText = body?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || "")
    .join("")
    .trim();
  const jsonText = extractJsonPayload(candidateText);

  if (!jsonText) {
    return null;
  }

  const parsed = JSON.parse(jsonText);
  const rankedTours = Array.isArray(parsed?.rankedTours)
    ? parsed.rankedTours
    : [];

  return rankedTours
    .map((item, index) => ({
      serviceId: String(item?.serviceId || "").trim(),
      position: index,
    }))
    .filter((item) => item.serviceId);
};

// Chuyển thứ tự AI thành bonus điểm nhỏ để rerank nhẹ.
// Doi thu tu AI thanh bonus diem nho de anh huong len ket qua cuoi cung.
const buildAiBonusMap = (orderedTours = []) => {
  const bonusMap = new Map();
  orderedTours.forEach((item, index) => {
    const bonus = Math.max(AI_RERANK_BONUS_MAX - index * 2, 0);
    if (bonus > 0) {
      bonusMap.set(item.serviceId, bonus);
    }
  });
  return bonusMap;
};

const stripCacheMeta = (service) => {
  if (!service || typeof service !== "object") return service;
  const { cacheMeta, ...rest } = service;
  return rest;
};

// Tạo danh sách gợi ý theo rule-base cho user hoặc guest.
module.exports.getRecommendations = async (query = {}, userId = null, guestId = "") => {
  const month = Number(query.month) || new Date().getMonth() + 1;
  const season = query.season || getSeasonFromMonth(month);
  const weatherTag = query.weatherTag || getCurrentWeatherTagFromSeason(season);
  const budgetRange = normalizeText(query.budgetRange);
  const category = query.category;
  const location = query.location;
  const isHoliday = isHolidayLike(query.holiday);
  const resolvedCategoryId = await resolveCategoryFilter(category);
  const ownerKey = getOwnerKey({ userId, guestId });
  const ownerType = userId ? "user" : "guest";
  const filterSnapshot = {
    month,
    season,
    weatherTag,
    budgetRange,
    category: category || "",
    location: location || "",
  };
  const filterKey = buildFilterKey(filterSnapshot);

  const cached = await getRecommendationCache({ ownerKey, filterKey });
  if (cached && !cached.refreshNeeded) {
    return {
      data: Array.isArray(cached.data) ? cached.data : [],
      meta: {
        ...(cached.meta || {}),
        cacheHit: true,
        cacheKey: cached.cacheKey,
        filterKey,
        ownerType,
        guestId: userId ? "" : guestId,
      },
    };
  }

  const preferenceSummary = userId
    ? buildPreferenceSummary(
        await getPreferenceDoc(userId),
      )
    : await getGuestPreferenceSummary(guestId);
  const trendSnapshot = await getLatestRecommendationTrendSnapshot();

  const serviceQuery = {
    status: "active",
  };

  if (budgetRange && ["low", "mid", "high"].includes(budgetRange)) {
    serviceQuery.budgetRange = budgetRange;
  }

  if (resolvedCategoryId) {
    serviceQuery.category = resolvedCategoryId;
  }

  if (location) {
    serviceQuery.location = { $regex: location, $options: "i" };
  }

  const [services, bookingCountMap] = await Promise.all([
    Service.find(serviceQuery)
      .populate("category", "categoryName slug")
      .populate("provider_id", "fullName")
      .sort({ featured: -1, rating: -1, reviewCount: -1, viewCount: -1, createdAt: -1 }),
    buildBookingCountMap(),
  ]);

  const ranked = services
    .map((service) => {
      const serviceObject = service.toObject();
      const bookingCount = Number(bookingCountMap.get(String(serviceObject._id)) || 0);
      const baseScore = buildBaseScore(serviceObject, bookingCount);
      const filterScore = buildFilterScore(serviceObject, {
        month,
        season,
        weatherTag,
        budgetRange,
        category: category || "",
        location: location || "",
      });
      const trendScore = buildTrendScore(
        serviceObject,
        bookingCount,
        trendSnapshot,
      );
      const seasonalScore = buildSeasonalScore(serviceObject, {
        month,
        season,
        weatherTag,
      });
      const personalPreferenceScore = buildPersonalPreferenceScore(serviceObject, {
        preference: preferenceSummary,
      });

      return {
        ...serviceObject,
        baseScore,
        filterScore,
        trendScore,
        seasonalScore,
        personalPreferenceScore,
        recommendationScore:
          baseScore +
          filterScore +
          trendScore +
          seasonalScore +
          personalPreferenceScore,
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore);

  const candidatePool = ranked.slice(0, AI_RERANK_CANDIDATE_LIMIT);
  let aiUsed = false;
  let fallbackUsed = false;
  let aiBonusMap = new Map();

  try {
    const aiRanking = await callGeminiRerank(
      buildAiRerankPayload({
        services: candidatePool,
        context: {
          userId: userId ? String(userId) : "",
          guestId: userId ? "" : guestId,
          ownerType,
          month,
          season,
          weatherTag,
          budgetRange,
          category: category || "",
          location: location || "",
          preference: preferenceSummary,
        },
        trendSnapshot,
      }),
    );

    if (Array.isArray(aiRanking) && aiRanking.length > 0) {
      aiBonusMap = buildAiBonusMap(aiRanking);
      aiUsed = true;
    } else {
      fallbackUsed = true;
    }
  } catch (error) {
    console.error("Gemini rerank failed, fallback to rule-base:", error);
    fallbackUsed = true;
  }

  // Rule-base chon ra ung vien, sau do AI chi rerank lai top dau.
  const finalRanked = candidatePool
    .map((service) => {
      const aiBonus = aiBonusMap.get(String(service._id)) || 0;
      return {
        ...service,
        aiBonus,
        recommendationScore: service.recommendationScore + aiBonus,
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, FINAL_LIMIT)
    .map(stripCacheMeta);

  const meta = {
    month,
    season,
    weatherTag,
    isHoliday,
    budgetRange,
    category: category || "",
    resolvedCategoryId: resolvedCategoryId ? String(resolvedCategoryId) : "",
    location: location || "",
    preference: preferenceSummary,
    limit: FINAL_LIMIT,
    ownerType,
    guestId: userId ? "" : guestId,
    mode: aiUsed ? "hybrid" : "rules",
    engine: aiUsed ? "rule-base + gemini rerank" : "rule-base recommendation",
    aiUsed,
    fallbackUsed,
    aiModel: aiUsed ? GEMINI_MODEL : "",
    candidatePoolSize: candidatePool.length,
    cacheHit: false,
  };

  await saveRecommendationCache({
    ownerKey,
    ownerType,
    ownerId: userId ? String(userId) : String(guestId || "anonymous"),
    filterKey,
    filterSnapshot,
    data: finalRanked,
    meta,
  });

  return {
    data: finalRanked,
    meta,
  };
};
