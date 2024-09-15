const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/AdminController');
const siteController = require('../app/controllers/SiteController');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });

//  begin test
router.get('/tests', adminController.tests);
router.get('/test/view/:id', adminController.view);
router.get('/test/delete/:id', adminController.deleteTest);
router.get('/test/add',siteController.home);
router.post('/test/create', siteController.create);
router.post('/test/download', siteController.download);
// end test




module.exports = router