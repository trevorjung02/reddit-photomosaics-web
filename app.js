require('dotenv').config()
const express = require('express');
const redditScrape = require('./bin/redditScraper');
const photomosaicRoute = require('./api/photomosaicRoute');
const updatePhotomosaic = require('./bin/updatePhotomosaic');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const child_process = require('child_process');
const uploadImageRoute = require('./api/uploadImageRoute');

cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.API_KEY,
   api_secret: process.env.API_SECRET
});

const app = express();
// const siteUrl = 'https://www.reddit.com/r/EarthPorn/';
// const siteUrl = 'https://www.reddit.com/r/CozyPlaces/';
// const siteUrl = 'https://www.reddit.com/r/RoomPorn/';
// const siteUrl = 'https://www.reddit.com/r/LandscapePhotography/';
// const siteUrl = 'https://www.reddit.com/r/wallpaper/';

app.use('/photomosaic', photomosaicRoute);
app.use('/uploadImage', uploadImageRoute);
app.use(express.static(path.join(__dirname, 'public', 'photomosaics')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bin')));
app.use(express.static(path.join(__dirname)));

// app.use('/search', function (req, res, next) {
//    let worker = child_process.spawn(
//       'node',
//       ['bin/updatePhotomosaicTask.js', null, true],
//       { stdio: 'inherit' }
//    );
//    // worker.stdout.on('data', function (data) {
//    //     console.log(data);
//    // });
//    // updatePhotomosaic();
//    res.status(200).sendFile(path.join(__dirname, 'public', 'home.html'));
// });

app.use('/', function (req, res, next) {
   res.status(200).sendFile(path.join(__dirname, 'public', 'home.html'));
});

module.exports = app;