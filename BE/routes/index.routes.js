const express = require('express');
const authRoutes = require('./auth.routes.js')
const servicesRoute = require("./services.routes.js")
const adminRoute = require("../routes/admin.routes.js")
module.exports = function(app) {
    app.use('/api/auth', authRoutes);
    app.use('/api/services',servicesRoute);
    app.use('/api/admin', adminRoute);

}
