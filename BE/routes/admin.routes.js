const express = require("express");
const router = express.Router();
const {verifyToken,authorizeRoles} = require("../middlewares/auth.middlewares.js");
const adminController = require("../controllers/admin.controller.js");
const Authorization =   [verifyToken,authorizeRoles("admin")]
router.get("/providers/pending",...Authorization,adminController.getPendingProviders,);
router.patch("/approve-provider/:id",...Authorization,adminController.approveProvider,);
router.patch("/reject-provider/:id",...Authorization,adminController.rejectProvider,);
//lấy tất cả tài khoản 
router.get("/allAccounts",  ...Authorization,adminController.getAllAccounts);
//change role
router.patch("/change-role/:id",  ...Authorization,adminController.changeUserRole);
//xóa tài khoản 
router.delete("/delete-account/:id",...Authorization,adminController.deleteAccount);
//khóa tài khoản 
router.patch("/lock-account/:id",...Authorization,adminController.lockAccount);
//mở khóa tài khoản
router.patch("/unlock-account/:id",...Authorization,adminController.unlockAccount);
//admin tạo tài khoản mới 
router.post("/add-account",...Authorization,adminController.addAccount);
module.exports = router;
