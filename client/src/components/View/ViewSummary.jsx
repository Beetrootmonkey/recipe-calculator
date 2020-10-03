import React from 'react';
import {getDisplayNameFromRecipeIngredient, getUnitFromIngredientType} from '../../util/IngredientFormat';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import View from './View';

const ViewSummary = ({onClickButton, onClickElement, recipeMapping, recipeTreeRoots}) => {

  const list = [];
  const addInput = (ingredient) => {
    const entry = {...ingredient};
    list.push(entry);
    const obj = recipeMapping[ingredient.id];
    if (obj == null) {
      entry.isLeaf = true;
      return;
    }
    const {recipe} = obj;
    if (recipe) {
      if (recipe.inputs) {
        recipe.inputs.forEach((input) => addInput(input));
      } else {
        console.error('Found recipe with no inputs:', recipe);
      }
    }
  };
  Object.values(recipeTreeRoots || {}).forEach((ingredient) => {
    addInput({...ingredient, isRoot: true});
  });

  return <View className='ViewSummary'>
    <div className='view-header'>
      <div className='title'>Summary</div>
      <Button onClick={onClickButton} title='Click to add an item'>+</Button>
    </div>
    <div className='view-body'>
      {list.map((ingredient) => {
        let name = ingredient.name;
        if (ingredient.amount != null) {
          name = ingredient.amount + getUnitFromIngredientType(ingredient.type) + ' ' + name;
        }

        const title = 'Click to add a recipe for ' + ingredient.name;

        return <div className='view-summary-entry' key={ingredient.id} onClick={() => onClickElement(ingredient)}
                    title={title}>
          <div>{name}</div>
          {ingredient.isLeaf ? <div className='view-summary-entry-leaf'>LEAF</div> : null}
          {ingredient.isRoot ? <div className='view-summary-entry-root'>ROOT</div> : null}
        </div>;
      })}
    </div>
  </View>;
};

export default React.memo(ViewSummary);
