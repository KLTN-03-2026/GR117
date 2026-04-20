const mongoose = require("mongoose");
const Service = require("./Service.js");
const scheduleSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    maxSlots: { type: Number, required: true },
    bookedSlots: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["open", "full", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  },
);
// Đảm bảo không trùng lịch khởi hành cho cùng 1 tour trong 1 ngày
scheduleSchema.index({ serviceId: 1, departureDate: 1 }, { unique: true });
const Schedule = mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;
