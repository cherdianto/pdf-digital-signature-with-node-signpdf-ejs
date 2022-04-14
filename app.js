var createError = require('http-errors');
var express = require('express');
var path = require('path');
const indexRouter = require('./routers/index');
require('dotenv').config();


var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// midware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use(function(req,res,next){
    next(createError(404));
})

module.exports = app;
