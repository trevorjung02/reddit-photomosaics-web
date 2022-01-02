require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const path = require('path');
const child_process = require('child_process');
const fs = require('fs').promises;
const util = require('util');
const exec = util.promisify(child_process.exec);

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const redditphotosDir = path.join(__dirname, "..", "redditphotos");
const scraperPath = path.join(redditphotosDir, "Scraper", "main");
const imagesDir = path.join(redditphotosDir, "images");
const redditphotosPath = path.join(redditphotosDir, "redditphotos");
const imgPath = path.join(imagesDir, "0.jpg");
const outPath = path.join(redditphotosDir, "photomosaics", "0.jpg");

(async function () {
    await fs.mkdir(imagesDir).catch(() => { });
})();

exec(`node "${scraperPath}" https://old.reddit.com/r/EarthPorn/ 100 ${imagesDir}`)
    .then(() => {
        fs.chmod(redditphotosPath, 0o777)
            .then(() => {
                exec(`cd redditphotos && ./redditphotos ${path.join(imgPath)}`)
                    .then(() => {
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
