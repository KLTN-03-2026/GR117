const Review = require("../models/Review.js");
const Order = require("../models/Order.js");
const Service = require("../models/Service.js");

//  GỬI ĐÁNH GIÁ MỚI (USER)
module.exports.createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    // 1. Kiểm tra đơn hàng (Order) có tồn tại và thuộc về User này không
    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (order.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền đánh giá đơn hàng này" });
    }

    // 2. Chỉ cho phép đánh giá khi tour đã hoàn thành (completed)
    if (order.status !== "completed") {
      return res.status(400).json({
        message: "Bạn chỉ có thể đánh giá sau khi đã hoàn thành chuyến đi",
      });
    }

    // 3. Kiểm tra xem đã đánh giá đơn hàng này chưa (1 Order = 1 Review)
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Bạn đã đánh giá cho chuyến đi này rồi" });
    }

    // 4. Tạo Review
    const newReview = await Review.create({
      orderId,
      serviceId: order.serviceId,
      userId: req.user.id,
      rating,
      comment,
    });

    // 5. CẬP NHẬT RATING TRUNG BÌNH CHO SERVICE
    const allReviews = await Review.find({ serviceId: order.serviceId });
    const reviewCount = allReviews.length;
    const avgRating =
      allReviews.reduce((sum, item) => sum + item.rating, 0) / reviewCount;

    await Service.findByIdAndUpdate(order.serviceId, {
      rating: avgRating.toFixed(1),
      reviewCount: reviewCount,
    });

    return res.status(201).json({
      message: "Cảm ơn bạn đã đánh giá chuyến đi!",
      data: newReview,
    });
  } catch (error) {
    console.error("Lỗi createReview:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// LẤY DANH SÁCH REVIEW CỦA MỘT TOUR (PUBLIC)
module.exports.getReviewsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const reviews = await Review.find({ serviceId })
      .populate("userId", "fullName avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: reviews });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

module.exports.getHighlightedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ rating: { $gte: 4 } })
      .populate("userId", "fullName avatar")
      .populate("serviceId", "serviceName")
      .sort({ rating: -1, createdAt: -1 })
      .limit(6);

    return res.status(200).json({ data: reviews });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//  XÓA ĐÁNH GIÁ (USER/ADMIN)
module.exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });

    // Chỉ chủ nhân hoặc Admin mới được xóa
    if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Không có quyền xóa đánh giá này" });
    }

    await Review.findByIdAndDelete(req.params.id);

    // update lại rating của Service sau khi xóa
    // ... logic tinh lai rating nhu createReview ...

    return res.status(200).json({ message: "Đã xóa đánh giá" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
