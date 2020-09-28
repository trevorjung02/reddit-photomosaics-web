const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const computeAverageRGBs = require('./computeAverageRGBs');
const processPixelImages = require('./processPixelImages');

const inputDir = path.join(__dirname, '../', 'public', 'images');
const outputDir = path.join(__dirname, '../', 'public', 'photomosaics');

async function match(inputJpg, pixelWidth, pixelHeight, calculatePixelRGBs) {
   const image = sharp(inputJpg);
   return image
      .metadata()
      .then(async function (metadata) {
         let inputAverageRGBs = await computeAverageRGBs(inputJpg, pixelWidth, pixelHeight, 2);
         // console.log(inputAverageRGBs);
         let pixelAverageRGBs = [];
         if (calculatePixelRGBs) {
            let numFiles = fs.readdirSync(inputDir).length;
            for (let i = 0; i < numFiles; i++) {
               pixelAverageRGBs[i] =
                  await computeAverageRGBs(
                     path.join(inputDir, `${i + 1}.jpg`),
                     pixelWidth,
                     pixelHeight,
                     2
                  );
            }
            // await Promise.all(pixelAverageRGBs);
            console.log("Finished processPixelImages");
         }
         // let pixelAverageRGBs = JSON.parse(fs.readFileSync(path.join(__dirname, "pixelAverageRGBs.json")));
         console.log(`Length of pixelAverageRGBs: ${pixelAverageRGBs.length}`);
         // console.log(pixelAverageRGBs);
         let compositeImages = [];
         for (let inputPixel = 0; inputPixel < inputAverageRGBs.length; inputPixel++) {
            let min = 1000;
            let minPixel = null;
            for (let pixel = 0; pixel < pixelAverageRGBs.length; pixel++) {
               let distance = computeDistance(pixelAverageRGBs[pixel][0], inputAverageRGBs[inputPixel], 2);
               if (min > distance) {
                  min = distance;
                  minPixel = pixel;
               }
            }
            compositeImages.push({
               input: path.join(inputDir, minPixel + 1 + ".jpg"),
               top: Math.floor(inputPixel / Math.ceil(metadata.width / pixelWidth)) * pixelHeight,
               left: inputPixel % Math.ceil(metadata.width / pixelWidth) * pixelWidth,
               // premultiplied: true
               // blend: "source"
            });
         }
         // console.log(compositeImages);
         // console.log(`compositeImages length: ${compositeImages.length}`);
         return compositeImages;
         // })
         // .catch(function (err) {
         //     throw err;
         // })
      })
      .catch(function (err) {
         console.log(err);
      });
}

async function compositePhotomosaic(dest, inputBuffer, compositeImages) {
   let batchSize = 20;
   let buffer = inputBuffer;
   for (let i = 0; i < compositeImages.length / batchSize; i++) {
      buffer = await compositeHelper(buffer, compositeImages.slice(i * batchSize, Math.min((i + 1) * batchSize, compositeImages.length)));
   }
   const dir = fs.readdirSync(outputDir);
   buffer = await sharp(buffer)
      .jpeg({
         quality: 20
      })
      .toBuffer()
      .catch(function (err) {
         console.log(err);
      });
   fs.writeFileSync(dest, buffer);
   console.log("Exit compositePhotomosaic");
}

async function compositeHelper(inputBuffer, compositeImages) {
   let image = sharp(inputBuffer);
   return await image.composite(compositeImages)
      .toBuffer()
}

async function createPhotomosaic(dest, inputJpg, pixelWidth, pixelHeight) {
   let compositeImages = await match(inputJpg, pixelWidth, pixelHeight, true);
   // console.log(compositeImages);
   let metadata =
      await sharp(inputJpg)
         .metadata();
   let blankImage =
      await sharp({
         create: {
            width: metadata.width,
            height: metadata.height,
            channels: metadata.channels,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
         }
      })
         .jpeg({ quality: 1 })
         .toBuffer();
   await compositePhotomosaic(dest, blankImage, compositeImages);
   console.log("finished photomosaic");
}

function computeDistance(rgbList1, rgbList2, divisions) {
   let distance = 0;
   for (let i = 0; i < divisions ** 2; i++) {
      let divisionDistance = 0;
      for (let j = 0; j < rgbList1[0].length; j++) {
         divisionDistance += (rgbList1[i][j] - rgbList2[i][j]) ** 2;
      }
      distance += Math.sqrt(divisionDistance);
   }
   // console.log(distance / divisions ** 2);
   return distance / divisions ** 2;
}

module.exports = createPhotomosaic;