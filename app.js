const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

app.use('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public', 'home.html'));
});

module.exports = app;