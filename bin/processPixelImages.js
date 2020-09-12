const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processPixelImages(directory) {
    let pixelAverageRGBs = [];
    const dir = fs.readdirSync(directory);
    for (let i = 0; i < dir.length; i++) {
        const file = (i + 1) + ".jpg";
        let image = sharp(path.join(directory, file));
        await image
            .stats()
            .then(function (stats) {
                let channels = stats.channels;
                // console.log(file);
                // console.log(channels[0].mean + " " + channels[1].mean + " " + channels[2].mean);
                pixelAverageRGBs[i] = [channels[0].mean, channels[1].mean, channels[2].mean];
                // pixelAverageRGBs[i] = i;
            })
            .catch(function (err) {
                console.log(err);
            });
    }
    // console.log(pixelAverageRGBs);
    console.log("In processPixelImages");
    fs.writeFileSync(path.join(__dirname, "pixelAverageRGBs.json"), JSON.stringify(pixelAverageRGBs));
    return;
}

module.exports = processPixelImages;