import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoChevronDown, IoSearch } from "react-icons/io5";
import ServicesCard from "../../Components/ServicesCard";

const STATUS_META = {
  all: "Tất cả",
  approval: "Hoạt động",
  pending: "Chờ duyệt",
  hidden: "Đã ẩn",
  reject: "Bị từ chối",
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/services/all");
        const result = await res.json();

        if (res.ok && result.success) {
          setServices(Array.isArray(result.data) ? result.data : []);
        } else {
          setError(result.message || "Không thể tải dịch vụ");
        }
      } catch (err) {
        setError("Lỗi kết nối tới server");
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
        uiName: service.servicesName || service.ServiceName || "",
        uiLocation:
          service.destination || service.location || service.region || "",
        uiCategory: service.category || "Khác",
        uiStatus:
          rawStatus === "active"
            ? "approval"
            : rawStatus === "rejected"
              ? "reject"
              : rawStatus === "inactive"
                ? "hidden"
                : ["approval", "pending", "hidden", "reject"].includes(
                      rawStatus,
                    )
                  ? rawStatus
                  : "pending",
      };
    });
  }, [services]);

  const categories = useMemo(
    () => [
      "Tất cả",
      ...new Set(normalizedServices.map((item) => item.uiCategory)),
    ],
    [normalizedServices],
  );

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
          hidden: 0,
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
        (category === "Tất cả" || item.uiCategory === category) &&
        (status === "all" || item.uiStatus === status)
      );
    });
  }, [normalizedServices, search, category, status]);

  if (loading) return <p className="p-6">Đang tải dịch vụ...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

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
              Quản lý dịch vụ
            </h1>
          </div>
        </div>

        <Link
          to="/provider/AddServices"
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-orange-600"
        >
          + Thêm dịch vụ
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
              placeholder="Tìm kiếm theo tên, địa điểm..."
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-[15px] outline-none transition placeholder:text-slate-300 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-14 min-w-[140px] appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-[15px] text-slate-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <IoChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div> */}
        </div>

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
              <ServicesCard key={service._id} service={service} />
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

