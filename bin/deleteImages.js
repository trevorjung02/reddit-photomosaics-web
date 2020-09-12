const path = require('path');
const fs = require('fs');

function deleteImages(directory) {
    fs.readdirSync(directory).forEach(file => {
        fs.unlinkSync(path.join(directory, file));
    });
    console.log(`All files in ${directory} deleted`);
}

module.exports = deleteImages;