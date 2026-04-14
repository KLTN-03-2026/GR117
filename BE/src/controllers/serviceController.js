const Service = require("../models/Service.js");

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

//  TẠO TOUR MỚI (PROVIDER) 
module.exports.createService = async (req, res) => {
  try {
    // req.user.id lấy từ verifyToken middleware
    const newService = new Service({
      ...req.body,
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

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, status: "pending" }, // Sửa xong thì chờ duyệt lại
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
