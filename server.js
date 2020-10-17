const recipesRouter = require('./routes/recipes');
const ingredientsRouter = require('./routes/ingredients');
const iconsRouter = require('./routes/icons');
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/recipes', recipesRouter);
app.use('/ingredients', ingredientsRouter);
app.use('/icons', iconsRouter);
