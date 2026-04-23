const Service = require("../models/Service.js");
const Order = require("../models/Order.js");
const {
  getSeasonFromMonth,
  isHolidayLike,
  normalizeTagList,
  normalizeText,
} = require("../utils/seasonHelper.js");

const getCurrentWeatherTagFromSeason = (season) => {
  if (season === "summer") return "hot";
  if (season === "winter") return "cool";
  if (season === "rainy") return "rainy";
  return "all";
};

const buildServiceScore = (service, context, bookingCountMap) => {
  const serviceObject = service.toObject ? service.toObject() : service;
  const season = context.season || getSeasonFromMonth(context.month);
  const weatherTag = context.weatherTag || getCurrentWeatherTagFromSeason(season);
  const isHoliday = context.isHoliday;
  const budgetRange = normalizeText(context.budgetRange);
  const categoryFilter = normalizeText(context.category);
  const locationFilter = normalizeText(context.location);

  const seasonTags = normalizeTagList(serviceObject.seasonTags);
  const weatherTags = normalizeTagList(serviceObject.weatherTags);
  const bestMonths = Array.isArray(serviceObject.bestMonths) ? serviceObject.bestMonths : [];
  const categoryName = normalizeText(serviceObject?.category?.categoryName);
  const serviceLocation = normalizeText(serviceObject.location);
  const serviceBudget = normalizeText(serviceObject.budgetRange);

  let score = 0;

  if (serviceObject.featured) score += 100;
  score += Number(serviceObject.rating || 0) * 20;
  score += Number(serviceObject.reviewCount || 0) * 3;
  score += Number(serviceObject.viewCount || 0) * 1.5;
  score += Number(bookingCountMap.get(String(serviceObject._id)) || 0) * 4;

  if (season !== "all" && seasonTags.includes(season)) score += 40;
  if (context.month && bestMonths.includes(Number(context.month))) score += 25;
  if (weatherTag !== "all" && weatherTags.includes(weatherTag)) score += 20;
  if (isHoliday) score += 15;

  if (categoryFilter) {
    if (
      categoryName.includes(categoryFilter) ||
      normalizeText(serviceObject.category?.slug).includes(categoryFilter)
    ) {
      score += 15;
    }
  }

  if (locationFilter && serviceLocation.includes(locationFilter)) {
    score += 10;
  }

  if (budgetRange && serviceBudget === budgetRange) {
    score += 10;
  }

  const createdAt = new Date(serviceObject.createdAt || 0).getTime();
  const ageInDays = Math.max(1, (Date.now() - createdAt) / (1000 * 60 * 60 * 24));
  score += Math.max(0, 20 - Math.min(20, ageInDays / 7));

  return score;
};

const buildBookingCountMap = async () => {
  const counts = await Order.aggregate([
    {
      $group: {
        _id: "$serviceId",
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(counts.map((item) => [String(item._id), Number(item.count || 0)]));
};

module.exports.getRecommendations = async (query = {}) => {
  const limit = Math.max(1, Math.min(Number(query.limit || 8), 24));
  const month = Number(query.month) || new Date().getMonth() + 1;
  const season = query.season || getSeasonFromMonth(month);
  const weatherTag = query.weatherTag || getCurrentWeatherTagFromSeason(season);
  const isHoliday = isHolidayLike(query.holiday);
  const budgetRange = normalizeText(query.budgetRange);
  const category = query.category;
  const location = query.location;

  const serviceQuery = {
    status: "active",
  };

  if (budgetRange && ["low", "mid", "high"].includes(budgetRange)) {
    serviceQuery.budgetRange = budgetRange;
  }

  if (category) {
    serviceQuery.category = category;
  }

  if (location) {
    serviceQuery.location = { $regex: location, $options: "i" };
  }

  const [services, bookingCountMap] = await Promise.all([
    Service.find(serviceQuery)
      .populate("category", "categoryName slug")
      .populate("provider_id", "fullName")
      .sort({ createdAt: -1 }),
    buildBookingCountMap(),
  ]);

  const ranked = services
    .map((service) => ({
      ...service.toObject(),
      recommendationScore: buildServiceScore(
        service,
        {
          month,
          season,
          weatherTag,
          isHoliday,
          budgetRange,
          category,
          location,
        },
        bookingCountMap,
      ),
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);

  return {
    data: ranked,
    meta: {
      month,
      season,
      weatherTag,
      isHoliday,
      limit,
    },
  };
};
