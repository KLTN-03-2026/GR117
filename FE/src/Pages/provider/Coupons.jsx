import { useEffect, useState } from "react";
import axios from "axios";

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

// Trang quan ly ma giam gia cua provider.
export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Lay danh sach coupon cua provider.
  const fetchCoupons = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/coupons/my-coupons", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setCoupons(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Khong tai duoc ma giam gia.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

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
  };

  // Xoa form ve trang thai ban dau.
  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  // Tao moi hoac cap nhat coupon.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("accessToken");

    const payload = {
      ...form,
      discountValue: Number(form.discountValue || 0),
      minOrderValue: Number(form.minOrderValue || 0),
      maxUsage: Number(form.maxUsage || 1),
      serviceIds: String(form.serviceIds || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      setLoading(true);
      setError("");
      setNotice("");

      if (editingId) {
        await axios.put(`/api/coupons/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setNotice("Cap nhat ma giam gia thanh cong.");
      } else {
        await axios.post("/api/coupons", payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setNotice("Tao ma giam gia thanh cong.");
      }

      resetForm();
      await fetchCoupons();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Khong luu duoc ma giam gia.");
    } finally {
      setLoading(false);
    }
  };

  // Xoa coupon cua provider.
  const handleDelete = async (couponId) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!window.confirm("Ban co chac muon xoa ma giam gia nay khong?")) return;

    try {
      setError("");
      setNotice("");

      await axios.delete(`/api/coupons/${couponId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setNotice("Da xoa ma giam gia.");
      await fetchCoupons();
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || "Khong xoa duoc ma giam gia.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm text-gray-400">Provider / Mã giảm giá</p>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Quản lý mã giảm giá</h1>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[28px] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingId ? "Cập nhật mã" : "Tạo mã mới"}
              </h2>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600"
                >
                  Hủy sửa
                </button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-500">Mã</span>
                <input
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-500">Trạng thái</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
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
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, discountType: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, discountValue: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-500">Đơn tối thiểu</span>
                <input
                  type="number"
                  min="0"
                  value={form.minOrderValue}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, minOrderValue: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-500">Số lượt dùng</span>
                <input
                  type="number"
                  min="1"
                  value={form.maxUsage}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maxUsage: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-500">Ngày bắt đầu</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-500">Ngày hết hạn</span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">
                Áp dụng cho dịch vụ nào? nhập ID, cách nhau bằng dấu phẩy
              </span>
              <textarea
                value={form.serviceIds}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, serviceIds: e.target.value }))
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f97316]"
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-600"
              >
                Làm mới
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo mã"}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Danh sách mã</h2>

            {coupons.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
                Chưa có mã giảm giá nào.
              </div>
            ) : (
              coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="rounded-[28px] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                        {coupon.status}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        {coupon.code}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(coupon)}
                        className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(coupon._id)}
                        className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p>Kiểu giảm: {coupon.discountType}</p>
                    <p>Giá trị: {coupon.discountValue}</p>
                    <p>Tối thiểu: {coupon.minOrderValue}</p>
                    <p>Số lượt: {coupon.usedCount}/{coupon.maxUsage}</p>
                    <p>Hiệu lực: {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString("vi-VN") : "—"}</p>
                    <p>Hết hạn: {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString("vi-VN") : "—"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
