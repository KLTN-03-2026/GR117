import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import ButtonBack from "../../Components/ButtonBack";

const ServicesDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/services/detail/${id}`,
        );
        const result = await res.json();
        setService(result);
      } catch (err) {
        console.error(":", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <p className="p-6">Đang tải chi tiết...</p>;
  if (!service)
    return <p className="p-6 text-red-600">không tìm thấy dịch vụ</p>;

  return (
    <div className="min-h-screen bg-[#fdfaf6] p-8">
      <div className="w-full max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-12 border border-orange-100">
        {/* button back */}
        <div className="flex justify-between mb-5 ">
          <h1 className="text-3xl text-center font-bold text-orange-600 ">
            {" "}
            Chi tiết dịch vụ 
          </h1>
          <ButtonBack />
        </div>

        <form className="space-y-6">
          {/* Supplier */}
          <div>
            <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
              Nhà cung cấp 
            </label>
            <input
              type="text"
              value={service.nameProvider || service.supplier || ""}
              readOnly
              className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
            />
          </div>

         
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
                Tên dịch vụ
              </label>
              <input
                type="text"
                value={service.serviceName || service.servicesName || ""}
                readOnly
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
                Giá
              </label>
              <input
                type="text"
                value={`${service.prices} VNĐ`}
                readOnly
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
              />
            </div>
          </div>

         
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
                Địa điểm 
              </label>
              <input
                type="text"
                value={
                  service.location ||
                  service.destination ||
                  service.region ||
                  ""
                }
                readOnly
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
                Danh mục
              </label>
              <input
                type="text"
                value={
                  Array.isArray(service.category)
                    ? service.category.join(", ")
                    : service.category || ""
                }
                readOnly
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
              />
            </div>
          </div>

      
          <div>
            <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
             Mô tả
            </label>
            <textarea
              value={service.description || service.descriptionDetail || ""}
              readOnly
              rows="4"
              className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
            />
          </div>

          
          <div>
            <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
              Hình ảnh 
            </label>
            <img
              src={
                service.imageUrl ||
                (service.imageFile
                  ? `http://localhost:5000/uploads/${service.imageFile}`
                  : "https://via.placeholder.com/400x250?text=No+Image")
              }
              alt={
                service.serviceName || service.servicesName || "service-image"
              }
              className="w-full max-w-md h-64 object-cover rounded border-2 border-orange-200 mx-auto"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServicesDetail;
