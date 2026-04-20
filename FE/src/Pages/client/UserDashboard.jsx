import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import {
  FaClock,
  FaEye,
  FaPenToSquare,
  FaTicket,
  FaTrash,
  FaUser,
  FaStar,
} from "react-icons/fa6";
import { jwt } from "../../utils/jwt";

const tabs = [
  { id: "orders", label: "Đơn hàng", icon: FaTicket },
  { id: "history", label: "Lịch sử", icon: FaClock },
  { id: "profile", label: "Thông tin cá nhân", icon: FaUser },
  { id: "reviews", label: "Đánh giá", icon: FaStar },
];

const bookingStatusMap = {
  awaiting_payment: { label: "Chờ thanh toán", cls: "bg-yellow-100 text-yellow-700" },
  awaiting_confirm: { label: "Chờ xác nhận", cls: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Đã xác nhận", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Bị từ chối", cls: "bg-red-100 text-red-700" },
  cancelled: { label: "Đã hủy", cls: "bg-gray-100 text-gray-600" },
  completed: { label: "Hoàn tất", cls: "bg-emerald-100 text-emerald-700" },
};

const paymentStatusMap = {
  unpaid: { label: "Chưa thanh toán", cls: "text-yellow-600" },
  paid: { label: "Đã thanh toán", cls: "text-green-600" },
  failed: { label: "Thất bại", cls: "text-red-600" },
  refunded: { label: "Đã hoàn tiền", cls: "text-blue-600" },
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

const getOrderId = (order) => order?._id || order?.id || "";

const getServiceName = (order) =>
  order?.tourSnapshot?.name ||
  order?.serviceId?.serviceName ||
  order?.serviceId?.name ||
  "Chưa có tên tour";

const getDepartureDate = (order) =>
  order?.tourSnapshot?.departureDate || order?.scheduleId?.departureDate || null;

function UserDashboard() {
  const user = jwt();
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  }, []);

  const [tab, setTab] = useState("orders");
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [detailId, setDetailId] = useState("");
  const [reviewForm, setReviewForm] = useState({
    orderId: "",
    serviceId: "",
    serviceName: "",
    rating: 5,
    comment: "",
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  if (!user || String(user.role).toLowerCase() !== "user") {
    return <Navigate to="/signin" replace />;
  }

  const accessToken = localStorage.getItem("accessToken");
  const currentUserId = String(user.userId || user.id || currentUser?._id || currentUser?.id || "");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {};

      const [profileRes, ordersRes] = await Promise.all([
        axios.get("/api/users/profile", { headers }),
        axios.get("/api/orders/my-orders", { headers }),
      ]);

      const profileData = profileRes.data?.data || {};
      const ordersData = Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : [];

      setProfile({
        fullName: profileData.fullName || currentUser?.fullName || "",
        email: profileData.email || currentUser?.email || "",
        phone: profileData.phone || currentUser?.phone || "",
      });
      setOrders(ordersData);
    } catch (fetchError) {
      setError(
        fetchError?.response?.data?.message ||
          fetchError.message ||
          "Không thể tải dữ liệu dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      setError("Bạn cần đăng nhập để xem dashboard.");
      setLoading(false);
      return;
    }

    fetchDashboard();
  }, [accessToken]);

  const activeOrders = orders.filter(
    (order) => !["completed", "cancelled", "rejected"].includes(order.status),
  );
  const historyOrders = orders.filter((order) =>
    ["completed", "cancelled", "rejected"].includes(order.status),
  );

  const serviceIds = useMemo(() => {
    const ids = new Set();
    orders.forEach((order) => {
      const serviceId =
        order?.serviceId?._id || order?.serviceId?.id || order?.serviceId || "";
      if (serviceId) ids.add(String(serviceId));
    });
    return Array.from(ids);
  }, [orders]);

  useEffect(() => {
    if (serviceIds.length === 0) {
      setReviews([]);
      return;
    }

    let cancelled = false;

    const fetchReviews = async () => {
      try {
        const results = await Promise.all(
          serviceIds.map((id) => axios.get(`/api/reviews/service/${id}`)),
        );

        if (cancelled) return;

        const allReviews = results.flatMap((res) =>
          Array.isArray(res.data?.data) ? res.data.data : [],
        );

        const myReviews = allReviews.filter((review) => {
          const reviewerId = review?.userId?._id || review?.userId || "";
          return String(reviewerId) === currentUserId;
        });

        setReviews(myReviews);
      } catch {
        if (!cancelled) setReviews([]);
      }
    };

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [serviceIds, currentUserId]);

  const updateProfile = async () => {
    if (!accessToken) return;

    try {
      setSavingProfile(true);
      setNotice("");
      const res = await axios.put(
        "/api/users/profile",
        {
          fullName: profile.fullName,
          phone: profile.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const updated = res.data?.data || {};
      setProfile((prev) => ({
        ...prev,
        fullName: updated.fullName || prev.fullName,
        phone: updated.phone || prev.phone,
      }));
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...(currentUser || {}),
          ...updated,
        }),
      );
      setNotice("Cập nhật thông tin thành công!");
    } catch (updateError) {
      setError(updateError?.response?.data?.message || "Không thể cập nhật hồ sơ.");
    } finally {
      setSavingProfile(false);
    }
  };

  const openReview = (order) => {
    setReviewForm({
      orderId: getOrderId(order),
      serviceId:
        order?.serviceId?._id || order?.serviceId?.id || order?.serviceId || "",
      serviceName: getServiceName(order),
      rating: 5,
      comment: "",
    });
    setShowReviewForm(true);
  };

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) {
      setError("Vui lòng nhập bình luận");
      return;
    }

    try {
      setSubmittingReview(true);
      setNotice("");
      await axios.post(
        "/api/reviews",
        {
          orderId: reviewForm.orderId,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setNotice("Đánh giá thành công!");
      setShowReviewForm(false);
      fetchDashboard();
    } catch (reviewError) {
      setError(reviewError?.response?.data?.message || "Không thể gửi đánh giá.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const canCancel = (status) => ["awaiting_payment", "awaiting_confirm"].includes(status);
  const canPay = (status) => status === "awaiting_payment";
  const canReview = (order) =>
    order.status === "completed" &&
    !reviews.find((review) => String(review.orderId) === String(getOrderId(order)));

  const handleCancel = (orderId) => {
    setNotice(`Đơn #${String(orderId).slice(-6)}: hiện backend chưa có endpoint hủy từ user.`);
    console.log("cancel order", orderId);
  };

  const handlePay = (orderId) => {
    setNotice(`Đơn #${String(orderId).slice(-6)}: hiện dashboard chưa nối VNPAY.`);
    console.log("pay order", orderId);
  };

  const BookingTable = ({ list }) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px]" style={{ fontSize: 14 }}>
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-500">Mã đơn</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-500">Dịch vụ</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-500">Ngày KH</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-500">Tổng tiền</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-500">Trạng thái</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-500">Thanh toán</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-500">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {list.map((order) => {
            const orderId = getOrderId(order);
            const bookingStatus = bookingStatusMap[order.status] || bookingStatusMap.awaiting_confirm;
            const paymentStatus = paymentStatusMap[order.paymentStatus] || paymentStatusMap.unpaid;
            const departureDate = getDepartureDate(order);

            return (
              <tr key={orderId} className="border-b border-slate-100 hover:bg-[#f8fafc]">
                <td className="px-4 py-4 align-top text-slate-700">#{orderId.slice(-6)}</td>
                <td className="px-4 py-4 align-top">
                  <p className="max-w-[260px] truncate text-left font-medium text-slate-900">
                    {getServiceName(order)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{order.numPeople} người</p>
                </td>
                <td className="px-4 py-4 align-top text-slate-600">
                  {departureDate ? new Date(departureDate).toLocaleDateString("vi-VN") : "Chưa có"}
                </td>
                <td className="px-4 py-4 align-top font-semibold text-[#f97316]">
                  {formatMoney(order.totalPrice)}
                </td>
                <td className="px-4 py-4 align-top">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${bookingStatus.cls}`}>
                    {bookingStatus.label}
                  </span>
                </td>
                <td className="px-4 py-4 align-top">
                  <span className={`text-xs font-medium ${paymentStatus.cls}`}>
                    {paymentStatus.label}
                  </span>
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailId(orderId)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#f97316] hover:text-[#f97316]"
                    >
                      <FaEye size={12} />
                      Chi tiết
                    </button>
                    {canPay(order.status) ? (
                      <button
                        type="button"
                        onClick={() => handlePay(orderId)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-600"
                      >
                        Thanh toán
                      </button>
                    ) : null}
                    {canCancel(order.status) ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(orderId)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                      >
                        <FaTrash size={12} />
                        Hủy
                      </button>
                    ) : null}
                    {canReview(order) ? (
                      <button
                        type="button"
                        onClick={() => openReview(order)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#f97316] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#ea5f0c]"
                      >
                        <FaPenToSquare size={12} />
                        Đánh giá
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {list.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">
          Không có đơn hàng nào
        </div>
      ) : null}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-4 py-8 md:px-6">
        <div className="mx-auto max-w-7xl rounded-[28px] bg-white p-8 text-slate-500 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          Đang tải dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6 text-left">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Dashboard khách hàng</p>
          <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1
                className="text-3xl font-extrabold tracking-tight text-slate-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Xin chào,{" "}
                <span className="text-[#f97316]">
                  {profile.fullName || currentUser?.fullName || "Khách hàng"}
                </span>
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-500">
                Đây là nơi bạn xem tổng quan tài khoản, các đơn đã đặt và thông tin cá nhân.
              </p>
            </div>

          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {notice}
          </div>
        ) : null}

        <div className="flex gap-1 overflow-x-auto rounded-2xl bg-[#f0f4f8] p-1">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-white text-[#f97316] shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          {tab === "orders" ? (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Đơn hàng đang xử lý</h2>
              <BookingTable list={activeOrders} />
            </div>
          ) : null}

          {tab === "history" ? (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Lịch sử đặt dịch vụ</h2>
              <BookingTable list={historyOrders} />
            </div>
          ) : null}

          {tab === "profile" ? (
            <div className="space-y-4">
              <div className="space-y-4">
                <h2 className="mb-2 text-xl font-semibold text-slate-900">Thông tin cá nhân</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-500">Họ tên</span>
                    <input
                      value={profile.fullName}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-slate-500">Số điện thoại</span>
                    <input
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm text-slate-500">Email</span>
                  <input
                    value={profile.email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                  />
                </label>

                <button
                  type="button"
                  onClick={updateProfile}
                  disabled={savingProfile}
                  className="rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-orange-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingProfile ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </div>
          ) : null}

          {tab === "reviews" ? (
            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-900">Đánh giá của tôi</h2>
                <p className="text-sm text-slate-500">{reviews.length} đánh giá</p>
              </div>

              {reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-14 text-center text-slate-500">
                  Bạn chưa có đánh giá nào
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id || review.id} className="rounded-2xl bg-[#f8fafc] p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {review?.serviceId?.serviceName || "Dịch vụ"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {review?.userId?.fullName || currentUser?.fullName || "Khách hàng"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[#f59e0b]">
                          {Array.from({ length: Number(review.rating || 0) }).map((_, index) => (
                            <FaStar key={index} size={14} className="fill-current" />
                          ))}
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {review.comment || "Không có nội dung đánh giá."}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {review.createdAt ? new Date(review.createdAt).toLocaleString("vi-VN") : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

      </div>

      {detailId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDetailId("")}
        >
          {(() => {
            const order = orders.find((item) => getOrderId(item) === detailId);
            if (!order) return null;
            const bookingStatus = bookingStatusMap[order.status] || bookingStatusMap.awaiting_confirm;
            const paymentStatus = paymentStatusMap[order.paymentStatus] || paymentStatusMap.unpaid;

            return (
              <div
                className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="mb-4 text-xl font-semibold text-slate-900">
                  Chi tiết đơn #{getOrderId(order).slice(-6)}
                </h3>

                <div className="space-y-3 text-sm text-slate-700">
                  {[
                    ["Dịch vụ", getServiceName(order)],
                    ["Đối tác", order?.provider_id?.fullName || "Chưa có"],
                    [
                      "Ngày khởi hành",
                      getDepartureDate(order)
                        ? new Date(getDepartureDate(order)).toLocaleDateString("vi-VN")
                        : "Chưa có",
                    ],
                    ["Số người", `${order.numPeople || 0} người`],
                    ["Tổng tiền", formatMoney(order.totalPrice)],
                    ["Trạng thái", bookingStatus.label],
                    ["Thanh toán", paymentStatus.label],
                    ["Ghi chú", order.note || "Không có"],
                    [
                      "Ngày đặt",
                      order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "",
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-right font-medium text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setDetailId("")}
                  className="mt-6 w-full rounded-xl bg-[#f0f4f8] py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  Đóng
                </button>
              </div>
            );
          })()}
        </div>
      ) : null}

      {showReviewForm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowReviewForm(false)}
        >
          <div
            className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-xl font-semibold text-slate-900">Đánh giá dịch vụ</h3>
            <p className="mb-5 text-sm text-slate-500">{reviewForm.serviceName}</p>

            <div className="mb-5">
              <label className="mb-2 block text-sm text-slate-500">Số sao</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setReviewForm((prev) => ({
                        ...prev,
                        rating: star,
                      }))
                    }
                  >
                    <FaStar
                      size={28}
                      className={
                        star <= reviewForm.rating
                          ? "text-[#f59e0b] fill-[#f59e0b]"
                          : "text-slate-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <label className="mb-5 block">
              <span className="mb-2 block text-sm text-slate-500">Bình luận</span>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="flex-1 rounded-xl bg-[#f0f4f8] py-2.5 text-sm font-medium text-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitReview}
                disabled={submittingReview}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default UserDashboard;
