import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../Components/shared/Breadcrumb.jsx";
import {
  FaArrowDownLong,
  FaArrowUpRightFromSquare,
  FaBuilding,
  FaCircleCheck,
  FaDollarSign,
  FaFilter,
  FaMagnifyingGlass,
  FaRotateRight,
  FaWallet,
  FaXmark,
} from "react-icons/fa6";

const fmtVND = (n) => `${Number(n || 0).toLocaleString("vi-VN")}đ`;

const withdrawalStatusMap = {
  pending: {
    label: "Chờ duyệt",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  approved: {
    label: "Đã duyệt",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  rejected: {
    label: "Từ chối",
    cls: "bg-red-50 text-red-600 border border-red-200",
  },
  paid: {
    label: "Đã chi trả",
    cls: "bg-blue-50 text-blue-700 border border-blue-200",
  },
};

const txMetaMap = {
  payment: {
    label: "Thanh toán",
    className: "bg-blue-50 text-blue-600",
    iconClassName: "text-blue-600",
    direction: "in",
  },
  commission: {
    label: "Hoa hồng",
    className: "bg-purple-50 text-purple-600",
    iconClassName: "text-purple-600",
    direction: "in",
  },
  payout: {
    label: "Giải ngân partner",
    className: "bg-orange-50 text-orange-600",
    iconClassName: "text-orange-600",
    direction: "out",
  },
  refund: {
    label: "Hoàn tiền user",
    className: "bg-amber-50 text-amber-600",
    iconClassName: "text-amber-600",
    direction: "out",
  },
  withdrawal: {
    label: "Rút tiền partner",
    className: "bg-red-50 text-red-600",
    iconClassName: "text-red-600",
    direction: "out",
  },
};

function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-gray-50 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${color}18` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <p
          style={{
            fontSize: 19,
            fontWeight: 700,
            color: "#1a1a2e",
            text: "center",
          }}
        >
          {fmtVND(value)}
        </p>
      </div>
      <p className="mt-1 text-slate-500" style={{ fontSize: 12 }}>
        {label}
      </p>
    </div>
  );
}

function TabButton({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
        active ? "bg-white text-[#f97316] shadow-sm" : "text-slate-500"
      }`}
      style={{ fontSize: 13, fontWeight: 500 }}
    >
      {label}
      {count > 0 ? (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] ${
            active
              ? "bg-orange-100 text-[#f97316]"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function EmptyState({ icon: Icon = FaFilter, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <Icon size={22} className="text-slate-300" />
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description ? (
        <p className="text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

function TransactionRow({ item }) {
  const meta = txMetaMap[item.type] || txMetaMap.payment;
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.className}`}
      >
        {meta.direction === "in" ? (
          <FaArrowDownLong size={15} />
        ) : (
          <FaArrowUpRightFromSquare size={15} />
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-left text-sm font-medium">{meta.label} </p>
        <p className="truncate text-left text-[11px] text-muted-foreground">
          {item.note}
        </p>
      </div>
      <div className="text-right">
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: meta.direction === "in" ? "#10b981" : "#ef4444",
          }}
        >
          {meta.direction === "in" ? "+" : "-"}
          {fmtVND(item.amount)}
        </p>
        <p className="text-muted-foreground" style={{ fontSize: 11 }}>
          {item.createdAt}
        </p>
      </div>
    </div>
  );
}

function WithdrawalRow({
  item,
  statusMeta,
  processingId,
  onReject,
  onApprove,
  onPaid,
}) {
  const withdrawalId = item.id || item._id;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-[260px] flex-1 items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100">
            <FaBuilding size={18} className="text-[#f97316]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">
              {item.partnerName || item?.provider_id?.fullName || "Chưa có"}
            </p>
            <p className="text-muted-foreground text-xs">
              #{withdrawalId} · {item.createdAt}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-[12px]">
              <div>
                <span className="text-muted-foreground">Ngân hàng: </span>
                {item.bankName}
              </div>
              <div>
                <span className="text-muted-foreground">Số TK: </span>
                {item.bankAccount || item.accountNumber}
              </div>
              <div>
                <span className="text-muted-foreground">Chủ TK: </span>
                {item.bankHolder || item.accountName}
              </div>
              {item.note ? (
                <div>
                  <span className="text-muted-foreground">Ghi chú: </span>
                  {item.note}
                </div>
              ) : null}
            </div>
            {item.rejectReason ? (
              <p className="mt-2 text-xs text-red-600">
                Lý do từ chối: {item.rejectReason}
              </p>
            ) : null}
          </div>
        </div>

        <div className="text-right">
          <p style={{ fontSize: 22, fontWeight: 700, color: "#f97316" }}>
            {fmtVND(item.amount)}
          </p>
          <span
            className={`inline-block mt-3 rounded-full px-2 py-0.5 ${statusMeta.cls}`}
            style={{ fontSize: 11, fontWeight: 500 }}
          >
            {statusMeta.label}
          </span>
          {item.status === "pending" ? (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onReject(withdrawalId)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                type="button"
                disabled={processingId === withdrawalId}
              >
                Từ chối
              </button>
              <button
                onClick={() => onApprove(withdrawalId)}
                className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
                type="button"
                disabled={processingId === withdrawalId}
              >
                <FaCircleCheck size={13} /> Duyệt & CK
              </button>
            </div>
          ) : null}
          {item.status === "approved" ? (
            <button
              onClick={() => onPaid(withdrawalId)}
              className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              type="button"
              disabled={processingId === withdrawalId}
            >
              Đánh dấu đã chi trả
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RefundRow({ item }) {
  const customerName = item?.userId?.fullName || item?.userName || "Khách hàng";
  const serviceName =
    item?.serviceId?.serviceName ||
    item?.tourSnapshot?.name ||
    item?.note ||
    "Không có mô tả";
  const refundAmount = Number(item?.refundAmount || item?.totalPrice || 0);
  const refundRate = Number(item?.refundRate || 0);
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
        <FaRotateRight size={16} className="text-emerald-600" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-medium">{customerName}</p>
        <p className="truncate text-[12px] text-muted-foreground">
          {serviceName}
        </p>
      </div>
      <div className="text-right">
        <p style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>
          +{fmtVND(refundAmount)}
        </p>
        <p className="text-muted-foreground" style={{ fontSize: 11 }}>
          {item.createdAt}
        </p>
        {refundRate > 0 ? (
          <p className="text-muted-foreground" style={{ fontSize: 11 }}>
            Hoàn {Math.round(refundRate * 100)}%
          </p>
        ) : null}
      </div>
    </div>
  );
}

function RejectModal({ open, onClose, value, onChange, onSubmit }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Từ chối yêu cầu</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground"
            type="button"
          >
            <FaXmark size={18} />
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="Lý do từ chối..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#f97316]"
          style={{ fontSize: 13 }}
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f0f4f8] py-2.5"
            style={{ fontSize: 13 }}
            type="button"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-white"
            style={{ fontSize: 13, fontWeight: 600 }}
            type="button"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

function Revenue() {
  const [stats, setStats] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [adminNoteMap, setAdminNoteMap] = useState({});
  const [tab, setTab] = useState("transactions");
  const [search, setSearch] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const accessToken = localStorage.getItem("accessToken");
  const handleTabChange = (nextTab) => setTab(nextTab);

  const fetchStats = async () => {
    const res = await fetch("/api/stats/admin", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const result = await res.json();
    if (!res.ok)
      throw new Error(result.message || "Không thể tải thống kê doanh thu");
    setStats(result.data || null);
  };

  const fetchWithdrawals = async () => {
    const res = await fetch("/api/withdrawals/admin", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const result = await res.json();
    if (!res.ok)
      throw new Error(result.message || "Không thể tải danh sách rút tiền");
    setWithdrawals(Array.isArray(result.data) ? result.data : []);
  };

  const fetchOrders = async () => {
    const res = await fetch("/api/orders/admin", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể tải danh sách đơn hàng");
    }
    setOrders(Array.isArray(result.data) ? result.data : []);
  };

  const reloadData = async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([fetchStats(), fetchWithdrawals(), fetchOrders()]);
    } catch (err) {
      setError(err?.message || "Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const totalCollected = Number(stats?.totalCollectedRevenue || 0);
  const heldRevenue = Number(stats?.heldRevenue || 0);
  const commissionRevenue = Number(stats?.commissionRevenue || 0);
  const providerPayout = Number(stats?.providerPayout || 0);

  const pendingWithdrawals = useMemo(
    () => withdrawals.filter((item) => item.status === "pending"),
    [withdrawals],
  );

  const txList = useMemo(() => {
    const rows = [
      {
        id: "total-collected",
        type: "payment",
        note: "Tổng doanh thu đã thu từ khách hàng",
        amount: totalCollected,
        createdAt: "-",
      },
      {
        id: "commission",
        type: "commission",
        note: "Hoa hồng hệ thống từ đơn đã hoàn tất",
        amount: commissionRevenue,
        createdAt: "-",
      },
      {
        id: "provider-payout",
        type: "payout",
        note: "Khoáº£n cáº§n chi tráº£ cho provider",
        amount: providerPayout,
        createdAt: "-",
      },
      {
        id: "held-revenue",
        type: "withdrawal",
        note: "Doanh thu đang giữ hộ chờ hoàn tất tour",
        amount: heldRevenue,
        createdAt: "-",
      },
    ];

    const refundRows = [...orders]
      .filter(
        (order) =>
          order?.paymentStatus === "refunded" ||
          Number(order?.refundAmount || 0) > 0,
      )
      .map((order) => ({
        id: `refund-${order?._id || order?.id}`,
        type: "refund",
        note: `Hoàn tiền tour ${
          order?.serviceId?.serviceName ||
          order?.tourSnapshot?.name ||
          "không có tên tour"
        }`,
        amount: Number(order?.refundAmount || order?.totalPrice || 0),
        createdAt: order?.updatedAt || order?.createdAt || "-",
      }));

    rows.push(...refundRows);

    return rows.filter((item) => {
      if (!search) return true;
      const keyword = search.toLowerCase();
      return (
        item.note.toLowerCase().includes(keyword) ||
        item.id.toLowerCase().includes(keyword)
      );
    });
  }, [search, totalCollected, commissionRevenue, providerPayout, heldRevenue]);

  const sortedTx = txList;

  const withdrawalList = useMemo(
    () =>
      [...withdrawals].sort((a, b) =>
        String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
      ),
    [withdrawals],
  );
  const sortedWd = withdrawalList;
  const wdMap = withdrawalStatusMap;

  const refundList = useMemo(
    () =>
      [...orders]
        .filter(
          (order) =>
            order?.paymentStatus === "refunded" ||
            Number(order?.refundAmount || 0) > 0,
        )
        .sort((a, b) =>
          String(b.updatedAt || b.createdAt || "").localeCompare(
            String(a.updatedAt || a.createdAt || ""),
          ),
        ),
    [orders],
  );

  const patchWithdrawal = async (id, status, note = "") => {
    const res = await fetch(`/api/withdrawals/admin/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        status,
        adminNote: note || adminNoteMap[id] || "",
      }),
    });
    const result = await res.json();
    if (!res.ok)
      throw new Error(result.message || "Khong the cap nhat rut tien");
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      setError("");
      await patchWithdrawal(id, "approved");
      await reloadData();
    } catch (err) {
      setError(err?.message || "Khong the duyet rut tien");
    } finally {
      setProcessingId("");
    }
  };

  const handlePaid = async (id) => {
    try {
      setProcessingId(id);
      setError("");
      await patchWithdrawal(id, "paid");
      await reloadData();
    } catch (err) {
      setError(err?.message || "Khong the cap nhat da chi tra");
    } finally {
      setProcessingId("");
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) {
      setError("Vui long nhap ly do tu choi");
      return;
    }

    try {
      setProcessingId(rejectId);
      setError("");
      await patchWithdrawal(rejectId, "rejected", rejectReason.trim());
      setRejectId(null);
      setRejectReason("");
      await reloadData();
    } catch (err) {
      setError(err?.message || "Khong the tu choi yeu cau");
    } finally {
      setProcessingId("");
    }
  };

  if (loading) {
    return (
      <div>
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
          <div>
            <Breadcrumb />
            <h1 className="text-left text-xl font-semibold text-slate-900">
              Doanh thu hệ thống
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
    <div className="space-y-5">
      <div className="">
        <h1 className="text-left text-xl font-semibold text-slate-900">
          Doanh thu hệ thống
        </h1>
      </div>

      <div className="space-y-3 p-3">
        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Tổng GMV"
            value={totalCollected}
            icon={FaDollarSign}
            color="#f97316"
          />
          <MetricCard
            label="Hoa hồng đã thu"
            value={commissionRevenue}
            icon={FaWallet}
            color="#10b981"
          />
          <MetricCard
            label="Đang giữ hộ"
            value={heldRevenue}
            icon={FaWallet}
            color="#3b82f6"
          />
          <MetricCard
            label="Yêu cầu chờ duyệt"
            value={pendingWithdrawals.length}
            icon={FaCircleCheck}
            color="#f59e0b"
          />
        </div>

        <div className="flex w-fit gap-1 rounded-xl bg-[#f8fafc] p-1">
          <TabButton
            active={tab === "transactions"}
            label="Giao dịch"
            count={sortedTx.length}
            onClick={() => handleTabChange("transactions")}
          />
          <TabButton
            active={tab === "withdrawals"}
            label="Yêu cầu rút"
            count={pendingWithdrawals.length}
            onClick={() => handleTabChange("withdrawals")}
          />
          <TabButton
            active={tab === "refunds"}
            label="Hoàn tiền"
            count={refundList.length}
            onClick={() => handleTabChange("refunds")}
          />
        </div>

        {tab === "transactions" && (
          <div className="bg-white border border-gray-100 rounded-2xl">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>
                Tất cả giao dịch
              </h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {sortedTx.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={FaFilter}
                    title="Chưa có giao dịch"
                    description="Hệ thống sẽ hiển thị các khoản thanh toán, hoa hồng và giải ngân ở đây."
                  />
                </div>
              ) : (
                sortedTx.map((t) => <TransactionRow key={t.id} item={t} />)
              )}
            </div>
          </div>
        )}

        {/* Withdrawals */}
        {tab === "withdrawals" && (
          <div className="space-y-3">
            {sortedWd.length === 0 ? (
              <EmptyState
                icon={FaCircleCheck}
                title="Chưa có yêu cầu nào"
                description="Các yêu cầu rút tiền của provider sẽ xuất hiện tại đây."
              />
            ) : (
              sortedWd.map((w) => (
                <WithdrawalRow
                  key={w.id || w._id}
                  item={w}
                  statusMeta={wdMap[w.status] || wdMap.pending}
                  processingId={processingId}
                  onReject={setRejectId}
                  onApprove={handleApprove}
                  onPaid={handlePaid}
                />
              ))
            )}
          </div>
        )}

        {/* Refunds */}
        {tab === "refunds" && (
          <div className="bg-white border border-gray-100 rounded-2xl">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>
                Lịch sử hoàn tiền
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {refundList.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={FaRotateRight}
                    title="Chưa có hoàn tiền nào"
                    description="Mục này sẽ hiển thị lịch sử hoàn tiền cho khách hàng."
                  />
                </div>
              ) : (
                refundList.map((t) => {
                  return <RefundRow key={t.id || t._id} item={t} />;
                })
              )}
            </div>
          </div>
        )}

        <RejectModal
          open={Boolean(rejectId)}
          onClose={() => setRejectId(null)}
          value={rejectReason}
          onChange={setRejectReason}
          onSubmit={handleReject}
        />
      </div>
    </div>
  );
}

export default Revenue;
