const Order = require("../models/Order.js");
const Schedule = require("../models/Schedule.js");
const Coupon = require("../models/Coupon.js");

const releaseScheduleSlots = async (order) => {
  const schedule = await Schedule.findById(order.scheduleId);
  if (!schedule) return;

  schedule.bookedSlots = Math.max(
    0,
    Number(schedule.bookedSlots || 0) - Number(order.numPeople || 0),
  );

  if (schedule.bookedSlots < schedule.maxSlots && schedule.status === "full") {
    schedule.status = "open";
  }

  await schedule.save();
};

// Tao don dat tour moi cho user, co xu ly coupon neu duoc gui len.
module.exports.createOrder = async (req, res) => {
  try {
    const {
      scheduleId,
      numPeople,
      customerInfo,
      note,
      paymentFlow,
      couponCode,
    } = req.body;

    const schedule = await Schedule.findById(scheduleId).populate("serviceId");
    if (!schedule || schedule.status !== "open") {
      return res
        .status(400)
        .json({ message: "Lich khoi hanh nay hien khong kha dung" });
    }

    const availableSlots = Number(schedule.maxSlots || 0) - Number(schedule.bookedSlots || 0);
    if (Number(numPeople) > availableSlots) {
      return res.status(400).json({
        message: `Khong du cho. Chi con ${availableSlots} cho trong.`,
      });
    }

    const service = schedule.serviceId;
    const baseTotalPrice = Number(service.prices || 0) * Number(numPeople || 0);
    let discountAmount = 0;
    let couponId = null;
    let normalizedCouponCode = "";

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: String(couponCode).trim().toUpperCase(),
        provider_id: service.provider_id,
        status: "active",
      });

      if (coupon) {
        const now = new Date();
        const withinTimeRange =
          (!coupon.startDate || coupon.startDate <= now) &&
          (!coupon.endDate || coupon.endDate >= now);

        if (
          withinTimeRange &&
          Number(coupon.usedCount || 0) < Number(coupon.maxUsage || 1) &&
          baseTotalPrice >= Number(coupon.minOrderValue || 0)
        ) {
          const allowedServiceIds = Array.isArray(coupon.serviceIds)
            ? coupon.serviceIds.map((item) => String(item))
            : [];
          const serviceAllowed =
            allowedServiceIds.length === 0 ||
            allowedServiceIds.includes(String(service._id));

          if (serviceAllowed) {
            if (coupon.discountType === "percent") {
              discountAmount = Math.floor(
                (baseTotalPrice * Number(coupon.discountValue || 0)) / 100,
              );
            } else {
              discountAmount = Number(coupon.discountValue || 0);
            }

            if (discountAmount > baseTotalPrice) discountAmount = baseTotalPrice;
            couponId = coupon._id;
            normalizedCouponCode = coupon.code;
            coupon.usedCount += 1;
            await coupon.save();
          }
        }
      }
    }

    const finalPrice = Math.max(baseTotalPrice - discountAmount, 0);
    const normalizedPaymentFlow =
      String(paymentFlow || "").toLowerCase() === "vnpay" ? "vnpay" : "manual";

    const newOrder = await Order.create({
      userId: req.user.id,
      serviceId: service._id,
      scheduleId: schedule._id,
      provider_id: service.provider_id,
      tourSnapshot: {
        name: service.serviceName,
        departureDate: schedule.departureDate,
        pricePerPerson: service.prices,
      },
      customerInfo,
      numPeople,
      originalPrice: baseTotalPrice,
      totalPrice: finalPrice,
      couponCode: normalizedCouponCode,
      couponId,
      discountAmount,
      finalPrice,
      note,
      status:
        normalizedPaymentFlow === "vnpay"
          ? "awaiting_payment"
          : "awaiting_confirm",
      paymentStatus: "unpaid",
    });

    schedule.bookedSlots += Number(numPeople);
    if (schedule.bookedSlots >= schedule.maxSlots) {
      schedule.status = "full";
    }
    await schedule.save();

    return res.status(201).json({
      message:
        normalizedPaymentFlow === "vnpay"
          ? "Da tao don cho thanh toan"
          : "Dat tour thanh cong, vui long cho doi tac xac nhan",
      data: newOrder,
    });
  } catch (error) {
    console.error("Loi createOrder:", error);
    return res.status(500).json({ message: "Loi he thong khi dat tour" });
  }
};

// Lich su dat tour cua user
module.exports.getMyOrders = async (req, res) => {
  try {
    const myOrders = await Order.find({ userId: req.user.id })
      .populate("serviceId", "serviceName images")
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: myOrders });
  } catch (error) {
    return res.status(500).json({ message: "Loi he thong" });
  }
};

// User huy don cua chinh minh
module.exports.cancelMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    if (String(order.userId) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Ban khong co quyen huy don nay" });
    }

    if (
      !["awaiting_payment", "awaiting_confirm", "confirmed"].includes(
        order.status,
      )
    ) {
      return res.status(400).json({
        message:
          "Chi co the huy don dang cho thanh toan, cho xac nhan hoac da xac nhan",
      });
    }

    if (order.status !== "cancelled") {
      await releaseScheduleSlots(order);
    }

    order.status = "cancelled";
    if (order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    }

    await order.save();

    return res.status(200).json({
      message:
        order.paymentStatus === "refunded"
          ? "Da huy don va ghi nhan hoan tien"
          : "Da huy don thanh cong",
      data: order,
    });
  } catch (error) {
    console.error("Loi cancelMyOrder:", error);
    return res.status(500).json({ message: "Loi he thong khi huy don" });
  }
};

// Danh sach don hang cho admin
module.exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("serviceId", "serviceName images location")
      .populate("provider_id", "fullName")
      .populate("userId", "fullName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: orders });
  } catch (error) {
    return res.status(500).json({ message: "Loi he thong" });
  }
};

// Danh sach don cua provider
module.exports.getProviderOrders = async (req, res) => {
  try {
    const orders = await Order.find({ provider_id: req.user.id })
      .populate("serviceId", "serviceName location destination region")
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: orders });
  } catch (error) {
    return res.status(500).json({ message: "Loi he thong" });
  }
};

// Provider/Admin cap nhat trang thai don
module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    if (
      String(order.provider_id) !== String(req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Ban khong co quyen xu ly don nay" });
    }

    if (status === "cancelled" && order.status !== "cancelled") {
      await releaseScheduleSlots(order);
    }

    if (status === "completed" && order.status !== "confirmed") {
      return res.status(400).json({
        message: "Chi co the hoan tat tour khi don hang da duoc xac nhan",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status, paymentStatus },
      { new: true },
    );

    return res.status(200).json({
      message: "Cap nhat trang thai don hang thanh cong",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Loi updateOrderStatus:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
