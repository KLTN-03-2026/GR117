const path = require("path");
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000;
const db = require("./src/config/connectDB.js");
const cors = require("cors");
const router = require("./src/routes/indexRoute.js");
const { ensureDefaultCategories } = require("./src/utils/ensureDefaultCategories.js");
const {
  startRecommendationCacheCronJobs,
} = require("./src/services/recommendationCacheCron.js");

// Middleware
app.use(cors());
// Provider registration sends the business license as a base64 image string,
// so we raise the JSON/body parser limit above the default 100kb.
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
router(app);

// Ket noi MongoDB
db.connectDB().then(() => {
  ensureDefaultCategories()
    .catch((error) => {
      console.error("Khong the khoi tao danh muc mac dinh:", error.message);
    })
    .finally(() => {
      startRecommendationCacheCronJobs();
      app.listen(port, () => {
        console.log(`server bat dau tren cong ${port}`);
      });
    });
});
