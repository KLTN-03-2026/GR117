// Tách văn bản thành từng dòng.
const splitLines = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

// Phân tích các trường dạng chuỗi hoặc mảng JSON.
const parseStringArrayField = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch (error) {}

  return splitLines(value);
};

// Phân tích dữ liệu lịch trình.
const parseItineraryField = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const ALLOWED_ACTIVITY_ICONS = new Set([
  "transport",
  "hotel",
  "food",
  "sightseeing",
  "activity",
  "photo",
]);

// Chuẩn hóa các ngày và hoạt động trong lịch trình.
const normalizeItineraryField = (value) =>
  parseItineraryField(value)
    .map((dayItem, index) => ({
      day: Number(dayItem?.day) > 0 ? Number(dayItem.day) : index + 1,
      title: String(dayItem?.title || "").trim(),
      description: String(dayItem?.description || "").trim(),
      meals: Array.isArray(dayItem?.meals)
        ? dayItem.meals.map((item) => String(item).trim()).filter(Boolean)
        : [],
      accommodation: String(dayItem?.accommodation || "").trim(),
      activities: Array.isArray(dayItem?.activities)
        ? dayItem.activities.map((activity) => {
            const icon = String(activity?.icon || "activity")
              .trim()
              .toLowerCase();

            return {
              time: String(activity?.time || "").trim(),
              title: String(activity?.title || "").trim(),
              description: String(activity?.description || "").trim(),
              icon: ALLOWED_ACTIVITY_ICONS.has(icon) ? icon : "activity",
            };
          })
        : [],
    }))
    .filter((dayItem) => dayItem.title || dayItem.description || dayItem.activities.length);

// Kiểm tra quyền sở hữu dịch vụ hoặc quyền admin.
const isOwnerOrAdmin = (service, user) => {
  if (!service || !user) return false;
  if (user.role === "admin") return true;
  return String(service.provider_id || "") === String(user.id || "");
};

// Lấy service ID từ body request.
const resolveServiceId = (reqBody) =>
  String(reqBody.serviceId || reqBody.service_id || "").trim();

// Kiểm tra quyền provider với một dịch vụ.
const canAccessService = (service, user) => {
  if (!service || !user) return false;
  if (user.role === "admin") return true;
  return String(service.provider_id || "") === String(user.id || "");
};

// Tạo bộ lọc dịch vụ cho provider.
const buildServiceFilter = (user) => {
  if (user?.role === "provider") {
    return { provider_id: user.id };
  }
  return {};
};

module.exports = {
  splitLines,
  parseStringArrayField,
  parseItineraryField,
  normalizeItineraryField,
  isOwnerOrAdmin,
  resolveServiceId,
  canAccessService,
  buildServiceFilter,
};


