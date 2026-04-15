const Services = require("../models/services.js");
const fs = require("fs");
const path = require("path");
const accounts = require("../models/account.js");

const splitLines = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const parseStringArrayField = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch (error) {
    // Fallback to newline parsing.
  }

  return splitLines(value);
};

const parseItineraryField = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const ALLOWED_ACTIVITY_ICONS = new Set([
  "transport",
  "hotel",
  "food",
  "sightseeing",
  "activity",
  "photo",
]);

const normalizeItineraryField = (value) =>
  parseItineraryField(value)
    .map((dayItem, index) => ({
      day: Number(dayItem?.day) > 0 ? Number(dayItem.day) : index + 1,
      title: String(dayItem?.title || "").trim(),
      description: String(dayItem?.description || "").trim(),
      meals: Array.isArray(dayItem?.meals)
        ? dayItem.meals.map((item) => String(item).trim()).filter(Boolean)
        : [],
      accommodation: String(dayItem?.accommodation || "").trim(),
      activities: Array.isArray(dayItem?.activities)
        ? dayItem.activities.map((activity) => {
            const icon = String(activity?.icon || "activity")
              .trim()
              .toLowerCase();

            return {
              time: String(activity?.time || "").trim(),
              title: String(activity?.title || "").trim(),
              description: String(activity?.description || "").trim(),
              icon: ALLOWED_ACTIVITY_ICONS.has(icon) ? icon : "activity",
            };
          })
        : [],
    }))
    .filter((dayItem) =>
      dayItem.title || dayItem.description || dayItem.activities.length,
    );

const isOwnerOrAdmin = (service, user) => {
  if (!service || !user) return false;
  if (user.role === "admin") return true;
  return String(service.provider_id || "") === String(user.id || "");
};

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
    } = req.body;

    if (!serviceName || !prices || !nameProvider) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const userId = req.user?.id;
    const user = await accounts.findOne({ _id: userId, role: "provider" });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện hành động này",
      });
    }

    const imageFile = req.file ? req.file.filename : null;
    const finalImageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : imageUrl || null;

    const newService = new Services({
      provider_id: user._id,
      nameProvider: user.fullName || user.email || "",
      serviceName,
      category: Array.isArray(category) ? category : [category].filter(Boolean),
      location,
      region,
      duration: duration ? String(duration) : undefined,
      prices: Number(prices),
      highlight: parseStringArrayField(highlight),
      description,
      serviceIncludes: parseStringArrayField(serviceIncludes),
      itinerary: normalizeItineraryField(itinerary),
      imageFile,
      imageUrl: finalImageUrl,
      status: "pending",
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

exports.publicServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const data = await Services.find({ status: "active" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Services.countDocuments({ status: "active" });

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

exports.putServices = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Services.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Không tìm thấy service" });
    }

    if (!isOwnerOrAdmin(service, req.user)) {
      return res.status(403).json({ message: "Bạn không có quyền sửa dịch vụ này" });
    }

    let updateData = { ...req.body };
    delete updateData.provider_id;
    delete updateData.nameProvider;

    if (updateData.prices) updateData.prices = Number(updateData.prices);
    if (updateData.duration) updateData.duration = String(updateData.duration);
    if (updateData.highlight !== undefined) {
      updateData.highlight = parseStringArrayField(updateData.highlight);
    }
    if (updateData.serviceIncludes !== undefined) {
      updateData.serviceIncludes = parseStringArrayField(updateData.serviceIncludes);
    }
    if (updateData.itinerary !== undefined) {
      updateData.itinerary = normalizeItineraryField(updateData.itinerary);
    }
    if (updateData.category !== undefined) {
      updateData.category = Array.isArray(updateData.category)
        ? updateData.category
        : [updateData.category].filter(Boolean);
    }

    if (req.file) {
      updateData.imageFile = req.file.filename;
      updateData.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const updated = await Services.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.json({
      success: true,
      message: "Update thành công",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.patchServices = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Services.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service không tồn tại",
      });
    }

    if (!isOwnerOrAdmin(service, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật dịch vụ này",
      });
    }

    let updateFields = { ...req.body };
    delete updateFields.provider_id;
    delete updateFields.nameProvider;

    if (updateFields.prices !== undefined) {
      updateFields.prices = Number(updateFields.prices);
    }

    if (updateFields.duration !== undefined) {
      updateFields.duration = String(updateFields.duration);
    }

    if (updateFields.highlight !== undefined) {
      updateFields.highlight = parseStringArrayField(updateFields.highlight);
    }

    if (updateFields.serviceIncludes !== undefined) {
      updateFields.serviceIncludes = parseStringArrayField(updateFields.serviceIncludes);
    }

    if (updateFields.itinerary !== undefined) {
      updateFields.itinerary = normalizeItineraryField(updateFields.itinerary);
    }

    if (updateFields.category !== undefined) {
      updateFields.category = Array.isArray(updateFields.category)
        ? updateFields.category
        : [updateFields.category].filter(Boolean);
    }

    if (req.file) {
      updateFields.imageFile = req.file.filename;
      updateFields.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    Object.keys(updateFields).forEach(
      (key) => updateFields[key] === undefined && delete updateFields[key],
    );

    const updatedService = await Services.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true },
    );

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

exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Services.findById(id);

    if (!service) {
      return res.status(404).json({
        message: "Service không tồn tại",
      });
    }

    if (!isOwnerOrAdmin(service, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa dịch vụ này",
      });
    }

    if (service.imageFile) {
      const filePath = path.join(__dirname, "..", "uploads", service.imageFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

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

exports.deleteServices = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({
        message: "Danh sách ID không hợp lệ",
      });
    }

    const services = await Services.find({ _id: { $in: ids } });
    const unauthorized = services.find((service) => !isOwnerOrAdmin(service, req.user));

    if (unauthorized) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa một số dịch vụ trong danh sách này",
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

exports.servicesDetail = async (req, res) => {
  try {
    const service = await Services.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Không tìm thấy dịch vụ",
      });
    }

    if (req.user && req.user.role === "provider" && !isOwnerOrAdmin(service, req.user)) {
      return res.status(403).json({
        message: "Bạn không có quyền xem dịch vụ này",
      });
    }

    return res.json(service);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.allServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const filter = req.user?.role === "provider" ? { provider_id: req.user.id } : {};

    const data = await Services.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Services.countDocuments(filter);

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
