const User = require("../models/User.js");
const Service = require("../models/Service.js");
const Review = require("../models/Review.js");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
//chờ duyệt
module.exports.getPendingProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: "provider", status: "pending" })
      .select("fullName email phone role status createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Lấy danh sách đối tác chờ duyệt thành công",
      data: providers,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách provider pending:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
//phê duyệt
module.exports.approveProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await User.findById(id);

    if (!provider) {
      return res.status(404).json({
        message: "Nhà cung cấp không tồn tại",
      });
    }

    if (provider.role !== "provider") {
      return res.status(400).json({
        message: "Tài khoản này không phải provider",
      });
    }

    if (provider.status === "active") {
      return res.status(400).json({
        message: "Nhà cung cấp đã được duyệt",
      });
    }

    provider.status = "active";
    await provider.save();

    return res.status(200).json({
      message: "Duyệt nhà cung cấp thành công",
      data: {
        id: provider._id,
        fullName: provider.fullName,
        email: provider.email,
        status: provider.status,
      },
    });
  } catch (error) {
    console.error("Lỗi khi duyệt nhà cung cấp:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};
//từ chối lời đăng ký
module.exports.rejectProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await User.findById(id);

    if (!provider) {
      return res.status(404).json({
        message: "Nhà cung cấp không tồn tại",
      });
    }

    if (provider.role !== "provider") {
      return res.status(400).json({
        message: "Tài khoản này không phải provider",
      });
    }

    provider.status = "rejected";
    await provider.save();

    return res.status(200).json({
      message: "Từ chối nhà cung cấp thành công",
      data: {
        id: provider._id,
        fullName: provider.fullName,
        email: provider.email,
        status: provider.status,
      },
    });
  } catch (error) {
    console.error("Lỗi khi từ chối nhà cung cấp:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

//láy tất cả tài khoản
module.exports.getAllAccounts = async (req, res) => {
  try {
    const accountsList = await User.find()
      .select("fullName email phone role status createdAt")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Lấy danh sách tài khoản thành công",
      data: accountsList,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tài khoản:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//thay đổi vai trò
module.exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.body.role;

    if (!["user", "provider", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Vai trò không hợp lệ",
      });
    }
    const account = await User.findById(id);
    if (!account) {
      return res.status(404).json({
        message: "Tài khoản không tồn tại",
      });
    }
    account.role = role;
    await account.save();
    return res.status(200).json({
      message: "Thay đổi vai trò thành công",
      data: {
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        role: account.role,
      },
    });
  } catch (error) {
    console.error("Lỗi khi thay đổi vai trò:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

//xóa tài khoản
module.exports.deleteAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const acconut = await User.findById(id);
    if (!acconut) {
      return res.status(404).json({
        message: "Tài khoản không tồn tại",
      });
    }
    const deletedAccount = await User.findByIdAndDelete(id);
    return res.status(200).json({
      message: "xóa tài khoản thành công",
      data: deletedAccount,
    });
  } catch (erro) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
module.exports.lockAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const account = await User.findById(id);
    if (!account) {
      return res.status(404).json({
        message: "Tài khoản không tồn tại",
      });
    }
    account.status = "locked";
    await account.save();
    return res.status(200).json({
      message: "Khóa tài khoản thành công",
      data: {
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        status: account.status,
      },
    });
  } catch (error) {
    console.error("Lỗi khi khóa tài khoản:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

// mở khóa tài khoản
module.exports.unlockAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const account = await User.findById(id);
    if (!account) {
      return res.status(404).json({
        message: "Tài khoản không tồn tại",
      });
    }
    account.status = "active";
    await account.save();
    return res.status(200).json({
      message: "Mở khóa tài khoản thành công",
      data: {
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        status: account.status,
      },
    });
  } catch (error) {
    console.error("Lỗi khi mở khóa tài khoản:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

//thêm tài khoản mới
module.exports.addAccount = async (req, res) => {
  //request gửi lên các thông cần thiết
  const fullName = String(req.body.fullName || "").trim();
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const phone = String(req.body.phone || "").trim();
  const password = String(req.body.password || "");
  const role = String(req.body.role || "").trim();

  try {
    const existAccount = await User.findOne({
      $or: [{ email }, { phone }, { fullName }],
    });
    if (existAccount) {
      return res
        .status(400)
        .json({ message: "Email, FullName,phone đã tồn tại" });
    }

    //check trường có thiếu hay ko
    if (!fullName || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    //check độ dài từng trường
    if (fullName.length < 2 || fullName.length > 30) {
      return res
        .status(400)
        .json({ message: "Họ và tên phải từ 2 đến 30 ký tự" });
    }

    if (email.length < 5 || email.length > 30) {
      return res.status(400).json({ message: "Email phải từ 5 đến 30 ký tự" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Số điện thoại phải đúng 10 số" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    if (!["user", "provider", "admin"].includes(role)) {
      return res.status(400).json({ message: "Vai trò không hợp lệ" });
    }

    const hasdPassword = await bcrypt.hash(password, 8);

    const newAccount = await User.create({
      fullName,
      email,
      phone,
      password: hasdPassword,
      role,
    });
    return res.status(201).json({
      message: "Thêm tài khoản thành công",
      data: newAccount,
    });
  } catch (error) {
    console.error("Lỗi khi thêm tài khoản:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Quan ly du lieu dich vu
// xem tat cac dich vu
module.exports.getAllService = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    // Lấy thêm keyword để hỗ trợ thanh tìm kiếm trên giao diện
    const { status = "all", keyword = "" } = req.query;

    // 1. Xây dựng bộ lọc
    const matchQuery = { deleted: { $ne: true } }; // Bỏ qua dịch vụ đã xóa

    if (status !== "all") {
      matchQuery.status = status; // Lọc theo trạng thái
    }

    // Nếu người dùng gõ vào thanh tìm kiếm, tìm theo tên dịch vụ
    if (keyword) {
      matchQuery.serviceName = { $regex: keyword, $options: "i" };
    }

    // 2. Truy vấn Aggregate
    const result = await Service.aggregate([
      { $match: matchQuery },

      // Bước 1: Nối bảng accounts để lấy Tên Nhà cung cấp
      // Dùng $toString để ép kiểu dữ liệu, giải quyết triệt để lỗi không khớp ObjectId vs String
      {
        $lookup: {
          from: "accounts",
          let: { pId: "$provider_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [{ $toString: "$_id" }, { $toString: "$$pId" }] },
              },
            },
          ],
          as: "providerInfo",
        },
      },
      {
        $set: {
          providerInfo: { $arrayElemAt: ["$providerInfo", 0] },
        },
      },

      // Bước 2: Nối bảng reviews để lấy danh sách Đánh giá
      {
        $lookup: {
          from: "reviews",
          let: { sId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$serviceID" }, { $toString: "$$sId" }],
                },
              },
            },
          ],
          as: "reviewsList",
        },
      },

      // Bước 3: Tính điểm Rating trung bình VÀ đếm Tổng số lượng đánh giá (phục vụ UI)
      {
        $addFields: {
          avgRating: { $ifNull: [{ $avg: "$reviewsList.rating" }, 0] },
          reviewCount: { $size: "$reviewsList" }, // Lấy số lượng phần tử trong mảng review
        },
      },

      // Bước 4: Trả về đúng các trường mà Giao diện (UI) đang cần hiển thị
      {
        $project: {
          serviceName: 1,
          location: 1, // Lấy địa điểm (VD: Quảng Nam)
          region: 1, // Lấy khu vực (VD: Biển đảo)
          category: 1,
          providerName: {
            $ifNull: ["$providerInfo.fullName", "Không xác định"],
          },
          price: "$prices",
          rating: { $round: ["$avgRating", 1] },
          reviewCount: 1, // Tổng số lượt đánh giá
          status: 1,
          createdAt: 1,
        },
      },

      // Bước 5: Phân trang
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ]);

    // 3. Xử lý kết quả
    const total = result[0].metadata[0]?.total || 0;
    const data = result[0].data;

    return res.status(200).json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi getAllService:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
// Xoa dich vu
module.exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Tìm và xóa dịch vụ trong Database
    const deletedService = await Service.findByIdAndDelete(id);

    // 2. Kiểm tra nếu không tìm thấy dịch vụ
    if (!deletedService) {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ để xóa" });
    }

    // 3. (Tùy chọn) Xóa luôn file ảnh lưu trong thư mục uploads để giải phóng bộ nhớ
    if (deletedService.imageFile) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        deletedService.imageFile,
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 4. Trả về thông báo thành công
    return res.status(200).json({
      message: "Xóa dịch vụ thành công!",
      data: deletedService, // Trả về data vừa xóa để frontend có thể cập nhật UI
    });
  } catch (error) {
    console.error("Lỗi deleteService:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
//Thay doi trang thai dich vu
module.exports.changeServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Frontend sẽ gửi trạng thái mới lên qua body

    // 1. Kiểm tra trạng thái hợp lệ dựa theo Enum trong Model Services
    const validStatuses = ["active", "inactive", "pending", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Trạng thái không hợp lệ. Chỉ chấp nhận: active, inactive, pending, rejected",
      });
    }

    // 2. Cập nhật vào Database
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }, // Trả về dữ liệu mới sau khi đã cập nhật
    );

    // 3. Kiểm tra nếu ID không tồn tại
    if (!updatedService) {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
    }

    // 4. Trả về thành công
    return res.status(200).json({
      message: `Cập nhật trạng thái thành '${status}' thành công!`,
      data: updatedService,
    });
  } catch (error) {
    console.error("Lỗi changeServiceStatus:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
