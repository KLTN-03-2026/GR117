import React from "react";
import { IoSearch } from "react-icons/io5";
const BookingManagement = () => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className=" text-left text-xl font-semibold text-slate-900">
          Quản lí đơn hàng
        </h2>

      </div>
      <div>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1 mb-5">
            <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 pl-11"
            />
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">STT</th>
                <th className="px-4 py-3 text-left font-medium">Mã đơn hàng</th>
                <th className="px-4 py-3 text-left font-medium">
                Khách hàng 
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  Dịch vụ 
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  Đối tác 
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  Tổng tiền 
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  Trạng thái 
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  Ngày đặt
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-16 text-center text-slate-400"
                >
                  Chua co du lieu booking
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;