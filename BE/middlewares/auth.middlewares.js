const jwt = require("jsonwebtoken");
require("dotenv").config();
const accounts = require("../models/account.js");

const verifyToken = function (req, res, next) {
  try {
    // Lấy access token từ header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy token" });
    }
    // Xác nhận token hợp lệ
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async function (err, decodedUser) {
        if (err) {
          console.error("Lỗi verify JWT:", err.message);
          return res
            .status(403)
            .json({ message: "Access token hết hạn hoặc không đúng" });
        }
        try {
          // Tìm user trong DB
          const user = await accounts
            .findById(decodedUser.userId)
            .select("-hashedPassword");
          if (!user) {
            return res
              .status(404)
              .json({ message: "Người dùng không tồn tại" });
          }
          if (user.status !== "active") {
            return res.status(403).json({ message: "Tai khoan da bi khoa" });
          }
          req.user = {
            id: user._id.toString(),
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            status: user.status,
          };
          next();
        } catch (dbError) {
          console.error("Lỗi DB khi tìm User:", dbError);
          return res.status(500).json({ message: "Lỗi kết nối cơ sở dữ liệu" });
        }
      },
    );
  } catch (error) {
    console.error("Lỗi hệ thống trong authMiddleware:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
const authorizeRoles = (...roles) => {
  return function (req, res, next) {
    try {
      // req.user được lấy từ middleware verifyToken phía trước
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Bạn không có quyền thực hiện hành động này.",
        });
      }
      next(); // Nếu role hợp lệ, cho phép đi tiếp vào controller
    } catch (error) {
      console.error("Lỗi khi xác minh Role trong roleMiddleware:", error);
      return res.status(500).json({ message: "Lỗi hệ thống" });
    }};
};
module.exports = {
  verifyToken,
  authorizeRoles,
};
