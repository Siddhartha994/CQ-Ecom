var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var flash = require('express-flash');

var session = require('express-session')



var db = require('./database/index')
var indexRouter = require('./routes/indexRouter');
var userRouter = require('./routes/userRouter');
var productRouter = require('./routes/productRouter');
var cartRouter = require('./routes/cartRouter');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
db.init();

// app.use(flash())
var cors = require('cors')

app.use(cors()) // Use this after the variable declaratio
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/public/uploads')));
app.use(express.static(path.join(__dirname, '/public/javascripts')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))



app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);

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
