const mongoose = require("mongoose");
const Order = require("../models/Order.js");
const Withdrawal = require("../models/Withdrawal.js");

const COMMISSION_RATE = 0.1;
const ACTIVE_BOOKING_STATUSES = ["awaiting_payment", "awaiting_confirm", "confirmed"];
const RESERVED_WITHDRAWAL_STATUSES = ["pending", "approved", "paid"];

const toMoney = (value) => Math.max(0, Math.floor(Number(value || 0)));

const calcCommission = (gross) => Math.floor(toMoney(gross) * COMMISSION_RATE);

const buildProviderRevenue = async (providerId) => {
  const providerObjectId = new mongoose.Types.ObjectId(providerId);

  const orderAgg = await Order.aggregate([
    {
      $match: {
        provider_id: providerObjectId,
        paymentStatus: "paid",
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: null,
        totalCollectedRevenue: { $sum: "$totalPrice" },
        completedRevenue: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, "$totalPrice", 0],
          },
        },
        heldRevenue: {
          $sum: {
            $cond: [
              { $in: ["$status", ACTIVE_BOOKING_STATUSES] },
              "$totalPrice",
              0,
            ],
          },
        },
      },
    },
  ]);

  const withdrawalAgg = await Withdrawal.aggregate([
    { $match: { provider_id: providerObjectId, status: { $in: RESERVED_WITHDRAWAL_STATUSES } } },
    {
      $group: {
        _id: null,
        reservedWithdrawals: { $sum: "$amount" },
      },
    },
  ]);

  const paidWithdrawalAgg = await Withdrawal.aggregate([
    { $match: { provider_id: providerObjectId, status: "paid" } },
    {
      $group: {
        _id: null,
        paidWithdrawals: { $sum: "$amount" },
      },
    },
  ]);

  const completedRevenue = orderAgg[0]?.completedRevenue || 0;
  const heldRevenue = orderAgg[0]?.heldRevenue || 0;
  const providerRevenue = Math.max(completedRevenue - calcCommission(completedRevenue), 0);
  const heldProviderRevenue = Math.max(heldRevenue - calcCommission(heldRevenue), 0);
  const reservedWithdrawals = withdrawalAgg[0]?.reservedWithdrawals || 0;
  const paidWithdrawals = paidWithdrawalAgg[0]?.paidWithdrawals || 0;
  const availableBalance = Math.max(providerRevenue - reservedWithdrawals, 0);

  return {
    totalCollectedRevenue: orderAgg[0]?.totalCollectedRevenue || 0,
    completedRevenue,
    heldRevenue,
    commissionRevenue: calcCommission(completedRevenue),
    providerRevenue,
    heldProviderRevenue,
    reservedWithdrawals,
    paidWithdrawals,
    availableBalance,
  };
};

const formatWithdrawal = (item) => ({
  _id: item._id,
  provider_id: item.provider_id,
  amount: item.amount,
  bankName: item.bankName,
  accountName: item.accountName,
  accountNumber: item.accountNumber,
  note: item.note,
  status: item.status,
  adminNote: item.adminNote,
  requestedAt: item.requestedAt,
  approvedAt: item.approvedAt,
  rejectedAt: item.rejectedAt,
  paidAt: item.paidAt,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

module.exports.getProviderWithdrawals = async (req, res) => {
  try {
    const summary = await buildProviderRevenue(req.user.id);

    const withdrawals = await Withdrawal.find({ provider_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      data: withdrawals.map(formatWithdrawal),
      summary,
    });
  } catch (error) {
    console.error("Loi getProviderWithdrawals:", error);
    return res.status(500).json({ message: "Khong the tai danh sach rut tien" });
  }
};

module.exports.createProviderWithdrawal = async (req, res) => {
  try {
    const providerId = req.user.id;
    const amount = toMoney(req.body?.amount);
    const bankName = String(req.body?.bankName || "").trim();
    const accountName = String(req.body?.accountName || "").trim();
    const accountNumber = String(req.body?.accountNumber || "").trim();
    const note = String(req.body?.note || "").trim();

    if (!amount) {
      return res.status(400).json({ message: "So tien rut khong hop le" });
    }

    if (!bankName || !accountName || !accountNumber) {
      return res.status(400).json({
        message: "Vui long nhap day du ten ngan hang, ten chu tai khoan va so tai khoan",
      });
    }

    const summary = await buildProviderRevenue(providerId);
    if (amount > summary.availableBalance) {
      return res.status(400).json({
        message: "So tien rut vuot qua so du kha dung",
      });
    }

    const withdrawal = await Withdrawal.create({
      provider_id: providerId,
      amount,
      bankName,
      accountName,
      accountNumber,
      note,
      status: "pending",
      requestedAt: new Date(),
    });

    return res.status(201).json({
      message: "Da gui yeu cau rut tien",
      data: formatWithdrawal(withdrawal),
      summary,
    });
  } catch (error) {
    console.error("Loi createProviderWithdrawal:", error);
    return res.status(500).json({ message: "Khong the tao yeu cau rut tien" });
  }
};

module.exports.getAdminWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate("provider_id", "fullName email phone")
      .populate("processedBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      data: withdrawals,
    });
  } catch (error) {
    console.error("Loi getAdminWithdrawals:", error);
    return res.status(500).json({ message: "Khong the tai danh sach rut tien" });
  }
};

module.exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const nextStatus = String(status || "").toLowerCase();

    if (!["approved", "rejected", "paid"].includes(nextStatus)) {
      return res.status(400).json({ message: "Trang thai rut tien khong hop le" });
    }

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Khong tim thay yeu cau rut tien" });
    }

    if (withdrawal.status === "paid") {
      return res.status(400).json({ message: "Yeu cau nay da duoc chi tra" });
    }

    if (nextStatus === "approved" && withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Chi co the duyet yeu cau dang cho xu ly" });
    }

    if (nextStatus === "paid" && withdrawal.status !== "approved") {
      return res.status(400).json({ message: "Chi co the danh dau da chi tra sau khi da duyet" });
    }

    if (nextStatus === "rejected" && !["pending", "approved"].includes(withdrawal.status)) {
      return res.status(400).json({ message: "Khong the tu choi yeu cau nay" });
    }

    withdrawal.status = nextStatus;
    withdrawal.adminNote = String(adminNote || withdrawal.adminNote || "").trim();
    withdrawal.processedBy = req.user.id;

    if (nextStatus === "approved") {
      withdrawal.approvedAt = new Date();
    }

    if (nextStatus === "rejected") {
      withdrawal.rejectedAt = new Date();
    }

    if (nextStatus === "paid") {
      withdrawal.paidAt = new Date();
    }

    await withdrawal.save();

    return res.status(200).json({
      message: "Cap nhat rut tien thanh cong",
      data: withdrawal,
    });
  } catch (error) {
    console.error("Loi updateWithdrawalStatus:", error);
    return res.status(500).json({ message: "Khong the cap nhat rut tien" });
  }
};

module.exports.buildProviderRevenue = buildProviderRevenue;
