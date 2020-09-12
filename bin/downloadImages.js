const https = require('https');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const events = require('events');
const deleteImages = require('./deleteImages');

const pixelDirectory = path.join(__dirname, '../', 'public', 'images');
const targetDirectory = path.join(__dirname, '../', 'public', 'targetimages');
const tempDirectory = path.join(__dirname, '../', 'public', 'tempimages');

function downloadImages(imageUrls, numStart, pixelWidth, pixelHeight) {
    function downloadImage(url, count, targetImage) {
        // if(targetImage) {
        //     console.log(`Started target ${targetDirectoryLength+1}.jpg`);
        //     console.log(url);
        // }
        // else {
        //     console.log(`Started ${count}.jpg`);
        //     console.log(url);
        // }
        const file = fs.createWriteStream(path.join(tempDirectory, (targetImage ? -count : count) + ".jpg"));
        https.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                sharp(file.path)
                    .resize({
                        width: targetImage ? 7000 : pixelWidth,
                        height: targetImage ? undefined : pixelHeight
                    })
                    .toFile(
                        targetImage ?
                            path.join(targetDirectory, targetDirectoryLength+1 + ".jpg") :
                            path.join(pixelDirectory, count + ".jpg"))
                    .then(async function () {
                        // if(targetImage) {
                        //     console.log(`Finished target ${targetDirectoryLength+1}.jpg`);
                        // }
                        // else {
                        //     console.log(`Finished ${count}.jpg`);
                        // }    
                        imagesFinished++;
                        if (imagesFinished == imageUrls.length) {
                            console.log("Images downloaded");
                            await sleep(1000*3);
                            console.log("Finised sleeping: now emitting");
                            finishedEmitter.emit('finished');
                        }
                    })
                    .then(function () {
                        file.close();
                    });
            });
        });
    }
    const targetDirectoryLength = fs.readdirSync(targetDirectory).length;
    let imagesFinished = 0;
    let finishedEmitter = new events.EventEmitter();
    finishedEmitter.on('finished', () => deleteImages(tempDirectory));
    for (let i = 1; i < imageUrls.length; i++) {
        downloadImage(imageUrls[i], numStart + i - 1, false);
    }
    downloadImage(imageUrls[0], numStart, true);
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

module.exports = downloadImages;


