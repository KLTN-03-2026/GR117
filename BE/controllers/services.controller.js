const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const Services = require("../models/services.js");
const accounts = require("../models/account.js");
const Reviews = require("../models/reviews.js");
const {
  parseStringArrayField,
  normalizeItineraryField,
  isOwnerOrAdmin,
} = require("../utils/serviceHelpers.js");

const ALLOWED_ACTIVITY_ICONS = new Set([
  "transport",
  "hotel",
  "food",
  "sightseeing",
  "activity",
  "photo",
]);

const attachReviewStats = async (services) => {
  const list = Array.isArray(services) ? services : [];
  const ids = list.map((service) => service._id);

  if (ids.length === 0) {
    return list;
  }

  const reviewStats = await Reviews.aggregate([
    { $match: { serviceID: { $in: ids } } },
    {
      $group: {
        _id: "$serviceID",
        rating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const reviewMap = new Map(
    reviewStats.map((item) => [
      String(item._id),
      {
        rating: Number(item.rating || 0),
        reviewCount: Number(item.reviewCount || 0),
      },
    ]),
  );

  return list.map((service) => {
    const stats = reviewMap.get(String(service._id)) || {
      rating: 0,
      reviewCount: 0,
    };

    return {
      ...(service.toObject ? service.toObject() : service),
      rating: stats.rating,
      reviewCount: stats.reviewCount,
    };
  });
};

const getUploadedFile = (req, fieldName) => req.files?.[fieldName]?.[0] || null;

const removeUploadedFile = (file) => {
  if (!file?.path) return;
  try {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (error) {}
};

const splitDelimitedList = (value) =>
  String(value || "")
    .split(/[\n,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeActivityIcon = (value) => {
  const icon = String(value || "activity").trim().toLowerCase();
  return ALLOWED_ACTIVITY_ICONS.has(icon) ? icon : "activity";
};

const normalizeActivityTime = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const hours = String(value.getHours()).padStart(2, "0");
    const minutes = String(value.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const hours = String(parsed.h).padStart(2, "0");
      const minutes = String(parsed.m).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
  }

  const text = String(value).trim();
  const match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }

  const date = new Date(text);
  if (!Number.isNaN(date.getTime()) && /GMT|UTC|1899|1900/.test(text)) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return text;
};

const parseItineraryFromExcelFile = (file) => {
  if (!file?.path) {
    return [];
  }

  const workbook = XLSX.readFile(file.path, { cellDates: true });
  const sheetName = workbook.SheetNames[1];

  if (!sheetName) {
    throw new Error("File lich trinh phai co sheet 2");
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: "",
    blankrows: false,
  });

  if (!rows.length) {
    throw new Error("File lich trinh khong co dong nao");
  }

  const dayMap = new Map();

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const day = Number(row.day);

    if (!Number.isFinite(day) || day <= 0) {
      throw new Error(`Dong ${rowNumber}: day khong hop le`);
    }

    const current = dayMap.get(day) || {
      day,
      title: "",
      description: "",
      meals: [],
      accommodation: "",
      activities: [],
    };

    const title = String(row.title || "").trim();
    const description = String(row.description || "").trim();
    const accommodation = String(row.accommodation || "").trim();

    if (title && !current.title) current.title = title;
    if (description && !current.description) current.description = description;
    if (accommodation && !current.accommodation) current.accommodation = accommodation;

    const meals = splitDelimitedList(row.meals);
    if (meals.length) {
      current.meals = Array.from(new Set([...(current.meals || []), ...meals]));
    }

    const activityTime = normalizeActivityTime(row.activity_time);
    const activityTitle = String(row.activity_title || "").trim();
    const activityDescription = String(row.activity_description || "").trim();
    const activityIcon = String(row.activity_icon || "").trim();

    if (activityTime || activityTitle || activityDescription || activityIcon) {
      current.activities.push({
        time: activityTime,
        title: activityTitle,
        description: activityDescription,
        icon: normalizeActivityIcon(activityIcon),
      });
    }

    dayMap.set(day, current);
  });

  return Array.from(dayMap.values())
    .sort((a, b) => a.day - b.day)
    .filter(
      (dayItem) =>
        dayItem.title ||
        dayItem.description ||
        dayItem.accommodation ||
        dayItem.meals.length ||
        dayItem.activities.length,
    );
};

// Tạo dịch vụ mới.
exports.addServices = async (req, res) => {
  const itineraryFile = getUploadedFile(req, "itineraryFile");
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
        message: "Thieu thong tin bat buoc",
      });
    }

    const userId = req.user?.id;
    const user = await accounts.findOne({ _id: userId, role: "provider" });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Ban khong co quyen thuc hien hanh dong nay",
      });
    }

    const imageFile = getUploadedFile(req, "image");
    const finalImageUrl = imageFile
      ? `${req.protocol}://${req.get("host")}/uploads/${imageFile.filename}`
      : imageUrl || null;

    const normalizedItinerary = itineraryFile
      ? parseItineraryFromExcelFile(itineraryFile)
      : normalizeItineraryField(itinerary);

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
      itinerary: normalizedItinerary,
      imageFile: imageFile ? imageFile.filename : null,
      imageUrl: finalImageUrl,
      status: "pending",
    });

    await newService.save();

    return res.status(201).json({
      success: true,
      message: "Them dich vu thanh cong",
      data: newService,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      error: err.message,
    });
  } finally {
    removeUploadedFile(itineraryFile);
  }
};

// Lấy danh sách dịch vụ công khai.
exports.publicServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const services = await Services.find({ status: "active" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Services.countDocuments({ status: "active" });
    const data = await attachReviewStats(services);

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

// Cập nhật dịch vụ.
exports.putServices = async (req, res) => {
  const itineraryFile = getUploadedFile(req, "itineraryFile");
  try {
    const { id } = req.params;
    const service = await Services.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Khong tim thay service" });
    }

    if (!isOwnerOrAdmin(service, req.user)) {
      return res.status(403).json({ message: "Ban khong co quyen sua dich vu nay" });
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

    const imageFile = getUploadedFile(req, "image");
    if (imageFile) {
      updateData.imageFile = imageFile.filename;
      updateData.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${imageFile.filename}`;
    }

    if (itineraryFile) {
      updateData.itinerary = parseItineraryFromExcelFile(itineraryFile);
    }

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const updated = await Services.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.json({
      success: true,
      message: "Update thanh cong",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  } finally {
    removeUploadedFile(itineraryFile);
  }
};

// Cập nhật một phần dịch vụ.
exports.patchServices = async (req, res) => {
  const itineraryFile = getUploadedFile(req, "itineraryFile");
  try {
    const { id } = req.params;
    const service = await Services.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service khong ton tai",
      });
    }

    if (!isOwnerOrAdmin(service, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Ban khong co quyen cap nhat dich vu nay",
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

    const imageFile = getUploadedFile(req, "image");
    if (imageFile) {
      updateFields.imageFile = imageFile.filename;
      updateFields.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${imageFile.filename}`;
    }

    if (itineraryFile) {
      updateFields.itinerary = parseItineraryFromExcelFile(itineraryFile);
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
      message: "Cap nhat mot phan thanh cong",
      data: updatedService,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Loi khi cap nhat",
      error: error.message,
    });
  } finally {
    removeUploadedFile(itineraryFile);
  }
};

// Xóa một dịch vụ cùng ảnh hoặc bản ghi liên quan.
exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Services.findById(id);

    if (!service) {
      return res.status(404).json({
        message: "Service khong ton tai",
      });
    }

    if (!isOwnerOrAdmin(service, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Ban khong co quyen xoa dich vu nay",
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
      message: "Xoa service + anh thanh cong",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Loi server",
      error: error.message,
    });
  }
};

// Xóa dịch vụ.
exports.deleteServices = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({
        message: "Danh sach ID khong hop le",
      });
    }

    const services = await Services.find({ _id: { $in: ids } });
    const unauthorized = services.find((service) => !isOwnerOrAdmin(service, req.user));

    if (unauthorized) {
      return res.status(403).json({
        message: "Ban khong co quyen xoa mot so dich vu trong danh sach nay",
      });
    }

    const result = await Services.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      message: "Xoa nhieu thanh cong",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Loi server",
    });
  }
};

// Lấy chi tiết dịch vụ.
exports.servicesDetail = async (req, res) => {
  try {
    const service = await Services.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Khong tim thay dich vu",
      });
    }

    if (req.user && req.user.role === "provider" && !isOwnerOrAdmin(service, req.user)) {
      return res.status(403).json({
        message: "Ban khong co quyen xem dich vu nay",
      });
    }

    const [withStats] = await attachReviewStats([service]);
    return res.json(withStats);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Lấy tất cả dịch vụ cho admin hoặc provider.
exports.allServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const filter = req.user?.role === "provider" ? { provider_id: req.user.id } : {};

    const services = await Services.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Services.countDocuments(filter);
    const data = await attachReviewStats(services);

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
