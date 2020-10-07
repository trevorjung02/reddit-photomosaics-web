const https = require('https');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const events = require('events');
const deleteImages = require('./deleteImages');

const pixelDirectory = path.join(__dirname, '../', 'public', 'images');
const targetDirectory = path.join(__dirname, '../', 'public', 'targetimages');
const tempDirectory = path.join(__dirname, '../', 'public', 'tempimages');

async function downloadImages(imageUrls, numStart, pixelWidth, pixelHeight, downloadTarget, targetDirectoryLength) {
   function downloadImage(url, count, targetImage) {
      return new Promise(function (resolve, reject) {
         const file = fs.createWriteStream(
            path.join(tempDirectory, (targetImage ? -count : count) + ".jpg")
         );
         https.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
               sharp(file.path)
                  .resize({
                     width: targetImage ? 2500 : pixelWidth,
                     height: targetImage ? undefined : pixelHeight
                  })
                  .jpeg({ quality: 10 })
                  .toFile(
                     targetImage ?
                        path.join(targetDirectory, targetDirectoryLength + 1 + ".jpg") :
                        path.join(pixelDirectory, count + ".jpg"))
                  .then(function (info) {
                     imagesFinished++;
                     if (imagesFinished == imageUrls.length) {
                        console.log("Images downloaded");
                        deleteImages(tempDirectory)
                     }
                     resolve();
                  })
                  .then(function () {
                     file.close();
                  })
                  .catch(function (err) {
                     console.log(err);
                  });
            });
         });
      });
   }
   let imagesFinished = 0;
   let downloadPromises = [];
   downloadPromises.push(downloadImage(imageUrls[0], numStart, downloadTarget ? true : false));
   for (let i = 1; i < imageUrls.length; i++) {
      downloadPromises.push(downloadImage(imageUrls[i], downloadTarget ? numStart + i - 1 : numStart + i, false));
   }
   await Promise.all(downloadPromises);
}

function sleep(ms) {
   return new Promise(resolve => {
      setTimeout(resolve, ms);
   });
}

module.exports = downloadImages;


