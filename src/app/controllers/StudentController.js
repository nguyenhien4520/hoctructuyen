const User = require("../models/User");
const Test = require('../models/Test');
const Class = require('../models/Class');
const Result = require('../models/Result');
const ClassTest = require("../models/ClassTest");


class StudentController {
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
            res.render('student/index.hbs', { user });
        } catch (error) {
            next(error);
        }
    }

    async test(req, res, next) {
        try {
            const testId = req.params.id;
            const { user } = req;
            const classId = user.classes[0]._id;
            const test = await Test.findById(testId).lean();
            const showAnswer = await ClassTest.findOne({class: classId, test: test._id  }).lean();
            if (showAnswer) {
                const show = showAnswer.show
                res.render('student/test.hbs', { test, show });
            }
            else {
                res.render('student/test.hbs', { test });
            }
        } catch (error) {
            next(error);
        }

    }

    async submitTest(req, res, next) {
        try {
            let { answers, testId } = req.body;
            const { user } = req;
            answers = answers.map(answer => {
                if (Array.isArray(answer)) {
                    return answer.find(val => val !== '') || undefined;
                }
                return answer === '' ? undefined : answer;
            });

            const test = await Test.findById({ _id: testId }).lean();
            const numQuestions = test.questions.length;
            const offset = 10 / numQuestions;
            let score = 0;
            let corrects = [];
            let resultAnswers = [];
            // lấy ra các đáp án đúng của bài test push vào mảng corects
            let questions = test.questions
            questions.forEach((question, qIndex) => {
                let options = question.options
                options.forEach((opt, indext) => {
                    if (opt.isCorrect) {
                        corrects.push(indext);
                    }
                })
            })
            // tính điểm
            test.questions.forEach((question, qIndex) => {
                let isCorrect = false;
                let userAnswer = answers[qIndex];
                if (userAnswer !== undefined) {
                    if (question.options[userAnswer].isCorrect) {
                        score += offset;
                        isCorrect = true;
                    }
                    resultAnswers.push({
                        questionIndex: qIndex,
                        userSelectedOption: parseInt(userAnswer),
                        correctAnswer: corrects[qIndex],
                        isCorrect: isCorrect
                    })
                } else {
                    resultAnswers.push({
                        questionIndex: qIndex,
                        userSelectedOption: parseInt(userAnswer),
                        correctAnswer: corrects[qIndex],
                        isCorrect: false
                    })
                }

            });
            score = Math.round(score * 10) / 10;

            let result = {
                student: user._id,
                test: testId,
                class: user.classes[0],
                score: score,
                resultAnswers: resultAnswers
            }
            const newResult = await Result.create(result)
            res.status(201).json({
                message: 'Test submitted successfully',
                corrects,
                score: score,
            })
        } catch (error) {
            console.error(error)
        }

    }

}

module.exports = new StudentController();
