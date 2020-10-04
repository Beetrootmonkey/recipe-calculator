import IngredientTypes from './IngredientTypes';

const getCompactAmount = (amount, ingredientType) => {
  if (ingredientType === IngredientTypes.FLUID) {
    if (amount < Math.pow(1000, 1)) {
      return amount + ' mB';
    } else if (amount < Math.pow(1000, 2)) {
      return ((amount / Math.pow(1000, 1)) + '').substr(0, 4) + ' B';
    } else if (amount < Math.pow(1000, 3)) {
      return ((amount / Math.pow(1000, 2)) + '').substr(0, 4) + ' kB';
    } else if (amount < Math.pow(1000, 4)) {
      return ((amount / Math.pow(1000, 3)) + '').substr(0, 4) + ' MB';
    }
  }
    const stacks = Math.floor(amount / 64);
    const rest = amount - (stacks * 64);
    return [stacks > 0 ? stacks + ' ' + (stacks > 1 ? 'Stacks' : 'Stack') : null, rest].filter((e) => e).join(' + ');
};

export default getCompactAmount;
