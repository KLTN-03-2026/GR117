const {
  VNPay,
  ignorelogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");
const Order = require("../models/Order.js");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getFrontendBaseUrl = () =>
  process.env.FRONTEND_URL || "http://localhost:5173";

module.exports.createQr = async (req, res) => {
  try {
    const port = process.env.PORT || 5000;
    const amount = String(req.body?.amount || "50000");
    const orderInfo = String(req.body?.orderInfo || "Thanh toan demo VNPAY");
    const txnRef = String(req.body?.txnRef || Date.now());

    const vnpay = new VNPay({
      tmnCode: "C39XK6SG",
      secureSecret: "4Y14DKK7PRH0PJ1L9H6PRUGI37EHWPH9",
      vnpayHost: "https://sandbox.vnpayment.vn",
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignorelogger,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const vnpayRespone = await vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: "127.0.0.1",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: `http://localhost:${port}/api/check-payment-vnpay`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    return res.status(200).json({
      vnpayRespone,
      requestData: {
        amount,
        orderInfo,
        txnRef,
        orderType: ProductCode.Other,
      },
    });
  } catch (error) {
    console.error("Loi create-qr:", error);
    return res.status(500).json({
      message:
        error?.code === "MODULE_NOT_FOUND"
          ? "Chua cai package vnpay trong backend"
          : "Khong tao duoc link thanh toan",
    });
  }
};

module.exports.checkPayment = async (req, res) => {
  const vnpay = new VNPay({
    tmnCode: "C39XK6SG",
    secureSecret: "4Y14DKK7PRH0PJ1L9H6PRUGI37EHWPH9",
    vnpayHost: "https://sandbox.vnpayment.vn",
    testMode: true,
    hashAlgorithm: "SHA512",
    loggerFn: ignorelogger,
  });

  let verifyResult = null;
  try {
    verifyResult = await vnpay.verifyReturnUrl(req.query);
  } catch (error) {
    console.error("Loi verifyReturnUrl:", error);
  }

  const queryEntries = Object.entries(req.query || {});
  const rows = queryEntries.length
    ? queryEntries
        .map(
          ([key, value]) => `
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#334155;">${escapeHtml(key)}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(value)}</td>
            </tr>`,
        )
        .join("")
    : `
      <tr>
        <td colspan="2" style="padding:16px;color:#64748b;text-align:center;">Khong co du lieu tra ve tu VNPAY.</td>
      </tr>`;

  const responseCode = String(
    verifyResult?.vnp_ResponseCode ?? req.query?.vnp_ResponseCode ?? "",
  );
  const transactionStatus = String(
    verifyResult?.vnp_TransactionStatus ??
      req.query?.vnp_TransactionStatus ??
      "",
  );
  const isVerified = Boolean(verifyResult?.isVerified);
  const hasSuccessfulResponseCode = responseCode === "00";
  const hasSuccessfulTransactionStatus =
    transactionStatus === "" || transactionStatus === "00";
  const isSuccess =
    isVerified && hasSuccessfulResponseCode && hasSuccessfulTransactionStatus;
  const txnRef = String(
    verifyResult?.vnp_TxnRef || req.query?.vnp_TxnRef || "",
  );
  let didUpdateOrder = false;

  if (txnRef) {
    try {
      const order = await Order.findById(txnRef);
      if (order) {
        if (isSuccess) {
          order.paymentStatus = "paid";
          if (order.status === "awaiting_payment") {
            order.status = "awaiting_confirm";
          }
          didUpdateOrder = true;
        } else if (order.status === "awaiting_payment") {
          order.paymentStatus = "unpaid";
        }
        await order.save();
      }
    } catch (error) {
      console.error("Loi cap nhat don hang sau thanh toan:", error);
    }
  }

  const title = isSuccess ? "Thanh toan thanh cong" : "Da quay ve tu VNPAY";
  const subtitle = isSuccess
    ? "Giao dich da duoc xac nhan va don hang da duoc cap nhat."
    : "Day la trang callback de ban kiem tra du lieu VNPAY tra ve.";
  const dashboardUrl = `${getFrontendBaseUrl()}/user/dashboard?vnpayStatus=${
    isSuccess ? "success" : "failed"
  }&orderId=${encodeURIComponent(txnRef)}&verified=${
    isVerified ? "1" : "0"
  }&updated=${didUpdateOrder ? "1" : "0"}`;
  const homeUrl = `${getFrontendBaseUrl()}/`;

  return res.status(200).send(`<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${isSuccess ? "Thanh toan thanh cong" : "Ket qua thanh toan"}</title>
    <meta http-equiv="refresh" content="3;url=${homeUrl}" />
  </head>
  <body style="margin:0;font-family:Arial,sans-serif;background:radial-gradient(circle at top,#ecfdf5 0%,#f8fafc 45%,#eef2ff 100%);color:#0f172a;">
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">
      <div style="width:100%;max-width:560px;background:#ffffff;border:1px solid #dbeafe;border-radius:28px;padding:40px 32px;box-shadow:0 20px 60px rgba(15,23,42,0.10);text-align:center;">
        <div style="width:88px;height:88px;margin:0 auto 20px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:${isSuccess ? "#dcfce7" : "#fee2e2"};box-shadow:inset 0 0 0 10px ${isSuccess ? "#f0fdf4" : "#fff1f2"};">
          ${
            isSuccess
              ? `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="#16a34a" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`
              : `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 9l-6 6M9 9l6 6" stroke="#dc2626" stroke-width="2.8" stroke-linecap="round"/>
                </svg>`
          }
        </div>

        <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:${isSuccess ? "#dcfce7" : "#fee2e2"};color:${isSuccess ? "#166534" : "#b91c1c"};font-weight:700;font-size:13px;">
          ${title}
        </div>

        <h1 style="margin:18px 0 10px;font-size:32px;line-height:1.2;color:#0f172a;">
          ${isSuccess ? "Thanh toán thành công" : "Thanh toán chưa thành công"}
        </h1>

        <p style="margin:0 auto;max-width:420px;color:#475569;line-height:1.7;font-size:15px;">
          ${
            isSuccess
              ? "Giao dịch của bạn đã được xác nhận. Hệ thống sẽ tự động đưa bạn quay về trang chủ sau 3 giây."
              : "Giao dịch chưa được xác nhận thành công. Bạn sẽ được chuyển về trang chủ sau 3 giây để tiếp tục thao tác."
          }
        </p>
        </div>
      </div>
    </div>
  </body>
</html>`);
};
