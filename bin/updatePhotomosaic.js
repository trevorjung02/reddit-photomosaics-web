require('dotenv').config()
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const redditScraper = require('./redditScraper');
const createPhotomosaic = require('./createPhotomosaic');
const deleteImages = require('./deleteImages');
const downloadImages = require('./downloadImages');
const sharp = require('sharp');

cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.API_KEY,
   api_secret: process.env.API_SECRET
});
const siteUrls = [
   'https://old.reddit.com/r/EarthPorn',
   // 'https://old.reddit.com/r/wallpapers',
];
const inputDir = path.join(__dirname, '../', 'public', 'images');
const tempDir = path.join(__dirname, '../', 'public', 'tempimages');
const targetDir = path.join(__dirname, '../', 'public', 'targetimages');
const outputDir = path.join(__dirname, '../', 'public', 'photomosaics');


function updatePhotomosaic(imagePath, uploadToCloud) {
   return new Promise(async function (resolve, reject) {
      let functionStart = Date.now();
      deleteImages(inputDir);
      deleteImages(tempDir);
      deleteImages(targetDir);
      // deleteImages(outputDir);
      let start = Date.now();
      let promises = [];
      const targetDirSize = fs.readdirSync(targetDir).length;
      if (imagePath != 'null' && imagePath != 'undefined') {
         // console.log(`ImagePath: ${imagePath}`);
         promises.push(sharp(imagePath)
            .resize({
               width: 2500
            })
            .jpeg({ quality: 10 })
            .toFile(path.join(targetDir, (targetDirSize + 1) + ".jpg"))
            .catch(function (err) {
               console.log(err);
            }));
      }
      let images = await redditScraper(siteUrls);
      let dirSize = fs.readdirSync(inputDir).length;
      console.log(`path: ${imagePath}`);
      if (imagePath != 'null' && imagePath != 'undefined') {
         promises.push(downloadImages(images, dirSize + 1, 75, 75, false));
         await Promise.all(promises);
      }
      else {
         await downloadImages(images, dirSize + 1, 75, 75, true, targetDirSize);
      }

      let end = Date.now();
      console.log((end - start) / 1000);

      const inputJpg = path.join(targetDir, `${targetDirSize + 1}.jpg`);
      console.log(inputJpg);
      start = Date.now();
      const destPath = Date.now() + ".jpg";
      await createPhotomosaic(path.join(outputDir, destPath), inputJpg, 75, 75);
      end = Date.now();
      console.log((end - start) / 1000);
      let functionEnd = Date.now();
      if (uploadToCloud) {
         console.log("Uploading to cloudinary");
         const dirLength = fs.readdirSync(outputDir).length;
         cloudinary.uploader.upload(path.join(outputDir, destPath),
            {
               folder: "photomosaics/",
               public_id: destPath,
               overwrite: true
            },
            function (error, result) {
               console.log(result, error);
            });
      }

      console.log((functionEnd - functionStart) / 1000);
      // process.exit();
      resolve();
   });
}

function sleep(ms) {
   return new Promise(resolve => {
      setTimeout(resolve, ms);
   });
}


module.exports = updatePhotomosaic;