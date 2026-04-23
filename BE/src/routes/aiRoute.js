const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController.js");

router.get("/recommendations", aiController.getRecommendations);

module.exports = router;
