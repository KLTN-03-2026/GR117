const mongoose = require("mongoose");


const ScheduleSchema = new mongoose.Schema({
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
  },

  status: {
    type: String,
    enum: ["active", "inactive", "cancelled"],
    default: "active",
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