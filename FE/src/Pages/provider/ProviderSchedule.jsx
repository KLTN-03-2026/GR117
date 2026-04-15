import React, { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiPlus } from "react-icons/fi";
import Breadcrumb from "../../Components/Breadcrumb.jsx";
import ProviderScheduleTable from "./ProviderScheduleTable.jsx";
import ScheduleFormModal from "./ScheduleFormModal.jsx";
import DeleteScheduleModal from "./DeleteScheduleModal.jsx";

const EMPTY_FORM = {
  serviceId: "",
  departureDate: "",
  endDate: "",
  maxPeople: "20",
  note: "",
};

const STATUS_CONFIG = {
  open: { label: "Mở đăng ký", cls: "bg-green-50 text-green-700" },
  full: { label: "Hết chỗ", cls: "bg-red-50 text-red-600" },
  closed: { label: "Đã đóng", cls: "bg-gray-100 text-gray-500" },
};

const fmtDate = (date) =>
  new Date(date).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || "";
  return "";
};

const toDateInputValue = (value) => {
  if (!value) return "";

  const raw = String(value);
  const rawMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (rawMatch) return rawMatch[1];

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

export default function ProviderSchedule() {
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthHeaders = () => {
    const accessToken = localStorage.getItem("accessToken");
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : null;
  };

  const mapService = (item) => ({
    id: item._id,
    name:
      item.serviceName ||
      item.servicesName ||
      item.ServiceName ||
      "Chưa có tên",
    location:
      item.location || item.destination || item.region || "Chưa cập nhật",
  });

  const loadServices = async () => {
    const headers = getAuthHeaders();
    if (!headers) return false;

    const res = await fetch("http://localhost:5000/api/schedules/getServiceList", {
      headers,
    });
    const result = await res.json();

    if (res.ok && result.success) {
      setServices((result.data || []).map(mapService));
      return true;
    }

    return false;
  };

  const loadSchedules = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    const res = await fetch("http://localhost:5000/api/schedules/all", {
      headers,
    });
    const result = await res.json();

    if (!res.ok || result.success === false) {
      throw new Error(result.message || "Không tải được danh sách lịch");
    }

    setSchedules(result.data || []);
  };

  useEffect(() => {
    const run = async () => {
      try {
        const serviceOk = await loadServices();

        if (!serviceOk) {
          setMessage({
            type: "error",
            text: "Không tải được danh sách dịch vụ, vui lòng thử lại sau",
          });
        }

        await loadSchedules();
      } catch (error) {
        setMessage({
          type: "error",
          text: `Lỗi tải dữ liệu: ${error.message}`,
        });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const getService = (serviceId) => {
    const id = normalizeId(serviceId);
    return services.find((item) => item.id === id) || null;
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingSchedule(null);
  };

  const validateForm = () => {
    if (
      !form.serviceId ||
      !form.departureDate ||
      !form.endDate ||
      Number(form.maxPeople) <= 0
    ) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin" });
      return false;
    }
    return true;
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAddModal = () => {
    resetForm();
    setMessage({ type: "", text: "" });
    setShowModal(true);
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setMessage({ type: "", text: "" });
    setForm({
      serviceId: normalizeId(schedule.service_id || schedule.serviceId),
      departureDate: toDateInputValue(schedule.departureDate),
      endDate: toDateInputValue(schedule.endDate),
      maxPeople: String(schedule.maxPeople || 20),
      note: schedule.note || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setMessage((prev) =>
      prev.type === "error" ? { type: "", text: "" } : prev,
    );
  };

  const handleAddSchedule = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setMessage({ type: "", text: "" });

      const res = await fetch("http://localhost:5000/api/schedules/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          serviceId: form.serviceId,
          service_id: form.serviceId,
          departureDate: form.departureDate,
          endDate: form.endDate,
          maxPeople: Number(form.maxPeople),
          note: form.note.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok || result.success === false) {
        setMessage({
          type: "error",
          text: result.message || "Không thể thêm lịch khởi hành mới",
        });
        return;
      }

      setMessage({ type: "success", text: "Thêm lịch khởi hành thành công" });
      await loadSchedules();
      closeModal();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Lỗi khi thêm lịch: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSchedule = async () => {
    if (!validateForm() || !editingSchedule?._id) return;

    try {
      setIsSubmitting(true);
      setMessage({ type: "", text: "" });

      const res = await fetch(
        `http://localhost:5000/api/schedules/update/${editingSchedule._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            serviceId: form.serviceId,
            service_id: form.serviceId,
            departureDate: form.departureDate,
            endDate: form.endDate,
            maxPeople: Number(form.maxPeople),
            note: form.note.trim(),
          }),
        },
      );

      const result = await res.json();

      if (!res.ok || result.success === false) {
        setMessage({
          type: "error",
          text: result.message || "Không thể cập nhật lịch khởi hành",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Cập nhật lịch khởi hành thành công",
      });
      await loadSchedules();
      closeModal();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Lỗi khi cập nhật lịch: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (editingSchedule) return handleEditSchedule();
    return handleAddSchedule();
  };

  const handleToggleStatus = async (schedule) => {
    if (!schedule?._id) {
      setMessage({ type: "error", text: "Không tìm thấy lịch cần cập nhật" });
      return;
    }

    const nextStatus = schedule.status === "open" ? "closed" : "open";

    try {
      setIsSubmitting(true);
      setMessage({ type: "", text: "" });

      const res = await fetch(
        `http://localhost:5000/api/schedules/update/${schedule._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            serviceId: normalizeId(schedule.service_id || schedule.serviceId),
            service_id: normalizeId(schedule.service_id || schedule.serviceId),
            departureDate: toDateInputValue(schedule.departureDate),
            endDate: toDateInputValue(schedule.endDate),
            maxPeople: Number(schedule.maxPeople),
            note: schedule.note || "",
            status: nextStatus,
          }),
        },
      );

      const result = await res.json();

      if (!res.ok || result.success === false) {
        setMessage({
          type: "error",
          text: result.message || "Không thể cập nhật trạng thái lịch",
        });
        return;
      }

      setSchedules((prev) =>
        prev.map((item) =>
          item._id === schedule._id ? { ...item, status: nextStatus } : item,
        ),
      );

      setMessage({
        type: "success",
        text:
          nextStatus === "open"
            ? "Đã mở lại lịch khởi hành"
            : "Đã đóng lịch khởi hành",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: `Lỗi khi cập nhật trạng thái: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!deleteTarget?._id) {
      setMessage({ type: "error", text: "Không tìm thấy lịch cần xóa" });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage({ type: "", text: "" });

      const res = await fetch(
        `http://localhost:5000/api/schedules/delete/${deleteTarget._id}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
          },
        },
      );

      const result = await res.json();

      if (!res.ok || result.success === false) {
        setMessage({
          type: "error",
          text: result.message || "Không thể xóa lịch khởi hành",
        });
        return;
      }

      setMessage({ type: "success", text: "Xóa lịch khởi hành thành công" });
      setSchedules((prev) =>
        prev.filter((item) => item._id !== deleteTarget._id),
      );
      setDeleteTarget(null);
    } catch (error) {
      setMessage({ type: "error", text: `Lỗi khi xóa lịch: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteScheduleName = useMemo(() => {
    if (!deleteTarget) return "Lịch khởi hành";
    const service = getService(deleteTarget.service_id);
    return `${service?.name || "Dịch vụ"} - ${new Date(deleteTarget.departureDate).toLocaleDateString("vi-VN")}`;
  }, [deleteTarget, services]);

  if (loading) {
    return <div className="p-4 text-gray-500">Đang tải lịch khởi hành...</div>;
  }

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
              Quản lý lịch khởi hành
            </h1>
          </div>
        </div>

        <button
          onClick={openAddModal}
          type="button"
          className="rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] px-4 py-2 text-[13px] font-medium text-white transition hover:shadow-lg hover:shadow-orange-200"
        >
          <span className="inline-flex items-center gap-2">
            <FiPlus size={16} /> Thêm lịch khởi hành
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

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-gray-900">
            Danh sách lịch khởi hành
          </h2>
          <div className="flex items-center gap-2 text-[12px] text-gray-400">
            <FiCalendar size={15} />
            <span>{schedules.length} lịch</span>
          </div>
        </div>

        <ProviderScheduleTable
          schedules={schedules}
          getService={getService}
          fmtDate={fmtDate}
          statusConfig={STATUS_CONFIG}
          onEdit={openEditModal}
          onToggleStatus={handleToggleStatus}
          onDelete={setDeleteTarget}
        />
      </div>

      <ScheduleFormModal
        open={showModal}
        isEdit={!!editingSchedule}
        services={services}
        form={form}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onChange={updateForm}
        onSubmit={handleSubmit}
      />

      <DeleteScheduleModal
        open={!!deleteTarget}
        scheduleName={deleteScheduleName}
        isSubmitting={isSubmitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSchedule}
      />
    </div>
  );
}
