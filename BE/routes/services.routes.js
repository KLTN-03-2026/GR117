const express = require("express");
const router = express.Router();

const servicesController = require("../controllers/services.controller.js");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middlewares.js");
const upload = require("../middlewares/serviceUploads.js");

const CheckProvider = [verifyToken, authorizeRoles("provider")];
const serviceFilesUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "itineraryFile", maxCount: 1 },
]);

router.post("/add", CheckProvider, serviceFilesUpload, servicesController.addServices);
router.put("/put/:id", CheckProvider, serviceFilesUpload, servicesController.putServices);
router.patch("/patch/:id", CheckProvider, serviceFilesUpload, servicesController.patchServices);
router.get("/detail/:id", servicesController.servicesDetail);
router.get("/all", CheckProvider, servicesController.allServices);
router.get("/public", servicesController.publicServices);
router.delete("/deleteMany", CheckProvider, servicesController.deleteServices);
router.delete("/deleteOne/:id", CheckProvider, servicesController.deleteOne);

module.exports = router;
