const express  = require('express');
const router = express.Router();
const {authorize} = require('../app/middlewares/authorize');
const studentController = require('../app/controllers/StudentController')
const multer = require('multer');
const upload = multer();

router.get('/', studentController.index)
router.get('/test/:id', studentController.test)
router.post('/test/submit-test',upload.none(), studentController.submitTest)

module.exports = router;
