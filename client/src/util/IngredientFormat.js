export const IngredientTypeUnit = {
  FLUID: 'mB'
};

export const getUnitFromIngredientType = (type) => {
  return IngredientTypeUnit[type] || '';
};

export const getDisplayNameFromIngredient = (ingredient) => {
  return ingredient.amount  + getUnitFromIngredientType(ingredient.type) + ' ' + ingredient.name;
};
