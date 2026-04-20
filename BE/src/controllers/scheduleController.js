const Schedule = require("../models/Schedule.js");
const Service = require("../models/Service.js");

//  TẠO LỊCH KHỞI HÀNH MỚI (PROVIDER)
module.exports.createSchedule = async (req, res) => {
  try {
    const { serviceId, departureDate, endDate, maxSlots, status } = req.body;

    // 1. Kiểm tra tour có tồn tại không
    const service = await Service.findById(serviceId);
    if (!service) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tour để tạo lịch" });
    }

    // 2. Kiểm tra quyền sở hữu: Chỉ chủ tour mới được tạo lịch
    if (service.provider_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền tạo lịch cho tour này" });
    }

    // 3. Kiểm tra ngày khởi hành không được ở quá khứ
    if (new Date(departureDate) < new Date()) {
      return res
        .status(400)
        .json({ message: "Ngày khởi hành không được ở quá khứ" });
    }

    const newSchedule = await Schedule.create({
      serviceId,
      departureDate,
      endDate: endDate || null,
      maxSlots,
      status: status || "open",
    });

    return res.status(201).json({
      message: "Tạo lịch khởi hành thành công",
      data: newSchedule,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Tour này đã có lịch khởi hành trong ngày này" });
    }
    console.error("Lỗi createSchedule:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// LẤY LỊCH THEO TOUR (PUBLIC)
module.exports.getSchedulesByService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Lấy các lịch còn mở (open) và ngày khởi hành chưa trôi qua
    const schedules = await Schedule.find({
      serviceId,
      status: "open",
      departureDate: { $gte: new Date() },
    }).sort({ departureDate: 1 });

    return res.status(200).json({ data: schedules });
  } catch (error) {
    console.error("Lỗi getSchedulesByService:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//  CẬP NHẬT LỊCH (PROVIDER)
module.exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxSlots, status, departureDate, endDate } = req.body;

    const schedule = await Schedule.findById(id).populate("serviceId");
    if (!schedule)
      return res.status(404).json({ message: "Không tìm thấy lịch" });

    // Kiểm tra quyền: serviceId trong schedule đã được populate thành object Service
    if (schedule.serviceId.provider_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa lịch này" });
    }

    // Nếu cập nhật số chỗ, không được nhỏ hơn số chỗ đã đặt
    if (maxSlots && maxSlots < schedule.bookedSlots) {
      return res.status(400).json({
        message: `Số chỗ tối đa không thể nhỏ hơn số khách đã đặt (${schedule.bookedSlots})`,
      });
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { maxSlots, status, departureDate, endDate: endDate || null },
      { new: true },
    );

    return res
      .status(200)
      .json({ message: "Cập nhật lịch thành công", data: updatedSchedule });
  } catch (error) {
    console.error("Lỗi updateSchedule:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//  XÓA LỊCH (PROVIDER)
module.exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate(
      "serviceId",
    );
    if (!schedule)
      return res.status(404).json({ message: "Không tìm thấy lịch" });

    if (schedule.serviceId.provider_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Không có quyền xóa lịch này" });
    }

    // Nếu đã có khách đặt (bookedSlots > 0) thì không cho xóa, chỉ cho phép "closed"
    if (schedule.bookedSlots > 0) {
      return res.status(400).json({
        message:
          "Không thể xóa lịch đã có khách đặt. Hãy chuyển trạng thái sang Closed.",
      });
    }

    await Schedule.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Đã xóa lịch khởi hành" });
  } catch (error) {
    console.error("Lỗi deleteSchedule:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
