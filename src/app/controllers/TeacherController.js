const User = require("../models/User");
const Test = require('../models/Test');
const Class = require('../models/Class');
const Result = require('../models/Result');

class TeacherController{
    async index(req, res, next) {
        try {
            // Populate 'classes' và 'tests' bên trong từng 'class'
            const user = await User.findById(req.user._id)
                .populate({
                    path: 'classes',
                    populate: {
                        path: 'tests',
                        model: 'Test'
                    }
                })
                .lean();
            res.render('teacher/index.hbs', { user });
        } catch (error) {
            next(error);
        }
    }

    async test(req, res, next) {
        const testId = req.params.id;
        const {classId} = req.body;
        const testResults = await Result.find({
            class: classId,
            test: testId
        }).populate('student')
          .populate('test')
          .populate('class')
          .lean();

          res.render('teacher/resultTest.hbs', { testResults});
    }

}

module.exports = new TeacherController();