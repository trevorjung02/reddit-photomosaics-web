// Meant to be run daily by a scheduler. Scrapes 100 images and creates a photomosaic from the first one. 
// Saves the photomosaic to Cloudinary to be used as the default photmosaic displayed on the home page.

require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const path = require('path');
const child_process = require('child_process');
const fs = require('fs').promises;
const util = require('util');
const exec = util.promisify(child_process.exec);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Paths
const redditphotosDir = path.join(__dirname, "..", "redditphotos");
const scraperPath = path.join(redditphotosDir, "Scraper", "main");
const imagesDir = path.join(redditphotosDir, "images");
const redditphotosPath = path.join(redditphotosDir, "redditphotos");
const imgPath = path.join(imagesDir, "0.jpg");
const outPath = path.join(redditphotosDir, "photomosaics", "0.jpg");

// Create directories
(async function () {
    await fs.mkdir(imagesDir).catch(() => { });
})();

// Scrape 100 images
exec(`node "${scraperPath}" https://old.reddit.com/r/EarthPorn/ 100 ${imagesDir}`)
    .then(() => {
        // Get permissions to execute redditphotos
        fs.chmod(redditphotosPath, 0o777)
            .then(() => {
                // Execute redditphotos and create photomosaic
                exec(`cd redditphotos && ./redditphotos ${path.join(imgPath)}`)
                    .then(() => {
                        // Upload photomosaic to cloudinary
                        cloudinary.uploader.upload(outPath,
                            {
                                folder: "photomosaics/",
                                public_id: "0",
                                overwrite: true
                            },
                            function (error, result) {
                                if (error) {
                                    console.log(error);
                                }
                            });
                    });
            })
            .catch((error) => {
                console.log(error);
            });
    })
    .catch((error) => {
        console.log(error);
    });
