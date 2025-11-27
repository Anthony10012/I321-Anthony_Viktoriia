var express = require('express');
const setupSwagger = require("./routes/swagger");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var pizzasRouter = require('./routes/pizzas');
var ingredientsRouter = require('./routes/ingredients');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/pizzas', pizzasRouter);
app.use('/ingredients', ingredientsRouter);

setupSwagger(app);

module.exports = app;
