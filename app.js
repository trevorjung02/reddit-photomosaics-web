const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const redditScrape = require('./scripts/redditScraper');

const app = express();
// const siteUrl = 'https://www.reddit.com/r/EarthPorn/';
// const siteUrl = 'https://www.reddit.com/r/CozyPlaces/';
// const siteUrl = 'https://www.reddit.com/r/RoomPorn/';
// const siteUrl = 'https://www.reddit.com/r/LandscapePhotography/';
const siteUrl = 'https://www.reddit.com/r/wallpaper/';

app.use(express.static(path.join(__dirname, 'public', 'photomosaics')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// app.use('/search', function (req, res, next) {
//     redditScrape(siteUrl);  
// });

app.use('/', function (req, res, next) {
    res.status(200).sendFile(path.join(__dirname, 'public', 'home.html'));
});


module.exports = app;