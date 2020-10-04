import React from 'react';
import getCompactAmount from '../../util/getCompactAmount';
import {getUnitFromIngredientType} from '../../util/IngredientFormat';
import IngredientTypes from '../../util/IngredientTypes';
import Icon from '../Icon/Icon';
import View from './View';

const getTitleForIngredient = (ingredient) => {
  let title = ingredient.id;
  if (ingredient.mod) {
    return ingredient.mod + ' | ' + title;
  }
  return IngredientTypes[ingredient.type] + ' | ' + title;
};

const ViewInstructions = ({onClickElement, recipeMapping, recipeTreeRoots}) => {
  const ingredientAmounts = {};
  const list = [];
  const addInput = (ingredient, depth = 0) => {
    const entry = {ingredient: {...ingredient}};
    const obj = recipeMapping[ingredient.id];

    entry.depth = depth;

    const isFirst = ingredientAmounts[ingredient.id] == null;
    if (isFirst) {
      list.push(entry);
    }
    ingredientAmounts[ingredient.id] = (ingredientAmounts[ingredient.id] || 0) + (ingredient.amount || 0);

    if (obj == null) {
      return;
    }

    const {recipe} = obj;
    if (recipe) {
      entry.recipe = {...recipe};
      let output = recipe.outputs.find((output) => output.id === ingredient.id);
      const outputAmount = output.amount;
      const neededAmount = (ingredient.amount != null ? ingredient.amount : 1) * (ingredient.factor || 1);
      const factor = Math.ceil(neededAmount / outputAmount);

      const totalOutput = factor * outputAmount;
      if (totalOutput !== neededAmount) {
        const type = getUnitFromIngredientType(ingredient.type);
        entry.info = '+' + (totalOutput - neededAmount) + (type ? ' ' + type : '') + ' extra';
      }

      if (recipe.inputs) {
        recipe.inputs.forEach((input) => addInput({...input, factor}, depth + 1));
      } else {
        console.error('Found recipe with no inputs:', recipe);
      }
    }
  };
  Object.values(recipeTreeRoots || {}).forEach((ingredient) => {
    addInput({...ingredient});
  });
  const sortedList = list.sort((a, b) => {
    if (a.depth === b.depth) {
      return a.ingredient.name < b.ingredient.name ? -1 : 1;
    }
    return a.depth < b.depth ? -1 : 1;
  }).reverse();

  let maxDepth = Number.MIN_VALUE;
  const gatherList = sortedList.filter((e) => !e.recipe);
  const processList = sortedList.filter((e) => {
    if (e.depth > maxDepth) {
      maxDepth = e.depth;
    }
    return e.recipe;
  });

  return <View className='ViewInstructions'>
    <div className='view-header'>
      <div className='title'><h2>Instructions</h2><small>
        <Icon type='help' className='help-icon'
              title={'Items here are automatically added when the tree view is updated, which in turn is updated when you add/change mappings.'}/></small>
      </div>
    </div>
    <div className='view-body'>
      <div key='gather-0'>
        <div className='view-entry-title'>[1] Gather:</div>
        <div className='gather-list'>
          {gatherList.map(({ingredient, depth}) => {
            let factor = ingredient.factor;
            if (factor == null) {
              factor = 1;
            }

            return <span className='view-entry' key={ingredient.id}
                         onClick={() => onClickElement(ingredient)}
                         title={getTitleForIngredient(ingredient)}>
              <span>
                <img src={'/icons/' + ingredient.name} alt='' width="24" height="24"/>
                {ingredient.amount
                  ? <small>{getCompactAmount(ingredient.amount * factor, ingredient.type)}</small>
                  : null}
                <span>{ingredient.name}</span>
                </span>
            </span>;
          })}
        </div>
      </div>
      {processList.map(({ingredient, recipe, depth}) => {
        let factor = ingredient.factor;
        if (factor == null) {
          factor = 1;
        }

        return <div className={'view-entry'} key={recipe.id}
                    onClick={() => onClickElement(ingredient)}>
          <div>
            <div className='view-entry-title'>{'[' + (maxDepth - depth + 2) + '] ' + recipe.type}:</div>
            <div>
              <span className='process-list'>
                <span>Input: </span>

                {recipe.inputs.map((ingredient) => <span key={ingredient.id} className='ingredient'
                                                         title={getTitleForIngredient(ingredient)}>
                  <img src={'/icons/' + ingredient.name} alt='' width="24" height="24"/>
                {ingredient.amount
                  ? <small>{getCompactAmount(ingredient.amount * factor, ingredient.type)}</small>
                  : null}
                  <span>{ingredient.name}</span>
                </span>)}
              </span>
            </div>
            <div>
              <span className='process-list'>
                <span>Output: </span>
                {recipe.outputs.map((ingredient) => <span key={ingredient.id} className='ingredient'
                                                          title={getTitleForIngredient(ingredient)}>
                  <img src={'/icons/' + ingredient.name} alt='' width="24" height="24"/>
                {ingredient.amount
                  ? <small>{getCompactAmount(ingredient.amount * factor, ingredient.type)}</small>
                  : null}
                  <span>{ingredient.name}</span>
                </span>)}
                </span>
            </div>

          </div>
        </div>;
      })}
    </div>
  </View>;
};

export default React.memo(ViewInstructions);
