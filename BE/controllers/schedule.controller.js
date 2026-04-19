const Schedule = require("../models/schedule.js");
const Service = require("../models/services.js");
const XLSX = require("xlsx");
const {
  resolveServiceId,
  canAccessService,
  buildServiceFilter,
} = require("../utils/serviceHelpers.js");

const ALLOWED_STATUS = ["open", "full", "closed"];

const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const normalizeDateKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseExcelDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }

  const text = String(value || "").trim();
  if (!text) return null;

  const normalized = text.includes("/") ? text.replace(/\//g, "-") : text;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const getRowValue = (row, keys) => {
  const map = new Map(
    Object.entries(row || {}).map(([key, value]) => [normalizeKey(key), value]),
  );

  for (const key of keys) {
    const value = map.get(normalizeKey(key));
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return "";
};

const buildServiceLookup = async (req) => {
  const filter = buildServiceFilter(req.user);
  const services = await Service.find(filter).select("_id serviceName");

  const byId = new Map();
  const byName = new Map();

  for (const service of services) {
    const id = String(service._id);
    const name = String(service.serviceName || "").trim().toLowerCase();

    byId.set(id, service);
    if (name && !byName.has(name)) {
      byName.set(name, service);
    }
  }

  return { byId, byName };
};

// Tạo lịch khởi hành.
module.exports.registerSchedule = async (req, res) => {
  try {
    const { departureDate, endDate, maxPeople, note, status } = req.body;
    const normalizedServiceId = resolveServiceId(req.body);

    if (!normalizedServiceId || !departureDate || !endDate || !maxPeople) {
      return res.status(400).json({ message: "Thieu du lieu" });
    }

    const depDate = new Date(departureDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (depDate < today || end < today) {
      return res.status(400).json({ message: "Khong duoc chon ngay trong qua khu" });
    }

    if (end < depDate) {
      return res.status(400).json({ message: "Ngay ve phai sau ngay di" });
    }

    if (status && !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: "Trang thai khong hop le" });
    }

    const service = await Service.findById(normalizedServiceId);
    if (!service) {
      return res.status(404).json({ message: "Service khong ton tai" });
    }

    if (!canAccessService(service, req.user)) {
      return res.status(403).json({ message: "Ban khong co quyen tao lich cho dich vu nay" });
    }

    const newSchedule = await Schedule.create({
      service_id: service._id,
      departureDate: depDate,
      endDate: end,
      maxPeople: Number(maxPeople),
      bookedSlots: 0,
      status: status || "open",
      note,
    });

    return res.status(201).json({
      success: true,
      message: "Them lich thanh cong",
      data: newSchedule,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
// Lấy danh sách dịch vụ cho form lịch.
module.exports.getServiceList = async (req, res) => {
  try {
    const filter = buildServiceFilter(req.user);
    const services = await Service.find(filter).select("_id serviceName location region provider_id");

    return res.json({
      success: true,
      data: services,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Lấy lịch theo dịch vụ.
module.exports.getSchedulesByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service khong ton tai" });
    }

    if (req.user && req.user.role === "provider" && !canAccessService(service, req.user)) {
      return res.status(403).json({ message: "Ban không có quyền xem lịch này " });
    }

    const schedules = await Schedule.find({ service_id: serviceId }).sort({
      departureDate: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả lịch.
module.exports.getAllSchedules = async (req, res) => {
  try {
    // 1. Lọc service theo user
    const serviceFilter = buildServiceFilter(req.user);

    // 2. Lấy danh sách service
    const services = await Service.find(serviceFilter).select("_id");

    // ❌ KHÔNG dùng String(_id)
    // const serviceIds = services.map(item => String(item._id));

    // ✅ Đúng: giữ nguyên ObjectId
    const serviceIds = services.map((item) => item._id);

    // 3. Query schedules
    const query =
      req.user?.role === "provider"
        ? { service_id: { $in: serviceIds } }
        : {};

    const schedules = await Schedule.find(query).sort({
      departureDate: 1,
      createdAt: -1,
    });

    // 4. Response
    return res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (err) {
    console.error("Lỗi getAllSchedules:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

// Cập nhật lịch.
module.exports.updateOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { departureDate, endDate, maxPeople, note, status } = req.body;
    const normalizedServiceId = resolveServiceId(req.body);

    if (!normalizedServiceId || !departureDate || !endDate || !maxPeople) {
      return res.status(400).json({ message: "Thiếu dữ liệu " });
    }

    const depDate = new Date(departureDate);
    const end = new Date(endDate);

    if (Number.isNaN(depDate.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: "Ngày không hợp lệ " });
    }

    if (end < depDate) {
      return res.status(400).json({ message: "Ngay về phải sau ngày đi " });
    }

    if (status && !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ " });
    }

    const service = await Service.findById(normalizedServiceId);
    if (!service) {
      return res.status(404).json({ message: "Service không tồn tại " });
    }

    if (!canAccessService(service, req.user)) {
      return res.status(403).json({ message: "Ban không có quyền nhận lịch này " });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Lịch trình không tồn tại",
      });
    }

    schedule.service_id = service._id;
    schedule.departureDate = depDate;
    schedule.endDate = end;
    schedule.maxPeople = Number(maxPeople);
    schedule.note = note;

    if (status) {
      schedule.status = status;
    }

    await schedule.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật lịch thành công ",
      data: schedule,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Loi server",
      error: error.message,
    });
  }
};

// Xóa lịch.
module.exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule khong ton tai",
      });
    }

    const service = await Service.findById(schedule.service_id);
    if (!canAccessService(service, req.user)) {
      return res.status(403).json({ message: "Ban khong co quyen xoa lich nay" });
    }

    await Schedule.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Xóa lịch thành công ",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Loi server",
      error: error.message,
    });
  }
};

// Import lich tu Excel/CSV.
module.exports.importSchedulesFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui long chon file Excel" });
    }

    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
      cellDates: true,
    });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return res.status(400).json({ message: "File Excel khong co du lieu" });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      blankrows: false,
    });

    if (!rows.length) {
      return res.status(400).json({ message: "File Excel khong co dong nao de import" });
    }

    const { byId, byName } = await buildServiceLookup(req);
    const existingSchedules = await Schedule.find({})
      .select("service_id departureDate")
      .lean();
    const existingKeys = new Set(
      existingSchedules.map(
        (item) => `${String(item.service_id)}-${normalizeDateKey(item.departureDate)}`,
      ),
    );
    const seenKeys = new Set();
    const imported = [];
    const errors = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let index = 0; index < rows.length; index += 1) {
      const rowNumber = index + 2;
      const row = rows[index];
      const serviceIdRaw = getRowValue(row, ["serviceId", "service_id"]);
      const serviceNameRaw = getRowValue(row, ["serviceName", "service_name"]);
      const departureRaw = getRowValue(row, ["departureDate", "departure_date"]);
      const endRaw = getRowValue(row, ["endDate", "end_date"]);
      const maxPeopleRaw = getRowValue(row, ["maxPeople", "max_people"]);
      const note = String(getRowValue(row, ["note"]) || "").trim();
      const statusRaw = String(getRowValue(row, ["status"]) || "open")
        .trim()
        .toLowerCase();

      const rowErrors = [];
      let service = null;

      if (serviceIdRaw) {
        service = byId.get(String(serviceIdRaw).trim()) || null;
      }

      if (!service && serviceNameRaw) {
        service = byName.get(String(serviceNameRaw).trim().toLowerCase()) || null;
      }

      if (!service) {
        rowErrors.push("Khong tim thay service phu hop");
      }

      const departureDate = parseExcelDate(departureRaw);
      const endDate = parseExcelDate(endRaw);

      if (!departureDate) {
        rowErrors.push("Ngay di khong hop le");
      }

      if (!endDate) {
        rowErrors.push("Ngay ve khong hop le");
      }

      if (departureDate && departureDate < today) {
        rowErrors.push("Ngay di khong duoc o qua khu");
      }

      if (endDate && endDate < today) {
        rowErrors.push("Ngay ve khong duoc o qua khu");
      }

      if (departureDate && endDate && endDate < departureDate) {
        rowErrors.push("Ngay ve phai sau ngay di");
      }

      const maxPeople = Number(maxPeopleRaw);
      if (!Number.isFinite(maxPeople) || maxPeople <= 0) {
        rowErrors.push("So cho toi da khong hop le");
      }

      if (statusRaw && !ALLOWED_STATUS.includes(statusRaw)) {
        rowErrors.push("Trang thai khong hop le");
      }

      const departureKey = departureDate ? normalizeDateKey(departureDate) : "";
      const duplicateKey = service ? `${String(service._id)}-${departureKey}` : "";

      if (duplicateKey && seenKeys.has(duplicateKey)) {
        rowErrors.push("Dong nay bi trung ngay di trong file");
      }

      if (duplicateKey && existingKeys.has(duplicateKey)) {
        rowErrors.push("Lich nay da ton tai trong he thong");
      }

      if (rowErrors.length) {
        errors.push({
          row: rowNumber,
          errors: rowErrors,
        });
        continue;
      }

      seenKeys.add(duplicateKey);
      imported.push({
        service_id: service._id,
        departureDate,
        endDate,
        maxPeople,
        bookedSlots: 0,
        status: statusRaw || "open",
        note,
      });
    }

    if (!imported.length) {
      return res.status(400).json({
        success: false,
        message: "Khong co dong nao hop le de import",
        data: { errors },
      });
    }

    const created = await Schedule.insertMany(imported);

    return res.status(200).json({
      success: true,
      message: `Da import ${created.length} dong${errors.length ? `, ${errors.length} dong loi` : ""}`,
      data: {
        importedCount: created.length,
        errorCount: errors.length,
        errors,
        schedules: created,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
