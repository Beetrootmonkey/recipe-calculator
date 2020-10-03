import React from 'react';
import {getDisplayNameFromRecipeIngredient} from '../../util/IngredientFormat';
import Button from '../Button/Button';
import View from './View';

const ViewTree = ({onClickButton, onClickElement, recipeMapping, recipeTreeRoots}) => {

  const list = [];
  const addInput = (ingredient, path) => {
    list.push({...ingredient, path});
    const recipe = recipeMapping[ingredient.id];
    if (recipe) {
      recipe.inputs.forEach((input) => addInput(input, (path == null  ? '└─    ' : '      ') + (path || '')));
    }
  };
  Object.values(recipeTreeRoots || {}).forEach((ingredient) => {
    addInput(ingredient);
  });

  return <View className='ViewTree'>
    <div className='view-header'>
      <div className='title'>Tree</div>
      <Button onClick={onClickButton}>+</Button>
    </div>
    <div className='view-body'>
      {list.map((ingredient) => {
        return <div className='view-tree-node' key={ingredient.id} onClick={() => onClickElement(ingredient)}
                    title={ingredient.type + ' | ' + ingredient.id}>
          <div>{ingredient.path}</div>
          <div>{ingredient.name}</div>
        </div>
      })}
    </div>
  </View>;
};

export default React.memo(ViewTree);
