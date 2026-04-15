import { useEffect, useState } from "react";
import { FaCircleCheck, MdOutlineDateRange } from "../assets/Icons/Icons"

import { formatDate } from "../utils/formatDate";

function DetailContentServices({ view,
    highlight = [],
    schedules,
    setSelectedSchedule,
    selectedSchedule }) {

    return (
        <div className="space-y-6 text-left">
            {/* Tong Quat */}
            {view === 0 &&
                <>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                        {/* Mo Ta Dich Vu */}
                        <h3 className="mb-3 font-size: 18px; font-weight: 600;">
                            Mô Tả Dịch Vụ
                        </h3>
                        <p className="text-muted-foreground whitespace-pre-line">
                            "Chưa Có"
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                        <h3 className="mb-3 font-size: 18px; font-weight: 600;">
                            Điểm Nổi Bật
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {highlight.map((item, index) => {
                                return (<div key={index} className="flex items-start gap-3 p-3 bg-[#f97316]/5 rounded-xl">

                                    <FaCircleCheck className="lucide lucide-circle-check text-[#f97316] shrink-0 mt-0.5" />

                                    {item}
                                </div>)
                            })}

                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                        <h3 className="mb-3 font-size: 18px; font-weight: 600;">
                            Dịch Vụ Bao Gồm
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-2">
                            {highlight.map((item, index) => {
                                return (
                                    <p key={index} className="flex items-center gap-2 text-muted-foreground">
                                        <FaCircleCheck className="lucide lucide-circle-check text-green-500 shrink-0" />
                                        {item}
                                    </p>
                                )
                            })}

                        </div>
                    </div>
                    {/* Tom Tắt Lịch Trình */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                        <h3 className="mb-3 font-size: 18px; font-weight: 600;">
                            Toám Tắt Lịch Trình
                        </h3>
                    </div>
                </>
            }
            {view === 1 && <div>Lịch trình từng ngày...</div>}
            {view === 2 && (
                <LichKhoiHanh
                    schedules={schedules}
                    setSelectedSchedule={setSelectedSchedule}
                    selectedSchedule={selectedSchedule}
                />
            )}
            {view === 3 && <div>Đánh giá khách hàng...</div>}
        </div>
    );
}

function LichKhoiHanh({ schedules, selectedSchedule, setSelectedSchedule }) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="mb-4 font-semibold text-lg">
                Lịch khởi hành
            </h3>

            <div className="space-y-3">
                {schedules.map((item) => {
                    const remain = item.maxPeople - item.bookedSlots;
                    const isFull = remain <= 0;
                    const isSelected = selectedSchedule?._id === item._id;

                    return (
                        <div
                            key={item._id}
                            onClick={() => {
                                if (!isFull) setSelectedSchedule(item);
                            }}
                            className={`p-4 rounded-2xl border flex items-center justify-between transition-all
                                ${isSelected
                                    ? "border-orange-500 bg-orange-50 shadow-sm"
                                    : "border-gray-200"
                                }
                                ${isFull
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer hover:border-orange-400"
                                }
                            `}
                        >
                            {/* LEFT */}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                                    <MdOutlineDateRange className="w-[14px] h-[14px]" />
                                </div>

                                <div>
                                    <p className="font-medium capitalize">
                                        {formatDate(item.departureDate)}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {isFull
                                            ? "Đã hết chỗ"
                                            : `Còn ${remain}/${item.maxPeople} chỗ`}
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div>
                                {isFull ? (
                                    <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-500">
                                        Hết chỗ
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
                                        Còn chỗ
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}





export default DetailContentServices;