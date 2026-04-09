const express = require('express');
const router = express.Router();

const servicesController = require('../controllers/services.controller.js');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middlewares.js');
const upload = require('../middlewares/uploads.js');

// Middleware auth
const CheckProvider = [verifyToken, authorizeRoles('provider')];
const CheckPU = [verifyToken, authorizeRoles('provider', 'user')];


router.post('/add',verifyToken, authorizeRoles('provider'), upload.single('image'), servicesController.addServices);


router.put('/put/:id', CheckProvider, upload.single('image'), servicesController.putServices);

router.patch('/patch/:id', CheckProvider, upload.single('image'), servicesController.patchServices);

router.get('/detail/:id',  servicesController.servicesDetail);

router.get('/all', servicesController.allServices);

router.delete('/deleteMany', CheckProvider, servicesController.deleteServices);

router.delete('/deleteOne/:id', CheckProvider, servicesController.deleteOne);
//lay du lieu service theo provider
    router.get('/my-services', CheckProvider, servicesController.getMyServices);
module.exports = router;