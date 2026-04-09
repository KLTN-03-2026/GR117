const Schedule = require("../models/schedule.js");
const Service = require("../models/services.js");

const ALLOWED_STATUS = ["open", "full", "closed"];

module.exports.registerSchedule = async (req, res) => {
  try {
    const {
      serviceId,
      service_id,
      departureDate,
      endDate,
      maxPeople,
      note,
      status,
    } = req.body;
    const normalizedServiceId = String(serviceId || service_id || "").trim();

    if (!normalizedServiceId || !departureDate || !endDate || !maxPeople) {
      return res.status(400).json({ message: "Thieu du lieu" });
    }

    const depDate = new Date(departureDate);
    const end = new Date(endDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (depDate < today || end < today) {
      return res.status(400).json({
        message: "Khong duoc chon ngay trong qua khu",
      });
    }

    if (end < depDate) {
      return res.status(400).json({
        message: "Ngay ve phai sau ngay di",
      });
    }

    if (status && !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({
        message: "Trang thai khong hop le",
      });
    }

    const service = await Service.findOne({ _id: normalizedServiceId });
    if (!service) {
      return res.status(404).json({ message: "Service khong ton tai" });
    }

    const newSchedule = await Schedule.create({
      service_id: service._id,
      departureDate: depDate,
      endDate: end,
      maxPeople: Number(maxPeople),
      bookedSlots: 0,
      status: status || "open",
      note,
    });

    return res.status(201).json({
      success: true,
      message: "Them lich thanh cong",
      data: newSchedule,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getServiceList = async (req, res) => {
  try {
    const services = await Service.find().select("_id serviceName");

    return res.json({
      success: true,
      data: services,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getSchedulesByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const schedules = await Schedule.find({ service_id: serviceId }).sort({
      departureDate: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({}).sort({
      departureDate: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Schedule.findById(id);

    // XÓA DB
    await Schedule.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Xóa schedule thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
