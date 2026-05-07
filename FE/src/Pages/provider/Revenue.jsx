import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../Components/shared/Breadcrumb.jsx";
import {
  FaWallet,
  FaChartLine,
  FaClock,
  FaCircleCheck,
  FaPercent,
  FaMoneyBill1Wave,
  FaXmark,
  FaBuilding,
} from "react-icons/fa6";

const fmtVND = (n) => `${Number(n || 0).toLocaleString("vi-VN")}đ`;

const wdMap = {
  pending: {
    label: "Chờ duyệt",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Đã chi trả",
    cls: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
  },
  rejected: {
    label: "Từ chối",
    cls: "bg-red-50 text-red-600 border border-red-200",
    dot: "bg-red-500",
  },
  paid: {
    label: "Đã chi trả",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
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
    if (!res.ok) {
      throw new Error(result.message || "Không thể tải thống kê doanh thu");
    }
    setStats(result.data || null);
  };

  const fetchWithdrawals = async () => {
    const res = await fetch("/api/withdrawals/provider", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể tải danh sách rút tiền");
    }
    setWithdrawals(Array.isArray(result.data) ? result.data : []);
    setWithdrawalSummary(result.summary || null);
  };

  const reloadData = async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([fetchStats(), fetchWithdrawals()]);
    } catch (err) {
      setError(err?.message || "Không thể tải dữ liệu doanh thu");
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
  const platformFee = Number(stats?.commissionRevenue || 0);
  const heldRevenue = Number(stats?.heldGrossRevenue || 0);

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
        throw new Error(result.message || "Không thể tạo yêu cầu rút tiền");
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
      setWithdrawError(err?.message || "Không thể tạo yêu cầu rút tiền");
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="sticky top-0 z-30 border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Tổng doanh thu",
              value: totalRevenue,
              icon: FaChartLine,
              color: "#f97316",
            },
            {
              label: "Phí sàn",
              value: platformFee,
              icon: FaPercent,
              color: "#8b5cf6",
            },
            {
              label: "Khả dụng (rút được)",
              value: availableBalance,
              icon: FaWallet,
              color: "#10b981",
            },
            {
              label: "Đang giữ hộ",
              value: heldRevenue,
              icon: FaClock,
              color: "#f59e0b",
            },
            {
              label: "Đã rút",
              value: paidWithdrawals,
              icon: FaCircleCheck,
              color: "#3b82f6",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="relative min-h-[69px]">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${item.color}18` }}
                >
                  <item.icon size={18} style={{ color: item.color }} />
                </div>

                <p
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1a1a2e",
                    margin: 10,
                    width: "100%",
                  }}
                >
                  {fmtVND(item.value)}
                </p>
              </div>
              <p
                className="mt-0 text-center text-muted-foreground"
                style={{ fontSize: 12 }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>
                Lịch sử rút tiền
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {myWd.length} yêu cầu,{" "}
                {myWd.filter((item) => item.status === "pending").length} chờ
                duyệt,{" "}
                {myWd.filter((item) => item.status === "rejected").length} bị từ
                chối
              </p>
            </div>
          </div>
          <div className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto">
            {myWd.length === 0 && (
              <p
                className="py-10 text-center text-muted-foreground"
                style={{ fontSize: 13 }}
              >
                Chưa có yêu cầu
              </p>
            )}
            {myWd.map((w) => (
              <div key={w.id} className="px-5 py-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                        Yêu cầu rút tiền
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {fmtVND(w.amount)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        #{w.requestCode}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${wdMap[w.status]?.cls || wdMap.pending.cls}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${wdMap[w.status]?.dot || wdMap.pending.dot}`}
                      />
                      {wdMap[w.status]?.label || wdMap.pending.label}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-400">Ngân hàng</p>
                      <p className="mt-1 font-medium text-slate-700">
                        {w.bankName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Tài khoản</p>
                      <p className="mt-1 font-medium text-slate-700">
                        {w.bankAccount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Thời gian</p>
                      <p className="mt-1 font-medium text-slate-700">
                        {w.createdAt}
                      </p>
                    </div>
                  </div>

                  {w.rejectReason ? (
                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                      Lý do từ chối: {w.rejectReason}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showWdForm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"
          onClick={() => setShowWdForm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                Yêu cầu rút tiền
              </h3>
              <button
                onClick={() => setShowWdForm(false)}
                className="text-muted-foreground hover:text-black"
              >
                <FaXmark size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label
                  className="mb-1 block text-muted-foreground"
                  style={{ fontSize: 11 }}
                >
                  Ngân hàng
                </label>
                <input
                  value={form.bankName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bankName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[#f97316]"
                  style={{ fontSize: 13 }}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-muted-foreground"
                  style={{ fontSize: 11 }}
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
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[#f97316]"
                  style={{ fontSize: 13 }}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-muted-foreground"
                  style={{ fontSize: 11 }}
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
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[#f97316]"
                  style={{ fontSize: 13 }}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-muted-foreground"
                  style={{ fontSize: 11 }}
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
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[#f97316]"
                  style={{ fontSize: 13 }}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-muted-foreground"
                  style={{ fontSize: 11 }}
                >
                  Ghi chú
                </label>
                <input
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[#f97316]"
                  style={{ fontSize: 13 }}
                />
              </div>
            </div>

            {withdrawError ? (
              <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {withdrawError}
              </div>
            ) : null}

            <div className="mt-4 flex gap-2.5">
              <button
                onClick={() => setShowWdForm(false)}
                className="flex-1 rounded-xl bg-[#f0f4f8] py-2"
                style={{ fontSize: 12.5, fontWeight: 500 }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={submittingWithdrawal}
                className="flex-1 rounded-xl py-2 text-white disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background: "linear-gradient(90deg, #f97316, #f59e0b)",
                  fontSize: 12.5,
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
