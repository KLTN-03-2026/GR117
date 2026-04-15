import React from "react";
import { IoLocationOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { FaHeart, FaChevronRight, FaStar, FaFire } from "react-icons/fa6";
import { RiCalendarScheduleLine } from "react-icons/ri";

const getName = (service) =>
  service.uiName ||
  service.serviceName ||
  service.servicesName ||
  service.ServiceName ||
  "Chờ cập nhật";
const getLocation = (service) =>
  service.uiLocation ||
  service.destination ||
  service.location ||
  service.region ||
  "Chờ cập nhật";
const getPrice = (service) =>
  Number(service.uiPrice ?? service.prices ?? service.price ?? 0);
const getStatus = (service) => service.uiStatus || service.status || "pending";
const getDuration = (service) => {
  const value = service.duration || service.tourDuration || "";
  const normalized = String(value).trim();

  return !normalized || normalized.toLowerCase() === "nan"
    ? "Chờ cập nhật"
    : normalized;
};
const getDescription = (service) =>
  service.description || service.descriptionDetail || "Chưa có mô tả";
const getCategory = (service) =>
  Array.isArray(service.category)
    ? service.category[0] || "Du lịch"
    : service.category || "Du lịch";
const getRating = (service) => {
  const value = Number(service.rating ?? 4.9);
  return Number.isFinite(value) ? value : 4.9;
};
const getReviewCount = (service) => {
  const value = Number(service.reviewCount ?? 0);
  return Number.isFinite(value) ? value : 0;
};
const FALLBACK_IMAGE = "https://via.placeholder.com/400x250?text=No+Image";

const statusClass = {
  approval: "bg-green-100 text-green-600",
  pending: "bg-yellow-100 text-amber-600",
  reject: "bg-red-100 text-red-500",
};

const statusLabel = {
  approval: "Hoạt động",
  pending: "Chờ duyệt",
  reject: "Từ chối",
};

const ServicesCard = ({
  service,
  viewMode = "grid",
  variant = "provider",
  onEdit,
  onDelete,
}) => {
  const serviceName = getName(service);
  const destination = getLocation(service);
  const price = getPrice(service);
  const status = getStatus(service);
  const duration = getDuration(service);
  const description = getDescription(service);
  const category = getCategory(service);
  const rating = getRating(service);
  const reviewCount = getReviewCount(service);
  const image =
    service.imageUrl ||
    (service.imageFile
      ? `http://localhost:5000/uploads/${service.imageFile}`
      : FALLBACK_IMAGE);
  const handleEdit = (e) => {
    e.preventDefault();
    onEdit?.(service);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    onDelete?.(service);
  };

  const actionButtons = (
    <div className="flex gap-3 text-gray-600">
      <button type="button" onClick={handleEdit}>
        <FaEdit className="cursor-pointer text-lg hover:text-blue-500" />
      </button>
      <button type="button" onClick={handleDelete}>
        <MdDelete className="cursor-pointer text-lg hover:text-red-500" />
      </button>
    </div>
  );

  if (variant === "destination") {
    return (
      <div className="group mx-auto w-full max-w-[218px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-52 overflow-hidden">
            <img
              src={image}
              alt={serviceName}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            <button
              type="button"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-500 backdrop-blur-sm transition hover:bg-white hover:text-rose-500"
            >
              <FaHeart className="text-[15px]" />
            </button>

            <span className="absolute left-3 top-3 rounded-full bg-sky-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                {category}
            </span>

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
                <RiCalendarScheduleLine className="text-[10px]" />
                {duration}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-[#f97316] px-2.5 py-1 text-[11px] font-semibold text-white">
                <FaFire className="text-xs" />
                Hot
              </span>
            </div>
        </div>

        <div className="p-4">
          <h2 className="mb-1 line-clamp-1 text-left text-[15px] font-semibold text-gray-900 transition group-hover:text-[#f97316]">
            {serviceName}
          </h2>

          <div className="mb-2 flex items-center gap-1 text-[12px] text-gray-400">
            <IoLocationOutline className="text-[11px]" />
            <p className="line-clamp-1 text-left text-[12px] text-gray-500">
              {destination}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <FaStar key={index} className="text-[12px] text-[#f59e0b]" />
            ))}
            <span className="ml-1 text-[12px] text-gray-500">
              {rating.toFixed(1)}{" "}
              {reviewCount > 0 ? <span className="text-gray-400">({reviewCount})</span> : null}
            </span>
          </div>

          <div className="my-3 border-t border-gray-50" />

          <div className="flex items-center justify-between">
              <div>
                <p className="mb-0.5 text-[10px] text-gray-400">
                  Từ
                </p>
                <p className="text-[18px] font-bold text-[#f97316]">
                  {price > 0 ? `${price.toLocaleString("vi-VN")}d` : "Lien he"}
                </p>
                <p className="text-[10px] text-gray-400">/ người</p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] px-4 py-2 text-[12px] font-semibold text-white transition-all group-hover:shadow-lg group-hover:shadow-orange-200"
              >
                Đặt ngay
                <FaChevronRight className="text-[13px]" />
              </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "customer") {
    return (
      <div className="overflow-hidden rounded-[30px] bg-white shadow transition hover:-translate-y-1 hover:shadow-lg">
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={serviceName}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="h-60 w-full object-cover transition duration-300 hover:scale-105"
          />
        </div>

        <div className="space-y-2 p-4">
          <h2 className="line-clamp-1 text-left text-[16px] font-semibold text-gray-800">
            {serviceName}
          </h2>

          <div className="flex items-center gap-1 text-[13px] text-gray-400">
            <IoLocationOutline />
            <p className="line-clamp-1 text-left text-sm text-gray-500">
              {destination}
            </p>
          </div>

          <p className="line-clamp-2 text-left text-sm leading-6 text-slate-500">
            {description}
          </p>

          <div className="pt-1">
            <span className="text-[16px] font-bold text-[#f97316]">
              {price > 0 ? `${price.toLocaleString("vi-VN")}d / nguoi` : "Lien he"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex overflow-hidden rounded-[28px] bg-white shadow transition hover:shadow-lg">
        <img
          src={image}
          alt={serviceName}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-44 w-52 object-cover"
        />

        <div className="flex flex-1 items-center justify-between gap-4 p-5">
          <div className="min-w-0 flex-1">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass[status] || statusClass.pending}`}
            >
              {statusLabel[status] || status}
            </span>
            <h3 className="mt-3 line-clamp-1 text-lg font-semibold text-slate-800">
              {serviceName}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <IoLocationOutline />
                {destination}
              </span>
              <span>{service.category || "Khac"}</span>
              <span>{duration}</span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xl font-bold text-orange-500">
              {price > 0 ? `${price.toLocaleString("vi-VN")}d` : "Lien he"}
            </p>
            <div className="mt-3 flex justify-end gap-2 text-gray-500">
              {actionButtons}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[30px] bg-white shadow transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={serviceName}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-60 w-full object-cover transition duration-300 hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[13px] font-medium ${statusClass[status] || statusClass.pending}`}
        >
          {statusLabel[status] || status}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <h2 className="line-clamp-1 text-left text-[15px] font-semibold text-gray-800">
          {serviceName}
        </h2>
        <div className="flex items-center gap-1 text-[13px] text-gray-400">
          <IoLocationOutline />
          <p className="line-clamp-1 text-left text-sm text-gray-500">
            {destination}
          </p>
        </div>
        <p className="line-clamp-1 text-left text-[13px] text-slate-400">
          {duration}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[16px] font-bold text-[#f97316]">
            {price > 0 ? `${price.toLocaleString("vi-VN")}d` : "Lien he"}
          </span>
          {actionButtons}
        </div>
      </div>
    </div>
  );
};

export default ServicesCard;
