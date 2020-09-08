const https = require('https');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const events = require('events');
const deleteImages = require('./deleteImages');

const directory = path.join(__dirname, 'public', 'images');
const tempDirectory = path.join(__dirname, 'public', 'tempimages');

function downloadImages(imageUrls, numStart, pixelWidth, pixelHeight) {
    function downloadImage(url, count) {
        // console.log(`Started ${count}.jpg`);
        const file = fs.createWriteStream(path.join(tempDirectory, count + ".jpg"));
        https.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                sharp(file.path)
                    .resize(pixelWidth, pixelHeight)
                    .toFile(path.join(directory, count + ".jpg"))
                    .then(function () {
                        // console.log(`Finished ${count}.jpg`);
                        imagesFinished++;
                        if(imagesFinished == imageUrls.length) {
                            console.log("Images downloaded");
                            finishedEmitter.emit('finished');
                        }
                    })
                    .then(function () {
                        file.close();
                    });
            });
        });
    }
    let imagesFinished = 0;
    let finishedEmitter = new events.EventEmitter();
    finishedEmitter.on('finished', () => deleteImages(tempDirectory));
    for(let i = 0; i < imageUrls.length; i++) {
        downloadImage(imageUrls[i], numStart+i);
    }
}

module.exports = downloadImages;


