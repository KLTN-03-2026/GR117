const path = require("path");
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000;
const db = require("./src/config/connectDB.js");
const cors = require("cors");
const router = require("./src/routes/indexRoute.js");

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
router(app);

// Ket noi MongoDB
db.connectDB().then(() => {
  app.listen(port, () => {
    console.log(`server bat dau tren cong ${port}`);
  });
});
