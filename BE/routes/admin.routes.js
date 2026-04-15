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

router.get(
  "/accounts",
  verifyToken,
  authorizeRoles("admin"),
  adminController.getAccounts,
);

router.post(
  "/accounts",
  verifyToken,
  authorizeRoles("admin"),
  adminController.createAccount,
);

router.patch(
  "/accounts/:id/block",
  verifyToken,
  authorizeRoles("admin"),
  adminController.blockAccount,
);

router.patch(
  "/accounts/:id/unblock",
  verifyToken,
  authorizeRoles("admin"),
  adminController.unblockAccount,
);

router.delete(
  "/accounts/:id",
  verifyToken,
  authorizeRoles("admin"),
  adminController.deleteAccount,
);

router.get(
  "/services",
  verifyToken,
  authorizeRoles("admin"),
  adminController.getServices,
);

router.patch(
  "/services/:id/approve",
  verifyToken,
  authorizeRoles("admin"),
  adminController.approveService,
);

router.patch(
  "/services/:id/reject",
  verifyToken,
  authorizeRoles("admin"),
  adminController.rejectService,
);

router.delete(
  "/services/:id",
  verifyToken,
  authorizeRoles("admin"),
  adminController.deleteService,
);

router.get(
  "/stats",
  verifyToken,
  authorizeRoles("admin"),
  adminController.getStats,
);

module.exports = router;
