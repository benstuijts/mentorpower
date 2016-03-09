'use strict';

const http          = require('http');
const express       = require('express');

const app           = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use('/', require('./routes/routes'));


app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
