const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const directory = path.join(__dirname, '../', 'public', 'images');

fs.readdirSync(directory).forEach(file => {
    if (file.startsWith("resized")) {
        return;
    }
    sharp(path.join(directory, file))
        .resize({ width: 3000 })
        .toFile(path.join(directory, "resized" + file));
        // .then(function() {
        //     fs.unlinkSync(path.join(directory, file));
        // })
});