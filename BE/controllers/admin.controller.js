const accounts = require("../models/account.js");
const Services = require("../models/services.js");
const fs = require("fs");
const path = require("path");

// Lấy danh sách provider chờ duyệt.
module.exports.getPendingProviders = async (req, res) => {
  try {
    const providers = await accounts
      .find({ role: "provider", status: "pending" })
      .select("fullName email phone role status createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Láº¥y danh sĂ¡ch Ä‘á»‘i tĂ¡c chá» duyá»‡t thĂ nh cĂ´ng",
      data: providers,
    });
  } catch (error) {
    console.error("Lá»—i khi láº¥y danh sĂ¡ch provider pending:", error);
    return res.status(500).json({ message: "Lá»—i há»‡ thá»‘ng" });
  }
};

// Duyệt provider.
module.exports.approveProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await accounts.findById(id);

    if (!provider) {
      return res.status(404).json({
        message: "NhĂ  cung cáº¥p khĂ´ng tá»“n táº¡i",
      });
    }

    if (provider.role !== "provider") {
      return res.status(400).json({
        message: "Tài khoản này ko phải provider",
      });
    }

    if (provider.status === "active") {
      return res.status(400).json({
        message: "NhĂ  cung cáº¥p Ä‘Ă£ Ä‘Æ°á»£c duyá»‡t",
      });
    }

    provider.status = "active";
    await provider.save();

    return res.status(200).json({
      message: "Duyá»‡t nhĂ  cung cáº¥p thĂ nh cĂ´ng",
      data: {
        id: provider._id,
        fullName: provider.fullName,
        email: provider.email,
        status: provider.status,
      },
    });
  } catch (error) {
    console.error("Lá»—i khi duyá»‡t nhĂ  cung cáº¥p:", error);
    return res.status(500).json({
      message: "Lá»—i há»‡ thá»‘ng",
    });
  }
};

// Từ chối provider.
module.exports.rejectProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await accounts.findById(id);

    if (!provider) {
      return res.status(404).json({
        message: "NhĂ  cung cáº¥p khĂ´ng tá»“n táº¡i",
      });
    }

    if (provider.role !== "provider") {
      return res.status(400).json({
        message: "TĂ i khoáº£n nĂ y khĂ´ng pháº£i provider",
      });
    }

    provider.status = "rejected";
    await provider.save();

    return res.status(200).json({
      message: "Tá»« chá»‘i nhĂ  cung cáº¥p thĂ nh cĂ´ng",
      data: {
        id: provider._id,
        fullName: provider.fullName,
        email: provider.email,
        status: provider.status,
      },
    });
  } catch (error) {
    console.error("Lá»—i khi tá»« chá»‘i nhĂ  cung cáº¥p:", error);
    return res.status(500).json({
      message: "Lá»—i há»‡ thá»‘ng",
    });
  }
};

// Lấy danh sách tài khoản.
module.exports.getAccounts = async (req, res) => {
  try {
    const { role, status } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const data = await accounts
      .find(filter)
      .select("fullName email phone role status createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "L?y danh s?ch t?i kho?n th?nh c?ng",
      data,
    });
  } catch (error) {
    console.error("L?i khi l?y danh s?ch t?i kho?n:", error);
    return res.status(500).json({ message: "L?i h? th?ng" });
  }
};

// Tạo tài khoản.
module.exports.createAccount = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, status } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Thi?u th?ng tin b?t bu?c",
      });
    }
    //check đuôi email 
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
  return res.status(400).json({ message: "Email không hợp lệ" });
  }

    if (role && !["user", "provider", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role kh?ng h?p l?" });
    }

    const duplicate = await accounts.findOne({ email });
    if (duplicate) {
      return res.status(409).json({ message: "Email ?? t?n t?i" });
    }

    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAccount = await accounts.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role || "user",
      status: status || "active",
    });

    return res.status(201).json({
      message: "Tao tai khoan thanh cong",
      data: {
        id: newAccount._id,
        fullName: newAccount.fullName,
        email: newAccount.email,
        phone: newAccount.phone,
        role: newAccount.role,
        status: newAccount.status,
      },
    });
  } catch (error) {
    console.error("L?i khi t?o t?i kho?n:", error);
    return res.status(500).json({ message: "L?i h? th?ng" });
  }
};

// Cập nhật trạng thái tài khoản.
const updateAccountStatus = async (req, res, nextStatus) => {
  const { id } = req.params;
  const user = await accounts.findById(id);

  if (!user) {
    return res.status(404).json({ message: "Tai khoan khong ton tai" });
  }

  user.status = nextStatus;
  await user.save();

  return res.status(200).json({
    message: "Cap nhat trang thai thanh cong",
    data: {
      id: user._id,
      status: user.status,
      role: user.role,
    },
  });
};

// Khóa tài khoản.
module.exports.blockAccount = async (req, res) => {
  try {
    return await updateAccountStatus(req, res, "blocked");
  } catch (error) {
    console.error("L?i khi kh?a t?i kho?n:", error);
    return res.status(500).json({ message: "L?i h? th?ng" });
  }
};

// Mở khóa tài khoản.
module.exports.unblockAccount = async (req, res) => {
  try {
    return await updateAccountStatus(req, res, "active");
  } catch (error) {
    console.error("L?i khi m? kh?a t?i kho?n:", error);
    return res.status(500).json({ message: "L?i h? th?ng" });
  }
};

// Xóa tài khoản.
module.exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await accounts.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Tai khoan khong ton tai" });
    }

    await accounts.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Xoa tai khoan thanh cong",
      data: { id },
    });
  } catch (error) {
    console.error("L?i khi x?a t?i kho?n:", error);
    return res.status(500).json({ message: "L?i h? th?ng" });
  }
};

// Lấy danh sách dịch vụ.
module.exports.getServices = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const data = await Services.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Lay danh sach dich vu thanh cong",
      data,
    });
  } catch (error) {
    console.error("L?i khi l?y danh s?ch d?ch v?:", error);
    return res.status(500).json({ message: "L?i h? th?ng" });
  }
};

// Duyệt dịch vụ.
module.exports.approveService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Services.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Dich vu khong ton tai" });
    }

    service.status = "active";
    await service.save();

    return res.status(200).json({
      message: "Duy?t d?ch v? th?nh c?ng",
      data: { id: service._id, status: service.status },
    });
  } catch (error) {
    console.error("L?i khi duy?t d?ch v?:", error);
    return res.status(500).json({ message: "L?i h? th?ng" });
  }
};

// Từ chối dịch vụ.
module.exports.rejectService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Services.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Dich vu khong ton tai" });
    }

    service.status = "rejected";
    await service.save();

    return res.status(200).json({
      message: "T? ch?i d?ch v? th?nh c?ng",
      data: { id: service._id, status: service.status },
    });
  } catch (error) {
    console.error("L?i khi t? ch?i d?ch v?:", error);
    return res.status(500).json({ message: "L?i h? th?ng" });
  }
};

// Xóa dịch vụ.
module.exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Services.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Dich vu khong ton tai" });
    }

    if (service.imageFile) {
      const filePath = path.join(__dirname, "..", "uploads", service.imageFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Services.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Xoa dich vu thanh cong",
      data: { id },
    });
  } catch (error) {
    console.error("L?i khi x?a d?ch v?:", error);
    return res.status(500).json({ message: "L?i h? th?ng" });
  }
};

// Lấy thống kê dashboard.
module.exports.getStats = async (req, res) => {
  try {
    const [totalServices, pendingServices, totalAccounts, pendingProviders] =
      await Promise.all([
        Services.countDocuments({}),
        Services.countDocuments({ status: "pending" }),
        accounts.countDocuments({}),
        accounts.countDocuments({ role: "provider", status: "pending" }),
      ]);

    return res.status(200).json({
      message: "Lay thong ke thanh cong",
      data: {
        totalServices,
        pendingServices,
        totalAccounts,
        pendingProviders,
      },
    });
  } catch (error) {
    console.error("L?i khi l?y th?ng k?:", error);
    return res.status(500).json({ message: "L?i h? th?ng" });
  }
};

