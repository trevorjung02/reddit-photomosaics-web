// Starting point of the application. Creates the webserver and scrapes 100 images. 

require('dotenv').config()
const http = require('http');
const express = require('express');
const path = require('path');
const child_process = require('child_process');
const fs = require('fs').promises;
const util = require('util');
const exec = util.promisify(child_process.exec);
const cloudinary = require('cloudinary').v2;
const { application } = require('express')

// Configure cloudinary
cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.API_KEY,
   api_secret: process.env.API_SECRET
});


const app = express();

// Static endpoints
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'redditphotos', 'photomosaics')));

// Home page
app.use('/', function (req, res, next) {
   res.status(200).sendFile(path.join(__dirname, 'public', 'home.html'));
});

const port = process.env.PORT || 3000;

const server = http.createServer(app);
let io = require('socket.io')(server);

app.set('socketio', io);

// Paths 
const inputDir = path.join(__dirname, "input");
const redditphotosDir = path.join(__dirname, "redditphotos");
const imagesDir = path.join(redditphotosDir, "images");
const scraperPath = path.join(redditphotosDir, "Scraper", "main");
const jsonDir = path.join(__dirname, "json");

// Create directories
(async function () {
   await Promise.all([fs.mkdir(inputDir), fs.mkdir(imagesDir), fs.mkdir(jsonDir)])
      .catch(() => { });
})();

// Handle connection
io.on('connection', socket => {
   console.log("connected");

   // Handle message to create a photomosaic with input img
   socket.on('create:user', async function (img) {
      // Save img to input directory, named as 1 + input directory size
      const inputDirSize = (await fs.readdir(inputDir)).length;
      const imgName = (inputDirSize + 1) + ".jpg";
      // Path of the saved image
      const imgPath = path.join(inputDir, imgName);
      fs.writeFile(imgPath, img)
         .then(() => {
            // Give permissions to execute redditphotos
            fs.chmod("redditphotos/redditphotos", 0o777)
               .then(() => {
                  // Execute redditphotos and create photomosaic
                  exec(`cd redditphotos && ./redditphotos ${path.join(imgPath)}`)
                     .then(() => {
                        // Send image name to client
                        const outPath = path.join(imgName);
                        socket.emit('send:user', outPath);
                     })
                     .catch((error) => {
                        socket.emit('send:error');
                        console.log(error);
                     });
               })
               .catch((error) => {
                  console.log(error);
               })
         })
         .catch((error) => {
            console.log(error);
         });
   });

   // Handle message to get default displayed photomosaic
   socket.on('getPhotomosaic', () => {
      // File with url to default photomosaic
      const JSONPath = path.join(jsonDir, "photomosaicURL.json");
      fs.readFile(JSONPath)
         .then(res => {
            // File exists, send the url
            socket.emit('sendPhotomosaic', JSON.parse(res).url);
         })
         .catch((error) => {
            // File doesn't exists, get url
            cloudinary.search.expression("resource_type:image AND folder:photomosaics AND filename:0")
               .execute()
               .then(result => {
                  // Send url and save it to file
                  const url = result.resources[0].secure_url;
                  socket.emit('sendPhotomosaic', url);
                  fs.writeFile(JSONPath, JSON.stringify({ url: url }));
               })
         })
   });
});

// Scrape 100 images
exec(`node ${scraperPath} https://old.reddit.com/r/EarthPorn/ 100 ${imagesDir}`)
   .catch((error) => {
      console.log(error);
   });

// Start server
server.listen(port, () => console.log(`Server created on port ${port}`));