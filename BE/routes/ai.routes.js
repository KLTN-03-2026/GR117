const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller.js");

router.post("/parse-service", aiController.parseServiceDraft);

module.exports = router;
