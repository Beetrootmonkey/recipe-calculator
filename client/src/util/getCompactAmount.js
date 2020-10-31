const getCompactAmount = (amount, ingredientType) => {
  amount = Math.max(amount, 0);

  if (ingredientType === 'FLUID') {
    if (amount < Math.pow(1000, 1)) {
      return amount + ' mB';
    } else if (amount < Math.pow(1000, 2)) {
      return ((amount / Math.pow(1000, 1)) + '').substr(0, 5) + ' B';
    } else if (amount < Math.pow(1000, 3)) {
      return ((amount / Math.pow(1000, 2)) + '').substr(0, 5) + ' kB';
    } else if (amount < Math.pow(1000, 4)) {
      return ((amount / Math.pow(1000, 3)) + '').substr(0, 5) + ' MB';
    } else if (amount < Math.pow(1000, 5)) {
      return ((amount / Math.pow(1000, 4)) + '').substr(0, 5) + ' GB';
    } else if (amount < Math.pow(1000, 6)) {
      return ((amount / Math.pow(1000, 5)) + '').substr(0, 5) + ' TB';
    } else {
      return ((amount / Math.pow(1000, 6)) + '').substr(0, 5) + ' PB';
    }
  }
  const stacks = Math.floor(amount / 64);
  const rest = amount - (stacks * 64);
  return [stacks > 0 ? stacks + ' ' + (stacks > 1 ? 'Stacks' : 'Stack') : null, rest].filter((e) => e).join(' + ');
};

export default getCompactAmount;
