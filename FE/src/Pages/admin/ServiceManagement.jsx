import React, { useEffect, useState } from "react";
import { IoSearch, IoTrashOutline } from "react-icons/io5";
import axios from "axios";
import { TiTickOutline } from "react-icons/ti";
import { AiOutlineCloseCircle } from "react-icons/ai";

const ServiceManagement = () => {
  const [serviceSearch, setServiceSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setError("");
        const accessToken = localStorage.getItem("accessToken");
        const result = await axios.get("/api/admin/getAllService", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setServices(result.data.data || []);
      } catch (err) {
        console.log(err);
        setError(err?.response?.data?.message || "Không thể tải dịch vụ");
      }
    };

    fetchServices();
  }, []);

  const statusLabel = (rawStatus) => {
    const status = String(rawStatus || "").toLowerCase();
    if (status === "active") {
      return { text: "Đang hiển thị", cls: "bg-emerald-50 text-emerald-600" };
    }
    if (status === "pending") {
      return { text: "Chờ duyệt", cls: "bg-orange-50 text-[#f97316]" };
    }
    if (status === "rejected") {
      return { text: "Bị từ chối", cls: "bg-red-50 text-red-600" };
    }
    return { text: rawStatus || "--", cls: "bg-slate-100 text-slate-600" };
  };

  const filtered = services
    .filter((item) => {
      const keyword = serviceSearch.trim().toLowerCase();
      if (!keyword) return true;

      const name = String(item.serviceName || "").toLowerCase();
      const provider = String(item.providerName || item.nameProvider || "").toLowerCase();
      return name.includes(keyword) || provider.includes(keyword);
    })
    .filter((item) => {
      if (statusFilter === "all") return true;
      return String(item.status || "").toLowerCase() === statusFilter;
    });

  const callAction = async (id, action) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("Bạn chưa đăng nhập hoặc token đã hết hạn");
      return;
    }

    try {
      setActionLoadingId(id);
      setError("");

      if (action === "approve") {
        const result = await axios.patch(
          `/api/admin/changeServiceStatus/${id}`,
          { status: "active" },
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        const nextStatus = result.data?.data?.status || "active";
        setServices((prev) => prev.map((s) => (s._id === id ? { ...s, status: nextStatus } : s)));
        return;
      }

      if (action === "reject") {
        const serviceName = services.find((s) => s._id === id)?.serviceName || "";
        const confirmed = window.confirm(`Bạn có chắc muốn từ chối dịch vụ "${serviceName}" không?`);
        if (!confirmed) return;

        const result = await axios.patch(
          `/api/admin/changeServiceStatus/${id}`,
          { status: "rejected" },
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        const nextStatus = result.data?.data?.status || "rejected";

        if (nextStatus === "rejected") {
          setServices((prev) => prev.filter((s) => s._id !== id));
        } else {
          setServices((prev) => prev.map((s) => (s._id === id ? { ...s, status: nextStatus } : s)));
        }
        return;
      }

      if (action === "delete") {
        const serviceName = services.find((s) => s._id === id)?.serviceName || "";
        const confirmed = window.confirm(`Bạn có chắc muốn xóa dịch vụ "${serviceName}" không?`);
        if (!confirmed) return;

        await axios.delete(`/api/admin/deleteService/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setServices((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Xử lý thất bại");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-left text-xl font-semibold text-slate-900">Quản lí dịch vụ</h2>
        <p className="mt-1 text-sm text-slate-400">Tìm kiếm, lọc và xử lý trạng thái dịch vụ</p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={serviceSearch}
            onChange={(e) => setServiceSearch(e.target.value)}
            placeholder="Tìm theo tên, nhà cung cấp..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 pl-11"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="active">Đang hiển thị</option>
          <option value="rejected">Bị từ chối</option>
        </select>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {actionLoadingId && <p className="text-sm text-slate-400">Đang xử lý...</p>}

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">STT</th>
              <th className="px-4 py-3 text-left font-medium">Tên dịch vụ</th>
              <th className="px-4 py-3 text-left font-medium">Tên nhà cung cấp</th>
              <th className="px-4 py-3 text-left font-medium">Giá</th>
              <th className="px-4 py-3 text-left font-medium">Đánh giá</th>
              <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item, index) => {
                const st = statusLabel(item.status);

                return (
                  <tr key={item._id}>
                    <td className="text-left px-4 py-3">{index + 1}</td>
                    <td className="text-left px-4 py-3">{item.serviceName}</td>
                    <td className="text-left px-4 py-3">{item.providerName || item.nameProvider}</td>
                    <td className="text-left px-4 py-3">{Number(item.price ?? item.prices ?? 0).toLocaleString("vi-VN")} VNĐ</td>
                    <td className="text-left px-4 py-3">--</td>
                    <td className="text-left px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
                        {st.text}
                      </span>
                    </td>
                    <td className="text-left px-4 py-3 flex gap-2">
                      {item.status !== "active" && (
                        <button
                          type="button"
                          onClick={() => callAction(item._id, "approve")}
                          className="text-green-600 hover:text-green-700"
                          title="Duyệt"
                        >
                          <TiTickOutline className="text-xl" />
                        </button>
                      )}

                      {item.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => callAction(item._id, "reject")}
                          className="text-red-600 hover:text-red-700"
                          title="Từ chối"
                        >
                          <AiOutlineCloseCircle className="text-xl" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => callAction(item._id, "delete")}
                        className="text-slate-500 hover:text-red-600"
                        title="Xóa"
                      >
                        <IoTrashOutline className="text-xl" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-16 text-center text-slate-400">
                  Chưa có dữ liệu dịch vụ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceManagement;
