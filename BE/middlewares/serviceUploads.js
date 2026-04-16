const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safeExt = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
const allowedExcelTypes = /xlsx|xls|csv/;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mime = String(file.mimetype || "").toLowerCase();
  const isImage = allowedImageTypes.test(ext) || allowedImageTypes.test(mime);
  const isExcel = allowedExcelTypes.test(ext) || /spreadsheet|excel|csv/.test(mime);

  if (isImage || isExcel) {
    cb(null, true);
  } else {
    cb(new Error("Chi chap nhan file anh hoac Excel/CSV"));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
