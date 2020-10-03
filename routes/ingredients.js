var express = require('express');
var data = require('../data');
var router = express.Router();

router.get('/', function (req, res, next) {
  const inputItemSearch = req.query.inputItemSearch ? req.query.inputItemSearch.toLowerCase() : '';
  const total = Object.values(data.ingredients).sort((a, b) => a.name < b.name ? -1 : 1);
  const filtered = total.filter((ingredient) => ingredient.name.toLowerCase().includes(inputItemSearch));
  const shown = filtered.slice(0, 100);
  res.json({
    data: shown,
    info: {
      total: total.length,
      filtered: filtered.length,
      shown: shown.length
    }
  });
});

module.exports = router;
