import { useEffect, useMemo, useState } from "react";
import {
  FaBuilding,
  FaFilter,
  FaMagnifyingGlass,
  FaRotateRight,
  FaWallet,
} from "react-icons/fa6";

const ACTIVE_BOOKING_STATUSES = [
  "awaiting_payment",
  "awaiting_confirm",
  "confirmed",
];
const COMMISSION_RATE = 0.1;

const fmtVND = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const toMoney = (value) => Math.max(0, Math.floor(Number(value || 0)));

const calcCommission = (gross) => Math.floor(toMoney(gross) * COMMISSION_RATE);

const providerLabel = (order) =>
  order?.provider_id?.fullName ||
  order?.provider_id?.name ||
  order?.providerName ||
  order?.partnerName ||
  "Chưa có tên provider";

function RevenueByProvider() {
  const [orders, setOrders] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const accessToken = localStorage.getItem("accessToken");

  const reloadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersRes, withdrawalsRes] = await Promise.all([
        fetch("/api/orders/admin", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch("/api/withdrawals/admin", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const [ordersResult, withdrawalsResult] = await Promise.all([
        ordersRes.json(),
        withdrawalsRes.json(),
      ]);

      if (!ordersRes.ok) {
        throw new Error(
          ordersResult.message || "Không thể tải danh sách đơn hàng",
        );
      }

      if (!withdrawalsRes.ok) {
        throw new Error(
          withdrawalsResult.message || "Không thể tải danh sách rút tiền",
        );
      }

      setOrders(Array.isArray(ordersResult.data) ? ordersResult.data : []);
      setWithdrawals(
        Array.isArray(withdrawalsResult.data) ? withdrawalsResult.data : [],
      );
    } catch (err) {
      setError(err?.message || "Không thể tải dữ liệu theo provider");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const providerRows = useMemo(() => {
    const map = new Map();

    const ensureProvider = (key, name) => {
      if (!map.has(key)) {
        map.set(key, {
          providerId: key,
          providerName: name || "Chưa có tên provider",
          totalRevenue: 0,
          commissionRevenue: 0,
          refundRevenue: 0,
          heldRevenue: 0,
          paidWithdrawals: 0,
          availableBalance: 0,
          pendingWithdrawals: 0,
          completedOrders: 0,
          activeOrders: 0,
          totalOrders: 0,
        });
      }
      return map.get(key);
    };

    orders.forEach((order) => {
      const providerId = String(
        order?.provider_id?._id ||
          order?.provider_id ||
          order?.providerId ||
          "unknown",
      );
      const name = providerLabel(order);
      const row = ensureProvider(providerId, name);
      const amount = toMoney(order?.totalPrice);
      const refundAmount = toMoney(
        order?.refundAmount || order?.refundInfo?.amount,
      );
      const isPaid =
        order?.paymentStatus === "paid" && order?.status !== "cancelled";
      const isCompleted = isPaid && order?.status === "completed";
      const isActive =
        isPaid && ACTIVE_BOOKING_STATUSES.includes(order?.status);
      const commission = isCompleted ? calcCommission(amount) : 0;

      row.totalOrders += 1;
      row.providerName =
        row.providerName === "Chưa có tên provider" ? name : row.providerName;

      if (isPaid) {
        row.totalRevenue += amount;
      }

      if (isCompleted) {
        row.completedOrders += 1;
        row.commissionRevenue += commission;
      }

      if (isActive) {
        row.activeOrders += 1;
        row.heldRevenue += amount;
      }

      if (order?.paymentStatus === "refunded" || refundAmount > 0) {
        row.refundRevenue += refundAmount || amount;
      }
    });

    withdrawals.forEach((item) => {
      const providerId = String(
        item?.provider_id?._id || item?.provider_id || "unknown",
      );
      const name =
        item?.provider_id?.fullName ||
        item?.providerName ||
        "Chưa có tên provider";
      const row = ensureProvider(providerId, name);
      const amount = toMoney(item?.amount);
      const status = String(item?.status || "pending").toLowerCase();

      if (status === "paid") {
        row.paidWithdrawals += amount;
      }

      if (["pending", "approved", "paid"].includes(status)) {
        row.availableBalance -= amount;
      }

      if (status === "pending") {
        row.pendingWithdrawals += 1;
      }
    });

    return [...map.values()]
      .map((row) => {
        const providerGross = Math.max(row.totalRevenue, 0);
        const providerCommission = Math.max(row.commissionRevenue, 0);
        const providerNet = Math.max(providerGross - providerCommission, 0);
        const availableBalance = Math.max(
          providerNet + row.availableBalance,
          0,
        );

        return {
          ...row,
          providerGross,
          providerCommission,
          providerNet,
          availableBalance,
        };
      })
      .sort((a, b) => b.providerGross - a.providerGross);
  }, [orders, withdrawals]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return providerRows;
    return providerRows.filter((row) => {
      return (
        row.providerName.toLowerCase().includes(keyword) ||
        String(row.providerId).toLowerCase().includes(keyword)
      );
    });
  }, [providerRows, search]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-400">
        Đang tải dữ liệu theo provider...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Quản lí doanh thu Provider
            </h3>
          </div>

          <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <FaMagnifyingGlass className="text-slate-400" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên provider..."
              className="w-full bg-transparent text-sm outline-none"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Xóa tìm kiếm"
              >
                <FaRotateRight size={14} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Tổng doanh thu</th>
                <th className="px-3 py-2">Phí sàn</th>
                <th className="px-3 py-2">Hoàn tiền</th>
                <th className="px-3 py-2">Đang giữ hộ</th>
                <th className="px-3 py-2">Đã rút</th>
                <th className="px-3 py-2">Khả dụng</th>
                <th className="px-3 py-2">Yêu cầu chờ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6">
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                      <FaFilter
                        className="mx-auto mb-2 text-slate-300"
                        size={18}
                      />
                      Không tìm thấy provider phù hợp.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.providerId}
                    className="rounded-2xl bg-slate-50/80"
                  >
                    <td className="rounded-l-2xl px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#f97316]">
                          <FaBuilding size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {row.providerName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {row.totalOrders} đơn, {row.completedOrders} hoàn
                            tất
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm font-medium text-slate-700">
                      {fmtVND(row.providerGross)}
                    </td>
                    <td className="px-3 py-4 text-sm font-medium text-slate-700">
                      {fmtVND(row.providerCommission)}
                    </td>
                    <td className="px-3 py-4 text-sm font-medium text-slate-700">
                      {fmtVND(row.refundRevenue)}
                    </td>
                    <td className="px-3 py-4 text-sm font-medium text-slate-700">
                      {fmtVND(row.heldRevenue)}
                    </td>
                    <td className="px-3 py-4 text-sm font-medium text-slate-700">
                      {fmtVND(row.paidWithdrawals)}
                    </td>
                    <td className="px-3 py-4 text-sm font-medium text-slate-700">
                      {fmtVND(row.availableBalance)}
                    </td>
                    <td className="rounded-r-2xl px-3 py-4 text-sm font-medium text-slate-700">
                      {row.pendingWithdrawals}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RevenueByProvider;
