const Schedule = require("../models/schedule.js");
const Service = require("../models/services.js");

const ALLOWED_STATUS = ["open", "full", "closed"];

const resolveServiceId = (reqBody) =>
  String(reqBody.serviceId || reqBody.service_id || "").trim();

const canAccessService = (service, user) => {
  if (!service || !user) return false;
  if (user.role === "admin") return true;
  return String(service.provider_id || "") === String(user.id || "");
};

const buildServiceFilter = (user) => {
  if (user?.role === "provider") {
    return { provider_id: user.id };
  }
  return {};
};

module.exports.registerSchedule = async (req, res) => {
  try {
    const { departureDate, endDate, maxPeople, note, status } = req.body;
    const normalizedServiceId = resolveServiceId(req.body);

    if (!normalizedServiceId || !departureDate || !endDate || !maxPeople) {
      return res.status(400).json({ message: "Thieu du lieu" });
    }

    const depDate = new Date(departureDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (depDate < today || end < today) {
      return res.status(400).json({ message: "Khong duoc chon ngay trong qua khu" });
    }

    if (end < depDate) {
      return res.status(400).json({ message: "Ngay ve phai sau ngay di" });
    }

    if (status && !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: "Trang thai khong hop le" });
    }

    const service = await Service.findById(normalizedServiceId);
    if (!service) {
      return res.status(404).json({ message: "Service khong ton tai" });
    }

    if (!canAccessService(service, req.user)) {
      return res.status(403).json({ message: "Ban khong co quyen tao lich cho dich vu nay" });
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
    const filter = buildServiceFilter(req.user);
    const services = await Service.find(filter).select("_id serviceName location region provider_id");

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
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service khong ton tai" });
    }

    if (req.user && req.user.role === "provider" && !canAccessService(service, req.user)) {
      return res.status(403).json({ message: "Ban khong co quyen xem lich nay" });
    }

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
    const serviceFilter = buildServiceFilter(req.user);
    const services = await Service.find(serviceFilter).select("_id");
    const serviceIds = services.map((item) => String(item._id));

    const schedules = await Schedule.find(
      req.user?.role === "provider"
        ? { service_id: { $in: serviceIds } }
        : {},
    ).sort({
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

module.exports.updateOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { departureDate, endDate, maxPeople, note, status } = req.body;
    const normalizedServiceId = resolveServiceId(req.body);

    if (!normalizedServiceId || !departureDate || !endDate || !maxPeople) {
      return res.status(400).json({ message: "Thieu du lieu" });
    }

    const depDate = new Date(departureDate);
    const end = new Date(endDate);

    if (Number.isNaN(depDate.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: "Ngay khong hop le" });
    }

    if (end < depDate) {
      return res.status(400).json({ message: "Ngay ve phai sau ngay di" });
    }

    if (status && !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: "Trang thai khong hop le" });
    }

    const service = await Service.findById(normalizedServiceId);
    if (!service) {
      return res.status(404).json({ message: "Service khong ton tai" });
    }

    if (!canAccessService(service, req.user)) {
      return res.status(403).json({ message: "Ban khong co quyen cap nhat lich nay" });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule khong ton tai",
      });
    }

    schedule.service_id = service._id;
    schedule.departureDate = depDate;
    schedule.endDate = end;
    schedule.maxPeople = Number(maxPeople);
    schedule.note = note;

    if (status) {
      schedule.status = status;
    }

    await schedule.save();

    return res.status(200).json({
      success: true,
      message: "Cap nhat schedule thanh cong",
      data: schedule,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Loi server",
      error: error.message,
    });
  }
};

module.exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule khong ton tai",
      });
    }

    const service = await Service.findById(schedule.service_id);
    if (!canAccessService(service, req.user)) {
      return res.status(403).json({ message: "Ban khong co quyen xoa lich nay" });
    }

    await Schedule.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Xoa schedule thanh cong",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Loi server",
      error: error.message,
    });
  }
};
