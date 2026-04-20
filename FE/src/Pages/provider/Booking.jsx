import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { IoSearch } from "react-icons/io5";
import { FaCalendarCheck, FaCircleXmark, FaLocationDot, FaRegCircleCheck } from "react-icons/fa6";
import Breadcrumb from "../../Components/shared/Breadcrumb.jsx";

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "awaiting_confirm", label: "Chờ xác nhận" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "completed", label: "Hoàn tất" },
  { id: "cancelled", label: "Đã hủy" },
];

const STATUS_META = {
  awaiting_payment: {
    label: "Chờ thanh toán",
    cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  awaiting_confirm: {
    label: "Chờ xác nhận",
    cls: "bg-blue-100 text-blue-700 border-blue-200",
  },
  confirmed: {
    label: "Đã xác nhận",
    cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  completed: {
    label: "Hoàn tất",
    cls: "bg-green-100 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Đã hủy",
    cls: "bg-red-100 text-red-700 border-red-200",
  },
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + "đ";

const getOrderId = (order) => order?._id || order?.id || "";

const getServiceName = (order) =>
  order?.tourSnapshot?.name || order?.serviceId?.serviceName || "Chưa có tên tour";

const getDepartureDate = (order) =>
  order?.tourSnapshot?.departureDate || order?.scheduleId?.departureDate || null;

const getCustomerName = (order) =>
  order?.customerInfo?.name || order?.customerInfo?.fullName || "Khách hàng";

const getCustomerPhone = (order) => order?.customerInfo?.phone || "";

const getInitial = (name) => String(name || "K").trim().charAt(0).toUpperCase() || "K";

const getStatusLabel = (status) => STATUS_META[status]?.label || status || "Chưa rõ";

const getStatusClass = (status) =>
  STATUS_META[status]?.cls || "bg-slate-100 text-slate-600 border-slate-200";

const canComplete = (status) => status === "confirmed";

function Booking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const accessToken = localStorage.getItem("accessToken");

  const fetchOrders = async () => {
    if (!accessToken) {
      setError("Bạn chưa đăng nhập hoặc token đã hết hạn");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/orders/provider", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (fetchError) {
      setError(
        fetchError?.response?.data?.message ||
          fetchError.message ||
          "Không thể tải danh sách đặt chỗ",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const counts = useMemo(
    () =>
      orders.reduce(
        (acc, order) => {
          acc.all += 1;
          if (acc[order.status] !== undefined) acc[order.status] += 1;
          return acc;
        },
        {
          all: 0,
          awaiting_confirm: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
        },
      ),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName = getCustomerName(order).toLowerCase();
      const serviceName = getServiceName(order).toLowerCase();
      const phone = getCustomerPhone(order).toLowerCase();
      const matchSearch =
        !keyword ||
        customerName.includes(keyword) ||
        serviceName.includes(keyword) ||
        phone.includes(keyword);

      const matchStatus = activeFilter === "all" || order.status === activeFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, activeFilter]);

  const updateOrder = async (orderId, status) => {
    if (!accessToken) return;

    try {
      setActionLoadingId(orderId);
      setError("");

      const res = await axios.patch(
        `/api/orders/status/${orderId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const updated = res.data?.data;
      if (updated) {
        setOrders((prev) =>
          prev.map((item) => (getOrderId(item) === orderId ? { ...item, ...updated } : item)),
        );
      } else {
        await fetchOrders();
      }
    } catch (updateError) {
      setError(
        updateError?.response?.data?.message ||
          updateError.message ||
          "Không thể cập nhật trạng thái đơn hàng",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-400">
          Đang tải danh sách đặt chỗ...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="sticky top-0 z-30 border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <Breadcrumb />
            <h1
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "20px",
                fontWeight: "700",
                color: "rgb(26, 26, 46)",
              }}
            >
              Quản lý đặt chỗ
            </h1>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {FILTERS.map((filter) => {
            const count = counts[filter.id] ?? counts.all;
            const active = activeFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "border-[#f97316] bg-[#f97316] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#f97316] hover:text-[#f97316]"
                }`}
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên khách, tour hoặc số điện thoại"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-400">
              Chưa có dữ liệu booking
            </div>
          ) : (
            filteredOrders.map((order) => {
              const orderId = getOrderId(order);
              const bookingStatus = getStatusLabel(order.status);
              const statusClass = getStatusClass(order.status);
              const isAwaitingConfirm = order.status === "awaiting_confirm";
              const isConfirmed = canComplete(order.status);
              const departureDate = getDepartureDate(order);

              return (
                <div
                  key={orderId}
                  className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-white">
                        {getInitial(getCustomerName(order))}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[16px] font-semibold text-slate-900">
                            {getCustomerName(order)}
                          </h3>
                          {getCustomerPhone(order) ? (
                            <span className="text-sm text-slate-400">
                              {getCustomerPhone(order)}
                            </span>
                          ) : null}
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
                          >
                            {bookingStatus}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-left text-[15px] text-slate-600">
                          {getServiceName(order)}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <FaCalendarCheck className="text-slate-300" />
                            {departureDate
                              ? new Date(departureDate).toLocaleDateString("vi-VN")
                              : "Chưa có ngày"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <FaLocationDot className="text-slate-300" />
                            {order?.serviceId?.location ||
                              order?.serviceId?.destination ||
                              order?.serviceId?.region ||
                              order?.tourSnapshot?.location ||
                              "Chưa có địa điểm"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <FaRegCircleCheck className="text-slate-300" />
                            {order.numPeople || 0} khách
                          </span>
                          <span>#{orderId.slice(-6)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right text-[22px] font-extrabold text-[#f97316]">
                        {formatMoney(order.totalPrice)}
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        {isAwaitingConfirm ? (
                          <>
                            <button
                              type="button"
                              disabled={actionLoadingId === orderId}
                              onClick={() => updateOrder(orderId, "confirmed")}
                              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <FaRegCircleCheck size={15} />
                              Xác nhận
                            </button>
                            <button
                              type="button"
                              disabled={actionLoadingId === orderId}
                              onClick={() => updateOrder(orderId, "cancelled")}
                              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <FaCircleXmark size={15} />
                              Từ chối
                            </button>
                          </>
                        ) : null}

                        {isConfirmed ? (
                          <button
                            type="button"
                            disabled={actionLoadingId === orderId}
                            onClick={() => updateOrder(orderId, "completed")}
                            className="inline-flex items-center gap-2 rounded-2xl border border-green-200 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <FaRegCircleCheck size={15} />
                            Hoàn tất
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Booking;
