import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClock as Clock,
  FaCircleCheck as CheckCircle2,
} from "../../assets/Icons/Icons";
import { formatDate } from "../../utils/formatDate";

const numberInputClass =
  "w-full px-3 py-2.5 rounded-xl bg-[#f8fafc] border border-border outline-none focus:border-[#f97316] no-spinner";

function BookingBox({
  props,
  schedules = [],
  viewPage,
  setViewPage,
  setView,
  selectedSchedule,
  setSelectedSchedule,
  onCheckout,
}) {
  const navigate = useNavigate();
  const service = props || {};
  const [showBooking, setShowBooking] = useState(viewPage === false);
  const [activeTab, setActiveTab] = useState("overview");
  const [people, setPeople] = useState("2");
  const [note, setNote] = useState("");

  const price = Number(service?.price || service?.prices || 0);
  const normalizedPeople = Math.max(
    Number(String(people || "1").replace(/^0+(?=\d)/, "") || 1),
    1,
  );

  useEffect(() => {
    if (viewPage === false) setShowBooking(true);
  }, [viewPage]);

  const handleBook = () => {
    const selectedScheduleId =
      selectedSchedule?._id || selectedSchedule?.id || "";

    const payload = {
      serviceId: service?._id || "",
      service,
      scheduleId: selectedScheduleId,
      schedule: selectedSchedule || null,
      people: normalizedPeople,
      note,
      price,
      total: price * normalizedPeople,
    };

    if (typeof onCheckout === "function") {
      onCheckout(payload);
      return;
    }

    navigate(`/booking/confirm/${payload.serviceId}`, { state: payload });
  };

  const openBooking = () => {
    setShowBooking(true);
    setActiveTab("schedules");
    if (typeof setView === "function") setView("schedules");
    if (typeof setViewPage === "function") setViewPage(false);
  };

  const closeBooking = () => {
    setShowBooking(false);
    if (typeof setViewPage === "function") setViewPage(true);
  };

  return (
    <div className="lg:col-span-1">
      <style>{`
        .no-spinner::-webkit-outer-spin-button,
        .no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-spinner {
          appearance: textfield;
          -moz-appearance: textfield;
        }
      `}</style>

      <div className="sticky top-20 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-border">
          <div className="text-center mb-5">
            <span
              className="text-[#f97316]"
              style={{ fontSize: 28, fontWeight: 700 }}
            >
              {price.toLocaleString("vi-VN")}đ
            </span>
            <span className="text-muted-foreground" style={{ fontSize: 14 }}>
              {" "}
              /người
            </span>

            {service.duration && (
              <p
                className="text-muted-foreground mt-1 flex items-center justify-center gap-1"
                style={{ fontSize: 13 }}
              >
                <Clock size={14} /> {service.duration}
              </p>
            )}
          </div>

          {!showBooking ? (
            <button
              onClick={openBooking}
              className="w-full py-3.5 bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all"
              style={{ fontSize: 15, fontWeight: 600 }}
            >
              Đặt dịch vụ ngay
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  className="block mb-1.5 text-left text-muted-foreground"
                  style={{ fontSize: 13 }}
                >
                  Lịch khởi hành *
                </label>
                <select
                  value={selectedSchedule?._id || selectedSchedule?.id || ""}
                  onChange={(e) => {
                    const selected = schedules.find(
                      (item) =>
                        item._id === e.target.value ||
                        item.id === e.target.value,
                    );
                    if (typeof setSelectedSchedule === "function") {
                      setSelectedSchedule(selected || null);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#f8fafc] border border-border outline-none focus:border-[#f97316]"
                  style={{ fontSize: 14 }}
                >
                  <option value="">Chọn lịch khởi hành</option>
                  {schedules
                    .filter(
                      (s) => String(s?.status || "").toLowerCase() === "open",
                    )
                    .map((s) => {
                      const remain =
                        Number(s.maxSlots || 0) - Number(s.bookedSlots || 0);
                      return (
                        <option key={s._id || s.id} value={s._id || s.id}>
                          {new Date(s.departureDate).toLocaleDateString(
                            "vi-VN",
                          )}{" "}
                          ( còn {remain} chỗ)
                        </option>
                      );
                    })}
                </select>
              </div>

              <div>
                <label
                  className="block mb-1.5 text-left text-muted-foreground"
                  style={{ fontSize: 13 }}
                >
                  Số người
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={people}
                  onChange={(e) => {
                    const digits = String(e.target.value || "").replace(
                      /\D/g,
                      "",
                    );
                    setPeople(digits);
                  }}
                  onBlur={() => {
                    const cleaned = String(people || "1")
                      .replace(/\D/g, "")
                      .replace(/^0+(?=\d)/, "");
                    setPeople(String(Math.max(Number(cleaned || 1), 1)));
                  }}
                  className={numberInputClass}
                  style={{
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label
                  className="block mb-1.5 text-left text-muted-foreground"
                  style={{ fontSize: 13 }}
                >
                  Ghi chú
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#f8fafc] border border-border outline-none focus:border-[#f97316] resize-none"
                  style={{ fontSize: 14 }}
                />
              </div>

              <div className="bg-[#f8fafc] rounded-xl p-4 space-y-2">
                <div className="flex justify-between" style={{ fontSize: 14 }}>
                  <span className="text-muted-foreground">
                    Giá x {normalizedPeople} người
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {(price * normalizedPeople).toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="border-t border-border pt-2 flex justify-between">
                  <span style={{ fontSize: 15, fontWeight: 600 }}>
                    Tổng cộng
                  </span>
                  <span
                    className="text-[#f97316]"
                    style={{ fontSize: 18, fontWeight: 700 }}
                  >
                    {(price * normalizedPeople).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              <button
                onClick={handleBook}
                className="w-full py-3.5 bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2"
                style={{ fontSize: 15, fontWeight: 600 }}
              >
                <CheckCircle2 size={18} /> Thanh toán qua VNPAY
              </button>

              <button
                onClick={closeBooking}
                className="w-full py-2 text-muted-foreground hover:text-[#1a1a2e]"
                style={{ fontSize: 13 }}
              >
                Hủy
              </button>
            </div>
          )}

          <div className="mt-6 space-y-3 pt-5 border-t border-border">
            {["Xác nhận tức thì", "Hỗ trợ 24/7", "Hoàn tiền linh hoạt"].map(
              (t) => (
                <p
                  key={t}
                  className="flex items-center gap-2 text-muted-foreground"
                  style={{ fontSize: 13 }}
                >
                  <CheckCircle2 size={14} className="text-green-500" /> {t}
                </p>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingBox;
