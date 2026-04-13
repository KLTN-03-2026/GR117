const Services = require("../models/services.js");
const fs = require("fs");
const path = require("path");
const accounts = require("../models/account.js");
// ================= ADD =================
exports.addServices = async (req, res) => {
  try {
    const {
      serviceName,
      nameProvider,
      category,
      location,
      region,
      duration,
      prices,
      highlight,
      description,
      imageUrl,
      itinerary,
      serviceIncludes,
      status,
    } = req.body;  
    //  Validate cơ bản
    if (!serviceName || !prices || !nameProvider  ) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc "
      });
    } 
    const userId = req.user?.id;
    const user = await accounts.findOne({ _id: userId, role: "provider" });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện hành động này"
      });
    }

    // Xử lý ảnh
    const imageFile = req.file ? req.file.filename : null;
    const finalImageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : imageUrl || null;

    const newService = new Services({
      serviceName,
      provider_id: user._id,
      nameProvider: user.fullName || user.email || "",
      category,
      location,
      region,
      duration: duration ? Number(duration) : undefined,
      prices: Number(prices),
      highlight,
      description, //
      serviceIncludes,
      itinerary,
      imageFile,
      imageUrl: finalImageUrl,
      status: status || "active",
    });

    await newService.save();

    return res.status(201).json({
      success: true,
      message: "Thêm dịch vụ thành công",
      data: newService,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thêm dịch vụ",
      error: err.message,
    });
  }
};

// ================= PUT =================
module.exports.putServices = async (req, res) => {
  try {
    const { id } = req.params;

    let updateData = { ...req.body };

    if (updateData.prices) updateData.prices = Number(updateData.prices);
    if (updateData.duration) updateData.duration = Number(updateData.duration);

    // ảnh
    if (req.file) {
      updateData.imageFile = req.file.filename;
      updateData.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    // xoá field rỗng
    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k]
    );

    const updated = await Services.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy service" });
    }

    res.json({
      success: true,
      message: "Update thành công",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= PATCH =================
module.exports.patchServices = async (req, res) => {
  try {
    const { id } = req.params;

    let updateFields = { ...req.body };

    // 🔹 convert số
    if (updateFields.prices !== undefined)
      updateFields.prices = Number(updateFields.prices);

    if (updateFields.duration !== undefined)
      updateFields.duration = Number(updateFields.duration);

    // 🔹 xử lý ảnh
    if (req.file) {
      updateFields.imageFile = req.file.filename;
      updateFields.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    // 🔹 xoá field undefined
    Object.keys(updateFields).forEach(
      (k) => updateFields[k] === undefined && delete updateFields[k]
    );

    const updatedService = await Services.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({
        success: false,
        message: "Service không tồn tại",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật một phần thành công",
      data: updatedService,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật",
      error: error.message,
    });
  }
};
// ================= DELETE ONE =================
module.exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Services.findById(id);

    if (!service) {
      return res.status(404).json({
        message: "Service không tồn tại",
      });
    }

    //  XÓA FILE ẢNH
    if (service.imageFile) {
      const filePath = path.join(__dirname, "..", "uploads", service.imageFile);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // XÓA DB
    await Services.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Xóa service + ảnh thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// ================= DELETE MANY =================
module.exports.deleteServices = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({
        message: "Danh sách ID không hợp lệ",
      });
    }

    const result = await Services.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      message: "Xóa nhiều thành công",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// ================= DETAIL =================
module.exports.servicesDetail = async (req, res) => {
  try {
    const service = await Services.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Không tìm thấy dịch vụ",
      });
    }

    return res.json(service);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ================= LIST + PAGINATION =================
module.exports.allServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const data = await Services.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Services.countDocuments();

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
