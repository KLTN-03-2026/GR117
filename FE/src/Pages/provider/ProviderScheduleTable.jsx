import React from "react";
import { FiEdit2, FiLock, FiMapPin, FiTrash2, FiUnlock } from "react-icons/fi";

function CapacityCell({ booked, max }) {
  const pct = max > 0 ? Math.round((booked / max) * 100) : 0;
  const barColor = pct >= 90 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#10b981";

  return (
    <div className="flex min-w-[120px] items-center gap-3">
      <span className="font-semibold text-gray-700">
        {booked}/{max}
      </span>

      <div className="max-w-[80px] flex-1">
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
      </div>

      <span className="text-[12px] text-gray-400">{pct}%</span>
    </div>
  );
}

export default function ProviderScheduleTable({
  schedules,
  getService,
  fmtDate,
  statusConfig,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ fontSize: 14 }}>
        <thead>
          <tr className="border-b border-gray-200">
            <th
              className="px-3 py-3 text-left text-gray-500"
              style={{ fontWeight: 500, fontSize: 13 }}
            >
              Dịch vụ
            </th>
            <th
              className="px-3 py-3 text-left text-gray-500"
              style={{ fontWeight: 500, fontSize: 13 }}
            >
              Ngày khởi hành
            </th>
            <th
              className="px-3 py-3 text-left text-gray-500"
              style={{ fontWeight: 500, fontSize: 13 }}
            >
              Ngày kết thúc
            </th>
            <th
              className="px-3 py-3 text-left text-gray-500"
              style={{ fontWeight: 500, fontSize: 13 }}
            >
              Chỗ đặt
            </th>
            <th
              className="px-3 py-3 text-left text-gray-500"
              style={{ fontWeight: 500, fontSize: 13 }}
            >
              Trạng thái
            </th>
            <th
              className="px-3 py-3 text-left text-gray-500"
              style={{ fontWeight: 500, fontSize: 13 }}
            >
              Thao tác
            </th>
          </tr>
        </thead>

        <tbody>
          {schedules.map((schedule) => {
            const service = getService(schedule.service_id);
            const st = statusConfig[schedule.status] || statusConfig.open;

            return (
              <tr
                key={schedule._id}
                className="border-b border-gray-100 transition-colors hover:bg-[#f8fafc]"
              >
                <td className="px-3 py-3">
                  <p className="font-medium">{service?.name || "—"}</p>
                  <p className="flex items-center gap-1 text-[12px] text-gray-400">
                    <FiMapPin size={11} />
                    {service?.location || "—"}
                  </p>
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  {fmtDate(schedule.departureDate)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {schedule.endDate ? fmtDate(schedule.endDate) : "—"}
                </td>

                <td className="px-3 py-3">
                  <CapacityCell
                    booked={schedule.bookedSlots || 0}
                    max={schedule.maxPeople || 0}
                  />
                </td>

                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2 py-1 ${st.cls}`}
                    style={{ fontSize: 12, fontWeight: 500 }}
                  >
                    {st.label}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit(schedule)}
                      className="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50"
                      title="Sửa"
                    >
                      <FiEdit2 size={16} />
                    </button>

                    <button
                      onClick={() => onToggleStatus(schedule)}
                      className={`rounded-lg p-1.5 transition ${
                        schedule.status === "open"
                          ? "text-amber-500 hover:bg-amber-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={schedule.status === "open" ? "Đóng bán" : "Mở bán"}
                    >
                      {schedule.status === "open" ? (
                        <FiLock size={16} />
                      ) : (
                        <FiUnlock size={16} />
                      )}
                    </button>

                    <button
                      onClick={() => onDelete(schedule)}
                      className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                      title="Xóa"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {schedules.length === 0 ? (
        <p className="py-10 text-center text-gray-400">
          Chưa có lịch khởi hành nào
        </p>
      ) : null}
    </div>
  );
}
