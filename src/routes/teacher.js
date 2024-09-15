const express = require('express');
const router = express.Router();
const teacherController = require('../app/controllers/TeacherController')

router.get('/',teacherController.index)
router.post ('/test/:id',teacherController.test)


module.exports = router;