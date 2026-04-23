const mongoose = require("mongoose");
const User = require("./User.js");
const Service = require("./Service.js");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    provider_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Snapshot thông tin tại thời điểm đặt để đối chiếu sau này
    tourSnapshot: {
      name: String,
      departureDate: Date,
      pricePerPerson: Number,
    },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    numPeople: { type: Number, required: true, min: 1 },
    originalPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    couponCode: { type: String, default: "" },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    discountAmount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "awaiting_payment",
        "awaiting_confirm",
        "confirmed",
        "completed",
        "cancelled",
      ],
      default: "awaiting_confirm",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
