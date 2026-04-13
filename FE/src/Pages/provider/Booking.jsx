import React from "react";
import Breadcrumb from "../../Components/Breadcrumb.jsx";

const Booking = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <Breadcrumb />
            <h1
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "20px",
                fontWeight: "700",
                color: "rgb(26, 26, 46)",
              }}
            >
              Quan ly dat cho
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-400">
          Chức năng đặt chổ đang hoàn thiện
        </div>
      </div>
    </div>
  );
};

export default Booking;
