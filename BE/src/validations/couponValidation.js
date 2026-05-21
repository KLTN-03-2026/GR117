const {
  validationError,
  validationSuccess,
  normalizeText,
} = require("./commonValidation.js");

const normalizeCode = (value) => normalizeText(value).toUpperCase();

const normalizeServiceIds = (serviceIds) =>
  Array.isArray(serviceIds) ? serviceIds : [];

const validateCreateCoupon = (body = {}) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderValue,
    maxUsage,
    startDate,
    endDate,
    serviceIds = [],
  } = body;

  if (!code || !discountType || discountValue === undefined || !endDate) {
    return validationError(400, "Thieu thong tin ma giam gia");
  }

  const normalizedDiscountType = String(discountType);
  if (!["percent", "fixed"].includes(normalizedDiscountType)) {
    return validationError(400, "Loai giam gia khong hop le");
  }

  return validationSuccess({
    code: normalizeCode(code),
    discountType: normalizedDiscountType,
    discountValue: Number(discountValue),
    minOrderValue: Number(minOrderValue || 0),
    maxUsage: Number(maxUsage || 1),
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: new Date(endDate),
    serviceIds: normalizeServiceIds(serviceIds),
  });
};

const validateUpdateCoupon = (body = {}) => {
  const data = {};

  if (body.code !== undefined) data.code = normalizeCode(body.code);
  if (body.discountType !== undefined) data.discountType = String(body.discountType);
  if (body.discountValue !== undefined) data.discountValue = Number(body.discountValue);
  if (body.minOrderValue !== undefined) data.minOrderValue = Number(body.minOrderValue);
  if (body.maxUsage !== undefined) data.maxUsage = Number(body.maxUsage);
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = new Date(body.endDate);
  if (body.status !== undefined) data.status = String(body.status);
  if (body.serviceIds !== undefined) data.serviceIds = normalizeServiceIds(body.serviceIds);

  return validationSuccess(data);
};

const validateCouponCheck = (body = {}) => {
  const { code, serviceId, amount } = body;

  if (!code || !serviceId || amount === undefined) {
    return validationError(400, "Thieu thong tin");
  }

  return validationSuccess({
    code: normalizeCode(code),
    serviceId,
    amount: Number(amount || 0),
  });
};

module.exports = {
  normalizeCode,
  validateCreateCoupon,
  validateUpdateCoupon,
  validateCouponCheck,
};
