const mongoose = require("mongoose");

const trendServiceSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    score: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    category: { type: String, default: "" },
    location: { type: String, default: "" },
    budgetRange: { type: String, default: "" },
    seasonTags: { type: [String], default: [] },
    weatherTags: { type: [String], default: [] },
  },
  { _id: false },
);

const recommendationTrendSnapshotSchema = new mongoose.Schema(
  {
    snapshotKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    periodType: {
      type: String,
      enum: ["monthly"],
      default: "monthly",
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    generatedAt: { type: Date, default: Date.now, index: true },
    active: { type: Boolean, default: true },
    topServices: {
      type: [trendServiceSchema],
      default: [],
    },
    summary: {
      totalServices: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

recommendationTrendSnapshotSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

const RecommendationTrendSnapshot = mongoose.model(
  "RecommendationTrendSnapshot",
  recommendationTrendSnapshotSchema,
);

module.exports = RecommendationTrendSnapshot;
