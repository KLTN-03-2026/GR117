const Services = require("../models/services.js");
const fs = require("fs");
const path = require("path");
// ================= ADD =================
exports.addServices = async (req, res) => {
  try {
    const {
      supplierId,
      ServiceName,
      category,
      location,
      region,
      duration,
      price,
      averageRating,
      totalReviews,
      descriptionDetail,
      imageUrl,
      status
    } = req.body;
    //xử lí ảnh 
    const imageFile = req.file ? req.file.filename : null;
    const finalImageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : imageUrl || null;

    if (!ServiceName || !price) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ServiceName hoặc price",
      });
    }

    const newService = new Services({
      supplierId,
      ServiceName,
      category,
      location,
      region,
      duration: duration ? Number(duration) : undefined,
      price: Number(price),
      averageRating: Number(averageRating) || 0,
      totalReviews: Number(totalReviews) || 0,
      descriptionDetail,
      imageFile,
      imageUrl: finalImageUrl,
      status : status || 'active'
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

// ================= MAP FIELD =================
const mapFields = (data) => {
  const update = { ...data };

  if (update.prices) {
    update.price = Number(update.prices);
    delete update.prices;
  }

  if (update.servicesName) {
    update.ServiceName = update.servicesName;
    delete update.servicesName;
  }

  if (update.total_review) {
    update.totalReviews = Number(update.total_review);
    delete update.total_review;
  }

  if (update.rating) {
    update.averageRating = Number(update.rating);
    delete update.rating;
  }

  if (update.supplier) {
    update.supplierId = update.supplier;
    delete update.supplier;
  }

  if (update.destination && !update.location) {
    update.location = update.destination;
    delete update.destination;
  }

  return update;
};

// ================= PUT =================
module.exports.putServices = async (req, res) => {
  try {
    const { id } = req.params;

    let updateData = mapFields(req.body);

    if (req.file) {
      updateData.imageFile = req.file.filename;
      updateData.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const updatedService = await Services.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service không tồn tại" });
    }

    return res.status(200).json({
      message: "Cập nhật dịch vụ thành công",
      data: updatedService,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi cập nhật dịch vụ",
      error: error.message,
    });
  }
};

// ================= PATCH =================
module.exports.patchServices = async (req, res) => {
  try {
    const { id } = req.params;

    let updateFields = mapFields(req.body);

    if (req.file) {
      updateFields.imageFile = req.file.filename;
      updateFields.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const updatedService = await Services.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service không tồn tại" });
    }

    return res.status(200).json({
      message: "Cập nhật một phần thành công",
      data: updatedService,
    });

  } catch (error) {
    return res.status(500).json({
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
      message: "Xóa service + ảnh thành công",
    });

  } catch (error) {
    return res.status(500).json({
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