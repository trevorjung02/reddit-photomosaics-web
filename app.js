require('dotenv').config()
const http = require('http');
const express = require('express');
const redditScrape = require('./bin/redditScraper');
const photomosaicRoute = require('./api/photomosaicRoute');
const updatePhotomosaic = require('./bin/updatePhotomosaic');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const child_process = require('child_process');
const uploadImageRoute = require('./api/uploadImageRoute');
const deleteImages = require('./bin/deleteImages');
const fs = require('fs');

const userDir = path.join(__dirname, 'public', 'userimages');
cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.API_KEY,
   api_secret: process.env.API_SECRET
});

const app = express();

app.use('/photomosaic', photomosaicRoute);
app.use('/uploadImage', uploadImageRoute);
app.use(express.static(path.join(__dirname, 'public', 'photomosaics')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bin')));
app.use(express.static(path.join(__dirname)));

app.use('/', function (req, res, next) {
   res.status(200).sendFile(path.join(__dirname, 'public', 'home.html'));
});

const port = process.env.PORT || 3000;

const server = http.createServer(app);
let io = require('socket.io')(server);

app.set('socketio', io);

io.on('connection', socket => {
   console.log("connected");
   let worker;
   socket.on('create:user', function (img) {
      // console.log(img + " recieved");
      const targetDirSize = fs.readdirSync(userDir).length;
      fs.writeFileSync(path.join(userDir, (targetDirSize + 1) + ".jpg"), img);
      worker = child_process.spawn(
         'node',
         ['bin/updatePhotomosaicTask.js', path.join(userDir, (targetDirSize + 1) + ".jpg"), false, true],
         { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] }
      );
      worker.on('message', function (message) {
         deleteImages(userDir);
         console.log("app recieved: " + message);
         socket.emit('send:user', message.imagePath);
      });
   });
});

server.listen(port, () => console.log(`Server created on port ${port}`));

// onclick="window.open('userImage.html'); return false"