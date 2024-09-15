

const html_to_docx = require('html-to-docx');
const OpenAI = require("openai");
const Test = require('../models/Test');
const User = require('../models/User');
const { text } = require('express');
const JWT = require('jsonwebtoken');
require('dotenv').config();


const openai = new OpenAI({
    apiKey: process.env.KEY
});
    async function taoQuiz(question) {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: question }],
            model: "gpt-4o-mini",
        });
        return completion.choices[0].message.content;
    }


function parseQuestions(input) {
    try {
        const lines = input.split('\n').filter(line => line.trim() !== '');
        const questions = []; // Danh sách câu hỏi
        let currentQuestion = null;
        let currentAnswer = null;

        for (const line of lines) {
            if (/^\d+\./.test(line)) { // Dòng bắt đầu bằng số, là câu hỏi
                if (currentQuestion) {
                    // Gán đáp án đúng
                    if (currentAnswer && currentQuestion.options.length > 0) {
                        const correctOption = currentQuestion.options.find(option => option.text.startsWith(currentAnswer));
                        if (correctOption) correctOption.isCorrect = true;
                    }
                    questions.push(currentQuestion);
                }
                currentQuestion = {
                    // text: line.substring(line.indexOf('.') + 1).trim(), // Nội dung câu hỏi
                    text: `Câu ${line.trim()}`,
                    options: [] // Danh sách các tùy chọn
                };
                currentAnswer = null; // Reset đáp án
            }
            if (/^[A-D]\./.test(line)) { // Dòng bắt đầu bằng A., B., C., D. là các tùy chọn
                if (currentQuestion) {
                    currentQuestion.options.push({
                        text: line.substring(0).trim(),
                        isCorrect: false // Mặc định không đúng
                    });
                }
            }
            if (/^\*\*True: [A-D]\*\*/.test(line)) { // Dòng chứa đáp án đúng
                currentAnswer = line.match(/[A-D]/)[0]; // Lấy ký tự đại diện đáp án
            }
        }

        if (currentQuestion) {
            // Gán đáp án đúng cho câu hỏi cuối cùng
            if (currentAnswer && currentQuestion.options.length > 0) {
                const correctOption = currentQuestion.options.find(option => option.text.startsWith(currentAnswer));
                if (correctOption) correctOption.isCorrect = true;
            }
            questions.push(currentQuestion);
        }

        return {
            questions: questions
        };
    } catch (error) {
        console.error("Đã xảy ra lỗi khi phân tích câu hỏi:", error);
        return {
            questions: []
        };
    }
}


async function saveTestToDB(data) {
    const test = new Test(data);
    await test.save();
}


class SiteController {
    //[GET method] /home

    home(req, res, next) {
        // res.render('home');
        res.render('home');
    }


    async create(req, res) {
        const { topic, subject, type, numQuestions, difficulty, grade, description, answer } = req.body;

        let stringQuestion;
        let da = '**True: D**';
        if (answer == '') {
            da = '';
        } else {
            da = '**True: D**';
        }
        if (description === "") {
            stringQuestion = `Hãy tạo cho tôi bài tập môn ${subject} lớp ${grade} loại bài tập ${type} gồm ${numQuestions} câu hỏi với độ khó là ${difficulty} mỗi câu hỏi được viết trên một dòng, ${answer} theo định dạng sau: 2. Số nào dưới đây không phải là số tự nhiên?
A. 0
B. 5
C. 10
D. -3
${da}`;
        } else {
            stringQuestion = `Hãy tạo cho tôi bài tập môn ${subject} lớp ${grade} loại bài tập ${type} gồm ${numQuestions} câu hỏi với độ khó là ${difficulty} cùng một số mô tả sau: ${description} mỗi câu hỏi được viết trên một dòng, ${answer} theo định dạng sau: 2. Số nào dưới đây không phải là số tự nhiên?
A. 0
B. 5
C. 10
D. -3
${da}`;
        }

        try {
            let result = await taoQuiz(stringQuestion);
            console.log(result);
            if (type == 'Trắc nghiệm' && answer != '') {
                try {
                    const data = parseQuestions(result);
                    data.title = topic;
                    data.subject = subject;
                    data.type = type;
                    data.numberQuestion = numQuestions;
                    data.grade = grade;
                    await saveTestToDB(data);
                } catch (e) {
                    console.error('Error parsing questions:', e);
                }
            }

            res.json({ result });
        } catch (error) {
            res.status(500).json({ error: 'Error generating quiz' });
        }
    }

    async download(req, res) {
        const htmlContent = req.body.htmlContent;

        try {
            const docxBuffer = await html_to_docx(htmlContent, null, {
                table: { row: { cantSplit: true } },
                footer: true,
            });

            const fileName = 'Bai_tap.docx';
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.send(docxBuffer);
        } catch (error) {
            console.error('Error generating document:', error);
            res.status(500).send('Error generating document');
        }
    }

    async signin(req, res) {
        res.render('signin')
    }

    async handleSignin(req, res) {
        const { username, password } = req.body;
        try {
            const foundUser = await User.findOne({ username: username }).lean();
            if (!foundUser) {
                return res.status(401).json({ error: 'Tài khoản không tồn tại' })
            }
            if (password !== foundUser.password) {
                return res.status(401).json({ error: 'Thông tin đăng nhập không đúng' })
            }
            const token = JWT.sign({ id: foundUser._id }, 'mk', { expiresIn: '1h' });
            res.cookie('jwt', token, { httpOnly: true, secure: false });
            if (foundUser.role === 'admin') {
                return res.redirect('/admin');
            } else if (foundUser.role === 'teacher') {
                return res.redirect('/teacher');
            } else {
                res.redirect('/student')
            }
        } catch (error) {
            res.status(500).json({ error: error })
        }
    }

    async logout(req, res, next) {
        res.clearCookie('jwt');
        res.redirect('/');
    }
}

module.exports = new SiteController();
