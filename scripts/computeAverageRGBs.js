function computeAverageRGB(imageBuffer, imageWidth, imageHeight, channels, left, top, width, height) {
    width = Math.min(width, imageWidth - left);
    height = Math.min(height, imageHeight - top);
    let rSum = 0, gSum = 0, bSum = 0;
    for (let y = top; y < top + height; y++) {
        for (let x = left; x < left + width; x++) {
            let pixel = y * imageWidth * channels + x * channels;
            rSum += imageBuffer[pixel];
            gSum += imageBuffer[pixel + 1];
            bSum += imageBuffer[pixel + 2];
        }
    }
    return [rSum / (width * height), gSum / (width * height), bSum / (width * height)];
}

function computeAverageRGBs(imageBuffer, imageWidth, imageHeight, channels, width, height) {
    let inputAverageRGBs = [];
    let rSum = 0, gSum = 0, bSum = 0;

    for (let y = 0; y < imageHeight; y += height) {
        for (let x = 0; x < imageWidth; x += width) {
            let pixelAverageRGBs = computeAverageRGB(imageBuffer, imageWidth, imageHeight, channels, x, y, width, height);
            inputAverageRGBs.push(pixelAverageRGBs);
        }
    }
    return inputAverageRGBs;
}  

module.exports = computeAverageRGBs;