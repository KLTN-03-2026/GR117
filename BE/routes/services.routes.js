const express = require('express');
const router = express.Router();

const servicesController = require('../controllers/services.controller.js');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middlewares.js');
const upload = require('../middlewares/uploads.js');

// Middleware auth
const CheckProvider = [verifyToken, authorizeRoles('provider')];
const CheckPU = [verifyToken, authorizeRoles('provider', 'user')];

// Upload nhiều field

//CheckPU,
// Routes
router.post('/add',upload.single("image") , servicesController.addServices);
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file nào được upload' });
  }
  res.json({
    success: true,
    message: 'Upload thành công',
    file: req.file
  });
});

router.put('/put/:id', CheckProvider, upload.single("image"), servicesController.putServices);

router.patch('/patch/:id', CheckProvider,upload.single("image") , servicesController.patchServices);

router.get('/detail/:id',  servicesController.servicesDetail);

router.get('/all', servicesController.allServices);

router.delete('/deleteMany', CheckProvider, servicesController.deleteServices);

router.delete('/deleteOne/:id', CheckProvider, servicesController.deleteOne);

module.exports = router;