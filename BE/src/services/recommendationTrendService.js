const Order = require("../models/Order.js");
const Review = require("../models/Review.js");
const Service = require("../models/Service.js");
const RecommendationTrendSnapshot = require("../models/RecommendationTrendSnapshot.js");
const { normalizeTagList, normalizeText } = require("../utils/seasonHelper.js");

const TREND_WINDOW_DAYS = 30;
const TREND_CACHE_TTL_DAYS = 45;
const TREND_LIMIT = 50;

// Tạo key theo tháng để nhận ra snapshot trend hiện tại.
const buildTrendSnapshotKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `monthly:${year}-${month}`;
};

// Lấy khoảng thời gian dùng để tính trend gần đây.
const buildTrendWindow = (date = new Date()) => {
  const periodEnd = new Date(date);
  const periodStart = new Date(date);
  periodStart.setDate(periodStart.getDate() - TREND_WINDOW_DAYS);
  return { periodStart, periodEnd };
};

// Tính điểm trend cho một tour từ booking/view/review và độ mới.
const computeTrendScore = ({ service, bookingCount, recentReviewCount }) => {
  const bookingBoost = Math.min(30, Math.log1p(Number(bookingCount || 0)) * 8);
  const viewBoost = Math.min(18, Math.log1p(Number(service.viewCount || 0)) * 3);
  const reviewBoost = Math.min(
    16,
    Math.log1p(Number(recentReviewCount || service.reviewCount || 0)) * 4,
  );
  const ratingBoost = Number(service.rating || 0) >= 4 ? 8 : 0;
  const featuredBoost = service.featured ? 6 : 0;
  const recencyBoost = (() => {
    const createdAt = new Date(service.createdAt || 0).getTime();
    const ageInDays = Math.max(
      1,
      (Date.now() - createdAt) / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, 10 - Math.min(10, ageInDays / 10));
  })();

  return (
    bookingBoost +
    viewBoost +
    reviewBoost +
    ratingBoost +
    featuredBoost +
    recencyBoost
  );
};

// Gom số booking gần đây theo từng service.
const buildRecentBookingCountMap = async (periodStart, periodEnd) => {
  const bookingCounts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: periodStart, $lte: periodEnd },
      },
    },
    {
      $group: {
        _id: "$serviceId",
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    bookingCounts.map((item) => [String(item._id), Number(item.count || 0)]),
  );
};

// Gom số review gần đây theo từng service.
const buildRecentReviewCountMap = async (periodStart, periodEnd) => {
  const reviewCounts = await Review.aggregate([
    {
      $match: {
        createdAt: { $gte: periodStart, $lte: periodEnd },
      },
    },
    {
      $group: {
        _id: "$serviceId",
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    reviewCounts.map((item) => [String(item._id), Number(item.count || 0)]),
  );
};

// Tạo lại snapshot trend mới nhất để phục vụ recommendation.
const refreshRecommendationTrendSnapshot = async () => {
  const now = new Date();
  const { periodStart, periodEnd } = buildTrendWindow(now);
  const snapshotKey = buildTrendSnapshotKey(now);
  const expiresAt = new Date(
    now.getTime() + TREND_CACHE_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  const [services, bookingCountMap, reviewCountMap] = await Promise.all([
    Service.find({ status: "active" })
      .populate("category", "categoryName slug")
      .sort({ featured: -1, rating: -1, reviewCount: -1, viewCount: -1, createdAt: -1 }),
    buildRecentBookingCountMap(periodStart, periodEnd),
    buildRecentReviewCountMap(periodStart, periodEnd),
  ]);

  const topServices = services
    .map((service) => {
      const serviceObject = service.toObject();
      const serviceId = String(serviceObject._id);
      const bookingCount = Number(bookingCountMap.get(serviceId) || 0);
      const recentReviewCount = Number(reviewCountMap.get(serviceId) || 0);
      const score = computeTrendScore({
        service: serviceObject,
        bookingCount,
        recentReviewCount,
      });

      return {
        serviceId: serviceObject._id,
        score,
        rank: 0,
        bookingCount,
        reviewCount: recentReviewCount,
        viewCount: Number(serviceObject.viewCount || 0),
        rating: Number(serviceObject.rating || 0),
        featured: Boolean(serviceObject.featured),
        category: normalizeText(serviceObject?.category?.categoryName || ""),
        location: normalizeText(serviceObject.location || ""),
        budgetRange: normalizeText(serviceObject.budgetRange || ""),
        seasonTags: normalizeTagList(serviceObject.seasonTags),
        weatherTags: normalizeTagList(serviceObject.weatherTags),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, TREND_LIMIT)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const totalBookings = topServices.reduce(
    (sum, item) => sum + Number(item.bookingCount || 0),
    0,
  );
  const totalReviews = topServices.reduce(
    (sum, item) => sum + Number(item.reviewCount || 0),
    0,
  );
  const totalViews = topServices.reduce(
    (sum, item) => sum + Number(item.viewCount || 0),
    0,
  );

  return RecommendationTrendSnapshot.findOneAndUpdate(
    { snapshotKey },
    {
      $set: {
        snapshotKey,
        periodType: "monthly",
        periodStart,
        periodEnd,
        generatedAt: now,
        active: true,
        topServices,
        summary: {
          totalServices: services.length,
          totalBookings,
          totalReviews,
          totalViews,
        },
        expiresAt,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  ).lean();
};

// Lấy snapshot trend gần nhất, nếu chưa có thì tự tạo mới.
const getLatestRecommendationTrendSnapshot = async () => {
  const now = new Date();
  const latest = await RecommendationTrendSnapshot.findOne({
    active: true,
    expiresAt: { $gt: now },
  })
    .sort({ generatedAt: -1 })
    .lean();

  if (latest) {
    return latest;
  }

  return refreshRecommendationTrendSnapshot();
};

// Đọc boost trend của một tour từ snapshot gần nhất.
const getTrendSnapshotBoost = (snapshot, serviceObject) => {
  if (!snapshot || !serviceObject?._id) {
    return 0;
  }

  const serviceId = String(serviceObject._id);
  const topServices = Array.isArray(snapshot.topServices)
    ? snapshot.topServices
    : [];
  const matched = topServices.find(
    (item) => String(item.serviceId) === serviceId,
  );

  if (!matched) {
    return 0;
  }

  const rankBoost = Math.max(0, 16 - Number(matched.rank || 0) * 1.2);
  const scoreBoost = Math.min(10, Number(matched.score || 0) * 0.08);

  return Number((rankBoost + scoreBoost).toFixed(2));
};

module.exports = {
  buildTrendSnapshotKey,
  getLatestRecommendationTrendSnapshot,
  getTrendSnapshotBoost,
  refreshRecommendationTrendSnapshot,
};
