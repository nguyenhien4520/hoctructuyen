const express = require('express');
const morgan = require('morgan');
const app = express();
const port = 3000;
const handlebars = require('express-handlebars');
const path = require('path');
const passport = require('./app/middlewares/passport');
const route = require('./routes');
const db = require('./config/db');
const { format } = require('date-fns');
const methodOverride = require('method-override');
const CookieParser = require('cookie-parser');
const sortMiddleware = require('./app/middlewares/sortMiddleWares');
// Morgan
// app.use(morgan('combined'));

//connect to db
db.connection()

app.use(morgan('dev'));
app.use(CookieParser());
app.use(methodOverride('_method'))


app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
//My middleware(sortMiddleware)
app.use(sortMiddleware)
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
});

//Template engine
app.engine('hbs', handlebars.engine(
    {
        extname: '.hbs',
        helpers: {
            myLookup: (obj, key) =>{return obj && obj[key];},
            sum: (a, b) => a + b,
            optionLetter: (value) => {
                const letters = ['A', 'B', 'C', 'D'];
                return letters[value] || value;
            },
            formatDate: (date, formatString) => format(date, formatString),
            sortable: (field, sort) => {
                const sortType = field === sort.column ? sort.type : "default";
                const icons = {
                    default: 'fa fa-sort',
                    asc: 'fa fa-sort-amount-desc',
                    desc: 'fa fa-sort-amount-asc',
                };

                const types = {
                    default: 'desc',
                    asc: 'desc',
                    desc: 'asc',
                }
                const icon = icons[sortType];
                const type = types[sortType];

                return `<a href="?_sort&column=${field}&type=${type}">
                <i class="${icon}"></i>
                </a>`;

            }
        }

    }
));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

route(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
