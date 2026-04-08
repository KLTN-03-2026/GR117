const accounts = require("../models/account.js");

module.exports.approveProvider = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm account
    const provider = await accounts.findById(id);

    if (!provider) {
      return res.status(404).json({
        message: "Nhà cung cấp không tồn tại",
      });
    }

    // Check đúng role provider
    if (provider.role !== "provider") {
      return res.status(400).json({
        message: "Tài khoản này không phải provider",
      });
    }

    // Check đã duyệt chưa
    if (provider.status === "active") {
      return res.status(400).json({
        message: "Nhà cung cấp đã được duyệt",
      });
    }

    // Duyệt
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