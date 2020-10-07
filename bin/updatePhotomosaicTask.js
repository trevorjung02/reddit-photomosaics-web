const updatePhotomosaic = require('./updatePhotomosaic');

console.log(process.argv);
updatePhotomosaic(process.argv[2], process.argv[3] === 'true')
   .then((outputImage) => {
      process.send({ imagePath: outputImage });
      process.exit();
   });