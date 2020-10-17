var express = require('express');
var data = require('../data');
var router = express.Router();
var fs = require('fs');
var path = require('path');

const iconNameOverrides = require('../icon_name_overrides.json');

const bufferFile = relPath => {
  return fs.readFileSync(path.join(__dirname, relPath));
};

router.get('/:ingredientId', function (req, res, next) {
  console.log('/icons');
  try {
    if (!req.params.ingredientId) {
      res.status(400).send('Need to provide an ingredient ID!');
      return;
    }

    const ingredient = data.ingredients[req.params.ingredientId];
    if (!ingredient) {
      res.status(400).send('Failed to find ingredient for given ID');
      return;
    }

    const iconName = iconNameOverrides[req.params.ingredientId] || ingredient.name;

    try {
      const file = bufferFile('../icons/' + iconName + '.png');
      res.send(file);
    } catch (e) {
      try {
        const file = bufferFile('../icons/' + req.params.ingredientId + '.png');
        res.send(file);
      } catch (e) {
        const file = bufferFile('../icons/_default_.png');
        res.send(file);
      }
    }

  } catch (e) {
    console.error(e);
    res.status(500).send('An error occurred');
  }
});

module.exports = router;
