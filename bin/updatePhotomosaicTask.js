const updatePhotomosaic = require('./updatePhotomosaic');

console.log(process.argv);
updatePhotomosaic(process.argv[2], process.argv[3] === 'true')
   .then((outputImage) => {
      if (process.argv[4] === 'true') {
         process.send({ imagePath: outputImage });
      }
      process.exit();
   });