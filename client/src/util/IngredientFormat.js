export const IngredientTypeUnit = {
  FLUID: 'mB'
};

export const getUnitFromIngredientType = (type) => {
  return IngredientTypeUnit[type] || '';
};

export const getDisplayNameFromRecipeIngredient = (ingredient) => {
  const unit = getUnitFromIngredientType(ingredient.type);
  return ingredient.amount  + (unit ? ' ' + unit : '') + ' ' + ingredient.name;
};
