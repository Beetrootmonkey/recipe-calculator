const data = require('./data_formatted');
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');

// let db = new sqlite3.Database('./data.db', (err) => {
let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  // console.log('Connected to the SQlite database.');
});

sqlite3.Database.prototype.runAsync = function (sql, ...params) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }
      resolve(this);
    });
  });
};

sqlite3.Database.prototype.runBatchAsync = function (statements) {
  var results = [];
  var batch = ['BEGIN', ...statements, 'COMMIT'];
  return batch.reduce((chain, statement) => chain.then(result => {
    results.push(result);
    return db.runAsync(...[].concat(statement));
  }), Promise.resolve())
    .catch(err => db.runAsync('ROLLBACK').then(() => Promise.reject(err +
      ' in statement #' + results.length)))
    .then(() => results.slice(2));
};

(async () => {
  console.time('> Finished!');

  console.log('Reading items...');
  console.time('    > Finished reading items');
  const flatData = [];
  data.sources[0].machines.forEach((machine) => {
    flatData.push({type: machine.n, recipes: machine.recs});
  });
  flatData.push(data.sources[1]);
  flatData.push(data.sources[2]);
  flatData.push(data.sources[3]);

  const items = {};
  const fluids = {};
  flatData.forEach((group) => {
    group.recipes.forEach((recipe) => {
      switch (group.type) {
        case 'shaped': {
          recipe.iI.filter((item) => item).forEach((item) => {
            items[item.uN] = item.lN;
          });
          items[recipe.o.uN] = recipe.o.lN;
          break;
        }
        case 'shapeless': {
          recipe.iI.forEach((item) => {
            items[item.uN] = item.lN;
          });
          items[recipe.o.uN] = recipe.o.lN;
          break;
        }
        case 'shapedOreDict': {
          recipe.iI.filter((item) => item).forEach((item) => {
            if (item.ins) {
              item.ims.forEach((subItem) => {
                items[subItem.uN] = subItem.lN;
              });
            } else {
              items[item.uN] = item.lN;
            }
          });
          items[recipe.o.uN] = recipe.o.lN;
          break;
        }
        default: {
          recipe.iI.forEach((item) => {
            if (item.cfg != null) {
              item.uN += '.' + item.cfg;
              item.lN += ' (Cfg ' + item.cfg + ')';
            }
            items[item.uN] = item.lN;
          });
          recipe.fI.forEach((item) => {
            fluids[item.uN] = item.lN;
          });
          recipe.iO.forEach((item) => {
            items[item.uN] = item.lN;
          });
          recipe.fO.forEach((item) => {
            fluids[item.uN] = item.lN;
          });
        }
      }
    });
  });
  console.timeEnd('    > Finished reading items');

  const recipes = {};

  console.log('Reading recipes...');
  console.time('    > Finished reading recipes');
  flatData.forEach((group) => {
    group.recipes.forEach((recipe) => {
      switch (group.type) {
        case 'shaped': {
          const inputMap = {};
          recipe.iI.filter((item) => item).forEach((item) => {
            inputMap[item.uN] = (inputMap[item.uN] || 0) + item.a;
          });
          const input = Object.entries(inputMap).map(([item, amount]) => ({
            amount,
            items: [item]
          }));
          const output = [{amount: recipe.o.a, item: recipe.o.uN}];

          const entry = {
            input,
            output,
            type: 'Shaped'
          };
          const id = md5(JSON.stringify(entry));
          entry.id = id;
          recipes[id] = entry;
          break;
        }
        case 'shapeless': {
          const inputMap = {};
          recipe.iI.forEach((item) => {
            inputMap[item.uN] = (inputMap[item.uN] || 0) + item.a;
          });
          const input = Object.entries(inputMap).map(([item, amount]) => ({
            amount,
            items: [item]
          }));
          const output = [{amount: recipe.o.a, item: recipe.o.uN}];

          const entry = {
            input,
            output,
            type: 'Shapeless'
          };
          const id = md5(JSON.stringify(entry));
          entry.id = id;
          recipes[id] = entry;
          break;
        }
        case 'shapedOreDict': {
          const inputMap = {};
          recipe.iI.filter((item) => item).map((item) => ({
            amount: item.ims ? item.ims[0].a : item.a,
            items: item.ims ? item.ims.map((subItem) => subItem.uN) : [item.uN]
          })).forEach((item) => {
            const key = JSON.stringify(Array.from(new Set(item.items)).filter((i) => i).sort((a, b) => a < b ? -1 : 1));
            inputMap[key] = (inputMap[key] || 0) + item.amount;
          });
          const input = Object.entries(inputMap).map(([key, amount]) => ({amount, items: JSON.parse(key)}));
          const output = [{amount: recipe.o.a, item: recipe.o.uN}];

          const entry = {
            input,
            output,
            type: 'Shapeless OreDict'
          };
          const id = md5(JSON.stringify(entry));
          entry.id = id;
          recipes[id] = entry;
          break;
        }
        default: {
          const inputMap = {};
          [...recipe.iI, ...recipe.fI].forEach((item) => {
            inputMap[item.uN] = (inputMap[item.uN] || 0) + item.a;
          });
          const input = Object.entries(inputMap).map(([item, amount]) => ({
            amount,
            items: [item]
          }));
          const outputMap = {};
          [...recipe.iO, ...recipe.fO].forEach((item) => {
            outputMap[item.uN] = (outputMap[item.uN] || 0) + item.a;
          });
          const output = Object.entries(outputMap).map(([item, amount]) => ({
            amount,
            item
          }));

          const entry = {
            input,
            output,
            type: group.type,
            euPerTick: recipe.eut,
            duration: recipe.dur
          };
          const id = md5(JSON.stringify(entry));
          entry.id = id;
          recipes[id] = entry;
        }
      }
    });
  });
  console.timeEnd('    > Finished reading recipes');

  Object.keys(items).forEach((key) => {
    if (fluids[key] != null) {
      console.error('ERROR: Duplicate key:', key);
    }
  });

  const batchInserts = (baseStatement, valuesArr) => {
    const insertsPerStatement = 900 / (baseStatement.split('?').length - 1);
    const paramGroups = [];
    let group = [];
    valuesArr.forEach((value, index) => {
      group.push(value);
      if ((index % insertsPerStatement === insertsPerStatement - 1) || (index === valuesArr.length - 1)) {
        paramGroups.push(group);
        group = [];
      }
    });
    let [statementStart, insert] = baseStatement.split('VALUES');
    insert = insert.trim();

    return paramGroups.map((group) => {
      const statement = statementStart + 'VALUES ' + group.map(() => insert).join(', ');
      const flatParams = [];
      group.forEach((paramsArr) => flatParams.push(...paramsArr));

      return [statement, ...flatParams];

    });
  };

  await db.run(`CREATE TABLE item (
    id text NOT NULL PRIMARY KEY,
    type text NOT NULL,
    name text NOT NULL
  );`);
  await db.run(`CREATE TABLE recipe (
    id text NOT NULL PRIMARY KEY,
    type text NOT NULL,
    eu_per_tick integer,
    duration integer
  );`);
  await db.run(`CREATE TABLE recipe_input (
    id integer NOT NULL,
    recipe_id text NOT NULL,
    amount integer NOT NULL,
    PRIMARY KEY (id, recipe_id)
  );`);
  await db.run(`CREATE TABLE recipe_input_item (
    recipe_id text NOT NULL,
    recipe_input_id integer NOT NULL,
    item_id text NOT NULL,
    PRIMARY KEY (recipe_id, recipe_input_id, item_id)
  );`);
  await db.run(`CREATE TABLE recipe_output (
    recipe_id text NOT NULL,
    item_id text NOT NULL,
    amount integer NOT NULL,
    PRIMARY KEY (recipe_id, item_id)
  );`);
  // await db.run(`DELETE FROM item`);
  // await db.run(`DELETE FROM recipe`);
  // await db.run(`DELETE FROM recipe_output`);
  // await db.run(`DELETE FROM recipe_input`);
  // await db.run(`DELETE FROM recipe_input_item`);

  console.log('Preparing statements...');
  console.time('    > Finished preparing statements');

  // ITEMS
  const itemData = Object.entries(items).map(([id, name]) => [id, name || id]);
  const itemStatements = batchInserts(`
    INSERT INTO
      item
      (id, type, name)
    VALUES
      (?, 'item', ?)
  `, itemData);

  // FLUIDS
  const fluidData = Object.entries(fluids).map(([id, name]) => [id, name || id]);
  const fluidStatements = batchInserts(`
    INSERT INTO
      item
      (id, type, name)
    VALUES
      (?, 'fluid', ?)
  `, fluidData);

  // RECIPES
  const recipeData = Object.entries(recipes)
    .map(([id, recipe]) => [id, recipe.type, recipe.euPerTick, recipe.duration]);
  const recipeStatements = batchInserts(`
    INSERT INTO
      recipe
      (id, type, eu_per_tick, duration)
    VALUES
      (?, ?, ?, ?)
  `, recipeData);

  // RECIPE OUTPUT
  const recipeOutputData = [];
  Object.entries(recipes).forEach(([id, recipe]) => {
    recipe.output.forEach((output) => recipeOutputData.push([id, output.item, output.amount]));
  });
  const recipeOutputStatements = batchInserts(`
    INSERT INTO
      recipe_output
      (recipe_id, item_id, amount)
    VALUES
      (?, ?, ?)
  `, recipeOutputData);

  // RECIPE INPUT
  const recipeInputData = [];
  Object.entries(recipes).forEach(([id, recipe]) => {
    recipe.input.forEach((input, index) => recipeInputData.push([id, index, input.amount]));
  });
  const recipeInputStatements = batchInserts(`
    INSERT INTO
      recipe_input
      (recipe_id, id, amount)
    VALUES
      (?, ?, ?)
  `, recipeInputData);

  // RECIPE INPUT ITEMS
  const recipeInputItemData = [];
  Object.entries(recipes).forEach(([id, recipe]) => {
    recipe.input.forEach((input, index) => {
      input.items.forEach((item) => {
        recipeInputItemData.push([id, index, item]);
      });
    });
  });
  const recipeInputItemStatements = batchInserts(`
    INSERT INTO
      recipe_input_item
      (recipe_id, recipe_input_id, item_id)
    VALUES
      (?, ?, ?)
  `, recipeInputItemData);

  recipeInputItemData.forEach(([id, , item], index) => {
    if (id == null || item == null) {
      console.error('ERROR: id or item is NULL:', recipeInputItemData[index]);
      console.error('Prev:', recipeInputItemData[index - 1]);
      console.error('Next:', recipeInputItemData[index + 1]);
    }
  });

  console.timeEnd('    > Finished preparing statements');

  console.log(`Inserting ${itemData.length} items in ${itemStatements.length} statements...`);
  console.time('    > Finished inserting items');
  await db.runBatchAsync(itemStatements);
  console.timeEnd('    > Finished inserting items');

  console.log(`Inserting ${fluidData.length} fluids in ${fluidStatements.length} statements...`);
  console.time('    > Finished inserting fluids');
  await db.runBatchAsync(fluidStatements);
  console.timeEnd('    > Finished inserting fluids');

  console.log(`Inserting ${recipeData.length} recipes in ${recipeStatements.length} statements...`);
  console.time('    > Finished inserting recipes');
  await db.runBatchAsync(recipeStatements);
  console.timeEnd('    > Finished inserting recipes');

  console.log(`Inserting ${recipeOutputData.length} recipes outputs in ${recipeOutputStatements.length} statements...`);
  console.time('    > Finished inserting recipe outputs');
  await db.runBatchAsync(recipeOutputStatements);
  console.timeEnd('    > Finished inserting recipe outputs');

  console.log(`Inserting ${recipeInputData.length} recipes inputs in ${recipeInputStatements.length} statements...`);
  console.time('    > Finished inserting recipe inputs');
  await db.runBatchAsync(recipeInputStatements);
  console.timeEnd('    > Finished inserting recipe inputs');

  console.log(`Inserting ${recipeInputItemData.length} recipes input items in ${recipeInputItemStatements.length} statements...`);
  console.time('    > Finished inserting recipe input items');
  await db.runBatchAsync(recipeInputItemStatements);
  console.timeEnd('    > Finished inserting recipe input items');

  console.log('');
  console.timeEnd('> Finished!');

  console.log('Testing...');
  console.time('    > Finished Testing');
  db.each(`
    SELECT
      count(*)
    FROM
      recipe r
      LEFT JOIN recipe_input ri
      ON r.id = ri.recipe_id
      LEFT JOIN recipe_input_item rii
      ON r.id = rii.recipe_id AND ri.id = rii.recipe_input_id
      LEFT JOIN item ii
      ON rii.item_id = ii.id
      LEFT JOIN recipe_output ro
      ON r.id = ro.recipe_id
      LEFT JOIN item io
      ON ro.item_id = io.id
    WHERE
      io.name LIKE '%iron pickaxe%'
  `);
  console.timeEnd('    > Finished Testing');

// close the database connection
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Closed the database connection.');
  });
})();
