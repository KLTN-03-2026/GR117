const mongoose = require("mongoose");


const ScheduleSchema = new mongoose.Schema({
  service_id: {
    type: String,
    ref: "services",
    required: true,
    index: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },

  maxPeople: {
    type: Number,
    required: true,
  },

  bookedSlots: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ["open", "full", "closed"],
    default: "open",
  },

  note: {
    type: String,
  },
},
{
  timestamps: true 
});

const Schedule = mongoose.model("schedule", ScheduleSchema);

module.exports = Schedule;
