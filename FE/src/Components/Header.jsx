import { useEffect, useState } from "react";
import {
  FaLocationDot,
  FaPhone,
  FaUser,
  MdOutlineDashboard,
  CiLogin,
} from "../assets/Icons/Icons";
import { SiGmail } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  // ===== STATE =====
  const [user, setUser] = useState(null);

  // ===== LOAD USER =====
  const loadUser = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("currentUser"));
      setUser(storedUser);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    // cập nhật khi login/logout ở tab khác
    const handleStorage = () => loadUser();
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isCheck = !!user;

  // ===== LOGOUT (KHÔNG RELOAD ❌) =====
  const Logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");

    setUser(null); // cập nhật UI ngay
    navigate("/signin"); // chuyển trang chuẩn
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      
      {/* TOP BAR */}
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

          {isCheck && (
            <span className="flex items-center gap-1">
              Xin chào <FaUser />
              <span className="text-[#f97316]">{user?.fullName}</span>

              <span className="ml-2 px-2 py-0.5 bg-white/10 rounded text-[11px]">
                {user?.role === "user" ? "Khách Hàng" : user?.role}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 justify-between">

        {/* LOGO */}
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

        {/* MENU */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/">Trang Chủ</Link>
          <Link to="/destination">Điểm Đến</Link>
          <Link to="/about">Về Chúng Tôi</Link>
          <Link to="/contact">Liên Hệ</Link>
        </div>

        {/* AUTH */}
        <div className="hidden md:flex items-center gap-3">
          {!isCheck ? (
            <>
              <Link
                to="/signin"
                className="text-gray-600 hover:text-[#f97316] px-4 py-2"
              >
                Đăng nhập
              </Link>

              <Link
                to="/register"
                className="px-5 py-2 bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white rounded-full hover:shadow-lg transition-all"
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              {/* DASHBOARD BUTTON */}
              {["provider", "admin"].includes(
                user?.role?.toLowerCase()
              ) && (
                <Link
                  to={
                    user?.role?.toLowerCase() === "admin"
                      ? "/admin/dashboard"
                      : "/provider/dashboard"
                  }
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#f0f4f8] rounded-full hover:bg-[#f97316]/10"
                >
                  <MdOutlineDashboard />
                  Dashboard
                </Link>
              )}

              {/* LOGOUT */}
              <button
                onClick={Logout}
                className="flex items-center gap-1.5 px-2 py-2 hover:text-red-500"
              >
                <CiLogin />
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </header>
    </nav>
  );
}

export default Header;