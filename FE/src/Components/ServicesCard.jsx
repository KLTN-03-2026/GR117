import React from "react";
import { CiStar } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

const getName = (service) =>
  service.uiName ||
  service.serviceName ||
  service.servicesName ||
  service.ServiceName ||
  "Chua co ten";
const getLocation = (service) =>
  service.uiLocation ||
  service.destination ||
  service.location ||
  service.region ||
  "Chua cap nhat";
const getPrice = (service) =>
  Number(service.uiPrice ?? service.prices ?? service.price ?? 0);
const getRating = (service) =>
  Number(service.rating ?? service.averageRating ?? 0);
const getReviewCount = (service) =>
  Number(service.total_review ?? service.totalReviews ?? 0);
const getStatus = (service) => service.uiStatus || service.status || "pending";

const statusClass = {
  approval: "bg-green-100 text-green-600",
  pending: "bg-yellow-100 text-amber-600",
  reject: "bg-red-100 text-red-500",
};

const statusLabel = {
  approval: "Hoat dong",
  pending: "Cho duyet",
  reject: "Tu choi",
};

const ServicesCard = ({ service, viewMode = "grid", onEdit, onDelete }) => {
  const serviceName = getName(service);
  const destination = getLocation(service);
  const price = getPrice(service);
  const rating = getRating(service);
  const totalReview = getReviewCount(service);
  const status = getStatus(service);
  const image =
    service.imageUrl ||
    (service.imageFile
      ? `http://localhost:5000/uploads/${service.imageFile}`
      : "https://via.placeholder.com/400x250?text=No+Image");

  const handleEdit = () => onEdit?.(service);
  const handleDelete = () => onDelete?.(service);

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

  if (viewMode === "list") {
    return (
      <div className="flex overflow-hidden rounded-[28px] bg-white shadow transition hover:shadow-lg">
        <img src={image} alt={serviceName} className="h-44 w-52 object-cover" />

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
              <span className="flex items-center gap-1">
                <CiStar className="text-base text-yellow-400" />
                {rating} ({totalReview})
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xl font-bold text-orange-500">
              {price > 0 ? `${price.toLocaleString("vi-VN")}d` : "Lien he"}
            </p>
            <div className="mt-3 flex justify-end gap-2 text-gray-500">{actionButtons}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[30px] bg-white shadow transition hover:shadow-lg">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={serviceName}
          className="h-60 w-full object-cover transition duration-300 hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[13px] font-medium ${statusClass[status] || statusClass.pending}`}
        >
          {statusLabel[status] || status}
        </span>
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-white/80 px-2 py-1">
          <CiStar className="text-2xl text-yellow-400" />
          <span className="text-sm font-semibold text-gray-700">
            {rating} ({totalReview})
          </span>
        </span>
      </div>

      <div className="space-y-2 p-4">
        <h2 className="line-clamp-1 text-left text-[15px] font-semibold text-gray-800">
          {serviceName}
        </h2>

        <div className="flex items-center gap-1 text-[13px] text-gray-400">
          <IoLocationOutline />
          <p className="line-clamp-1 text-left text-sm text-gray-500">{destination}</p>
        </div>

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
