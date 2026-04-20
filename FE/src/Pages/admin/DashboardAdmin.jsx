import React, { useState } from "react";
import {
  IoBarChartOutline,
  IoPeopleOutline,
  IoPricetagOutline,
  IoShieldCheckmarkOutline,
  IoTicketOutline,  
} from "react-icons/io5";

import TotalSystem from "./TotalSystem";
import ServiceManagement from "./ServiceManagement";
import AccountManagement from "./AccountManagement";
import BookingManagement from "./BookingManagement";


const tabs = [
  { id: "overview", label: "Tổng quan ", icon: IoBarChartOutline },
  { id: "services", label: "Dịch vụ", icon: IoPricetagOutline },
  { id: "accounts", label: "Tài khoản ", icon: IoPeopleOutline },
  { id: "bookings", label: "Đơn hàng ", icon: IoTicketOutline },
];

const DashboardAdmin = () => {
  const [tab, setTab] = useState("overview");
  const cardClass ="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
            <IoShieldCheckmarkOutline className="text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 my-5 ">
              Admin <span className="text-orange-500">Dashboard</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-2xl bg-[#eef2f7] p-1 mb-6">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? "bg-white text-orange-500 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="text-base" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className={cardClass}>
          {tab === "overview" && (
           <TotalSystem />
          )}

          {tab === "services" && (
            <ServiceManagement/>
          )}

          {tab === "accounts" && (
            <AccountManagement />
          )}

          {tab === "bookings" && (
           <BookingManagement/>
          )}
         
        </div>
       
      </div>
    </div>
  );
};

export default DashboardAdmin;
