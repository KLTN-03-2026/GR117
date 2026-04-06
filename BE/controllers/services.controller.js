const services = require("../models/services.model.js");

exports.addServices = async (req, res) => {
  try {
    const {
      supplier,
      servicesName,
      category,
      destination,
      descriptionDetail,
      prices,
      rating,
      total_review,
      status,
      location,
      schedule,
      duration,
      highlights,
      includedServices,
      meals,
      experiences,
      accommodation,
      policies,
      supplierRating,
      tags,
    } = req.body;

    // Chuẩn hóa dữ liệu
    const parsedHighlights = Array.isArray(highlights)
      ? highlights
      : highlights
      ? [highlights]
      : [];

    const parsedIncluded = Array.isArray(includedServices)
      ? includedServices
      : includedServices
      ? [includedServices]
      : [];

    const parsedPolicies = Array.isArray(policies)
      ? policies
      : policies
      ? [policies]
      : [];

    const parsedTags = Array.isArray(tags) ? tags : tags ? [tags] : [];

    // Xử lý file upload
    const imageFile = req.file ? req.file.filename : null;
    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const service = new services({
      supplier,
      servicesName,
      category,
      destination,
      descriptionDetail,
      prices: prices ? Number(prices) : 0,
      rating: rating ? Number(rating) : 0,
      total_review: total_review ? Number(total_review) : 0,
      status: ["approval", "reject", "pending"].includes(status)
        ? status
        : "pending",
      location,
      imageFile,
      imageUrl,
      schedule: Array.isArray(schedule) ? schedule : [],
      duration: duration || "",
      highlights: parsedHighlights,
      includedServices: parsedIncluded,
      meals: meals ? Number(meals) : 0,
      experiences: experiences ? Number(experiences) : 0,
      accommodation: Array.isArray(accommodation) ? accommodation : [],
      policies: parsedPolicies,
      supplierRating: supplierRating ? Number(supplierRating) : 0,
      tags: parsedTags,
    });

    await service.save();
    res.status(201).json({
      success: true,
      message: "Thêm dịch vụ thành công",
      data: service,
    });
  } catch (err) {
    console.error("Add Service Error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm dịch vụ",
      error: err.message,
    });
  }
};


module.exports.putServices = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Nếu có file mới thì thay ảnh, nếu không thì giữ nguyên ảnh cũ từ body
    if (req.file) {
      updateData.thumbnail = req.file.path; // multer sẽ lưu vào /uploads
    }

    const updatedService = await services.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      overwrite: true,
    });

    if (!updatedService) {
      return res.status(404).json({ message: "Service không tồn tại" });
    }

    return res.status(200).json({
      message: "Cập nhật toàn bộ dịch vụ thành công",
      data: updatedService,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi cập nhật dịch vụ",
      error: error.message,
    });
  }
};

module.exports.patchServices = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    if (req.file) {
      updateFields.thumbnail = req.file.path;
    }

    const updatedService = await services.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service không tồn tại" });
    }

    return res.status(200).json({
      message: "Cập nhật một phần dịch vụ thành công",
      data: updatedService,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi cập nhật dịch vụ",
      error: error.message,
    });
  }
};

// Xóa một service theo ID
module.exports.deleteOne = async (req, res) => {
  try {
    //lấy ra id services và xóa đi sv đó
    const { id } = req.params;
    const deletedService = await services.findByIdAndDelete(id);

    //check đk để xóa
    if (!deletedService) {
      return res.status(404).json({
        message: "Service không tồn tại",
      });
    }

    return res.status(200).json({
      message: "Xóa service thành công",
      data: deletedService,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// Xóa nhiều service theo danh sách ID
module.exports.deleteServices = async (req, res) => {
  try {
    const { ids } = req.body;
    // nhận mảng id từ body

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        message: "Danh sách ID không hợp lệ",
      });
    }

    const DeleteMany = await services.deleteMany({ _id: { $in: ids } });
    return res
      .status(200)
      .json({
        message: "Xóa nhiều service thành công",
        deletedCount: DeleteMany,
      });
    return res.status(200).json({ message: "Xóa nhiều service thành công", deletedCount: DeleteMany, });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

//hoàn thành
exports.servicesDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await services.findById(id);

    if (!service) {
      return res.status(404).json({
        message: "Không tìm thấy dịch vụ",
      });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


module.exports.allServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;

    const skip = (page - 1) * limit;

    // lấy data phân trang
    const data = await services
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // tổng số lượng
    const total = await services.countDocuments();

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách dịch vụ thành công",
      data: data,
      pagination: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lấy danh sách dịch vụ thất bại",
    });
  }
};

