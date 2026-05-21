const Review = require("../models/Review.js");
const Order = require("../models/Order.js");
const Service = require("../models/Service.js");
const behaviorService = require("../services/behaviorService.js");

const refreshServiceReviewStats = async (serviceId) => {
  const reviews = await Review.find({ serviceId }).select("rating").lean();
  const reviewCount = reviews.length;

  if (reviewCount === 0) {
    await Service.findByIdAndUpdate(serviceId, {
      rating: 0,
      reviewCount: 0,
    });
    return { reviewCount: 0, avgRating: 0 };
  }

  const avgRating =
    reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
    reviewCount;

  const roundedRating = Number(avgRating.toFixed(1));
  await Service.findByIdAndUpdate(serviceId, {
    rating: roundedRating,
    reviewCount,
  });

  return { reviewCount, avgRating: roundedRating };
};

// Gui danh gia moi (user)
module.exports.createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    if (order.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Ban khong co quyen danh gia don hang nay" });
    }

    if (order.status !== "completed") {
      return res.status(400).json({
        message: "Ban chi co the danh gia sau khi da hoan thanh chuyen di",
      });
    }

    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Ban da danh gia cho chuyen di nay roi" });
    }

    const newReview = await Review.create({
      orderId,
      serviceId: order.serviceId,
      userId: req.user.id,
      rating,
      comment,
    });

    await refreshServiceReviewStats(order.serviceId);

    const serviceForBehavior = await Service.findById(order.serviceId).populate(
      "category",
      "categoryName slug",
    );

    await behaviorService
      .recordBehavior({
        userId: req.user.id,
        actionType: "rating",
        service: serviceForBehavior,
        payload: {
          rating,
          source: "create_review",
          metadata: {
            orderId: String(orderId),
            comment,
          },
        },
      })
      .catch((behaviorError) => {
        console.error("Loi record rating behavior:", behaviorError);
      });

    return res.status(201).json({
      message: "Cam on ban da danh gia chuyen di!",
      data: newReview,
    });
  } catch (error) {
    console.error("Loi createReview:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

// Lay danh sach review cua mot tour (public)
module.exports.getReviewsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const reviews = await Review.find({ serviceId })
      .populate("userId", "fullName avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: reviews });
  } catch (error) {
    return res.status(500).json({ message: "Loi he thong" });
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
    return res.status(500).json({ message: "Loi he thong" });
  }
};

// Xoa danh gia (user/admin)
module.exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Khong tim thay danh gia" });
    }

    if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Khong co quyen xoa danh gia nay" });
    }

    await Review.findByIdAndDelete(req.params.id);
    await refreshServiceReviewStats(review.serviceId);

    return res.status(200).json({ message: "Da xoa danh gia" });
  } catch (error) {
    return res.status(500).json({ message: "Loi he thong" });
  }
};
