const {
  validationError,
  validationSuccess,
  normalizeText,
} = require("./commonValidation.js");

const SCHEDULE_STATUSES = ["open", "full", "closed"];

const validateScheduleDate = (departureDate) => {
  const selectedDate = new Date(departureDate);
  if (Number.isNaN(selectedDate.getTime())) {
    return validationError(400, "Ngày khởi hành không hợp lệ");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return validationError(400, "Ngày khởi hành không được ở quá khứ");
  }

  return validationSuccess({ departureDate });
};

const validateCreateSchedule = (body = {}) => {
  const { serviceId, departureDate, endDate, maxSlots, status } = body;
  const normalizedMaxSlots = Number(maxSlots);
  const normalizedStatus = normalizeText(status) || "open";

  if (!serviceId || !departureDate || !maxSlots) {
    return validationError(400, "Thiếu thông tin tạo lịch khởi hành");
  }

  if (!Number.isFinite(normalizedMaxSlots) || normalizedMaxSlots < 1) {
    return validationError(400, "Số chỗ tối đa không hợp lệ");
  }

  if (!SCHEDULE_STATUSES.includes(normalizedStatus)) {
    return validationError(400, "Trạng thái lịch không hợp lệ");
  }

  const dateValidation = validateScheduleDate(departureDate);
  if (!dateValidation.isValid) return dateValidation;

  return validationSuccess({
    serviceId,
    departureDate,
    endDate: endDate || null,
    maxSlots: normalizedMaxSlots,
    status: normalizedStatus,
  });
};

const validateUpdateSchedule = (body = {}, bookedSlots = 0) => {
  const { maxSlots, status, departureDate, endDate } = body;
  const normalizedMaxSlots =
    maxSlots !== undefined ? Number(maxSlots) : undefined;
  const normalizedStatus =
    status !== undefined ? normalizeText(status) : undefined;

  if (
    normalizedMaxSlots !== undefined &&
    (!Number.isFinite(normalizedMaxSlots) || normalizedMaxSlots < 1)
  ) {
    return validationError(400, "Số chỗ tối đa không hợp lệ");
  }

  if (normalizedMaxSlots !== undefined && normalizedMaxSlots < bookedSlots) {
    return validationError(
      400,
      `Số chỗ tối đa không thể nhỏ hơn số khách đã đặt (${bookedSlots})`,
    );
  }

  if (
    normalizedStatus !== undefined &&
    !SCHEDULE_STATUSES.includes(normalizedStatus)
  ) {
    return validationError(400, "Trạng thái lịch không hợp lệ");
  }

  if (departureDate !== undefined) {
    const dateValidation = validateScheduleDate(departureDate);
    if (!dateValidation.isValid) return dateValidation;
  }

  return validationSuccess({
    maxSlots: normalizedMaxSlots,
    status: normalizedStatus,
    departureDate,
    endDate: endDate || null,
  });
};

module.exports = {
  validateCreateSchedule,
  validateUpdateSchedule,
};
