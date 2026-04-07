const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const serviceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },

  ServiceName: {
    type: String,
    required: true,
  },

  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },

  provider_name: {
    type: String,
    required: true,
  },

  category: {
    type: [String],
    default: [],
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (val) => val.length === 2,
        message: "Coordinates must be [lng, lat]",
      },
    },
  },

  region: String,

  duration: Number,

  price: {
    type: Number,
    required: true,
  },

  highlight: String,

  description: String,

  imageFile: String,
  imageUrl: String,

  rating: {
    type: Number,
    default: 0,
  },
  review_count: {
    type: Number,
    default: 0,
  },
  includes : {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// bắt buộc cho map
serviceSchema.index({ location: "2dsphere" });

const Services = mongoose.model("services", serviceSchema);

module.exports = Services;