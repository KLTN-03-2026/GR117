const Service = require("../models/services.js")
const Schedule = require("../models/schedule.js")
const Order = require("../models/order.js")

module.exports.createOrder = async (req, res) => {
  try {
    const { scheduleId, quantity, note } = req.body;

    // validate
    if (!scheduleId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Thiếu scheduleId hoặc quantity",
      });
    }

    // tìm schedule
    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch",
      });
    }

    // check số lượng người
    if (quantity > schedule.maxPeople) {
      return res.status(400).json({
        success: false,
        message: "Số lượng vượt quá giới hạn",
      });
    }

    // tạo order
    const newOrder = new Order({
      scheduleId: schedule._id,
      departureDate: schedule.departureDate, // lấy từ schedule
      quantity,
      note,
      userId: req.user?.id, // nếu có auth
    });

    await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Đặt lịch thành công",
      data: newOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};