const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ScheduleSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
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
