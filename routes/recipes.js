var express = require('express');
var data = require('../data');
var router = express.Router();

const getIngredientById = (id) => data.ingredients[id];
const getIngredientWithNameAndType = ([id, amount]) => {
  const ingredient = getIngredientById(id);

  if (!ingredient) {
    console.error('Failed to find Ingredient for ID \'' + id + '\'')
    return null;
  }

  return {
    id, amount, name: ingredient ? ingredient.name : null, type: ingredient ? ingredient.type : null, mod: ingredient.mod
  };
};

router.get('/', function (req, res, next) {
  console.log('/recipes');
  const outputItemId = req.query.outputItemId;
  const inputItemSearch = req.query.inputItemSearch ? req.query.inputItemSearch.toLowerCase() : '';

  const total = [];
  data.recipes.forEach((recipeGroup) => {
    recipeGroup.recipeList.forEach((recipe) => {
      if (Object.keys(recipe.outputs).find((key) => key === outputItemId)) {
        total.push({
          ...recipe,
          inputs: Object.entries(recipe.inputs).map(getIngredientWithNameAndType),
          outputs: Object.entries(recipe.outputs).map(getIngredientWithNameAndType),
          type: recipeGroup.title + (recipe.voltageLevel ? ' (' + recipe.voltageLevel + ')' : '')
        });
      }
    });
  });

  const filtered = total.filter((recipe) => recipe.inputs.map((input) => input.name)
    .join(' + ')
    .toLowerCase()
    .includes(inputItemSearch));
  const shown = filtered.slice(0, 100);

  res.json({
    data: shown, info: {
      total: total.length,
      filtered: filtered.length,
      shown: shown.length
    }
  });
});

module.exports = router;
