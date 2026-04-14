import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import axios from "axios";
import { TiTickOutline } from "react-icons/ti";
import { AiOutlineCloseCircle } from "react-icons/ai";
const ServiceManagement = () => {
  const [serviceSearch, setServiceSearch] = useState("");
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const result = await axios.get(
          "http://localhost:5000/api/services/all"
        );

        console.log(result.data);


        setServices(result.data.data || result.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-left text-xl font-semibold text-slate-900">
          Quản lí dịch vụ
        </h2>

      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={serviceSearch}
            onChange={(e) => setServiceSearch(e.target.value)}
            placeholder="Tim theo ten, nha cung cap..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 pl-11"
          />
        </div>


      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">STT</th>
              <th className="px-4 py-3 text-left font-medium">
                Tên dịch vụ
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Tên nhà cung cấp
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Giá
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Đánh giá
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody>
            {services.length > 0 ? (
              services.map((item, index) => (
                <tr key={item._id}>
                  <td className="text-left px-4 py-3">{index + 1}</td>
                  <td className="text-left px-4 py-3">{item.serviceName}</td>
                  <td className="text-left px-4 py-3">{item.nameProvider}</td>
                  <td className="text-left px-4 py-3">{item.prices?.toLocaleString("vi-VN")} VNĐ</td>
                  <td className="text-left px-4 py-3">--</td>
                  <td className="text-left px-4 py-3">{item.status}</td>
                  <td className="text-left px-4 py-3 flex gap-2">
                    <TiTickOutline className="text-green-500 text-xl" />
                    <AiOutlineCloseCircle className="text-red-500 text-xl" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-16 text-center text-slate-400"
                >
                  Chua co du lieu dich vu
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