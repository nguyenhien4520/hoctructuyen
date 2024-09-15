const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const adminController = require('../app/controllers/AdminController');
const siteController = require('../app/controllers/SiteController');


router.get('/', adminController.index);

// begin class
router.get('/classes', adminController.classes);
router.post('/class/create', adminController.create)
router.post('/class/add-test', adminController.addTest)
router.get('/class/list-students/:id', adminController.listStudentOfClass)
router.get('/class/list-tests/:id', adminController.listTestsOfClass)
router.get('/class/list-students-to-add/:id', adminController.listStudentsToAdd)
router.put('/class/:id/add-students', adminController.addStudentToClass)
router.delete('/class/:id', adminController.delete)

// end class

// begin teacher
router.get('/teachers', adminController.teachers);
router.get('/teachers/:id', adminController.editTeacher);
router.put('/teachers/:id', adminController.updateTeacher);
router.post('/teachers/add', adminController.addTeacher);
router.delete('/teachers/:id', adminController.deleteTeacher);
// end teacher

// begin student
router.delete('/students/:id', adminController.deleteStudent);
router.get('/students', adminController.students);
router.post('/students/add', adminController.addStudent);
router.post('/students/upload', upload.single('file'),adminController.uploadStudents);
router.get('/students/:id', adminController.editStudent);
router.put('/students/:id', adminController.updateStudent);
//end student

//  begin test
// router.get('/tests', adminController.tests);
// router.get('/test/view/:id', adminController.view);
// router.get('/test/delete/:id', adminController.deleteTest);
// router.get('/test/add',siteController.home);
// router.post('/test/create', siteController.create);
// router.post('/test/download', siteController.download);
// end test

module.exports = router;