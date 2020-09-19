require('dotenv').config()
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const redditScraper = require('./redditScraper');
const createPhotomosaic = require('./createPhotomosaic');
const deleteImages = require('./deleteImages');
const downloadImages = require('./downloadImages');

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


async function updatePhotomosaic() {
    let functionStart = Date.now();
    deleteImages(inputDir);
    deleteImages(tempDir);
    deleteImages(targetDir);
    deleteImages(outputDir);
    let start = Date.now();

    let images = await redditScraper(siteUrls);
    let dirSize = fs.readdirSync(inputDir).length;
    await downloadImages(images, dirSize + 1, 75, 75, true);

    let end = Date.now();
    console.log((end - start) / 1000);

    const dir = fs.readdirSync(targetDir);
    console.log(path.join(targetDir, dir[0]));
    const inputJpg = path.join(targetDir, dir[0]);
    // console.log(inputJpg);
    start = Date.now();
    await createPhotomosaic(inputJpg, 75, 75);
    end = Date.now();
    console.log((end - start) / 1000);
    console.log("Uploading to cloudinary");
    let functionEnd = Date.now();
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
    console.log((functionEnd - functionStart) / 1000);
    // process.exit();
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

module.exports = updatePhotomosaic;