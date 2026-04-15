import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DetailBannerService from "../../Components/DetailBannertServices";
import DetailContentServices from "../../Components/DetailContentServices";
import BookingBox from "../../Components/BookingBox";
import axios from "axios";
import { MdOutlineDateRange, FaRegEye, MdFoodBank, FaRegCompass } from "../../assets/Icons/Icons"

function DetailServices() {
    const btn = [
        { name: "Tổng Quan", index: 0 },
        { name: "Lịch Ngày", index: 1 },
        { name: "Lịch Khởi Hành", index: 2 },
        { name: "Đánh Giá", index: 3 },
    ];


    const [view, setView] = useState(0);
    const [viewPage, setViewPage] = useState(true);
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const location = useLocation();
    const { props } = location.state || {};

    // ✅ xử lý highlight an toàn
    const highlight = props?.highlight
        ? props.highlight.split(".").filter((i) => i.trim() !== "")
        : [];

    // ✅ fetch schedules
    useEffect(() => {
        if (!props?._id) return;

        const fetchSchedules = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/schedules/service/${props._id}`
                );
                setSchedules(res.data.data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchSchedules();
    }, [props?._id]);

    // ✅ check dữ liệu
    if (!props) {
        return <div>Không có dữ liệu</div>;
    }

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
                                    className={`px-4 py-2.5 rounded-lg ${view === item.index
                                        ? "bg-white text-orange-500"
                                        : "text-gray-500"
                                        }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>

                        {/* Nội dung */}

                        <DetailContentServices
                            view={view}
                            highlight={highlight}
                            schedules={schedules}
                            selectedSchedule={selectedSchedule}
                            setSelectedSchedule={setSelectedSchedule}
                        />
                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 space-y-4">

                            {/*  BookingBox*/}
                            <BookingBox
                                props={props}
                                schedules={schedules}
                                viewPage={viewPage}
                                setViewPage={setViewPage}
                                setView={setView}
                                selectedSchedule={selectedSchedule}
                                setSelectedSchedule={setSelectedSchedule}
                            />
                            {/* Tour Overview */}
                            <div className="rounded-2xl overflow-hidden border hidden lg:block"> <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d2b55] p-5"> <p className="text-white/60 text-xs">TOUR OVERVIEW</p> <p className="text-white font-semibold text-sm"> Tổng quan hành trình </p> </div> <div className="bg-white p-4"> <div className="grid grid-cols-2 gap-3"> {/* Item */} <div className="bg-orange-50 rounded-xl p-3 text-center"> <MdOutlineDateRange className="text-lg mx-auto mb-1 text-orange-500" /> <p className="text-xs text-gray-500">Ngày</p> <p className="text-lg font-bold">3</p> </div> <div className="bg-purple-50 rounded-xl p-3 text-center"> <FaRegEye className="text-lg mx-auto mb-1 text-purple-600" /> <p className="text-xs text-gray-500">Điểm đến</p> <p className="text-lg font-bold">{highlight.length}</p> </div> <div className="bg-yellow-50 rounded-xl p-3 text-center"> <MdFoodBank className="text-lg mx-auto mb-1 text-yellow-600" /> <p className="text-xs text-gray-500">Bữa ăn</p> <p className="text-lg font-bold">6</p> </div> <div className="bg-cyan-50 rounded-xl p-3 text-center"> <FaRegCompass className="text-lg mx-auto mb-1 text-cyan-600" /> <p className="text-xs text-gray-500">Hoạt động</p> <p className="text-lg font-bold">5</p> </div> </div> </div> </div>

                            {/* Contact */}
                            <button className="w-full py-2 bg-gray-100 rounded-xl">
                                Liên hệ tư vấn
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default DetailServices;