const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/schedule.controller.js");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middlewares.js");

const CheckProvider = [verifyToken, authorizeRoles("provider")];

router.post("/add", CheckProvider, scheduleController.registerSchedule);
router.get("/getServiceList", CheckProvider, scheduleController.getServiceList);
router.get("/all", CheckProvider, scheduleController.getAllSchedules);
router.get("/service/:serviceId", scheduleController.getSchedulesByService);
router.put("/update/:id", CheckProvider, scheduleController.updateOne);
router.delete("/delete/:id", CheckProvider, scheduleController.deleteOne);

module.exports = router;
