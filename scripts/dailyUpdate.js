require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const path = require('path');
const child_process = require('child_process');
const util = require('util');
const execFile = util.promisify(child_process.execFile);

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const redditphotosDir = path.join(__dirname, "..", "redditphotos");
const redditphotosPath = path.join(redditphotosDir, "redditphotos.exe");
const imgPath = path.join(redditphotosDir, "images", "0.jpg");
const outPath = path.join(redditphotosDir, "photomosaics", "0.jpg");

execFile(redditphotosPath, ["--sub=EarthPorn", imgPath])
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
    })
