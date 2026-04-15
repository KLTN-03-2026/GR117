const mongoose = require("mongoose");

const Account  = require("../models/account.js");

const activitySchema = new mongoose.Schema(
  {
    time: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    icon: {
      type: String,
      enum: ["transport", "hotel", "food", "sightseeing", "activity", "photo"],
      default: "activity",
      set: (value) => {
        const normalized = String(value || "")
          .trim()
          .toLowerCase()
          .replace(/[`"' ]+/g, "");

        return ["transport", "hotel", "food", "sightseeing", "activity", "photo"].includes(normalized)
          ? normalized
          : "activity";
      },
    },
  },
  { _id: false },
);

const itineraryDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    meals: {
      type: [String],
      default: [],
    },
    accommodation: { type: String, default: "" },
    activities: {
      type: [activitySchema],
      default: [],
    },
  },
  { _id: false },
);

const serviceSchema = new mongoose.Schema({
  provider_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        index: true,
      },
  nameProvider: {
    type: String,
  },
  //tên dịch vụ 
  serviceName: {
    type: String,
    required: true,
  },
   //danh mục 
  category: {
    type: [String],
    default: [],
  },
  //địa điểm 
  location: {type: String,},
  //khu vực  ví dụ : trung tâm thành phố, ngoại ô , ven biển , núi 
  region: {type : String},
  //thời gian của tour
  duration:{ type: String,required: true},
  //giá 
  prices: {
    type: Number,
    required: true,
  },
   // điểm nổi bật của tour
  highlight: {
    type: [String],
    default: [],
  },
 
  //mô tả 
  description: String,
  

  //ảnh 
  imageFile: String,
  imageUrl: String,
   

  //lịch trình chi tiết của tour
  itinerary: {
    type: [itineraryDaySchema],
    default: [],
  },
  
  //bao gồm buổi ăn , phương tiện 
  serviceIncludes : {
    type: [String],
    default: [],
  },
  totalSlots : Number,
  bookedSlots : Number,
  remainingSlots : Number,
   // trạng thái 
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  deleted : Boolean,
  deletedAt : Date, 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Services = mongoose.model("services", serviceSchema);

module.exports = Services;
