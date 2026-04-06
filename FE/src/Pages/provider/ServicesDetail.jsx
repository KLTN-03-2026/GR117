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
        const res = await fetch(`http://localhost:5000/api/services/detail/${id}`);
        const result = await res.json();
        setService(result);
      } catch (err) {
        console.error("Lá»—i fetch chi tiáº¿t:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <p className="p-6">Äang táº£i chi tiáº¿t...</p>;
  if (!service) return <p className="p-6 text-red-600">KhĂ´ng tĂ¬m tháº¥y dá»‹ch vá»¥</p>;

  return (
    <div className="min-h-screen bg-[#fdfaf6] p-8">
      <div className="w-full max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-12 border border-orange-100">

        {/* button back */}
        <div className="flex justify-between mb-5 ">

        <h1 className="text-3xl text-center font-bold text-orange-600 "> Chi tiáº¿t dá»‹ch vá»¥</h1>
           <ButtonBack/>
          
        </div>

        <form className="space-y-6">
          {/* Supplier */}
          <div>
            <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
              NhĂ  cung cáº¥p
            </label>
            <input
              type="text"
              value={service.supplier}
              readOnly
              className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
            />
          </div>

          {/* TĂªn dá»‹ch vá»¥ + GiĂ¡ */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
                TĂªn dá»‹ch vá»¥
              </label>
              <input
                type="text"
                value={service.servicesName}
                readOnly
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
                GiĂ¡
              </label>
              <input
                type="text"
                value={`${service.prices}Ä‘`}
                readOnly
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          {/* Äá»‹a Ä‘iá»ƒm + Danh má»¥c */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
                Äá»‹a Ä‘iá»ƒm
              </label>
              <input
                type="text"
                value={service.destination}
                readOnly
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
                Danh má»¥c
              </label>
              <input
                type="text"
                value={service.category}
                readOnly
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          {/* MĂ´ táº£ */}
          <div>
            <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
              MĂ´ táº£ dá»‹ch vá»¥
            </label>
            <textarea
              value={service.descriptionDetail}
              readOnly
              rows="4"
              className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
            />
          </div>

          {/* áº¢nh Ä‘áº¡i diá»‡n */}
          <div>
            <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5">
              áº¢nh dá»‹ch vá»¥ 
            </label>
             <img
            src={
              service.imageUrl ||
              (service.imageFile
                ? `http://localhost:5000/uploads/${service.imageFile}`
                : "https://via.placeholder.com/400x250?text=No+Image")
            }
            alt={service.servicesName}
            className="w-full max-w-md h-64 object-cover rounded border-2 border-orange-200 mx-auto"
          />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServicesDetail;
