const Order = require("../models/Order.js");
const Schedule = require("../models/Schedule.js");
const Service = require("../models/Service.js");

//  TẠO ĐƠN ĐẶT TOUR MỚI (USER)
module.exports.createOrder = async (req, res) => {
  try {
    const { scheduleId, numPeople, customerInfo, note } = req.body;

    // 1. Kiểm tra lịch khởi hành có tồn tại và còn mở không
    const schedule = await Schedule.findById(scheduleId).populate("serviceId");
    if (!schedule || schedule.status !== "open") {
      return res
        .status(400)
        .json({ message: "Lịch khởi hành này hiện không khả dụng" });
    }

    // 2. Kiểm tra số chỗ trống
    const availableSlots = schedule.maxSlots - schedule.bookedSlots;
    if (numPeople > availableSlots) {
      return res.status(400).json({
        message: `Không đủ chỗ. Chỉ còn ${availableSlots} chỗ trống.`,
      });
    }

    // 3. Lấy thông tin tour để làm Snapshot và tính giá
    const service = schedule.serviceId;
    const totalPrice = service.prices * numPeople;

    // 4. Tạo đơn hàng
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
      totalPrice,
      note,
      status: "awaiting_confirm",
      paymentStatus: "unpaid",
    });

    // 5. CẬP NHẬT BOOKED SLOTS TRONG SCHEDULE
    schedule.bookedSlots += Number(numPeople);
    if (schedule.bookedSlots >= schedule.maxSlots) {
      schedule.status = "full";
    }
    await schedule.save();

    return res.status(201).json({
      message: "Đặt tour thành công, vui lòng chờ đối tác xác nhận",
      data: newOrder,
    });
  } catch (error) {
    console.error("Lỗi createOrder:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi đặt tour" });
  }
};

//  LỊCH SỬ ĐẶT TOUR CỦA KHÁCH (USER)
module.exports.getMyOrders = async (req, res) => {
  try {
    const myOrders = await Order.find({ userId: req.user.id })
      .populate("serviceId", "serviceName images")
      .sort({ createdAt: -1 });
    return res.status(200).json({ data: myOrders });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// DANH SÁCH ĐƠN HÀNG CHO ADMIN
module.exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("serviceId", "serviceName images location")
      .populate("provider_id", "fullName")
      .populate("userId", "fullName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: orders });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// QUẢN LÝ ĐƠN HÀNG DÀNH CHO PROVIDER
module.exports.getProviderOrders = async (req, res) => {
  try {
    const orders = await Order.find({ provider_id: req.user.id })
      .populate("serviceId", "serviceName location destination region")
      .sort({ createdAt: -1 });
    return res.status(200).json({ data: orders });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (PROVIDER/ADMIN)
module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Kiểm tra quyền (Chỉ Provider của tour đó hoặc Admin)
    if (
      order.provider_id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xử lý đơn này" });
    }

    // XỬ LÝ LOGIC KHI HỦY ĐƠN (Để trả lại chỗ cho bảng Schedule)
    if (status === "cancelled" && order.status !== "cancelled") {
      const schedule = await Schedule.findById(order.scheduleId);
      if (schedule) {
        schedule.bookedSlots -= order.numPeople;
        if (schedule.status === "full") schedule.status = "open";
        await schedule.save();
      }
    }

    if (status === "completed" && order.status !== "confirmed") {
      return res.status(400).json({
        message: "Chỉ có thể hoàn tất tour khi đơn hàng đã được xác nhận",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status, paymentStatus },
      { new: true },
    );

    return res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Lỗi updateOrderStatus:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
