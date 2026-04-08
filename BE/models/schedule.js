const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Services = require("../models/services.js");
const ScheduleSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
    },
    serviceID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        required: true,
    },
    departureDate : String,
    endDate: String,
    status: {
        type :String ,
        enum : ["active", "inactive", "cancelled"],
         default : "active",    
    },
    timestamp : {
        type: Date,
        default: Date.now
    }
});
const Schedule = mongoose.model("Schedule", ScheduleSchema);
module.exports = Schedule;