import { useState } from "react";
import { FaClock, FaCircleCheck } from "../../assets/Icons/Icons";
import { formatDate } from "../../utils/formatDate";

function BookingBox({
    props,
    schedules,
    viewPage,
    setViewPage,
    setView,
    selectedSchedule,
    setSelectedSchedule,
}) {
    const [sendBooking, setSendBooking] = useState({
        slot: 1,
    });

    const total = Number(sendBooking.slot) * Number(props?.prices || 0);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
            <div className="text-center mb-5">
                <p className="text-2xl font-bold text-orange-500">
                    {Number(props?.prices || 0).toLocaleString("vi-VN")}đ
                </p>
                <p className="text-sm text-gray-500">/người</p>

                {props?.duration ? (
                    <p className="text-gray-500 mt-2 flex items-center justify-center gap-1 text-sm">
                        <FaClock />
                        {props.duration}
                    </p>
                ) : null}
            </div>

            {!viewPage && (
                <div className="space-y-4 text-left p-2">
                    <div>
                        <label className="block mb-1 text-sm">Lịch khởi hành</label>

                        <select
                            className="w-full px-3 py-2 border rounded-xl"
                            value={selectedSchedule?.departureDate || ""}
                            onChange={(e) => {
                                const selected = schedules.find(
                                    (s) => s.departureDate === e.target.value,
                                );
                                setSelectedSchedule(selected);
                            }}
                        >
                            <option value="">Chọn lịch</option>

                            {schedules.map((item) => (
                                <option key={item._id} value={item.departureDate}>
                                    {formatDate(item.departureDate)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Số lượng</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={sendBooking.slot}
                            onChange={(e) =>
                                setSendBooking({
                                    ...sendBooking,
                                    slot: Number(e.target.value),
                                })
                            }
                            className="w-full px-3 py-2 border rounded-xl"
                        />
                    </div>

                    <div>
                        <label>Ghi chú</label>
                        <textarea
                            rows={2}
                            className="w-full px-3 py-2 border rounded-xl"
                        />
                    </div>

                    <div className="bg-[#f8fafc] rounded-xl p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Giá x {sendBooking.slot} người
                            </span>
                            <span>
                                {Number(props?.prices || 0).toLocaleString("vi-VN")}đ x {sendBooking.slot}
                            </span>
                        </div>

                        <div className="border-t border-border pt-2 flex justify-between">
                            <span className="font-semibold">Tổng cộng</span>
                            <span className="text-[#f97316] font-bold">
                                {Number(total).toLocaleString("vi-VN")}VNĐ
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => {
                    setView(2);
                    setViewPage(!viewPage);
                }}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all"
            >
                Đặt dịch vụ
            </button>

            <div className="mt-4 space-y-2">
                {["Xác nhận tức thì", "Hỗ trợ 24/7", "Hoàn tiền linh hoạt"].map(
                    (item, i) => (
                        <p key={i} className="flex gap-2 text-sm text-slate-500">
                            <FaCircleCheck className="text-green-500" />
                            {item}
                        </p>
                    ),
                )}
            </div>
        </div>
    );
}

export default BookingBox;

