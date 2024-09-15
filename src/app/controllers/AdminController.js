const multer = require('multer');
const XLSX = require('xlsx');
const removeAccents = require('remove-accents');
const User = require("../models/User");
const Test = require('../models/Test');
const Class = require('../models/Class');
const ClassTest = require('../models/ClassTest');

class AdminController {
    async index(req, res) {
        res.render('admin/index.hbs');
    }

    async classes(req, res) {
        const teachers = await User.find({ role: 'teacher' }).lean();
        const classes = await Class.find({}).populate('teacher').lean();
        const tests = await Test.find({}).lean();
        res.render('admin/class/classes.hbs',{
            teachers: teachers,
            classes: classes,
            tests: tests
        });
    }

    async create(req, res) {
        const {className, teacherId} = req.body;
        const newClass = await new Class({
            name: className,
            teacher: teacherId
        });
        await newClass.save();
        const teacher = await User.findById({ _id: teacherId});
        teacher.classes.push(newClass._id);
        teacher.save();
        res.redirect('back');
    }

    async delete(req, res) {
        const classId = req.params.id;
        const classToDelete = await Class.findByIdAndDelete(classId);
        const teacher = await User.findById({ _id: classToDelete.teacher });
        teacher.classes.remove(classId);
        await teacher.save();
        res.status(200).json({
            message: "Class deleted successfully",
            data: classToDelete
        });
    }

    async addTest(req, res) {
        const { test, testClass, showAnswer} = req.body;
        const classToAdd = await Class.findById({_id: testClass});
        classToAdd.tests.push(test);
        await classToAdd.save();
        await ClassTest.create({class: testClass, test, show: showAnswer});
        res.redirect('back');
    }

    async listStudentOfClass(req, res) {
        const classId = req.params.id;
        const classs = await Class.findById({ _id: classId }).populate('teacher').lean();
        const teacher = classs.teacher;
        const classInfo = await Class.findById({ _id: classId }).populate('students').lean();
        const students = classInfo.students;
        res.render('admin/class/listStudents.hbs', {
            students: students,
            classInfo: classInfo,
            teacher: teacher
        });
    }

    async listTestsOfClass(req, res) {
        const classId = req.params.id;
        const classInfo = await Class.findById({_id: classId}).populate('tests').lean();
        // console.log("=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",classInfo.tests);
        res.render('admin/class/listTests.hbs', {
            classInfo: classInfo,         
        });
    }

    async listStudentsToAdd(req, res) {
        const classId = req.params.id;
        const students = await User.find({role: 'student'}).populate('classes').lean();
        res.render('admin/class/listStudentsToAdd.hbs', {
            students: students,
            classId: classId
        });
    }

    async addStudentToClass(req, res) {
        const {studentIds} = req.body;
        const classId = req.params.id;
        try {
            const classData = await Class.findById(classId);
            if (!classData) {
                return res.status(404).send('Class not found');
            }
    
            // Kiểm tra và thêm từng học sinh vào lớp
            const addedStudents = [];
            for (const studentId of studentIds) {
                const student = await User.findById(studentId);
                if (student) {
                    classData.students.addToSet(student._id);
                    student.classes.addToSet(classData._id);
                    await student.save();
                    addedStudents.push(studentId);
                }
            }
            await classData.save();
            
            res.redirect('/admin/classes')
        } catch (error) {
            res.status(500).send('An error occurred while adding students to class');
        }
    }

    async teachers(req, res) {
        const teachers = (await User.find({ role: "teacher" }).lean());
        res.render('admin/teachers.hbs', {
            teachers: teachers
        });
    }

    async students(req, res) {
        const student = (await User.find({ role: "student" }).lean());
        res.render('admin/students2.hbs', {
            student: student
        });
    }

    async tests(req, res) {
        try {
            const tests = await Test.find({}).lean();
            // console.log("test", tests[0].questions);
            const user_role = req.user.role;
            res.render('test/tests.hbs', {
                tests: tests,
                user_role
            });
        } catch (error) {
            console.error("Error fetching tests: ", error);
            res.status(500).send('Internal Server Error');
        }
    }


    async addStudent(req, res) {
        try {
            const { name, username, password, dob } = req.body;
            const role = "student";
            // Tạo user mới
            const result = await User.create({
                name: name,
                username: username,
                password: password,
                dateOfBirth: dob,
                role: role
            });

            // console.log("result:     ", result);
            // Gửi phản hồi thành công
            res.status(201).json({
                message: "Student added successfully",
                data: result
            });
        } catch (error) {
            // Xử lý lỗi và gửi phản hồi
            console.error("Error adding student:", error);
            res.status(500).json({
                message: "Failed to add student",
                error: error.message
            });
        }
    }

    async addTeacher(req, res) {
        try {
            const { name, username, password, dob } = req.body;
            const role = "teacher";
            // Tạo user mới
            const result = await User.create({
                name: name,
                username: username,
                password: password,
                dateOfBirth: dob,
                role: role
            });

            // console.log("result:     ", result);
            // Gửi phản hồi thành công
            res.status(201).json({
                message: "Teacher added successfully",
                data: result
            });
        } catch (error) {
            // Xử lý lỗi và gửi phản hồi
            console.error("Error adding teacher:", error);
            res.status(500).json({
                message: "Failed to add teacher",
                error: error.message
            });
        }
    }

    async editStudent(req, res) {
        const student = await User.findById(req.params.id).lean();
        res.status(200).json({
            data: student
        })
    }

    async view(req, res) {
        const test = await Test.findById(req.params.id).lean();
        res.render('test/testDetail', {
            test: test
        })
    }

    async deleteTest(req, res) {
        const result = await Test.deleteOne({ _id: req.params.id })
        // res.status(200).json({
        //     message: "Test deleted successfully",
        //     data: result
        // });
        res.redirect('/admin/tests');
    }

    async editTeacher(req, res) {
        const teacher = await User.findById(req.params.id).lean();
        res.status(200).json({
            data: teacher
        })
    }

    async updateStudent(req, res) {
        try {
            const { _id, name, username, password, dob } = req.body;
            const updatedStudent = await User.findByIdAndUpdate(_id, {
                name: name,
                username: username,
                password: password,
                dateOfBirth: dob
            }, { new: true });
            res.status(200).json({
                message: "Student updated successfully",
                data: updatedStudent
            });
        } catch (error) {
            console.error("Error updating student:", error);
            res.status(500).json({
                message: "Failed to update student",
                error: error.message
            });
        }
    }

    async updateTeacher(req, res) {
        try {
            const { _id, name, username, password, dob } = req.body;
            const updatedStudent = await User.findByIdAndUpdate(_id, {
                name: name,
                username: username,
                password: password,
                dateOfBirth: dob
            }, { new: true });
            res.status(200).json({
                message: "Teacher updated successfully",
                data: updatedStudent
            });
        } catch (error) {
            console.error("Error updating teacher:", error);
            res.status(500).json({
                message: "Failed to update teacher",
                error: error.message
            });
        }
    }


    async deleteStudent(req, res) {
        const result = await User.deleteOne({ _id: req.params.id })
        res.status(200).json({
            message: "Student deleted successfully",
            data: result
        });
    }

    async deleteTeacher(req, res) {
        const result = await User.deleteOne({ _id: req.params.id, role: "teacher" })
        res.status(200).json({
            message: "Teacher deleted successfully",
            data: result
        });
    }

    async uploadStudents(req, res) {
        try {
            const file = req.file;

            if (!file) {
                return res.status(400).send('No file uploaded.');
            }

            // Đọc file Excel
            const workbook = XLSX.readFile(file.path);
            const sheet_name_list = workbook.SheetNames;
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            // console.log('data =>>>>>>>>>>>>>', data);
            function generateUsername(name, dob) {
                // Loại bỏ dấu cách và chuyển tên về dạng chữ thường
                const namePart = name.toLowerCase().replace(/ /g, '');

                // Tách ngày, tháng, năm từ dob
                const date = new Date(dob);
                const day = String(date.getDate()).padStart(2, '0'); // Lấy ngày, đảm bảo có 2 chữ số
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Lấy tháng, đảm bảo có 2 chữ số
                const year = date.getFullYear(); // Lấy năm

                // Tạo username bằng cách kết hợp tên với ngày, tháng, năm
                const username = `${namePart}${day}${month}${year}`;

                return username;
            }
            // Xử lý dữ liệu và lưu vào database
            for (const row of data) {
                const student = new User({
                    name: row["Họ tên"],  // 'ten' là tên cột trong file Excel
                    username: generateUsername(removeAccents(row["Họ tên"]).toLowerCase().replace(/ /g, ''), row["Ngày sinh"]), // Tạo tên tài khoản từ tên
                    password: "123456",
                    dateOfBirth: new Date(row["Ngày sinh"]), // 'ngay_sinh' là tên cột trong file Excel
                    role: "student"
                });

                await student.save(); // Lưu vào database
            }

            res.status(200).json({
                message: "Students uploaded successfully"
            })
        } catch (err) {
            console.error(err);
            res.status(500).send('Error processing file.');
        }
    }
}

module.exports = new AdminController();