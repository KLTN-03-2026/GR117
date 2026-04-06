import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menu = [
    { id: "tongquan", label: "Tổng quan", path: "/provider/dashboard" },
    { id: "dichvu", label: "Dịch vụ", path: "/provider/services" },
    { id: "lich", label: "Lịch khởi hành", path: "/provider/Schedule" },
    { id: "datcho", label: "Đặt chỗ", path: "/provider/Booking", badge: 1 },
    { id: "doanhthu", label: "Doanh thu", path: "/provider/Revenue" },
    { id: "doitac", label: "Hồ sơ đối tác", path: "/provider/PartnerProfile" },
  ];

  return (
    <div className="w-64 h-screen bg-[#1a1a2e] text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <p className="text-sm text-white/70">Công ty Du lịch Hạ Long</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menu.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all
                  ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500/30 to-yellow-500/10 border-l-4 border-orange-500 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-orange-500 text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button className="w-full bg-red-500 py-2 rounded hover:bg-red-600">
          Đăng xuất
        </button>
      </div>
    </div>
  );
}