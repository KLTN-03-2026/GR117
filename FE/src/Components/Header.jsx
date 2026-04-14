import { useEffect, useState } from "react";
import {
  FaLocationDot,
  FaPhone,
  FaUser,
  MdOutlineDashboard,
  CiLogin,
} from "../assets/Icons/Icons";
import { SiGmail } from "react-icons/si";
import { NavLink, Link } from "react-router-dom";

function Header() {
  const accessToken = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");
  const isCheck = !!accessToken;

  console.log(user);

  const Logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    window.location.reload();
  };

  const navClass = ({ isActive }) =>
    isActive
      ? "text-[#f97316] font-semibold border-b-2 border-[#f97316] pb-1"
      : "hover:text-[#f97316] transition-colors";

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      {/* Top bar */}
      <div className="bg-[#1a1a2e] text-white/80 hidden md:block text-[15px]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6 px-2">
            <span className="flex items-center gap-1">
              <FaPhone />
              1900 1234
            </span>
            <span className="flex items-center gap-1">
              <SiGmail />
              hello@vivutravel.vn
            </span>
          </div>

          {!isCheck ? null : (
            <span className="flex items-center gap-1">
              <span className="flex items-center gap-1">
                Xin Chào <FaUser />
                <span className="text-[#f97316] ">
                  {user?.fullName}
                </span>
              </span>
              <span className="ml-2 px-2 py-0.5 bg-white/10 rounded text-[11px]">
                {user?.role === "user" ? "Khách Hàng" : ""}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Main header */}
      <header className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 justify-between">
        {/* Logo */}
        <div className="flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f97316] to-[#f59e0b] flex items-center justify-center text-white">
              <FaLocationDot />
            </div>

            <span className="text-xl font-bold">
              <span className="text-black">ViVu</span>
              <span className="text-[#f97316]">Travel</span>
            </span>
          </Link>
        </div>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={navClass}>
            Trang Chủ
          </NavLink>

          <NavLink to="/destination" className={navClass}>
            Điểm Đến
          </NavLink>

          <NavLink to="/about" className={navClass}>
            Về Chúng Tôi
          </NavLink>

          <NavLink to="/contact" className={navClass}>
            Liên Hệ
          </NavLink>
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {!isCheck ? (
            <>
              <NavLink
                to="/signin"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#f97316] font-semibold"
                    : "text-gray-600 hover:text-[#f97316] px-4 py-2"
                }
              >
                Đăng nhập
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive
                    ? "px-5 py-2 bg-[#f97316] text-white rounded-full"
                    : "px-5 py-2 bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white rounded-full hover:shadow-lg hover:shadow-orange-200 transition-all"
                }
              >
                Đăng ký
              </NavLink>
            </>
          ) : (
            <>
              {["provider", "admin"].includes(user?.role) && (
                <NavLink
                  to={
                    user.role === "admin"
                      ? "/admin/dashboard"
                      : "/provider/dashboard"
                  }
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-1.5 px-4 py-2 bg-[#f97316]/10 text-[#f97316] rounded-full"
                      : "flex items-center gap-1.5 px-4 py-2 bg-[#f0f4f8] text-[#1a1a2e] rounded-full hover:bg-[#f97316]/10 transition-colors"
                  }
                >
                  <MdOutlineDashboard />
                  Dashboard
                </NavLink>
              )}

              <button
                onClick={Logout}
                className="flex items-center gap-1.5 px-2 py-2 text-muted-foreground hover:text-[#ef4444] transition-colors"
              >
                <CiLogin />
                Đăng Xuất
              </button>
            </>
          )}
        </div>
      </header>
    </nav>
  );
}

export default Header;