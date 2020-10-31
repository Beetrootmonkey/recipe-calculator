const data = require('./data.json');
const data_custom = require('./data_custom.json');

const mergedData = data;
mergedData.recipes.push(...data_custom.recipes);
Object.entries(data_custom.ingredients).forEach(([key, value]) => {
  mergedData.ingredients[key] = value;
});

module.exports = mergedData;
