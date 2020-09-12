const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const computeAverageRGBs = require('./computeAverageRGBs');
const processPixelImages = require('./processPixelImages');

const inputDir = path.join(__dirname, '../', 'public', 'images');
const outputDir = path.join(__dirname, '../', 'public', 'photomosaics');

// const inputJpg = 'C:/Users/trevo/Code/Projects/top-photo-mosaic/public/targetimages/resizeddda910d-fb050930-a90c-4670-bd34-262b38aaaac4.jpg';
// const inputJpg = 'C:/Users/trevo/Code/Projects/top-photo-mosaic/public/targetimages/resizedgoogle2.0.0.jpg';
// const inputJpg = 'C:/Users/trevo/Code/Projects/top-photo-mosaic/public/targetimages/resizedheliod-sun-crowned_thb_2560x1600_wallpaper.jpg';

async function match(inputJpg, pixelWidth, pixelHeight, calculatePixelRGBs) {
    const image = sharp(inputJpg);
    return image
        .metadata()
        .then(async function (metadata) {
            return image
                .raw()
                .toBuffer()
                .then(async function (data) {
                    let inputAverageRGBs = computeAverageRGBs(data, metadata.width, metadata.height, 3,
                        pixelWidth, pixelHeight);
                    if (calculatePixelRGBs) {
                        await processPixelImages(inputDir);
                        console.log("Finished processPixelImages");
                    }
                    let pixelAverageRGBs = JSON.parse(fs.readFileSync(path.join(__dirname, "pixelAverageRGBs.json")));
                    console.log(`Length of pixelAverageRGBs: ${pixelAverageRGBs.length}`);
                    let compositeImages = [];
                    for (let inputPixel = 0; inputPixel < inputAverageRGBs.length; inputPixel++) {
                        let min = 500;
                        let minPixel = null;
                        for (let pixel = 0; pixel < pixelAverageRGBs.length; pixel++) {
                            let distance = computeDistance(pixelAverageRGBs[pixel], inputAverageRGBs[inputPixel]);
                            if (min > distance) {
                                min = distance;
                                minPixel = pixel;
                            }
                        }
                        compositeImages.push({
                            input: path.join(inputDir, minPixel + 1 + ".jpg"),
                            top: Math.floor(inputPixel / Math.ceil(metadata.width / pixelWidth)) * pixelHeight,
                            left: inputPixel % Math.ceil(metadata.width / pixelWidth) * pixelWidth,
                            // blend: "source"
                        });
                    }
                    console.log(`compositeImages length: ${compositeImages.length}`);
                    return compositeImages;
                })
                .catch(function (err) {
                    throw err;
                })
        })
        .catch(function (err) {
            console.log(err);
        });
}

async function compositePhotomosaic(inputBuffer, compositeImages) {
    let batchSize = 120;
    let buffer = inputBuffer;
    for (let i = 0; i < compositeImages.length / batchSize; i++) {
        // console.log("Enter for");
        buffer = await compositeHelper(buffer, compositeImages.slice(i * batchSize, Math.min((i + 1) * batchSize, compositeImages.length)));
        // console.log("Exit for");
    }
    const dir = fs.readdirSync(outputDir);
    buffer = await sharp(buffer)
        .jpeg({
            quality: 30
        })
        .toBuffer()
        .catch(function (err) {
            console.log(err);
        });
    fs.writeFileSync(path.join(outputDir, (dir.length + 1) + ".jpg"), buffer);
    console.log("Exit compositePhotomosaic");
}

async function compositeHelper(inputBuffer, compositeImages) {
    let image = sharp(inputBuffer);
    // console.log("Enter helper");
    return await image.composite(compositeImages)
        .toBuffer()
}

async function createPhotomosaic(inputJpg, pixelWidth, pixelHeight) {
    let compositeImages = await match(inputJpg, pixelWidth, pixelHeight, true);
    // console.log(compositeImages);
    // let image = sharp(inputJpg);
    // let inputBuffer = await image
    //     .metadata()
    //     .then(function (metadata) {
    //         return sharp({
    //             create: {
    //                 width: metadata.width,
    //                 height: metadata.height,
    //                 channels: 3,
    //                 background: { r: 0, g: 0, b: 0 }
    //             }
    //         })
    //             .jpeg()
    //             .toBuffer();
    //     })
    await compositePhotomosaic(inputJpg, compositeImages);
    console.log("finished photomosaic");
}

function computeDistance(rgb1, rgb2) {
    let distance = 0;
    for (let i = 0; i < rgb1.length; i++) {
        distance += (rgb1[i] - rgb2[i]) ** 2;
    }
    return Math.sqrt(distance);
}

module.exports = createPhotomosaic;