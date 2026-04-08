const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller.js');
// const [verifyToken, authorizeRoles] = require('../middlewares/auth.middlewares.js'); 
// verifyToken, authorizeRoles(['admin']),
router.post('/add',  scheduleController.registerSchedule);
router.get('/getServiceList',  scheduleController.getServiceList);



module.exports = router;
