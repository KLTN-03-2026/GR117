const User = require("../models/User.js");
const bcrypt = require("bcrypt");

// Lấy thông tin cá nhân hiện tại
module.exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    return res.status(200).json({ data: user });
  } catch (error) {
    console.error("Lỗi getProfile:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cập nhật thông tin cá nhân (Họ tên, SĐT)
module.exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    // Tìm và cập nhật
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone },
      { new: true, runValidators: true },
    ).select("-password");

    return res.status(200).json({
      message: "Cập nhật hồ sơ thành công",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi updateProfile:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Thay đổi mật khẩu
module.exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPass } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPass) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword !== confirmNewPass) {
      return res.status(400).json({ message: "Mật khẩu mới không khớp" });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Thay đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi changePassword:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// [ADMIN] Lấy danh sách tất cả người dùng
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ data: users });
  } catch (error) {
    console.error("Lỗi getAllUsers:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// [ADMIN] Khóa/Mở khóa hoặc duyệt Provider
module.exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, isLocked } = req.body;

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (status) user.status = status;
    if (typeof isLocked === "boolean") user.isLocked = isLocked;

    await user.save();
    return res
      .status(200)
      .json({ message: "Cập nhật trạng thái thành công", data: user });
  } catch (error) {
    console.error("Lỗi updateUserStatus:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
