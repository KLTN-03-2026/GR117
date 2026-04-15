const express = require("express");
const router = express.Router();

const servicesController = require("../controllers/services.controller.js");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middlewares.js");
const upload = require("../middlewares/uploads.js");

const CheckProvider = [verifyToken, authorizeRoles("provider")];

router.post("/add", CheckProvider, upload.single("image"), servicesController.addServices);
router.put("/put/:id", CheckProvider, upload.single("image"), servicesController.putServices);
router.patch("/patch/:id", CheckProvider, upload.single("image"), servicesController.patchServices);
router.get("/detail/:id", servicesController.servicesDetail);
router.get("/all", CheckProvider, servicesController.allServices);
router.get("/public", servicesController.publicServices);
router.delete("/deleteMany", CheckProvider, servicesController.deleteServices);
router.delete("/deleteOne/:id", CheckProvider, servicesController.deleteOne);

module.exports = router;
