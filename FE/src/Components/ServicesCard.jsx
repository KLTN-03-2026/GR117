import React from "react";
import { Link } from "react-router-dom";
import { CiStar } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { FaEyeSlash, FaEdit } from "react-icons/fa";

const ServicesCard = ({ service }) => {
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
          className={`absolute top-3 left-3 text-[14px] font-medium px-2.5 py-1 rounded-full ${
            service.status === "pending"
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
  );
};

export default ServicesCard;