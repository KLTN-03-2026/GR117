import { useState } from "react";
import { FaClock, FaCircleCheck } from "../assets/Icons/Icons";
import { formatDate } from "../utils/formatDate";

function BookingBox({
    props,
    schedules,
    viewPage,
    setViewPage,
    setView,
    selectedSchedule,
    setSelectedSchedule
}) {

    const [SendBooking, setSendBooking] = useState({
        slot: "1",
        prices: 0
    })
    const total = SendBooking.slot * props.prices;
    console.log(SendBooking, props);
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">

            {/* Giá */}
            <div className="text-center mb-5">
                <p className="text-2xl font-bold text-orange-500">
                    {Number(props.prices).toLocaleString("vi-VN")}đ
                </p>
                <p className="text-sm text-gray-500">/người</p>

                <p className="text-gray-500 mt-2 flex items-center justify-center gap-1 text-sm">
                    <FaClock />
                    3 Ngày 2 đêm
                </p>
            </div>

            {/* Form */}
            {!viewPage && (
                <div className="space-y-4 text-left p-2">

                    {/* Lịch */}
                    <div>
                        <label className="block mb-1 text-sm">
                            Lịch Khởi Hành
                        </label>

                        <select
                            className="w-full px-3 py-2 border rounded-xl"
                            value={selectedSchedule?.departureDate || ""}
                            onChange={(e) => {
                                const selected = schedules.find(
                                    (s) => s.departureDate === e.target.value
                                );
                                setSelectedSchedule(selected);
                            }}
                        >
                            <option value="">Chọn Lịch</option>

                            {schedules.map((item) => (
                                <option key={item._id} value={item.departureDate}>
                                    {formatDate(item.departureDate)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="">
                            Số Lượng
                        </label>
                        {/* Số người */}
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={SendBooking.slot}
                            onChange={(e) =>
                                setSendBooking({
                                    ...SendBooking,
                                    slot: Number(e.target.value)
                                })
                            }
                            className="w-full px-3 py-2 border rounded-xl"
                        />
                    </div>

                    {/* Ghi chú */}
                    <div>
                        <label htmlFor="">Ghi Chú</label>
                        <textarea
                            rows={2}
                            className="w-full px-3 py-2 border rounded-xl"
                        />
                    </div>

                    {/* Tổng */}
                    <div className="bg-[#f8fafc] rounded-xl p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Giá x {SendBooking.slot} người
                            </span>
                            <span>
                                {Number(props.prices).toLocaleString("vi-VN")}đ x {SendBooking.slot}
                            </span>
                        </div>

                        <div className="border-t border-border pt-2 flex justify-between">
                            <span className="font-semibold">
                                Tổng Cộng
                            </span>
                            <span className="text-[#f97316] font-bold">
                                {Number(total).toLocaleString("vi-VN")}đ
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Button */}
            <button
                onClick={() => {
                    setView(2);
                    setViewPage(!viewPage);
                }}
                className="w-full mt-4 py-3 bg-orange-500 text-white rounded-xl"
            >
                Đặt dịch vụ
            </button>

            {/* Info */}
            <div className="mt-4 space-y-2">
                {[
                    "Xác nhận tức thì",
                    "Hỗ trợ 24/7",
                    "Hoàn tiền linh hoạt",
                ].map((item, i) => (
                    <p key={i} className="flex gap-2 text-sm">
                        <FaCircleCheck className="text-green-500" />
                        {item}
                    </p>
                ))}
            </div>
        </div>
    );
}

export default BookingBox;