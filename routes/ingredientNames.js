var express = require('express');
var data = require('../data');
var router = express.Router();

router.get('/', function (req, res, next) {
  const total = Object.values(data.ingredients).sort((a, b) => a.name < b.name ? -1 : 1);
  const filtered = total.filter((ingredient) => (req.ingredientIds || []).includes(ingredient.id));
  const response = {};
  filtered.forEach((ingredient) => {
    response[ingredient.id] = ingredient.name;
  });
  res.json(response);
});

module.exports = router;
