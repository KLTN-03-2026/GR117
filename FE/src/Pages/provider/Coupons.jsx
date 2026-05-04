import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import Breadcrumb from "../../Components/shared/Breadcrumb.jsx";

const emptyForm = {
  code: "",
  discountType: "percent",
  discountValue: "",
  minOrderValue: "",
  maxUsage: "1",
  startDate: "",
  endDate: "",
  serviceIds: "",
  status: "active",
};

const STATUS_CONFIG = {
  active: { label: "Hoạt động", cls: "bg-green-50 text-green-700" },
  inactive: { label: "Tắt", cls: "bg-gray-100 text-gray-500" },
};

const DISCOUNT_TYPE_LABEL = {
  percent: "Phần trăm",
  fixed: "Số tiền cố định",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—";

const formatDiscountValue = (coupon) => {
  const value = Number(coupon.discountValue || 0);
  if (coupon.discountType === "percent") return `${value}%`;
  return `${value.toLocaleString("vi-VN")}đ`;
};

function CouponFormModal({
  open,
  isEdit,
  form,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
  onReset,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {isEdit ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Thiết lập mã áp dụng cho dịch vụ của bạn.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-slate-500">Mã</span>
              <input
                value={form.code}
                onChange={(e) => onChange("code", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">Trạng thái</span>
              <select
                value={form.status}
                onChange={(e) => onChange("status", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tắt</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">Kiểu giảm</span>
              <select
                value={form.discountType}
                onChange={(e) => onChange("discountType", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
              >
                <option value="percent">Phần trăm</option>
                <option value="fixed">Số tiền cố định</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">Giá trị giảm</span>
              <input
                type="number"
                min="0"
                value={form.discountValue}
                onChange={(e) => onChange("discountValue", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">Đơn tối thiểu</span>
              <input
                type="number"
                min="0"
                value={form.minOrderValue}
                onChange={(e) => onChange("minOrderValue", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">Số lượt dùng</span>
              <input
                type="number"
                min="1"
                value={form.maxUsage}
                onChange={(e) => onChange("maxUsage", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">Ngày bắt đầu</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => onChange("startDate", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">Ngày hết hạn</span>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => onChange("endDate", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
              />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm text-slate-500">
              Áp dụng cho dịch vụ nào? Nhập ID, cách nhau bằng dấu phẩy
            </span>
            <textarea
              value={form.serviceIds}
              onChange={(e) => onChange("serviceIds", e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-600"
            >
              Làm mới
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mã"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Trang quan ly ma giam gia cua provider.
export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showModal, setShowModal] = useState(false);

  const getAuthHeaders = () => {
    const accessToken = localStorage.getItem("accessToken");
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : null;
  };

  // Lay danh sach coupon cua provider.
  const fetchCoupons = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setError("Không tìm thấy token đăng nhập.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/coupons/my-coupons", { headers });
      setCoupons(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (fetchError) {
      setError(
        fetchError?.response?.data?.message || "Không tải được mã giảm giá.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const openAddModal = () => {
    resetForm();
    setNotice("");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Cap nhat state form khi provider chon sua.
  const handleEdit = (coupon) => {
    setEditingId(coupon._id || coupon.id || "");
    setForm({
      code: coupon.code || "",
      discountType: coupon.discountType || "percent",
      discountValue: String(coupon.discountValue ?? ""),
      minOrderValue: String(coupon.minOrderValue ?? ""),
      maxUsage: String(coupon.maxUsage ?? 1),
      startDate: coupon.startDate ? String(coupon.startDate).slice(0, 10) : "",
      endDate: coupon.endDate ? String(coupon.endDate).slice(0, 10) : "",
      serviceIds: Array.isArray(coupon.serviceIds)
        ? coupon.serviceIds.map((item) => String(item)).join(", ")
        : "",
      status: coupon.status || "active",
    });
    setNotice("");
    setError("");
    setShowModal(true);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => ({
    ...form,
    discountValue: Number(form.discountValue || 0),
    minOrderValue: Number(form.minOrderValue || 0),
    maxUsage: Number(form.maxUsage || 1),
    serviceIds: String(form.serviceIds || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = getAuthHeaders();
    if (!headers) {
      setError("Không tìm thấy token đăng nhập.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setNotice("");

      const payload = buildPayload();

      if (editingId) {
        await axios.put(`/api/coupons/${editingId}`, payload, { headers });
        setNotice("Cập nhật mã giảm giá thành công.");
      } else {
        await axios.post("/api/coupons", payload, { headers });
        setNotice("Tạo mã giảm giá thành công.");
      }

      closeModal();
      await fetchCoupons();
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message || "Không lưu được mã giảm giá.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xoa coupon cua provider.
  const handleDelete = async (couponId) => {
    const headers = getAuthHeaders();
    if (!headers) {
      setError("Không tìm thấy token đăng nhập.");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xóa mã giảm giá này không?")) return;

    try {
      setError("");
      setNotice("");
      setIsSubmitting(true);

      await axios.delete(`/api/coupons/${couponId}`, { headers });

      setNotice("Đã xóa mã giảm giá.");
      await fetchCoupons();
    } catch (deleteError) {
      setError(
        deleteError?.response?.data?.message || "Không xóa được mã giảm giá.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const couponCountLabel = useMemo(
    () => `${coupons.length} mã`,
    [coupons.length],
  );

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
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
            Quản lý mã giảm giá
          </h1>
        </div>

        <button
          onClick={openAddModal}
          type="button"
          className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-[13px] font-medium text-[#f97316] transition hover:bg-orange-100"
        >
          <span className="inline-flex items-center gap-2">
            <FiPlus size={16} /> Thêm mã giảm giá
          </span>
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-700">
          {notice}
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold text-gray-900">
            Danh sách mã giảm giá
          </h2>
          <span className="text-[12px] text-gray-400">{couponCountLabel}</span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Đang tải mã giảm giá...
          </div>
        ) : coupons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center text-gray-500">
            Chưa có mã giảm giá nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-3 py-3 font-medium">Mã</th>
                  <th className="px-3 py-3 font-medium">Kiểu giảm</th>
                  <th className="px-3 py-3 font-medium">Giá trị</th>
                  <th className="px-3 py-3 font-medium">Đơn tối thiểu</th>
                  <th className="px-3 py-3 font-medium">Sử dụng</th>
                  <th className="px-3 py-3 font-medium">Hiệu lực</th>
                  <th className="px-3 py-3 font-medium">Trạng thái</th>
                  <th className="px-3 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {coupons.map((coupon) => {
                  const status =
                    STATUS_CONFIG[coupon.status] || STATUS_CONFIG.active;
                  return (
                    <tr
                      key={coupon._id}
                      className="border-b border-gray-100 transition-colors hover:bg-[#f8fafc]"
                    >
                      <td className="px-3 py-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            {coupon.code}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {Array.isArray(coupon.serviceIds) &&
                            coupon.serviceIds.length > 0
                              ? `${coupon.serviceIds.length} dịch vụ`
                              : "Áp dụng cho toàn bộ dịch vụ"}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {DISCOUNT_TYPE_LABEL[coupon.discountType] ||
                          coupon.discountType ||
                          "—"}
                      </td>
                      <td className="px-3 py-4 font-medium text-slate-">
                        {formatDiscountValue(coupon)}
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {Number(coupon.minOrderValue || 0).toLocaleString(
                          "vi-VN",
                        )}
                        đ
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {Number(coupon.usedCount || 0)}/
                        {Number(coupon.maxUsage || 0)}
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        <div className="whitespace-nowrap">
                          <p>{formatDate(coupon.startDate)}</p>
                          <p className="text-xs text-slate-400">
                            đến {formatDate(coupon.endDate)}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${status.cls}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(coupon)}
                            className="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50"
                            title="Sửa"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(coupon._id)}
                            className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                            title="Xóa"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CouponFormModal
        open={showModal}
        isEdit={!!editingId}
        form={form}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onChange={updateForm}
        onReset={resetForm}
      />
    </div>
  );
}
