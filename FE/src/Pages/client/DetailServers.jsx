import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";

import BookingBox from "../../Components/services/BookingBox";
import DetailContentServices from "../../Components/services/DetailContentServices";
import {
  FaArrowLeft,
  FaHeart,
  FaLocationDot,
  FaShareNodes,
  FaStar,
} from "react-icons/fa6";
import {
  FaRegCompass,
  FaClock,
  FaRegEye,
  MdFoodBank,
  MdOutlineDateRange,
} from "../../assets/Icons/Icons";

const normalizeHighlights = (raw) => {
  if (!Array.isArray(raw)) return [];
  if (raw.length === 1 && typeof raw[0] === "string" && raw[0].includes("1.")) {
    return raw[0]
      .split(/\d+\./)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return raw.map((item) => String(item || "").trim()).filter(Boolean);
};

const getCategoryLabel = (service) => {
  const raw = service?.category;
  if (Array.isArray(raw)) return raw[0] || "Du lịch";
  return raw || "Du lịch";
};

const countItineraryStats = (itinerary) => {
  const days = Array.isArray(itinerary) ? itinerary.length : 0;
  const allActivities = Array.isArray(itinerary)
    ? itinerary.flatMap((day) => day?.activities || [])
    : [];

  const sightseeingCount = allActivities.filter((act) =>
    ["sightseeing", "photo"].includes(String(act?.icon || "").toLowerCase()),
  ).length;

  const mealCount = Array.isArray(itinerary)
    ? itinerary.reduce((sum, day) => sum + (day?.meals?.length || 0), 0)
    : 0;

  const activityCount = allActivities.filter((act) =>
    ["activity", "transport", "hotel", "food"].includes(
      String(act?.icon || "").toLowerCase(),
    ),
  ).length;

  return { days, sightseeingCount, mealCount, activityCount };
};

const getServiceImages = (service) => {
  const images = Array.isArray(service?.images)
    ? service.images.filter(Boolean)
    : [];

  if (images.length > 0) return images;
  if (service?.imageUrl) return [service.imageUrl];
  if (service?.imageFile) {
    return [`http://localhost:5000/uploads/${service.imageFile}`];
  }
  return ["https://via.placeholder.com/1200x600?text=No+Image"];
};

function DetailServices() {
  const tabs = useMemo(
    () => [
      { name: "Tổng quan", index: 0 },
      { name: "Lịch trình", index: 1 },
      { name: "Lịch khởi hành", index: 2 },
      { name: "Đánh giá", index: 3 },
    ],
    [],
  );

  const [view, setView] = useState(0);
  const [viewPage, setViewPage] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  const { id } = useParams();
  const location = useLocation();
  const { props } = location.state || {};
  const [service, setService] = useState(props || null);

  const highlight = normalizeHighlights(service?.highlight);
  const includes = Array.isArray(service?.serviceIncludes)
    ? service.serviceIncludes.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const itinerary = Array.isArray(service?.itinerary) ? service.itinerary : [];
  const categoryLabel = getCategoryLabel(service);
  const stats = countItineraryStats(itinerary);
  const serviceImages = getServiceImages(service);

  useEffect(() => {
    if (service?._id) return;
    if (!id) return;

    const fetchServiceDetail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/services/detail/${id}`,
        );
        setService(res.data || null);
      } catch (err) {
        console.log(err);
      }
    };

    fetchServiceDetail();
  }, [id, service?._id]);

  useEffect(() => {
    if (!service?._id) return;

    const fetchSchedules = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/schedules/service/${service._id}`,
        );
        setSchedules(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchSchedules();
  }, [service?._id]);

  if (!service) {
    return <div>Không có dữ liệu</div>;
  }

  return (
    <div>
      <div className="relative h-72 overflow-hidden md:h-[440px]">
        <img
          src={serviceImages[activeImg] || serviceImages[0]}
          alt={service.serviceName || "service-image"}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-7xl p-6 md:p-10">
          <Link
            to="/services"
            className="mb-4 inline-flex items-center gap-1 text-white/70 transition-colors hover:text-white"
            style={{ fontSize: 14 }}
          >
            <FaArrowLeft size={14} />
            Quay lại
          </Link>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-sm"
                  style={{ fontSize: 12, fontWeight: 600 }}
                >
                  {categoryLabel}
                </span>
                {service.duration && (
                  <span
                    className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-sm"
                    style={{ fontSize: 12, fontWeight: 600 }}
                  >
                    <FaClock size={11} />
                    {service.duration}
                  </span>
                )}
              </div>

              <h1
                className="text-white"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(24px, 4vw, 38px)",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {service.serviceName}
              </h1>

              <div
                className="mt-3 flex flex-wrap items-center gap-4 text-white/80"
                style={{ fontSize: 14 }}
              >
                <span className="flex items-center gap-1">
                  <FaLocationDot size={14} />
                  {service.location}
                </span>
                <span className="flex items-center gap-1">
                  <FaStar size={14} className="text-[#f59e0b] fill-[#f59e0b]" />
                  {service.rating || 0} ({service.reviewCount || 0})
                </span>
                <span>
                  bởi{" "}
                  <span className="text-[#f97316]" style={{ fontWeight: 500 }}>
                    {service.nameProvider}
                  </span>
                </span>
              </div>
            </div>

            <div className="hidden shrink-0 gap-2 md:flex">
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40">
                <FaHeart size={16} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40">
                <FaShareNodes size={16} />
              </button>
            </div>
          </div>
        </div>

        {serviceImages.length > 1 && (
          <div className="absolute bottom-6 right-6 flex gap-2 md:right-10">
            {serviceImages.map((img, index) => (
              <button
                key={img || index}
                type="button"
                onClick={() => setActiveImg(index)}
                className={`h-10 w-14 overflow-hidden rounded-lg border-2 ${
                  activeImg === index ? "border-[#f97316]" : "border-white/30"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="flex gap-1 overflow-x-auto rounded-xl bg-[#f0f4f8] p-1">
              {tabs.map((item) => (
                <button
                  key={item.index}
                  type="button"
                  onClick={() => setView(item.index)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all ${
                    view === item.index
                      ? "bg-white shadow-sm text-[#f97316]"
                      : "text-gray-500 hover:text-[#1a1a2e]"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <DetailContentServices
              view={view}
              description={service.description}
              highlight={highlight}
              includes={includes}
              itinerary={itinerary}
              schedules={schedules}
              selectedSchedule={selectedSchedule}
              setSelectedSchedule={setSelectedSchedule}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <BookingBox
                props={service}
                schedules={schedules}
                viewPage={viewPage}
                setViewPage={setViewPage}
                setView={setView}
                selectedSchedule={selectedSchedule}
                setSelectedSchedule={setSelectedSchedule}
              />

              <div className="hidden overflow-hidden rounded-2xl border lg:block">
                <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d2b55] p-5">
                  <p className="text-xs text-white/60">TOUR OVERVIEW</p>
                  <p className="text-sm font-semibold text-white">Tổng quan hành trình</p>
                </div>

                <div className="bg-white p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-orange-50 p-3 text-center">
                      <MdOutlineDateRange className="mx-auto mb-1 text-lg text-orange-500" />
                      <p className="text-xs text-gray-500">Ngày</p>
                      <p className="text-lg font-bold">{stats.days || "-"}</p>
                    </div>

                    <div className="rounded-xl bg-purple-50 p-3 text-center">
                      <FaRegEye className="mx-auto mb-1 text-lg text-purple-600" />
                      <p className="text-xs text-gray-500">Tham quan</p>
                      <p className="text-lg font-bold">
                        {stats.sightseeingCount || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-yellow-50 p-3 text-center">
                      <MdFoodBank className="mx-auto mb-1 text-lg text-yellow-600" />
                      <p className="text-xs text-gray-500">Bữa ăn</p>
                      <p className="text-lg font-bold">{stats.mealCount || "-"}</p>
                    </div>

                    <div className="rounded-xl bg-cyan-50 p-3 text-center">
                      <FaRegCompass className="mx-auto mb-1 text-lg text-cyan-600" />
                      <p className="text-xs text-gray-500">Hoạt động</p>
                      <p className="text-lg font-bold">
                        {stats.activityCount || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full rounded-xl bg-gray-100 py-2 text-sm text-gray-700 hover:bg-gray-200 transition">
                Liên hệ tư vấn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailServices;

