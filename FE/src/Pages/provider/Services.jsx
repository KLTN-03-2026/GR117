import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import ServicesCard from "../../Components/ServicesCard";

const STATUS_META = {
  all: "Tất cả",
  approval: "Hoạt động",
  pending: "Chờ duyệt",
  reject: "Bị từ chối",
};

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("T?t c?");
  const [status, setStatus] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/services/all");
        const result = await res.json();

        if (res.ok && result.success) {
          setServices(Array.isArray(result.data) ? result.data : []);
        } else {
          setError(result.message || "Khong the tai dich vu");
        }
      } catch (err) {
        setError("Loi ket noi toi server");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const normalizedServices = useMemo(() => {
    return services.map((service) => {
      const rawStatus = String(service.status || "pending").toLowerCase();

      return {
        ...service,
        uiName: service.serviceName || service.servicesName || service.ServiceName || "",
        uiLocation: service.location || service.destination || service.region || "",
        uiCategory: Array.isArray(service.category)
          ? service.category[0] || "Khac"
          : (service.category || "Khac"),
        uiStatus:
          rawStatus === "active"
            ? "approval"
            : rawStatus === "rejected"
              ? "reject"
              : ["approval", "pending", "reject"].includes(rawStatus)
                ? rawStatus
                : "pending",
      };
    });
  }, [services]);

  const counts = useMemo(
    () =>
      normalizedServices.reduce(
        (acc, item) => {
          acc.all += 1;
          if (acc[item.uiStatus] !== undefined) acc[item.uiStatus] += 1;
          return acc;
        },
        {
          all: 0,
          approval: 0,
          pending: 0,
          reject: 0,
        },
      ),
    [normalizedServices],
  );

  const filteredServices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return normalizedServices.filter((item) => {
      const matchSearch =
        !keyword ||
        item.uiName.toLowerCase().includes(keyword) ||
        item.uiLocation.toLowerCase().includes(keyword);

      return (
        matchSearch &&
        (category === "T?t c?" || item.uiCategory === category) &&
        (status === "all" || item.uiStatus === status)
      );
    });
  }, [normalizedServices, search, category, status]);

  const handleEdit = (service) => {
    navigate(`/provider/EditServices/${service._id}`);
  };

  const handleDelete = async (service) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa dịch vụ  \"${service.uiName || service.serviceName || ""}\" không?`);
    if (!confirmed) {
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("Bạn chưa đăng nhập hoặc token đã hết hạn");
      return;
    }

    try {
      setActionLoadingId(service._id);
      setError("");

      const res = await fetch(`http://localhost:5000/api/services/deleteOne/${service._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await res.json();

      if (!res.ok || result.success === false) {
        setError(result.message || "Không thể xóa dịch vụ");
        return;
      }

      setServices((prev) => prev.filter((item) => item._id !== service._id));
    } catch (deleteError) {
      setError(`lỗi xóa dịch vụ : ${deleteError.message}`);
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) return <p className="p-6">Đang tải dịch vụ ...</p>;
  if (error && services.length === 0) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <div className="mb-0.5 flex items-center gap-2 text-[12px] text-gray-400">
              <span>Dashboard</span>
              <span>{">"}</span>
              <span className="text-[#f97316]">Dịch vụ</span>
            </div>

            <h1
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "20px",
                fontWeight: "700",
                color: "rgb(26, 26, 46)",
              }}
            >
              Quản lí dịch vụ 
            </h1>
          </div>
        </div>

        <Link
          to="/provider/AddServices"
          className="rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] px-4 py-2 text-[13px] font-medium text-white transition hover:shadow-lg hover:shadow-orange-200"
        >
          +  Thêm dịch vụ 
        </Link>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên , địa điểm"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-[15px] outline-none transition placeholder:text-slate-300 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        {actionLoadingId && <p className="text-sm text-slate-500">Đăng xử lí dịch vụ ...</p>}

        <div className="flex flex-wrap gap-3">
          {Object.entries(STATUS_META).map(([key, label]) => {
            const count = counts[key] ?? counts.all;
            const active = status === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                className={`rounded-2xl border px-5 py-3 text-sm font-medium transition ${
                  active
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-orange-200 hover:text-orange-500"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <ServicesCard
                key={service._id}
                service={service}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-400">
            Không có dịch vụ phù hợp.
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
