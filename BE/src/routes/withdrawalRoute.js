const express = require("express");
const router = express.Router();
const withdrawalController = require("../controllers/withdrawalController.js");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware.js");

router.get(
  "/provider",
  verifyToken,
  authorizeRoles("provider"),
  withdrawalController.getProviderWithdrawals,
);

router.post(
  "/provider",
  verifyToken,
  authorizeRoles("provider"),
  withdrawalController.createProviderWithdrawal,
);

router.get(
  "/admin",
  verifyToken,
  authorizeRoles("admin"),
  withdrawalController.getAdminWithdrawals,
);

router.patch(
  "/admin/:id",
  verifyToken,
  authorizeRoles("admin"),
  withdrawalController.updateWithdrawalStatus,
);

module.exports = router;
