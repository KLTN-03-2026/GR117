const Order = require("../models/Order.js");
const Service = require("../models/Service.js");
const User = require("../models/User.js");
const mongoose = require("mongoose");

// [PROVIDER] THỐNG KÊ CHO NHÀ CUNG CẤP
module.exports.getPartnerStats = async (req, res) => {
  try {
    const providerId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Tổng doanh thu (Chỉ tính các đơn đã hoàn thành và đã thanh toán)
    const revenueData = await Order.aggregate([
      {
        $match: {
          provider_id: providerId,
          status: "completed",
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    // 2. Thống kê đơn hàng theo trạng thái (Để vẽ biểu đồ tròn)
    const orderStatusStats = await Order.aggregate([
      { $match: { provider_id: providerId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // 3. Doanh thu theo tháng trong năm hiện tại (Để vẽ biểu đồ đường/cột)
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          provider_id: providerId,
          status: "completed",
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 4. Các con số tổng hợp khác
    const totalTours = await Service.countDocuments({
      provider_id: providerId,
    });
    const totalOrders = await Order.countDocuments({ provider_id: providerId });

    return res.status(200).json({
      data: {
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        totalTours,
        totalOrders,
        orderStatusStats,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("Lỗi getPartnerStats:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi lấy thống kê" });
  }
};

//  [ADMIN] THỐNG KÊ CHO QUẢN TRỊ VIÊN
module.exports.getAdminStats = async (req, res) => {
  try {
    // 1. Tổng doanh thu toàn sàn
    const totalSystemRevenue = await Order.aggregate([
      { $match: { status: "completed", paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // 2. Thống kê người dùng theo vai trò
    const userStats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // 3. Thống kê trạng thái các Tour (Duyệt/Chờ duyệt)
    const serviceStats = await Service.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // 4. Top 5 Tour có doanh thu cao nhất
    const topServices = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$serviceId",
          totalEarned: { $sum: "$totalPrice" },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { totalEarned: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "services", // Tên collection trong DB
          localField: "_id",
          foreignField: "_id",
          as: "tourInfo",
        },
      },
      { $unwind: "$tourInfo" },
      {
        $project: {
          serviceName: "$tourInfo.serviceName",
          totalEarned: 1,
          totalBookings: 1,
        },
      },
    ]);

    return res.status(200).json({
      data: {
        totalRevenue: totalSystemRevenue[0]?.total || 0,
        userStats,
        serviceStats,
        topServices,
      },
    });
  } catch (error) {
    console.error("Lỗi getAdminStats:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
