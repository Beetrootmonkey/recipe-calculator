var express = require('express');
var data = require('../data');
var router = express.Router();
var fs = require('fs');
var path = require('path');

router.get('/:name', function (req, res, next) {
  var options = {
    root: path.join(__dirname, '../icons'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  const fileName = req.params.name + '.png';
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
});

module.exports = router;
