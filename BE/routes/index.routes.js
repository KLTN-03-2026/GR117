const express = require('express');
const authRoutes = require('./auth.routes.js')
const servicesRoute = require("./services.routes.js")
module.exports = function(app) {
    app.use('/api/auth', authRoutes);
    app.use('/api/services',servicesRoute);

}
