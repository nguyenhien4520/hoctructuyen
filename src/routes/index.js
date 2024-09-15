
const siteRouter = require('./site');
const adminRouter = require('./admin');
const studentRouter = require('./student');
const teacherRouter = require('./teacher');
const testRouter = require('./test');
const {authorize} = require('../app/middlewares/authorize');

function route(app) {

    app.use('/', siteRouter);

    app.use('/admin',authorize('admin'), adminRouter);

    app.use('/teacher', authorize('teacher'), teacherRouter);

    app.use('/student',authorize('student'), studentRouter);

    app.use('/test_managements',authorize(['admin','teacher']), testRouter);

}

module.exports = route;
