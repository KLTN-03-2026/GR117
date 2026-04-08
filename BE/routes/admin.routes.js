const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middlewares.js');
const adminController = require('../controllers/admin.controller.js');

router.patch('/approve-provider/:id', verifyToken, authorizeRoles("admin"), adminController.approveProvider);

module.exports = router;
