import { useEffect, useState } from "react";
import { FaLocationDot, FaRegStar, FaPhone, FaUser, MdOutlineDashboard, CiLogin } from "../assets/Icons/Icons";
import { SiGmail } from "react-icons/si";
import { Link } from "react-router-dom";

function Header() {
    const accessToken = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    const isCheck = !!accessToken;
    { console.log(user) }


    const Logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");

        window.location.reload();
    };


    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
            <div className="bg-[#1a1a2e] text-white/80 hidden md:block text-[15px]">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-6 px-2">
                        <span className="flex items-center gap-1"><FaPhone />1900 1234</span>
                        <span className="flex items-center gap-1"><SiGmail />hello@vivutravel.vn</span>
                    </div>
                    {!isCheck ? (
                        <></>
                    ) : (
                        <span className="flex items-center gap-1">
                            <span className="flex items-center gap-1">
                                Xin Chào <FaUser />
                                {/* Cần Render Tên Khi Nhận dữ liệu từ backend */}
                                <span className="text-[#f97316] ">
                                    {user?.fullName}
                                </span>
                            </span>
                            <span className="ml-2 px-2 py-0.5 bg-white/10 rounded text-[11px]">
                                {user?.role == "user" ? "Khách Hàng" : ""}
                            </span>
                        </span>
                    )}

                </div>
            </div>

            <header className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 justify-between">
                {/* Logo */}
                <div className="flex h-16 items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f97316] to-[#f59e0b] flex items-center justify-center text-white">
                            <FaLocationDot />
                        </div>

                        <span className="text-xl font-bold text-transparent">
                            <span className="text-[#000000]">
                                ViVu
                            </span>
                            <span className="text-[#f97316]">
                                Travel
                            </span>
                        </span>
                    </Link>
                </div>

                {/* Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className="text-sm font-medium text-gray-600 hover:text-[#f97316]">Trang Chủ</Link>
                    <Link to="/user/Destination" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#f97316]">
                        <FaRegStar /> Điểm Đến
                    </Link>
                    <Link to="/user/About" className="text-sm font-medium text-gray-600 hover:text-[#f97316]">Về Chúng Tôi</Link>
                    <Link to="/user/Contact" className="text-sm font-medium text-gray-600 hover:text-[#f97316]">Liên Hệ</Link>
                   
                </div>

                {/* Auth */}
                <div className="hidden md:flex items-center gap-3">
                    {!isCheck ? (
                        <>
                            <Link to="/signin" className="text-l text-gray-600 hover:text-[#f97316] px-4 py-2">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white rounded-full hover:shadow-lg hover:shadow-orange-200 transition-all">
                                Đăng ký
                            </Link>
                        </>
                    ) : (
                        <>
                            {user.role == "provider" ? (
                                <Link to="/provider/dashboard" className="flex items-center gap-1.5 px-4 py-2 bg-[#f0f4f8] text-[#1a1a2e] rounded-full hover:bg-[#f97316]/10 transition-colors">
                                    <MdOutlineDashboard />
                                    Dashboard
                                </Link>) : ("")
                            }
                            <button onClick={Logout} className="flex items-center gap-1.5 px-2 py-2 text-muted-foreground hover:text-[#ef4444] transition-colors">
                                <span>
                                    <CiLogin />
                                </span>
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