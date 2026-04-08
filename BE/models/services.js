const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Account  = require("../models/account.js");

const serviceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  //tên dịch vụ 
  serviceName: {
    type: String,
    required: true,
  },
  
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
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
  highlight: String,
 
  //mô tả 
  description: String,
  

  //ảnh 
  imageFile: String,
  imageUrl: String,
   

  //lịch trình chi tiết của tour
  itinerary: String,
  
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