import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaYoutube, FaPhone, FaLocationDot, SiGmail } from "../assets/Icons/Icons";
function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f97316] to-[#f59e0b] flex items-center justify-center text-white">
                                <FaLocationDot />
                            </div>
                            <span className="font-size: 1.25rem; font-weight: 700;"> ViVu Travel</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Nền tảng đặt dịch vụ du lịch trực tuyến hàng đầu Việt Nam. Kết nối khách hàng với nhà cung cấp dịch vụ uy tín trên toàn quốc.
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                            <span className="w-[24px] h-[24px]"><Link href=""><FaFacebook /></Link></span>
                            <span className="w-[24px] h-[24px]"><Link href=""><FaInstagram /></Link></span>
                            <span className="w-[24px] h-[24px]"><Link href=""><FaYoutube /></Link></span>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Dịch Vụ</h4>
                        <ul className="flex flex-col space-y-2 text-sm">
                            <li><Link className="hover:text-[#f97316] transition-colors">Tour du lịch</Link></li>
                            <li><Link className="hover:text-[#f97316] transition-colors">Khách sạn & Resort</Link></li>
                            <li><Link className="hover:text-[#f97316] transition-colors">Vé tham quan</Link></li>
                            <li><Link className="hover:text-[#f97316] transition-colors">Gợi ý theo mùa</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
                        <ul className="flex flex-col space-y-2 text-sm">
                            <li><Link className="hover:text-[#f97316] transition-colors">Trung tâm trợ giúp</Link> </li>
                            <li><Link className="hover:text-[#f97316] transition-colors">Chính sách hoàn tiền</Link> </li>
                            <li><Link className="hover:text-[#f97316] transition-colors">Điều khoản dịch vụ</Link> </li>
                            <li><Link className="hover:text-[#f97316] transition-colors">Chính sách bảo mật</Link> </li>
                            <li><Link className="hover:text-[#f97316] transition-colors">Đăng ký làm đối tác</Link> </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Liên Hệ</h4>

                        <ul className="flex flex-col space-y-3 text-sm">

                            <li>
                                <Link className="flex items-start gap-2">
                                    <FaLocationDot className="mt-1" />
                                    <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                                </Link>
                            </li>

                            <li>
                                <Link className="flex items-center gap-2">
                                    <FaPhone />
                                    <span>1800 1234 (Miễn phí)</span>
                                </Link>
                            </li>

                            <li>
                                <Link className="flex items-center gap-2">
                                    <SiGmail />
                                    <span>support@vivu.vn</span>
                                </Link>
                            </li>

                        </ul>
                    </div>
                </div>
                <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © 2026 ViVu Travel. Được phát triển bởi Nhóm 116 - Trường KHMT.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png" alt="" className="h-6 opacity-60" />
                        <span>Hỗ trợ thanh toán VNPAY</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;