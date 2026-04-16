const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const name = String(file.originalname || "").toLowerCase();
  const allowed = name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv");

  if (allowed) {
    cb(null, true);
  } else {
    cb(new Error("Chi chap nhan file .xlsx, .xls hoac .csv"));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
