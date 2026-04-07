import React from "react";
import { Link } from "react-router-dom";
import { CiStar, CiClock2 } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { FaEyeSlash, FaEdit, FaHeart, FaFire, FaStar } from "react-icons/fa";
import { jwt } from "../utils/jwt";

const ServicesCard = ({ service }) => {
  const user = jwt();

  console.log(user?.role);

  if (user.role === "user") {
    return (
      <div>
        <Link
          to={`/services/${service._id}`}
          className="block bg-white rounded-2xl border border-gray-100 shadow-sm
        hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
        >
          <div className="relative h-52 overflow-hidden">
            <img
              src={service.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* ❤️ Heart */}
            <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition z-10">
              <FaHeart className="text-gray-500" />
            </button>

            {/* Category */}
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white bg-sky-500">
              {service.category}
            </span>

            {/* Duration */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px]">
              <CiClock2 />
              {service?.duration || "Chưa có"}
            </div>

            {/* Hot */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#f97316] text-white px-2.5 py-1 rounded-full text-[11px] font-semibold">
              <FaFire />
              Hot
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-[#f97316] transition">
              {service?.ServiceName}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1 text-gray-400 text-[12px] mb-2">
              <IoLocationOutline />
              {service?.location}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-yellow-500 text-sm">
              <FaStar />
              {service?.rating || 0}
              <span className="text-gray-400">
                ({service?.total_review || 0})
              </span>
            </div>

            <div className="border-t border-gray-50 my-3" />

            {/* Price */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-400">Từ</div>
                <div className="text-[18px] font-bold text-[#f97316]">
                  {service?.prices
                    ? `${Number(service.prices).toLocaleString("vi-VN")}đ`
                    : "Liên hệ"}
                </div>
                <div className="text-[10px] text-gray-400">/ người</div>
              </div>

              {/* Button */}
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white text-[12px] font-semibold group-hover:shadow-lg group-hover:shadow-orange-200 transition-all">
                Đặt ngay
              </div>
            </div>
          </div>
        </Link>
      </div>
    )
  }
  if (user.role === "provider") {
    return (
      <Link
        to={`/provider/DetailServices/${service._id}`}
        className="bg-white rounded-[30px] shadow hover:shadow-lg  h-[400px] transition overflow-hidden block"
      >
        {/* Hình ảnh */}
        <div className="relative overflow-hidden ">
          <img
            src={
              service.imageUrl ||
              (service.imageFile
                ? `http://localhost:5000/uploads/${service.imageFile}`
                : "https://via.placeholder.com/400x250?text=No+Image")
            }
            alt={service.servicesName}
            className="w-full h-60 object-cover transform transition duration-300 hover:scale-105"
          />
          <span
            className={`absolute top-3 left-3 text-[14px] font-medium px-2.5 py-1 rounded-full ${service.status === "pending"
              ? "bg-yellow-100 text-amber-600"
              : "bg-green-100 text-green-600"
              }`}
          >
            {service.status}
          </span>
          <span className="flex items-center gap-1 absolute top-2 right-2 bg-white/80 px-2 py-1 rounded">
            <CiStar className="text-2xl text-yellow-400 drop-shadow-sm" />
            <span className="text-sm font-semibold text-gray-700">
              {service.rating} ({service.total_review})
            </span>
          </span>
        </div>

        {/* Nội dung */}
        <div className="p-4 space-y-2">
          <h2 className="text-[14px] text-left font-semibold text-gray-800 line-clamp-1 mb-1">
            {service.servicesName}
          </h2>
          <div className="flex items-center gap-1 text-gray-400 text-[12px] mb-3">
            <IoLocationOutline />
            <p className="text-sm text-left text-gray-500 pb-1 pt-1">
              {service.destination}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[15px] font-bold text-[#f97316]">
              {service.prices && service.prices > 0
                ? `${Number(service.prices).toLocaleString("vi-VN")}đ`
                : "Liên hệ"}
            </span>
            <div className="flex gap-3 m-2 text-gray-600 rounded-2xl">
              <FaEdit className="cursor-pointer text-xl hover:text-blue-500" />
              <FaEyeSlash className="cursor-pointer text-xl hover:text-gray-800" />
              <MdDelete className="cursor-pointer text-xl hover:text-red-500" />
            </div>
          </div>
        </div>
      </Link>
    )
  }

};

export default ServicesCard;