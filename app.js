require('dotenv').config({path:'./.env'})
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('./config/db')
const User=require('./models/UserSchema')

var indexRouter = require('./routes/index');
const RecipeRouter=require('./routes/Recipes')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors({
  origin: 'https://food-recipe-frontend-ten.vercel.app',
  credentials: true
}));
app.use(
  session({
    secret: 'bahut secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 60 * 60 * 1000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
app.use('/recipes',RecipeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
