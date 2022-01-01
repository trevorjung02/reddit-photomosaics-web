require('dotenv').config()
const http = require('http');
const express = require('express');
const path = require('path');
const child_process = require('child_process');
const fs = require('fs').promises;
const util = require('util');
const execFile = util.promisify(child_process.execFile);
const exec = util.promisify(child_process.exec);
const cloudinary = require('cloudinary').v2;

cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.API_KEY,
   api_secret: process.env.API_SECRET
});

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'redditphotos', 'photomosaics')));
app.use(express.static(path.join(__dirname)));

app.use('/', function (req, res, next) {
   res.status(200).sendFile(path.join(__dirname, 'public', 'home.html'));
});

const port = process.env.PORT || 3000;

const server = http.createServer(app);
let io = require('socket.io')(server);

app.set('socketio', io);

const inputDir = path.join("input");
const redditphotosDir = path.join("redditphotos");
const redditphotosPath = path.join(redditphotosDir, "redditphotos");
const imagesDir = path.join(redditphotosDir, "images");
const scraperPath = path.join(redditphotosDir, "Scraper", "scraper.exe");

(async function () {
   await fs.mkdir(inputDir).catch(() => { });
   await fs.mkdir(imagesDir).catch(() => { });
})();

io.on('connection', socket => {
   console.log("connected");
   socket.on('create:user', async function (img) {
      const inputDirSize = (await fs.readdir(inputDir)).length;
      const imgName = (inputDirSize + 1) + ".jpg";
      const imgPath = path.join(inputDir, imgName);
      fs.writeFile(imgPath, img)
         .then(() => {
            exec(`cd redditphotos && ./redditphotos ${path.join("..", imgPath)}`)
               .then(() => {
                  const outPath = path.join("redditphotos", "photomosaics", imgName);
                  socket.emit('send:user', outPath);
               })
               .catch((error) => {
                  console.log(error);
               });
         });
   });
   socket.on('getPhotomosaic', () => {
      const JSONPath = path.join("json", "photomosaicURL.json");
      fs.readFile(JSONPath)
         .then(res => {
            socket.emit('sendPhotomosaic', JSON.parse(res).url);
         })
         .catch((error) => {
            cloudinary.search.expression("resource_type:image AND folder:photomosaics AND filename:0")
               .execute()
               .then(result => {
                  const url = result.resources[0].secure_url;
                  socket.emit('sendPhotomosaic', url);
                  fs.writeFile(JSONPath, JSON.stringify({ url: url }));
               })
         })
   });
});

// execFile(scraperPath, ["https://old.reddit.com/r/EarthPorn/", 100, imagesDir])
//    .catch((error) => {
//       console.log(error);
//    });;

exec(`node redditphotos/Scraper/main https://old.reddit.com/r/EarthPorn/ 100 ${imagesDir}`)
   .catch((error) => {
      console.log(error);
   });;

server.listen(port, () => console.log(`Server created on port ${port}`));