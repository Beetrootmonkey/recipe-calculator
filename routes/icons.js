var express = require('express');
var data = require('../data');
var router = express.Router();
var fs = require('fs');
var path = require('path');

const bufferFile = relPath => {
  return fs.readFileSync(path.join(__dirname, relPath));
};

router.get('/:imgName', function (req, res, next) {
  console.log('/icons');
  try {
    if (!req.params.imgName) {
      res.status(400).send('Need to provide an image id!');
      return;
    }

    try {
      const file = bufferFile('../icons/' + req.params.imgName + '.png');
      res.send(file);
    } catch (e) {
      const file = bufferFile('../icons/_default_.png');
      res.send(file);
    }

  } catch (e) {
    console.error(e);
    res.status(500).send('An error occurred');
  }
});

module.exports = router;
