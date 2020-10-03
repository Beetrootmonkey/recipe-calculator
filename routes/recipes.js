var express = require('express');
var data = require('../data');
var router = express.Router();

const getIngredientById = (id) => data.ingredients[id];
const getIngredientWithNameAndType = ([id, amount]) => {
  const ingredient = getIngredientById(id);
  return {
    id, amount, name: ingredient ? ingredient.name : null, type: ingredient ? ingredient.type : null
  };
};

router.get('/', function (req, res, next) {
  const outputItemId = req.query.outputItemId;
  const inputItemSearch = req.query.inputItemSearch ? req.query.inputItemSearch.toLowerCase() : '';

  const response = [];
  data.recipes.forEach((recipeGroup) => {
    recipeGroup.recipeList.forEach((recipe) => {
      if (Object.keys(recipe.outputs).find((key) => key === outputItemId)) {
        response.push({
          ...recipe,
          inputs: Object.entries(recipe.inputs).map(getIngredientWithNameAndType),
          outputs: Object.entries(recipe.outputs).map(getIngredientWithNameAndType)
        });
      }
    });
  });

  res.json(response.filter((recipe) => recipe.inputs.map((input) => input.name).join(' + ').toLowerCase().includes(inputItemSearch)).slice(0, 100));
});

module.exports = router;
