const accounts = require("../models/account.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Session = require("../models/session.js");

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

// ================= ĐĂNG KÝ =================
// Đăng ký user hoặc provider.
module.exports.register = async (req, res) => {
  try {
    let { fullName, email, phone, password, confirmPass, role } = req.body;

    // 🔥 regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-zÀ-ỹ\s]+$/;
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

    // 🔥 normalize
    fullName = fullName?.trim();

    // ✅ REQUIRED
    if (!fullName || !email || !phone || !password || !confirmPass || !role) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    // ✅ NAME
    if (fullName.length < 2) {
      return res.status(400).json({
        message: "Tên phải ít nhất 2 ký tự",
      });
    }

    if (!nameRegex.test(fullName)) {
      return res.status(400).json({
        message: "Tên không hợp lệ",
      });
    }

    // ✅ EMAIL
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Email không đúng định dạng",
      });
    }

    if (!email.endsWith("@gmail.com")) {
      return res.status(400).json({
        message: "Chỉ chấp nhận email Gmail",
      });
    }

    // ✅ PHONE
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Số điện thoại không hợp lệ  ",
      });
    }

    // ✅ ROLE
    if (!["user", "provider"].includes(role)) {
      return res.status(400).json({
        message: "Role không hợp lệ",
      });
    }

    // ✅ PASSWORD
    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải ít nhất 6 ký tự",
      });
    }

    if (password !== confirmPass) {
      return res.status(400).json({
        message: "Mật khẩu xác nhận không khớp",
      });
    }

    // ✅ CHECK DUPLICATE
    const duplicate = await accounts.findOne({
      $or: [{ email }, { phone }],
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Email hoặc số điện thoại đã tồn tại",
      });
    }

    // ✅ HASH
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ STATUS
    const status = role === "provider" ? "pending" : "active";

    // ✅ CREATE
    const newAccount = await accounts.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
      status,
    });

    return res.status(201).json({
      message:
        role === "provider"
          ? "Đăng ký đối tác thành công, chờ admin duyệt"
          : "Đăng ký thành công",
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
    console.error("Lỗi register:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};
// Đăng nhập và tạo phiên làm việc.
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email hoặc password" });
    }

    const user = await accounts.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email không chính xác " });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "Mật khẩu không chính xác " });
    }

    if (user.role === "provider" && user.status === "pending") {
      return res.status(403).json({
        message: "Tài khoản đang được xác minh",
      });
    }

   if (user.role === "provider" && user.status === "rejected") {
  return res.status(403).json({
    message: "Tài khoản đối tác đã bị từ chối",
  });
}

  if (user.status !== "active") {
  return res.status(403).json({
    message: "Tài khoản của bạn đang bị khóa hoặc chưa được kích hoạt",
  });
}

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      message: "Đăng nhập thành công ",
      data: {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          status: user.status,
        },
      },
    });
 } catch (error) {
  console.error("Lỗi khi gọi signIn:", error);
  return res.status(500).json({ message: "Lỗi hệ thống" });
}
};

// Làm mới access token.
module.exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại." });
    }

    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      return res.status(403).json({ message: "Token đã hết hạn." });
    }

    const user = await accounts.findById(session.userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lỗi khi gọi refreshToken:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Đăng xuất và xóa refresh token.
module.exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await Session.deleteOne({ refreshToken: token });
      res.clearCookie("refreshToken");
    }
    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signOut:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
