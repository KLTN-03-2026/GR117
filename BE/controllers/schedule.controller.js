const Schedule = require("../models/schedule.js");
const Service = require("../models/services.js");

module.exports.registerSchedule = async (req, res) => {
  try {
    const { serviceId, departureDate, endDate, maxPeople, note } = req.body;

    if (!serviceId || !departureDate || !endDate || !maxPeople) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const depDate = new Date(departureDate);
    const end = new Date(endDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // check quá khứ
    if (depDate < today || end < today) {
      return res.status(400).json({
        message: "Không được chọn ngày trong quá khứ",
      });
    }

    // check logic ngày
    if (end < depDate) {
      return res.status(400).json({
        message: "Ngày về phải sau ngày đi",
      });
    }

    //dùng ID để tìm service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service không tồn tại" });
    }

    const newSchedule = await Schedule.create({
      service_id: service._id,
      departureDate: depDate,
      endDate: end,
      maxPeople: Number(maxPeople),
      note,
    });

    res.status(201).json({
      success: true,
      message: "Thêm lịch thành công",
      data: newSchedule,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getServiceList = async (req, res) => {
  try {
    const services = await Service.find().select("_id serviceName");

    res.json({
      success: true,
      data: services,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};