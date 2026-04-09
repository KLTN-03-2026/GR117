import React from "react";
import {
  FiCalendar,
  FiChevronDown,
  FiEdit2,
  FiLock,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiUnlock,
  FiX,
} from "react-icons/fi";
import Breadcrumb from "../../Components/Breadcrumb.jsx";

const STATUS_CONFIG = {
  open: {
    label: "Mo dang ky",
    cls: "text-green-700",
    dot: "bg-green-400",
    bg: "bg-green-50 border border-green-200",
  },
  full: {
    label: "Het cho",
    cls: "text-red-600",
    dot: "bg-red-400",
    bg: "bg-red-50 border border-red-200",
  },
  closed: {
    label: "Da dong",
    cls: "text-gray-500",
    dot: "bg-gray-300",
    bg: "bg-gray-100 border border-gray-200",
  },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const daysUntil = (d) => {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (diff < 0) return { text: `${Math.abs(diff)} ngay truoc`, color: "text-gray-400" };
  if (diff === 0) return { text: "Hom nay!", color: "text-red-500" };
  if (diff <= 7) return { text: `Con ${diff} ngay`, color: "text-amber-600" };
  return { text: `Con ${diff} ngay`, color: "text-blue-600" };
};

function CapacityBar({ booked, max }) {
  const pct = max > 0 ? Math.round((booked / max) * 100) : 0;
  const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : pct >= 40 ? "#f97316" : "#10b981";

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[12px]">
        <span className="text-gray-500">Da dat</span>
        <span className="font-semibold text-gray-700">
          {booked}/{max} cho
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="mt-1 flex justify-between">
        <span className="text-[11px] text-gray-400">{pct}% lap day</span>
        <span className="text-[11px]" style={{ color }}>
          {max - booked > 0 ? `Con ${max - booked} cho` : "Da day"}
        </span>
      </div>
    </div>
  );
}

function DeleteConfirm({ scheduleName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} role="presentation" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50">
          <FiTrash2 size={24} className="text-red-500" />
        </div>
        <h3 className="mb-2 text-[16px] font-bold text-gray-900">Xac nhan xoa?</h3>
        <p className="mb-6 text-[13px] text-gray-500">
          Xoa lich khoi hanh <span className="font-semibold text-gray-700">"{scheduleName}"</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl bg-gray-100 py-2.5 text-[13px] font-medium text-gray-600">
            Huy
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-500 py-2.5 text-[13px] font-semibold text-white">
            Xoa lich
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProviderScheduleView({
  services,
  schedules,
  message,
  showModal,
  form,
  isSubmitting,
  deleteTarget,
  onOpenAdd,
  onCloseModal,
  onUpdateForm,
  onSubmit,
  onToggleStatus,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}) {
  const getServiceInfo = (serviceId) => {
    const service = services.find((item) => item.id === serviceId);
    return {
      name: service?.name || "Chua co ten",
      location: service?.location || "Chua cap nhat",
    };
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <Breadcrumb />
            <h1
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "20px",
                fontWeight: "700",
                color: "rgb(26, 26, 46)",
              }}
            >
              Quan ly lich khoi hanh
            </h1>
          </div>
        </div>

        <button
          onClick={onOpenAdd}
          type="button"
          className="rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] px-4 py-2 text-[13px] font-medium text-white transition hover:shadow-lg hover:shadow-orange-200"
        >
          <span className="inline-flex items-center gap-2">
            <FiPlus size={16} /> Them lich
          </span>
        </button>
      </div>

      {message.text ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-[13px] ${
            message.type === "error"
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {schedules.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-gray-100 bg-white p-14 text-center text-gray-500">
            Chua co lich khoi hanh nao
          </div>
        ) : (
          schedules.map((schedule) => {
            const service = getServiceInfo(schedule.service_id);
            const st = STATUS_CONFIG[schedule.status] || STATUS_CONFIG.open;
            const countdown = daysUntil(schedule.departureDate);
            const isPast = new Date(schedule.departureDate) < new Date();
            const dateObj = new Date(schedule.departureDate);
            return (
              <div
                key={schedule._id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
                  isPast ? "border-gray-200 opacity-70" : "border-gray-100"
                }`}
              >
                <div
                  className="h-1.5"
                  style={{
                    background:
                      schedule.status === "open"
                        ? "linear-gradient(90deg, #f97316, #f59e0b)"
                        : schedule.status === "full"
                          ? "linear-gradient(90deg, #ef4444, #f97316)"
                          : "#d1d5db",
                  }}
                />

                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="mb-1 line-clamp-1 text-[14px] font-semibold text-gray-800">{service.name}</h4>
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                        <FiMapPin size={11} />
                        <span className="truncate">{service.location}</span>
                      </div>
                    </div>
                    <span className={`ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.bg} ${st.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>

                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#f97316] to-[#f59e0b] text-white">
                      <span className="text-[16px] font-bold leading-none">{dateObj.getDate()}</span>
                      <span className="mt-0.5 text-[9px] uppercase">Th{dateObj.getMonth() + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-gray-800">{fmtDate(schedule.departureDate)}</p>
                      <p className={`mt-0.5 text-[12px] font-medium ${countdown.color}`}>{isPast ? "Da qua" : countdown.text}</p>
                    </div>
                    <FiCalendar size={18} className="shrink-0 text-gray-300" />
                  </div>

                  <div className="mb-4">
                    <CapacityBar booked={schedule.bookedSlots || 0} max={schedule.maxPeople || 0} />
                  </div>

                  {schedule.note ? (
                    <p className="mb-4 rounded-xl bg-gray-50 px-3 py-2 text-[12px] text-gray-500">{schedule.note}</p>
                  ) : null}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 py-2.5 text-[12px] font-medium text-blue-600 opacity-60"
                    >
                      <FiEdit2 size={13} /> Sua
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(schedule._id)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[12px] font-medium ${
                        schedule.status === "open"
                          ? "border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100"
                          : "border-green-100 bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {schedule.status === "open" ? (
                        <>
                          <FiLock size={13} /> Dong
                        </>
                      ) : (
                        <>
                          <FiUnlock size={13} /> Mo
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRequest(schedule._id)}
                      className="rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-500 transition hover:bg-red-100"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCloseModal} role="presentation" />

          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-7 py-5">
              <div>
                <h2 className="text-[18px] font-bold text-gray-900">Them lich khoi hanh</h2>
                <p className="mt-0.5 text-[13px] text-gray-400">Tao lich khoi hanh moi cho dich vu</p>
              </div>
              <button onClick={onCloseModal} type="button" className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                <FiX className="text-gray-500" size={16} />
              </button>
            </div>

            <div className="space-y-5 px-7 py-6">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                  Dich vu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.serviceId}
                    onChange={(e) => onUpdateForm("serviceId", e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-[14px] text-gray-800 outline-none focus:border-[#f97316]"
                  >
                    <option value="">-- Chon dich vu --</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.location}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                    Ngay di <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.departureDate}
                    onChange={(e) => onUpdateForm("departureDate", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-[#f97316]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                    Ngay ve <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => onUpdateForm("endDate", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-[#f97316]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                    So cho toi da <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxPeople}
                    onChange={(e) => onUpdateForm("maxPeople", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-gray-600">Ghi chu</label>
                <textarea
                  value={form.note}
                  onChange={(e) => onUpdateForm("note", e.target.value)}
                  rows={2}
                  placeholder="VD: Lich tet, doan rieng..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-[#f97316]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/60 px-7 py-5">
              <button onClick={onCloseModal} type="button" className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-[13px] font-medium text-gray-600">
                Huy
              </button>
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                type="button"
                className="rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] px-6 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
              >
                {isSubmitting ? "Dang luu..." : "Them lich"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <DeleteConfirm
          scheduleName={(() => {
            const target = schedules.find((item) => item._id === deleteTarget);
            if (!target) return "Lich khoi hanh";
            const service = getServiceInfo(target.service_id);
            return `${service.name} - ${new Date(target.departureDate).toLocaleDateString("vi-VN")}`;
          })()}
          onConfirm={onDeleteConfirm}
          onCancel={onDeleteCancel}
        />
      ) : null}
    </div>
  );
}
