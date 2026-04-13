const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/auth.middlewares.js");
const adminController = require("../controllers/admin.controller.js");

router.get(
  "/providers/pending",
  verifyToken,
  authorizeRoles("admin"),
  adminController.getPendingProviders,
);

router.patch(
  "/approve-provider/:id",
  verifyToken,
  authorizeRoles("admin"),
  adminController.approveProvider,
);

router.patch(
  "/reject-provider/:id",
  verifyToken,
  authorizeRoles("admin"),
  adminController.rejectProvider,
);

module.exports = router;