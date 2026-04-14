import { useState } from "react";
import { useLocation } from "react-router-dom";
import DetailBannerService from "../../Components/DetailBannertServices";
import DetailContentServices from "../../Components/DetailContentServices";
import { FaClock, FaCircleCheck, FaPhone, MdOutlineDateRange, FaRegEye, MdFoodBank, FaRegCompass } from "../../assets/Icons/Icons"
function DetailServices() {
    const btn = [
        { name: "Tổng Quan", index: 0 },
        { name: "Lịch Ngày", index: 1 },
        { name: "Lịch Khởi Hành", index: 2 },
        { name: "Đánh Giá", index: 3 },
    ];

    const [view, setView] = useState(0);

    const location = useLocation();
    const { props } = location.state || {};
    const highlight = props?.highlight?.split(".") || [];
    if (!props) {
        return <div>Không có dữ liệu</div>;
    }
    { console.log(props) }

    return (
        <div>
            {/* Banner */}
            <DetailBannerService
                imageUrl={props.imageUrl}
                serviceName={props.serviceName}
                location={props.location}
                nameProvider={props.nameProvider}
            />

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* LEFT */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Tabs */}
                        <div className="flex gap-1 overflow-x-auto bg-[#f0f4f8] p-1 rounded-xl">
                            {btn.map((item) => (
                                <button
                                    key={item.index}
                                    onClick={() => setView(item.index)}
                                    className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-all ${view === item.index
                                        ? "bg-white shadow-sm text-[#f97316]"
                                        : "text-gray-500 hover:text-black"
                                        }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>

                        {/* Nội dung theo tab */}
                        <DetailContentServices view={view} props={props} highlight={highlight} />

                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 space-y-4">
                            {/* Box Giá */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
                                <div className="text-center mb-5">
                                    <p className="text-2xl font-bold text-orange-500">
                                        {Number(props.prices).toLocaleString("vi-VN")}đ
                                    </p>
                                    <p className="text-sm text-gray-500">/người</p>

                                    <p className="text-gray-500 mt-2 flex items-center justify-center gap-1 text-sm">
                                        <FaClock className="text-base" />
                                        3 Ngày 2 đêm
                                    </p>
                                </div>

                                <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl hover:shadow-lg transition-all">
                                    Đặt dịch vụ
                                </button>
                                <div className="mt-5 space-y-3 pt-5 border-t">
                                    {["Xác nhận tức thì", "Hỗ trợ 24/7", "Hoàn tiền linh hoạt"].map((item, index) => (
                                        <p key={index} className="flex items-center gap-2 text-gray-600 text-sm">
                                            <FaCircleCheck className="text-green-500 text-base" />
                                            {item}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            {/* Tour OverRview */}
                            <div className="rounded-2xl overflow-hidden border hidden lg:block">
                                <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d2b55] p-5">
                                    <p className="text-white/60 text-xs">TOUR OVERVIEW</p>
                                    <p className="text-white font-semibold text-sm">
                                        Tổng quan hành trình
                                    </p>
                                </div>

                                <div className="bg-white p-4">
                                    <div className="grid grid-cols-2 gap-3">

                                        {/* Item */}
                                        <div className="bg-orange-50 rounded-xl p-3 text-center">
                                            <MdOutlineDateRange className="text-lg mx-auto mb-1 text-orange-500" />
                                            <p className="text-xs text-gray-500">Ngày</p>
                                            <p className="text-lg font-bold">3</p>
                                        </div>

                                        <div className="bg-purple-50 rounded-xl p-3 text-center">
                                            <FaRegEye className="text-lg mx-auto mb-1 text-purple-600" />
                                            <p className="text-xs text-gray-500">Điểm đến</p>
                                            <p className="text-lg font-bold">{highlight.length}</p>
                                        </div>

                                        <div className="bg-yellow-50 rounded-xl p-3 text-center">
                                            <MdFoodBank className="text-lg mx-auto mb-1 text-yellow-600" />
                                            <p className="text-xs text-gray-500">Bữa ăn</p>
                                            <p className="text-lg font-bold">6</p>
                                        </div>

                                        <div className="bg-cyan-50 rounded-xl p-3 text-center">
                                            <FaRegCompass className="text-lg mx-auto mb-1 text-cyan-600" />
                                            <p className="text-xs text-gray-500">Hoạt động</p>
                                            <p className="text-lg font-bold">5</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Contact */}
                            <div className="mt-4 pt-4 border-t border-border">
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f0f4f8] text-muted-foreground transition-colors">
                                    <FaPhone className="w-[14px] h-[14px]" />
                                    Liên hệ tư vấn
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default DetailServices;