require('dotenv').config()
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const redditScraper = require('./redditScraper');
const createPhotomosaic = require('./createPhotomosaic');
const deleteImages = require('./deleteImages');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
const siteUrls = [
    'https://www.reddit.com/r/wallpaper/',
    'https://www.reddit.com/r/EarthPorn/',
];
const inputDir = path.join(__dirname, '../', 'public', 'images');
const tempDir = path.join(__dirname, '../', 'public', 'tempimages');
const targetDir = path.join(__dirname, '../', 'public', 'targetimages');
const outputDir = path.join(__dirname, '../', 'public', 'photomosaics');


async function updatePhotomosaic() {
    deleteImages(inputDir);
    deleteImages(tempDir);
    deleteImages(targetDir);
    deleteImages(outputDir);
    for (let i = 0; i < siteUrls.length; i++) {
        await redditScraper(siteUrls[i]);
        await sleep(10 * 1000);
    }
    const dir = fs.readdirSync(targetDir);
    const inputJpg = path.join(targetDir, dir[0]);
    // console.log(inputJpg);
    await createPhotomosaic(inputJpg, 75, 75);
    console.log("Uploading to cloudinary");
    const dirLength = fs.readdirSync(outputDir).length;
    cloudinary.uploader.upload(path.join(outputDir, dirLength + ".jpg"),
        {
            folder: "photomosaics/",
            public_id: dirLength,
            overwrite: true
        },
        function (error, result) {
            console.log(result, error);
        });
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

module.exports = updatePhotomosaic;