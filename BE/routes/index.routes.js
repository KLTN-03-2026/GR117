const express = require('express');
const authRoute = require('./auth.routes.js')
const servicesRoute = require("./services.routes.js")
const scheduleRoute = require("../routes/schedule.routes.js")
module.exports = function(app) {
    app.use('/api/auth', authRoute);
    app.use('/api/services',servicesRoute);
    app.use('/api/schedules', scheduleRoute);
}   
    
