import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaCircleCheck, MdOutlineDateRange } from "../assets/Icons/Icons";
import {
  FaBed,
  FaBus,
  FaCamera,
  FaChevronDown,
  FaChevronUp,
  FaCompass,
  FaEye,
  FaHotel,
  FaUtensils,
} from "react-icons/fa6";

import { formatDate } from "../utils/formatDate";

function DetailContentServices({
  view,
  description = "",
  highlight = [],
  includes = [],
  itinerary = [],
  schedules = [],
  setSelectedSchedule,
  selectedSchedule,
}) {
  const sortedItinerary = useMemo(() => {
    return Array.isArray(itinerary)
      ? [...itinerary].sort((a, b) => Number(a?.day || 0) - Number(b?.day || 0))
      : [];
  }, [itinerary]);

  const [expandedDays, setExpandedDays] = useState([]);

  const toggleDay = (day) => {
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const activityMeta = {
    transport: { Icon: FaBus, cls: "bg-blue-100 text-blue-600" },
    sightseeing: { Icon: FaEye, cls: "bg-purple-100 text-purple-600" },
    food: { Icon: FaUtensils, cls: "bg-orange-100 text-[#f97316]" },
    hotel: { Icon: FaHotel, cls: "bg-emerald-100 text-emerald-600" },
    activity: { Icon: FaCompass, cls: "bg-cyan-100 text-cyan-600" },
    photo: { Icon: FaCamera, cls: "bg-pink-100 text-pink-600" },
  };

  const ActivityIcon = ({ icon }) => {
    const key = String(icon || "activity").toLowerCase();
    const meta = activityMeta[key] || activityMeta.activity;
    const IconComp = meta.Icon;

    return (
      <div
        className={`h-9 w-9 shrink-0 rounded-xl ${meta.cls} flex items-center justify-center`}
      >
        <IconComp size={16} />
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left">
      {view === 0 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-[18px] font-semibold text-[#1a1a2e]">
              Mô tả dịch vụ
            </h3>
            <p className="whitespace-pre-line text-[15px] leading-8 text-slate-500">
              {description?.trim() ? description : "Chưa có mô tả."}
            </p>
          </div>

          {highlight.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-[18px] font-semibold text-[#1a1a2e]">
                Điểm nổi bật
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {highlight.map((item, index) => (
                  <motion.div
                    key={`${index}-${item}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 rounded-xl bg-[#f97316]/5 p-3"
                  >
                    <FaCircleCheck className="mt-0.5 shrink-0 text-[#f97316]" />
                    <span className="text-[14px] leading-6 text-slate-700">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {includes.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-[18px] font-semibold text-[#1a1a2e]">
                Dịch vụ bao gồm
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {includes.map((item, index) => (
                  <p
                    key={`${index}-${item}`}
                    className="flex items-center gap-2 text-[14px] text-slate-500"
                  >
                    <FaCircleCheck className="shrink-0 text-green-500" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          )}

          {sortedItinerary.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-[18px] font-semibold text-[#1a1a2e]">
                Tóm tắt lịch trình
              </h3>

              <div className="space-y-0">
                {sortedItinerary.map((day, idx) => (
                  <div key={day.day || idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-[#f59e0b] text-[13px] font-bold text-white">
                        N{day.day}
                      </div>
                      {idx < sortedItinerary.length - 1 && (
                        <div className="my-1 w-0.5 flex-1 bg-[#f97316]/20" />
                      )}
                    </div>

                    <div className="pb-6">
                      <h4 className="text-[15px] font-semibold text-slate-800">
                        {day.title || `Ngày ${day.day}`}
                      </h4>
                      {day.description ? (
                        <p className="mt-1 text-[13px] leading-6 text-slate-500">
                          {day.description}
                        </p>
                      ) : null}

                      <div className="mt-2 flex flex-wrap gap-2">
                        {(day.meals || []).map((meal, j) => (
                          <span
                            key={`${day.day}-meal-${j}`}
                            className="inline-flex items-center gap-1 rounded bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-[#f97316]"
                          >
                            <FaUtensils size={10} /> {meal}
                          </span>
                        ))}
                        {day.accommodation ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                            <FaBed size={10} /> {day.accommodation}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 1 && (
        <div className="space-y-4">
          {sortedItinerary.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
              <p className="text-[15px] text-slate-500">
                Chưa có lịch trình chi tiết
              </p>
            </div>
          ) : (
            sortedItinerary.map((day) => {
              const isExpanded = expandedDays.includes(day.day);

              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleDay(day.day)}
                    className="w-full p-5 text-left transition-colors hover:bg-[#f8fafc]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316] to-[#f59e0b] text-white">
                        <span className="text-[10px] font-medium leading-none">
                          NGÀY
                        </span>
                        <span className="text-[22px] font-bold leading-none">
                          {day.day}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-[17px] font-semibold text-slate-800">
                          {day.title || `Ngày ${day.day}`}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-[13px] text-slate-500">
                          {day.description || ""}
                        </p>
                      </div>

                      <div className="shrink-0 text-slate-400">
                        {isExpanded ? (
                          <FaChevronUp size={18} />
                        ) : (
                          <FaChevronDown size={18} />
                        )}
                      </div>
                    </div>

                    <div className="ml-[4.5rem] mt-3 flex flex-wrap gap-2">
                      {(day.meals || []).map((meal, j) => (
                        <span
                          key={`${day.day}-meal-tag-${j}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1 text-[12px] font-medium text-[#f97316]"
                        >
                          <FaUtensils size={12} /> {meal}
                        </span>
                      ))}
                      {day.accommodation ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-600">
                          <FaBed size={12} /> {day.accommodation}
                        </span>
                      ) : null}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-6">
                      <div className="ml-[1.65rem] space-y-0 border-l-2 border-[#f97316]/20 pl-8">
                        {(day.activities || []).map((act, ai) => (
                          <motion.div
                            key={`${day.day}-act-${ai}`}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ai * 0.03 }}
                            className="relative pb-6 last:pb-0"
                          >
                            <div className="absolute -left-[2.55rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#f97316] shadow-sm" />

                            <div className="flex gap-3">
                              <ActivityIcon icon={act?.icon} />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  {act?.time ? (
                                    <span className="rounded bg-[#1a1a2e] px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
                                      {act.time}
                                    </span>
                                  ) : null}
                                  <h4 className="text-[15px] font-semibold text-slate-800">
                                    {act?.title || "Hoạt động"}
                                  </h4>
                                </div>
                                {act?.description ? (
                                  <p className="mt-1 text-[13px] leading-7 text-slate-500">
                                    {act.description}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {view === 2 && (
        <LichKhoiHanh
          schedules={schedules}
          setSelectedSchedule={setSelectedSchedule}
          selectedSchedule={selectedSchedule}
        />
      )}

      {view === 3 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <p className="text-[15px] text-slate-500">Chưa có đánh giá.</p>
        </div>
      )}
    </div>
  );
}

function LichKhoiHanh({ schedules, selectedSchedule, setSelectedSchedule }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-[#1a1a2e]">Lịch khởi hành</h3>

      <div className="space-y-3">
        {schedules.map((item) => {
          const remain = item.maxPeople - item.bookedSlots;
          const isFull = remain <= 0;
          const isSelected = selectedSchedule?._id === item._id;

          return (
            <button
              key={item._id}
              type="button"
              disabled={isFull}
              onClick={() => {
                if (!isFull) setSelectedSchedule(item);
              }}
              className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all text-left
                ${isSelected ? "border-orange-500 bg-orange-50 shadow-sm" : "border-slate-200 bg-white"}
                ${isFull ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-orange-400"}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <MdOutlineDateRange className="h-[14px] w-[14px]" />
                </div>

                <div>
                  <p className="font-medium capitalize text-slate-800">
                    {formatDate(item.departureDate)}
                  </p>

                  <p className="text-sm text-slate-500">
                    {isFull ? "Đã hết chỗ" : `Còn ${remain}/${item.maxPeople} chỗ`}
                  </p>
                </div>
              </div>

              <div>
                {isFull ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-500">
                    Hết chỗ
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-600">
                    Còn chỗ
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {schedules.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-slate-400">
            Chưa có lịch khởi hành.
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailContentServices;
