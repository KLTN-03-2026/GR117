const Schedule = require("../models/Schedule.js");
const Service = require("../models/Service.js");
const Order = require("../models/Order.js");
const {
  validateCreateSchedule,
  validateUpdateSchedule,
} = require("../validations/scheduleValidation.js");

module.exports.createSchedule = async (req, res) => {
  try {
    const validation = validateCreateSchedule(req.body);
    if (!validation.isValid) {
      return res.status(validation.status).json({ message: validation.message });
    }

    const { serviceId, departureDate, endDate, maxSlots, status } =
      validation.data;
    const service = await Service.findById(serviceId);
    if (!service) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tour để tạo lịch" });
    }

    if (String(service.provider_id) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền tạo lịch cho tour này" });
    }

    const newSchedule = await Schedule.create({
      serviceId,
      departureDate,
      endDate,
      maxSlots,
      status,
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

module.exports.getSchedulesByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId).select("provider_id");
    const canManageSchedules =
      service &&
      req.user?.role === "provider" &&
      String(service.provider_id) === String(req.user.id);

    const query = canManageSchedules
      ? { serviceId }
      : {
          serviceId,
          status: "open",
          departureDate: { $gte: new Date() },
        };

    const schedules = await Schedule.find(query).sort({ departureDate: 1 });

    return res.status(200).json({ data: schedules });
  } catch (error) {
    console.error("Lỗi getSchedulesByService:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

module.exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id).populate("serviceId");
    if (!schedule) {
      return res.status(404).json({ message: "Không tìm thấy lịch" });
    }

    if (String(schedule.serviceId.provider_id) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa lịch này" });
    }

    const validation = validateUpdateSchedule(req.body, schedule.bookedSlots);
    if (!validation.isValid) {
      return res.status(validation.status).json({ message: validation.message });
    }

    const { maxSlots, status, departureDate, endDate } = validation.data;
    const updateData = {
      maxSlots,
      status,
      departureDate,
      endDate: endDate || null,
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const updatedSchedule = await Schedule.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
    });

    if (departureDate) {
      await Order.updateMany(
        {
          scheduleId: schedule._id,
          status: { $nin: ["completed", "cancelled"] },
        },
        {
          $set: {
            "tourSnapshot.departureDate": updatedSchedule.departureDate,
          },
        },
      );
    }

    return res
      .status(200)
      .json({ message: "Cập nhật lịch thành công", data: updatedSchedule });
  } catch (error) {
    console.error("Lỗi updateSchedule:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

module.exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate(
      "serviceId",
    );
    if (!schedule) {
      return res.status(404).json({ message: "Không tìm thấy lịch" });
    }

    if (String(schedule.serviceId.provider_id) !== String(req.user.id)) {
      return res.status(403).json({ message: "Không có quyền xóa lịch này" });
    }

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
