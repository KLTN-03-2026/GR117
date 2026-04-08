const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Account = require("../models/account.js")
const OrderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    serviceID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        required: true,
    },
      orderCode: {
        type: String, default: uuidv4
      },
      // KHÁCH HÀNG mà mình ĐẶT DỊCH VỤ NÀY ví dụ : mình đặt số lượng 3 
      quantity: {
        type: Number,
    },
    status : {
        type : String,
        enum : ["pending", "confirmed", "cancelled"],
        default : "pending",
    },
    note : String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;


    


      
