const sharp = require('sharp');

async function computeAvgRGBImage(inputJpg, unitWidth, unitHeight, divisions) {
    let imageSharp = sharp(inputJpg);
    let [imageWidth, imageHeight, channels] =
        await imageSharp
            .metadata()
            .then(function (metadata) {
                return [metadata.width, metadata.height, 3];
            });
    let imageBuffer =
        await imageSharp
            .raw()
            .toBuffer();
    let imageAvgRGBs = [];

    for (let y = 0; y < imageHeight; y += unitHeight) {
        for (let x = 0; x < imageWidth; x += unitWidth) {
            let unitAverageRGBs = computeAvgRGBUnit(x, y);
            imageAvgRGBs.push(unitAverageRGBs);
        }
    }
    // console.log("End of image")
    // console.log(imageAvgRGBs);
    // return new Promise(function (resolve, reject) {
    //     resolve(imageAvgRGBs);
    // });
    return imageAvgRGBs;

    function computeAvgRGBUnit(left, top) {
        // console.log("Start unit");
        let minUnitWidth = Math.min(unitWidth, imageWidth - left);
        let minUnitHeight = Math.min(unitHeight, imageHeight - top);
        let divsionAvgRGBs = [];
        for (let y = top; y < top + minUnitHeight; y += Math.ceil(minUnitHeight / divisions)) {
            // console.log("y" + y, top + minUnitHeight);
            for (let x = left; x < left + minUnitWidth; x += Math.ceil(minUnitWidth / divisions)) {
                // console.log("x" + x, left + minUnitWidth);
                divsionAvgRGBs.push(computeAvgRGBDivision(x, y));
            }
        }
        return divsionAvgRGBs;

        function computeAvgRGBDivision(left, top) {
            let rSum = 0, gSum = 0, bSum = 0;
            for (let y = top; y < Math.floor(top + minUnitHeight / divisions); y++) {
                for (let x = left; x < Math.floor(left + minUnitWidth / divisions); x++) {
                    let pixel = y * imageWidth * channels + x * channels;
                    rSum += imageBuffer[pixel];
                    gSum += imageBuffer[pixel + 1];
                    bSum += imageBuffer[pixel + 2];
                }
            }
            return [
                rSum / (minUnitWidth * minUnitHeight) * divisions ** 2,
                gSum / (minUnitWidth * minUnitHeight) * divisions ** 2,
                bSum / (minUnitWidth * minUnitHeight) * divisions ** 2
            ];
        }
    }
    // function computeAvgRGBUnit(left, top) {
    //     let minUnitWidth = Math.min(unitWidth, imageWidth - left);
    //     let minUnitHeight = Math.min(unitHeight, imageHeight - top);
    //     let rSum = 0, gSum = 0, bSum = 0;
    //     for (let y = top; y < top + minUnitHeight; y++) {
    //         for (let x = left; x < left + minUnitWidth; x++) {
    //             let pixel = y * imageWidth * channels + x * channels;
    //             rSum += imageBuffer[pixel];
    //             gSum += imageBuffer[pixel + 1];
    //             bSum += imageBuffer[pixel + 2];
    //         }
    //     }
    //     return [
    //         rSum / (minUnitWidth * minUnitHeight),
    //         gSum / (minUnitWidth * minUnitHeight),
    //         bSum / (minUnitWidth * minUnitHeight)
    //     ];
    // }
}

module.exports = computeAvgRGBImage;