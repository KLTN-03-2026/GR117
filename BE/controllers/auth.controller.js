const accounts = require("../models/account.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Session = require("../models/session.js");

const ACCESS_TOKEN_TTL = "30m"; // Thường dưới 15m khi deploy
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày



module.exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPass, isProvider  } = req.body;

    if (!fullName || !email || !phone || !password || !confirmPass) {
      return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
    }
    // Kiểm tra email tồn tại chưa
    const duplicate = await accounts.findOne({
      $or: [{ email }, { phone }],
    });
    if (duplicate) {
      return res
        .status(409)
        .json({ message: "Email hoặc số điện thoại đã tồn tại" });
    }
    if (confirmPass !== password) {
      return res.status(401).json({ message: "Mật khẩu xác nhận không khớp" });
    }
    
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
      }
    const hashedPassword = await bcrypt.hash(password, 10);

     
    const role = isProvider ? "provider" : "user";
    const status = isProvider ? "inactive" : "active";
    

    if(status !== "active"){
      return res.status(403).json({ message: "Tài khoản của bạn chưa được duyệt. Vui lòng liên hệ quản trị viên." });
    }
    const newAccount = await accounts.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
      status,
    });

    return res.status(201).json({
      message: "Đăng ký thành công",
      data: {
        fullName: newAccount.fullName,
        email: newAccount.email,
        phone: newAccount.phone,
        role: newAccount.role,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi signUp:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

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
        .json({ message: "Email hoặc password không chính xác" });
    }

    // Kiểm tra password
    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "Email hoặc password không chính xác" });
    }
    // Tạo accessToken với JWT
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );
    // Tạo refresh token ngẫu nhiên
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // Lưu session mới vào DB
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });
    // Trả refresh token về trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });
    return res.status(200).json({
      message: "Đăng nhập thành công",
      data: {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi signIn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

module.exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại." });
    }

    // Tìm session và "populate" luôn thông tin user để lấy role
    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id }); // Tiện tay xóa luôn session hết hạn
      return res.status(403).json({ message: "Token đã hết hạn." });
    }

    // LẤY ROLE: Vì Access Token cần role, bạn nên tìm user
    const user = await accounts.findById(session.userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Tạo access token mới CÓ CHỨA ROLE
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role }, // Thêm role ở đây!
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lỗi khi gọi refreshToken:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    // console.log("Token nhận được từ Cookie:", token);
    if (token) {
      // Xóa session trong DB
      await Session.deleteOne({ refreshToken: token });
      // Xóa cookie ở trình duyệt
      res.clearCookie("refreshToken");
    }
    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signOut:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
