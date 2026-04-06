const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const serviceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },

  ServiceName: {
    type: String,
    required: true
  },

  category: {
    type: String,
     default: []
  },

  location: {
    type: String
  },

  region: {
    type: String
  },//khu vực 

  duration: {
    type: Number // number of days
  },

  price: {
    type: Number,
    required: true
  },

  averageRating: {
    type: Number,
    default: 0
  },

  totalReviews: {
    type: Number,
    default: 0,
  },

  isFavorite: {
    type: Boolean,
    default: false,
  },

  supplierId: {
    type: String,
  },

  descriptionDetail: {
    type: String,
  },

  imageFile: {
    type: String,
  },

  imageUrl: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }

});

const Services = mongoose.model("services", serviceSchema);

module.exports = Services;