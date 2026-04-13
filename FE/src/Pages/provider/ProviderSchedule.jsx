import React, { useEffect, useState } from "react";
import ProviderScheduleView from "./ProviderScheduleView.jsx";

const EMPTY_FORM = {
  serviceId: "",
  departureDate: "",
  endDate: "",
  maxPeople: "20",
  note: "",
};

export default function ProviderSchedule() {
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadServices = async () => {
    const res = await fetch("http://localhost:5000/api/services/all");
    const result = await res.json();

    if (res.ok && result.success) {
      setServices(
        (result.data || []).map((item) => ({
          id: item._id,
          name:
            item.serviceName ||
            item.servicesName ||
            item.ServiceName ||
            "Chưa có tên",
          location:
            item.location || item.destination || item.region || "Chưa cập nhật",
        })),
      );
      return true;
    }

    const fallback = await fetch(
      "http://localhost:5000/api/schedules/getServiceList",
    );
    const fallbackResult = await fallback.json();
    if (fallback.ok && fallbackResult.success) {
      setServices(
        (fallbackResult.data || []).map((item) => ({
          id: item._id,
          name: item.serviceName || "Chưa có tên",
          location: "Chưa cập nhật",
        })),
      );
      return true;
    }
    return false;
  };

  const loadSchedules = async () => {
    const res = await fetch("http://localhost:5000/api/schedules/all");
    const result = await res.json();
    if (!res.ok || result.success === false) {
      throw new Error(result.message || "Khong tai duoc danh sach lich");
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
          text: `Loi tai du lieu: ${error.message}`,
        });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    if (
      !form.serviceId ||
      !form.departureDate ||
      !form.endDate ||
      Number(form.maxPeople) <= 0
    ) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin" });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage({ type: "", text: "" });

      const res = await fetch("http://localhost:5000/api/schedules/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const handleToggleStatus = (id) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item._id !== id) return item;
        const nextStatus = item.status === "open" ? "closed" : "open";
        return { ...item, status: nextStatus };
      }),
    );
    setMessage({
      type: "success",
      text: "Đã đổi trạng thái lịch trên giao diện",
    });
  };

  const handleDelete = () => {
    setSchedules((prev) => prev.filter((item) => item._id !== deleteTarget));
    setDeleteTarget(null);
    setMessage({ type: "success", text: "Đã xóa lịch trên giao diện" });
  };

  if (loading) {
    return <div className="p-4 text-gray-500">Đang tải lịch khởi hành...</div>;
  }

  return (
    <ProviderScheduleView
      services={services}
      schedules={schedules}
      message={message}
      showModal={showModal}
      form={form}
      isSubmitting={isSubmitting}
      deleteTarget={deleteTarget}
      onOpenAdd={openAdd}
      onCloseModal={closeModal}
      onUpdateForm={updateForm}
      onSubmit={submit}
      onToggleStatus={handleToggleStatus}
      onDeleteRequest={setDeleteTarget}
      onDeleteConfirm={handleDelete}
      onDeleteCancel={() => setDeleteTarget(null)}
    />
  );
}
