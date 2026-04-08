const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Account  = require("../models/account.js");
const Services = require("../models/services.js");
const reviewSchema = new mongoose.Schema({
  _id: {
    type: String,   
    default: uuidv4,
    },
 userID :{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Account",
    required : true,
 },
 serviceID : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Services",
    required : true,    
 },
 rating : {
    type : Number,
    min : 1,
    max : 5
 },
 comment : String,
 reviewDate : {
    type : Date,
    default : Date.now,
    },
 
});
const Reviews = mongoose.model("Reviews", reviewSchema);
module.exports = Reviews;
