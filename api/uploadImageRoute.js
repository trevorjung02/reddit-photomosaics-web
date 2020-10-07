const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const updatePhotomosaic = require('../bin/updatePhotomosaic');
const child_process = require('child_process');

router.post('/', function (req, res) {
   // let image = req.body.userImage;
   const io = req.app.get('socketio');
   const form = new formidable.IncomingForm();
   form.parse(req, async function (err, fields, files) {
      if (err != null) {
         console.log(err);
         return res.status(400).json({ message: err.message });
      }
      res.sendFile(path.join(__dirname, '../', 'public', 'userImage.html'));
      io.emit('hello', 'helloworld');
      // const userImage = files.userImage;
      // const imagePath = userImage.path;
      // let worker = child_process.spawn(
      //    'node',
      //    ['bin/updatePhotomosaicTask.js', imagePath, false],
      //    { stdio: 'inherit' }
      // );
      // // await updatePhotomosaic(imagePath, false);
      // worker.on('exit', () => {

      // })
   })
});

module.exports = router;