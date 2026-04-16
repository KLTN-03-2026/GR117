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
    const { fullName, email, phone, password, confirmPass, role } = req.body;

    // Kiểm tra dữ liệu
    if (!fullName || !email || !phone || !password || !confirmPass || !role) {
      return res.status(400).json({ message: "Thiáº¿u thĂ´ng tin Ä‘Äƒng kĂ½" });
    }

    if (!["user", "provider"].includes(role)) {
      return res.status(400).json({ message: "Role khĂ´ng há»£p lá»‡" });
    }

    if (password !== confirmPass) {
      return res.status(400).json({ message: "Máº­t kháº©u xĂ¡c nháº­n khĂ´ng khá»›p" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Máº­t kháº©u pháº£i cĂ³ Ă­t nháº¥t 6 kĂ½ tá»±" });
    }

    const duplicate = await accounts.findOne({
      $or: [{ email }, { phone }],
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Email hoáº·c sá»‘ Ä‘iá»‡n thoáº¡i Ä‘Ă£ tá»“n táº¡i",
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gán trạng thái theo role
    const status = role === "provider" ? "pending" : "active";

    // Tạo tài khoản
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
          ? "ÄÄƒng kĂ½ Ä‘á»‘i tĂ¡c thĂ nh cĂ´ng, chá» admin duyá»‡t"
          : "ÄÄƒng kĂ½ thĂ nh cĂ´ng",
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
    console.error("Lá»—i register:", error);
    return res.status(500).json({ message: "Lá»—i há»‡ thá»‘ng" });
  }
};
// Đăng nhập và tạo phiên làm việc.
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Thiáº¿u email hoáº·c password" });
    }

    const user = await accounts.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoáº·c password khĂ´ng chĂ­nh xĂ¡c" });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "Email hoáº·c password khĂ´ng chĂ­nh xĂ¡c" });
    }

    if (user.role === "provider" && user.status === "pending") {
      return res.status(403).json({
        message: "TĂ i khoáº£n Ä‘á»‘i tĂ¡c Ä‘ang chá» admin duyá»‡t",
      });
    }

    if (user.role === "provider" && user.status === "rejected") {
      return res.status(403).json({
        message: "TĂ i khoáº£n Ä‘á»‘i tĂ¡c Ä‘Ă£ bá»‹ tá»« chá»‘i",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "TĂ i khoáº£n cá»§a báº¡n Ä‘ang bá»‹ khĂ³a hoáº·c chÆ°a Ä‘Æ°á»£c kĂ­ch hoáº¡t",
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
      message: "ÄÄƒng nháº­p thĂ nh cĂ´ng",
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
    console.error("Lá»—i khi gá»i signIn:", error);
    return res.status(500).json({ message: "Lá»—i há»‡ thá»‘ng" });
  }
};

// Làm mới access token.
module.exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token khĂ´ng tá»“n táº¡i." });
    }

    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res
        .status(403)
        .json({ message: "Token khĂ´ng há»£p lá»‡ hoáº·c Ä‘Ă£ háº¿t háº¡n" });
    }

    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      return res.status(403).json({ message: "Token Ä‘Ă£ háº¿t háº¡n." });
    }

    const user = await accounts.findById(session.userId);
    if (!user) {
      return res.status(404).json({ message: "NgÆ°á»i dĂ¹ng khĂ´ng tá»“n táº¡i" });
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lá»—i khi gá»i refreshToken:", error);
    return res.status(500).json({ message: "Lá»—i há»‡ thá»‘ng" });
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
    console.error("Lá»—i khi gá»i signOut:", error);
    return res.status(500).json({ message: "Lá»—i há»‡ thá»‘ng" });
  }
};
