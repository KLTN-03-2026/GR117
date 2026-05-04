import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../Components/shared/Breadcrumb.jsx";
import {
  FaWallet,
  FaChartLine,
  FaClock,
  FaCircleCheck,
  FaMoneyBill1Wave,
  FaXmark,
  FaBuilding,
} from "react-icons/fa6";

const fmtVND = (n) => `${Number(n || 0).toLocaleString("vi-VN")}đ`;

const wdMap = {
  pending: {
    label: "Chờ duyệt",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  approved: {
    label: "Đã duyệt",
    cls: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  rejected: {
    label: "Từ chối",
    cls: "bg-red-50 text-red-600 border border-red-200",
  },
  paid: {
    label: "Đã chi trả",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
};

function Revenue() {
  const [stats, setStats] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalSummary, setWithdrawalSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [showWdForm, setShowWdForm] = useState(false);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    bankName: "Vietcombank",
    accountNumber: "",
    bankHolder: "",
    note: "",
  });

  const accessToken = localStorage.getItem("accessToken");

  const fetchStats = async () => {
    const res = await fetch("/api/stats/partner", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const result = await res.json();
    if (!res.ok)
      throw new Error(result.message || "Khong the tai thong ke doanh thu");
    setStats(result.data || null);
  };

  const fetchWithdrawals = async () => {
    const res = await fetch("/api/withdrawals/provider", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const result = await res.json();
    if (!res.ok)
      throw new Error(result.message || "Khong the tai danh sach rut tien");
    setWithdrawals(Array.isArray(result.data) ? result.data : []);
    setWithdrawalSummary(result.summary || null);
  };

  const reloadData = async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([fetchStats(), fetchWithdrawals()]);
    } catch (err) {
      setError(err?.message || "Khong the tai du lieu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const withdrawalsSorted = useMemo(
    () =>
      [...withdrawals].sort((a, b) =>
        String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
      ),
    [withdrawals],
  );

  const myWd = useMemo(
    () =>
      withdrawalsSorted.map((w) => ({
        ...w,
        requestCode: w.code || w.requestCode || w.id || w._id,
        id: w.id || w._id,
        bankAccount: w.bankAccount || w.accountNumber,
        createdAt: w.createdAt
          ? new Date(w.createdAt).toLocaleString("vi-VN")
          : w.requestedAt
            ? new Date(w.requestedAt).toLocaleString("vi-VN")
            : "",
        rejectReason: w.rejectReason || w.adminNote || "",
        status: w.status || "pending",
      })),
    [withdrawalsSorted],
  );

  const availableBalance = Number(withdrawalSummary?.availableBalance || 0);
  const paidWithdrawals = Number(withdrawalSummary?.paidWithdrawals || 0);
  const totalRevenue = Number(stats?.providerRevenue || 0);
  const heldRevenue = Number(stats?.heldGrossRevenue || 0);
  const commissionRevenue = Number(stats?.commissionRevenue || 0);

  const openWithdrawForm = () => {
    setWithdrawError("");
    setForm((prev) => ({
      ...prev,
      amount: String(Math.max(availableBalance, 0)),
    }));
    setShowWdForm(true);
  };

  const handleSubmit = async () => {
    const amount = Number(String(form.amount || "").replace(/\D/g, ""));
    if (!amount || amount < 100000) {
      setWithdrawError("Vui lòng nhập số tiền rút hợp lệ, tối thiểu 100.000đ");
      return;
    }
    if (!form.accountNumber || !form.bankHolder) {
      setWithdrawError("Vui lòng nhập đầy đủ thông tin ngân hàng");
      return;
    }

    try {
      setSubmittingWithdrawal(true);
      setWithdrawError("");

      const res = await fetch("/api/withdrawals/provider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount,
          bankName: form.bankName,
          accountName: form.bankHolder,
          accountNumber: form.accountNumber,
          note: form.note,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Khong the tao yeu cau rut tien");
      }

      setShowWdForm(false);
      setForm({
        amount: "",
        bankName: "Vietcombank",
        accountNumber: "",
        bankHolder: "",
        note: "",
      });
      await reloadData();
    } catch (err) {
      setWithdrawError(err?.message || "Khong the tao yeu cau rut tien");
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
          <div>
            <Breadcrumb />
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px",
                fontWeight: "700",
                color: "rgb(26, 26, 46)",
              }}
            >
              Quản lý doanh thu
            </h1>
          </div>
        </div>
        <div className="p-6">
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-400">
            Đang tải dữ liệu doanh thu...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
        <div>
          <Breadcrumb />
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "20px",
              fontWeight: "700",
              color: "rgb(26, 26, 46)",
            }}
          >
            Quản lý doanh thu
          </h1>
        </div>

        <button
          type="button"
          onClick={openWithdrawForm}
          disabled={availableBalance < 100000}
          className="rounded-xl px-4 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: "linear-gradient(90deg, #f97316, #f59e0b)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span className="inline-flex items-center gap-2">
            <FaMoneyBill1Wave size={16} />
            Yêu cầu rút tiền
          </span>
        </button>
      </div>

      <div className="space-y-6 p-6">
        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Tổng doanh thu",
              value: totalRevenue,
              icon: FaChartLine,
              color: "#f97316",
              sub: "90% sau khi hoàn tất",
            },
            {
              label: "Khả dụng (rút được)",
              value: availableBalance,
              icon: FaWallet,
              color: "#10b981",
              sub: "Có thể rút ngay",
            },
            {
              label: "Đang giữ hộ",
              value: heldRevenue,
              icon: FaClock,
              color: "#f59e0b",
              sub: "Chờ hoàn tất tour",
            },
            {
              label: "Đã rút",
              value: paidWithdrawals,
              icon: FaCircleCheck,
              color: "#3b82f6",
              sub: "Tổng tiền đã nhận",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="relative mb-0 flex items-center">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${item.color}18` }}
                >
                  <item.icon size={18} style={{ color: item.color }} />
                </div>

                <p
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    margin: 0,
                  }}
                >
                  {fmtVND(item.value)}
                </p>
              </div>
              <p
                className="mt-1 text-muted-foreground"
                style={{ fontSize: 12 }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Lịch sử rút tiền</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
            {myWd.length === 0 && (
              <p
                className="py-10 text-center text-muted-foreground"
                style={{ fontSize: 13 }}
              >
                Chưa có yêu cầu
              </p>
            )}
            {myWd.map((w) => (
              <div key={w.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p style={{ fontSize: 14, fontWeight: 600 }}>
                    {fmtVND(w.amount)}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full ${wdMap[w.status]?.cls || wdMap.pending.cls}`}
                    style={{ fontSize: 11, fontWeight: 500 }}
                  >
                    {wdMap[w.status]?.label || wdMap.pending.label}
                  </span>
                </div>
                <p className="text-muted-foreground" style={{ fontSize: 11 }}>
                  Mã yêu cầu: #{w.requestCode}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: 12 }}>
                  {w.bankName} · {w.bankAccount}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: 11 }}>
                  {w.createdAt}
                </p>
                {w.rejectReason && (
                  <p className="text-red-600 mt-1" style={{ fontSize: 11 }}>
                    Lý do: {w.rejectReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showWdForm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowWdForm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>
                Yêu cầu rút tiền
              </h3>
              <button
                onClick={() => setShowWdForm(false)}
                className="text-muted-foreground hover:text-black"
              >
                <FaXmark size={18} />
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-3">
              <p className="text-muted-foreground" style={{ fontSize: 12 }}>
                Số dư khả dụng
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#f97316" }}>
                {fmtVND(availableBalance)}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  className="mb-1.5 block text-muted-foreground"
                  style={{ fontSize: 12 }}
                >
                  Số tiền
                </label>
                <input
                  value={form.amount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      amount: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="500000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#f97316]"
                  style={{ fontSize: 14 }}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-muted-foreground"
                  style={{ fontSize: 12 }}
                >
                  Ngân hàng
                </label>
                <input
                  value={form.bankName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bankName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#f97316]"
                  style={{ fontSize: 14 }}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-muted-foreground"
                  style={{ fontSize: 12 }}
                >
                  Số tài khoản
                </label>
                <input
                  value={form.accountNumber}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      accountNumber: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#f97316]"
                  style={{ fontSize: 14 }}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-muted-foreground"
                  style={{ fontSize: 12 }}
                >
                  Chủ tài khoản
                </label>
                <input
                  value={form.bankHolder}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      bankHolder: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="NGUYEN VAN A"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#f97316]"
                  style={{ fontSize: 14 }}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-muted-foreground"
                  style={{ fontSize: 12 }}
                >
                  Ghi chú
                </label>
                <input
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#f97316]"
                  style={{ fontSize: 14 }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <FaBuilding size={14} className="mt-0.5 text-blue-600" />
              <p className="text-blue-800" style={{ fontSize: 11 }}>
                Admin sẽ duyệt và chuyển khoản theo quy trình rút tiền của hệ
                thống.
              </p>
            </div>

            {withdrawError ? (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {withdrawError}
              </div>
            ) : null}

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowWdForm(false)}
                className="flex-1 rounded-xl bg-[#f0f4f8] py-2.5"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={submittingWithdrawal}
                className="flex-1 rounded-xl py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background: "linear-gradient(90deg, #f97316, #f59e0b)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {submittingWithdrawal ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Revenue;
