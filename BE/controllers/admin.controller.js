const accounts = require("../models/account.js");
const Service = require("../models/services.js")
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


