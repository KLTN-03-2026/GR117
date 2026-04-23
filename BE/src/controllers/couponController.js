const Coupon = require("../models/Coupon.js");
const Schedule = require("../models/Schedule.js");
const Service = require("../models/Service.js");

const normalizeCode = (value) => String(value || "").trim().toUpperCase();

// Provider tao ma giam gia moi cho chinh dich vu cua minh.
module.exports.createCoupon = async (req, res) => {
  try {
    const providerId = req.user.id;
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxUsage,
      startDate,
      endDate,
      serviceIds = [],
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !endDate) {
      return res.status(400).json({ message: "Thieu thong tin ma giam gia" });
    }

    if (!["percent", "fixed"].includes(String(discountType))) {
      return res.status(400).json({ message: "Loai giam gia khong hop le" });
    }

    const coupon = await Coupon.create({
      provider_id: providerId,
      code: normalizeCode(code),
      discountType: String(discountType),
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      maxUsage: Number(maxUsage || 1),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      serviceIds: Array.isArray(serviceIds) ? serviceIds : [],
    });

    return res.status(201).json({
      message: "Tao ma giam gia thanh cong",
      data: coupon,
    });
  } catch (error) {
    console.error("Loi createCoupon:", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Ma giam gia da ton tai" });
    }
    return res.status(500).json({ message: "Loi he thong" });
  }
};

// Lay danh sach ma giam gia cua provider dang dang nhap.
module.exports.getMyCoupons = async (req, res) => {
  try {
    const providerId = req.user.id;
    const coupons = await Coupon.find({ provider_id: providerId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ data: coupons });
  } catch (error) {
    console.error("Loi getMyCoupons:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

// Provider cap nhat ma giam gia cua chinh minh.
module.exports.updateCoupon = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { id } = req.params;

    const coupon = await Coupon.findOne({ _id: id, provider_id: providerId });
    if (!coupon) {
      return res.status(404).json({ message: "Khong tim thay ma giam gia" });
    }

    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxUsage,
      startDate,
      endDate,
      status,
      serviceIds,
    } = req.body;

    if (code !== undefined) coupon.code = normalizeCode(code);
    if (discountType !== undefined) coupon.discountType = String(discountType);
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) coupon.minOrderValue = Number(minOrderValue);
    if (maxUsage !== undefined) coupon.maxUsage = Number(maxUsage);
    if (startDate !== undefined) coupon.startDate = new Date(startDate);
    if (endDate !== undefined) coupon.endDate = new Date(endDate);
    if (status !== undefined) coupon.status = String(status);
    if (serviceIds !== undefined) {
      coupon.serviceIds = Array.isArray(serviceIds) ? serviceIds : [];
    }

    await coupon.save();

    return res.status(200).json({
      message: "Cap nhat ma giam gia thanh cong",
      data: coupon,
    });
  } catch (error) {
    console.error("Loi updateCoupon:", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Ma giam gia da ton tai" });
    }
    return res.status(500).json({ message: "Loi he thong" });
  }
};

// Provider xoa ma giam gia cua chinh minh.
module.exports.deleteCoupon = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { id } = req.params;

    const coupon = await Coupon.findOneAndDelete({
      _id: id,
      provider_id: providerId,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Khong tim thay ma giam gia" });
    }

    return res.status(200).json({ message: "Xoa ma giam gia thanh cong" });
  } catch (error) {
    console.error("Loi deleteCoupon:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

// Kiem tra ma giam gia truoc khi dat tour hoac thanh toan.
module.exports.validateCoupon = async (req, res) => {
  try {
    const { code, serviceId, amount } = req.body;
    if (!code || !serviceId || amount === undefined) {
      return res.status(400).json({ message: "Thieu thong tin" });
    }

    const service = await Service.findById(serviceId).select("provider_id");
    if (!service) {
      return res.status(404).json({ message: "Khong tim thay dich vu" });
    }

    const coupon = await Coupon.findOne({
      code: normalizeCode(code),
      provider_id: service.provider_id,
      status: "active",
    });

    if (!coupon) {
      return res.status(404).json({ message: "Ma khong hop le" });
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return res.status(400).json({ message: "Ma chua co hieu luc" });
    }
    if (coupon.endDate && coupon.endDate < now) {
      return res.status(400).json({ message: "Ma da het han" });
    }
    if (Number(coupon.usedCount || 0) >= Number(coupon.maxUsage || 1)) {
      return res.status(400).json({ message: "Ma da het luot dung" });
    }

    const allowedServiceIds = Array.isArray(coupon.serviceIds)
      ? coupon.serviceIds.map((item) => String(item))
      : [];
    if (
      allowedServiceIds.length > 0 &&
      !allowedServiceIds.includes(String(serviceId))
    ) {
      return res.status(400).json({ message: "Ma khong ap dung cho dich vu nay" });
    }

    const orderAmount = Number(amount || 0);
    if (orderAmount < Number(coupon.minOrderValue || 0)) {
      return res.status(400).json({
        message: "Don hang chua dat gia tri toi thieu",
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percent") {
      discountAmount = Math.floor((orderAmount * Number(coupon.discountValue || 0)) / 100);
    } else {
      discountAmount = Number(coupon.discountValue || 0);
    }

    if (discountAmount > orderAmount) discountAmount = orderAmount;

    return res.status(200).json({
      message: "Ma hop le",
      data: {
        couponId: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalAmount: orderAmount - discountAmount,
      },
    });
  } catch (error) {
    console.error("Loi validateCoupon:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
