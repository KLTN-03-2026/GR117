const Service = require("../models/Service.js");
const { parseItineraryExcelBuffer } = require("../utils/itineraryExcelParser.js");

// Hàm đổi dữ liệu text hoặc JSON từ form-data thành mảng string để lưu vào Mongo đúng kiểu.
const parseArrayField = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return [];

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch {
      // Nếu không phải JSON thì rơi xuống tách dòng.
    }

    return text
      .split(/[,;\n]/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// Hàm chuẩn hóa dữ liệu service nhận từ FE trước khi tạo hoặc cập nhật trong DB.
const normalizeServiceBody = (body) => {
  const payload = {
    serviceName: String(body.serviceName || body.name || "").trim(),
    description: String(body.description || "").trim(),
    prices: Number(body.prices ?? body.price ?? 0),
    location: String(body.location || "").trim(),
    category: String(body.category || "").trim(),
    duration: String(body.duration || "").trim(),
    highlight: parseArrayField(body.highlight || body.highlights),
    includes: parseArrayField(body.includes),
    images: parseArrayField(body.images),
    featured: body.featured === true || body.featured === "true",
    seasonTags: parseArrayField(body.seasonTags || body.seasonTagsJson),
    bestMonths: parseArrayField(body.bestMonths).map((item) => Number(item)).filter(Number.isFinite),
    weatherTags: parseArrayField(body.weatherTags),
    budgetRange: ["low", "mid", "high"].includes(
      String(body.budgetRange || "mid").trim().toLowerCase(),
    )
      ? String(body.budgetRange || "mid").trim().toLowerCase()
      : "mid",
    imageUrl: String(body.imageUrl || "").trim(),
    imageId: String(body.imageId || "").trim(),
  };

  return payload;
};

// Hàm lấy itinerary từ file Excel nếu FE upload file, hoặc từ body cũ nếu còn gửi JSON.
const resolveItineraryPayload = (bodyItinerary, file) => {
  if (file) {
    return parseItineraryExcelBuffer(file.buffer);
  }

  if (!bodyItinerary) {
    return undefined;
  }

  if (Array.isArray(bodyItinerary)) {
    return bodyItinerary;
  }

  if (typeof bodyItinerary === "string") {
    const text = bodyItinerary.trim();
    if (!text) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

//  LẤY DANH SÁCH TOUR (PUBLIC) 
module.exports.getAllServices = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    // Xây dựng bộ lọc
    const query = { status: "active" };

    if (search) {
      query.serviceName = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category = category;
    }
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    if (minPrice || maxPrice) {
      query.prices = {};
      if (minPrice) query.prices.$gte = Number(minPrice);
      if (maxPrice) query.prices.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;
    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .populate("category", "categoryName")
      .populate("provider_id", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      data: services,
    });
  } catch (error) {
    console.error("Lỗi getAllServices:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//  CHI TIẾT TOUR (PUBLIC) 
module.exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("category")
      .populate("provider_id", "fullName phone email");

    if (!service) {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
    }
    return res.status(200).json({ data: service });
  } catch (error) {
    console.error("Lỗi getServiceById:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// [PUBLIC] TĂNG LƯỢT XEM TOUR
module.exports.incrementServiceView = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedService = await Service.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true },
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
    }

    return res.status(200).json({
      message: "Tăng lượt xem thành công",
      data: {
        id: updatedService._id,
        viewCount: updatedService.viewCount || 0,
      },
    });
  } catch (error) {
    console.error("Loi incrementServiceView:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//  TẠO TOUR MỚI (PROVIDER) 
module.exports.createService = async (req, res) => {
  try {
    // Hàm này tạo service mới và đọc lịch trình từ file Excel nếu FE gửi file lên.
    const payload = normalizeServiceBody(req.body);
    const itinerary = resolveItineraryPayload(req.body.itinerary, req.file);

    if (
      !payload.serviceName ||
      !payload.description ||
      !payload.prices ||
      !payload.category
    ) {
      return res
        .status(400)
        .json({ message: "Thiếu dữ liệu bắt buộc khi tạo service" });
    }

    if (req.file && (!itinerary || itinerary.length === 0)) {
      return res
        .status(400)
        .json({ message: "File Excel không có dữ liệu lịch trình hợp lệ" });
    }

    const newService = new Service({
      ...payload,
      itinerary: itinerary || [],
      provider_id: req.user.id,
      status: "pending", // Mặc định chờ duyệt dù model để active
    });

    await newService.save();
    return res.status(201).json({
      message: "Tạo tour thành công, chờ admin duyệt",
      data: newService,
    });
  } catch (error) {
    console.error("Lỗi createService:", error);
    return res
      .status(500)
      .json({ message: "Lỗi dữ liệu đầu vào hoặc hệ thống" });
  }
};

//  CẬP NHẬT TOUR (PROVIDER) 
module.exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service)
      return res.status(404).json({ message: "Tour không tồn tại" });

    // Kiểm tra quyền sở hữu
    if (service.provider_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa tour này" });
    }

    // Hàm này cập nhật service và chỉ thay lịch trình khi FE upload file Excel mới.
    const payload = normalizeServiceBody(req.body);
    const itinerary = resolveItineraryPayload(req.body.itinerary, req.file);
    const updateData = {
      ...payload,
      status: "pending", // Sửa xong thì chờ duyệt lại
    };

    if (req.file) {
      if (!itinerary || itinerary.length === 0) {
        return res
          .status(400)
          .json({ message: "File Excel không có dữ liệu lịch trình hợp lệ" });
      }
      updateData.itinerary = itinerary;
    } else if (Array.isArray(itinerary)) {
      updateData.itinerary = itinerary;
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    return res
      .status(200)
      .json({ message: "Cập nhật thành công", data: updatedService });
  } catch (error) {
    console.error("Lỗi updateService:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//  XÓA TOUR (PROVIDER) 
module.exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service)
      return res.status(404).json({ message: "Tour không tồn tại" });

    if (service.provider_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Không có quyền xóa" });
    }

    await Service.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Đã xóa tour thành công" });
  } catch (error) {
    console.error("Lỗi deleteService:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//  LẤY TOUR CỦA TÔI (PROVIDER) 
module.exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider_id: req.user.id }).sort({
      createdAt: -1,
    });
    //Lay tong so dich vu cua Provider
    const total = await Service.countDocuments(services);
    return res.status(200).json({ total, data: services });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//  [ADMIN] LẤY DANH SÁCH TOUR CHỜ DUYỆT 
module.exports.getPendingServices = async (req, res) => {
  try {
    // Chỉ lấy các tour có trạng thái là 'pending'
    const pendingServices = await Service.find({ status: "pending" })
      .populate("category", "categoryName")
      .populate("provider_id", "fullName email")
      .sort({ createdAt: 1 }); // Tour cũ nhất hiện lên trước để duyệt trước

    return res.status(200).json({
      count: pendingServices.length,
      data: pendingServices,
    });
  } catch (error) {
    console.error("Lỗi getPendingServices:", error);
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống khi lấy danh sách chờ duyệt" });
  }
};

//  [ADMIN] DUYỆT HOẶC TỪ CHỐI TOUR 
module.exports.approveRejectService = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Status truyền lên phải là 'active' hoặc 'rejected'

    if (!["active", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Trạng thái phê duyệt không hợp lệ" });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Không tìm thấy tour" });
    }

    service.status = status;
    await service.save();

    return res.status(200).json({
      message:
        status === "active" ? "Đã duyệt tour thành công" : "Đã từ chối tour",
      data: service,
    });
  } catch (error) {
    console.error("Lỗi approveRejectService:", error);
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống khi xử lý duyệt tour" });
  }
};
