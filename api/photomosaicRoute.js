var cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();

cloudinary.config({
    cloud_name: 'emrys',
    api_key: '948549434388226',
    api_secret: 'pOcq_60nmTk4D2I5NRm0WpiAXow'
});

router.get('/', (req, res, next) => {
    let photomosaic = JSON.parse(fs.readFileSync(path.join(__dirname, 'photomosaic.json')));
    if (Object.keys(photomosaic).length != 0 && Date.now() - Date.parse(photomosaic.resources[0].created_at) < 1000 * 60 * 60 * 24) {
        res.status(200).json({
            src: photomosaic.resources[0].url
        });
    }
    else {
        cloudinary.api.resources(function (error, result) {
            if (error) {
                console.log(error);
                res.status(500).json({
                    error
                });
            }
            else {
                console.log(JSON.stringify(result));
                fs.writeFileSync(path.join(__dirname, 'photomosaic.json'), JSON.stringify(result));
                res.status(200).json({
                    src: result.resources[0].url
                })
            }
        });
    }
});

module.exports = router;