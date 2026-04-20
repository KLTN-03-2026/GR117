const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController.js");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware.js");

// Đặt tour mới (Mọi user đã login đều làm được)
router.post("/", verifyToken, orderController.createOrder);

// Khách xem lịch sử của mình
router.get("/my-orders", verifyToken, orderController.getMyOrders);

// Admin xem toàn bộ đơn hàng
router.get(
  "/admin",
  verifyToken,
  authorizeRoles("admin"),
  orderController.getAdminOrders,
);

// Provider xem danh sách khách đặt tour của mình
router.get(
  "/provider",
  verifyToken,
  authorizeRoles("provider"),
  orderController.getProviderOrders,
);

// Cập nhật trạng thái đơn (Xác nhận/Hủy/Thanh toán)
router.patch(
  "/status/:id",
  verifyToken,
  authorizeRoles("provider", "admin"),
  orderController.updateOrderStatus,
);

module.exports = router;
