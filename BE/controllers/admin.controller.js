const accounts = require("../models/account.js");
const Services = require("../models/services.js");
const fs = require("fs");
const path = require("path");

module.exports.getPendingProviders = async (req, res) => {
  try {
    const providers = await accounts
      .find({ role: "provider", status: "pending" })
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

module.exports.approveProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await accounts.findById(id);

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

module.exports.rejectProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await accounts.findById(id);

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
      message: "Lay danh sach tai khoan thanh cong",
      data,
    });
  } catch (error) {
    console.error("Loi khi lay danh sach tai khoan:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

module.exports.createAccount = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, status } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Thieu thong tin bat buoc",
      });
    }

    if (role && !["user", "provider", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role khong hop le" });
    }

    const duplicate = await accounts.findOne({ email });
    if (duplicate) {
      return res.status(409).json({ message: "Email da ton tai" });
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
    console.error("Loi khi tao tai khoan:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

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

module.exports.blockAccount = async (req, res) => {
  try {
    return await updateAccountStatus(req, res, "blocked");
  } catch (error) {
    console.error("Loi khi khoa tai khoan:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

module.exports.unblockAccount = async (req, res) => {
  try {
    return await updateAccountStatus(req, res, "active");
  } catch (error) {
    console.error("Loi khi mo khoa tai khoan:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

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
    console.error("Loi khi xoa tai khoan:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

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
    console.error("Loi khi lay danh sach dich vu:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

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
      message: "Duyet dich vu thanh cong",
      data: { id: service._id, status: service.status },
    });
  } catch (error) {
    console.error("Loi khi duyet dich vu:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

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
      message: "Tu choi dich vu thanh cong",
      data: { id: service._id, status: service.status },
    });
  } catch (error) {
    console.error("Loi khi tu choi dich vu:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

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
    console.error("Loi khi xoa dich vu:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

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
    console.error("Loi khi lay thong ke:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
