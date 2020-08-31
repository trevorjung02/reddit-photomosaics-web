const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

module.exports = app;