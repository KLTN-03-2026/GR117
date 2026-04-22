const User = require("../models/User.js");
const Provider = require("../models/Provider.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Session = require("../models/Session.js");

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

module.exports.register = async (req, res) => {
  try {
    const {
      fullName,
      businessName,
      email,
      phone,
      password,
      confirmPass,
      role,
      taxCode,
      businessLicense,
      address,
      legalRepresentative,
      agreements = {},
    } = req.body;

    if (!email || !phone || !password || !confirmPass || !role) {
      return res.status(400).json({ message: "Thieu thong tin dang ky" });
    }

    if (!["user", "provider"].includes(role)) {
      return res.status(400).json({ message: "Role khong hop le" });
    }

    if (password !== confirmPass) {
      return res.status(400).json({ message: "Mat khau xac nhan khong khop" });
    }

    const normalizedDisplayName =
      role === "provider" ? String(businessName || "").trim() : String(fullName || "").trim();

    if (!normalizedDisplayName) {
      return res.status(400).json({
        message:
          role === "provider"
            ? "Thieu ten doanh nghiep/ho kinh doanh/thuong nhan"
            : "Thieu ho va ten",
      });
    }

    if (
      normalizedDisplayName.length < 2 ||
      normalizedDisplayName.length > 120
    ) {
      return res.status(400).json({
        message:
          role === "provider"
            ? "Ten doanh nghiep phai tu 2 den 120 ky tu"
            : "Ho va ten phai tu 2 den 120 ky tu",
      });
    }

    if (!/^\d{10}$/.test(String(phone || "").trim())) {
      return res.status(400).json({
        message: "So dien thoai phai dung 10 so",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Mat khau phai co it nhat 6 ky tu",
      });
    }

    if (role === "provider") {
      if (
        !businessName ||
        !taxCode ||
        !businessLicense ||
        !address ||
        !legalRepresentative
      ) {
        return res.status(400).json({
          message: "Thieu thong tin ho so nha cung cap",
        });
      }

      if (agreements?.termsAccepted !== true) {
        return res.status(400).json({
          message: "Ban can dong y dieu khoan hop tac",
        });
      }
    }

    const duplicate = await User.findOne({
      $or: [
        { email: String(email).trim().toLowerCase() },
        { phone: String(phone).trim() },
      ],
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Email hoac so dien thoai da ton tai",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const status = role === "provider" ? "pending" : "active";

    const newUser = await User.create({
      fullName: normalizedDisplayName,
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      password: hashedPassword,
      role,
      status,
    });

    if (role === "provider") {
      try {
        await Provider.create({
          providerID: newUser._id,
          businessName: String(businessName).trim(),
          taxCode: String(taxCode).trim(),
          businessLicense: String(businessLicense).trim(),
          address: String(address).trim(),
          legalRepresentative: String(legalRepresentative).trim(),
          status: "pending",
          agreements: {
            termsAccepted: agreements?.termsAccepted === true,
            policyAccepted: true,
            complaintPolicyAccepted: true,
            infoCommitment: true,
          },
        });
      } catch (providerError) {
        await User.findByIdAndDelete(newUser._id);
        console.error("Loi tao ho so provider:", providerError);
        return res.status(500).json({
          message: "Khong the tao ho so nha cung cap",
        });
      }
    }

    return res.status(201).json({
      message:
        role === "provider"
          ? "Dang ky doi tac thanh cong, cho admin duyet"
          : "Dang ky thanh cong",
      data: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error("Loi register:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Thieu email hoac password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Email hoac password khong chinh xac",
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Email hoac password khong chinh xac",
      });
    }

    if (user.role === "provider" && user.status === "pending") {
      return res.status(403).json({
        message: "Tai khoan doi tac dang cho admin duyet",
      });
    }

    if (user.role === "provider" && user.status === "rejected") {
      return res.status(403).json({
        message: "Tai khoan doi tac da bi tu choi",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Tai khoan cua ban dang bi khoa hoac chua duoc kich hoat",
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
      message: "Dang nhap thanh cong",
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
    console.error("Loi login:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

module.exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token khong ton tai." });
    }

    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res.status(403).json({
        message: "Token khong hop le hoac da het han",
      });
    }

    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      return res.status(403).json({ message: "Token da het han." });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return res.status(404).json({ message: "Nguoi dung khong ton tai" });
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Loi refreshToken:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await Session.deleteOne({ refreshToken: token });
      res.clearCookie("refreshToken");
    }
    return res.sendStatus(204);
  } catch (error) {
    console.error("Loi logout:", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
