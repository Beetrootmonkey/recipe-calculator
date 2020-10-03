import React from 'react';
import Button from '../Button/Button';
import View from './View';

const ViewTree = ({onClickButton, onClickElement, recipeMapping, recipeTreeRoots}) => {

  const list = [];
  const addInput = (ingredient, path) => {
    list.push({...ingredient, path});
    const obj = recipeMapping[ingredient.id];
    if (obj == null) return;
    const {recipe} = obj;
    if (recipe) {
      if (recipe.inputs) {
        recipe.inputs.forEach((input) => addInput(input, (path == null ? '└─    ' : '      ') + (path || '')));
      } else {
        console.error('Found recipe with no inputs:', recipe);
      }
    }
  };
  Object.values(recipeTreeRoots || {}).forEach((ingredient) => {
    addInput(ingredient);
  });

  return <View className='ViewTree'>
    <div className='view-header'>
      <div className='title'>Tree</div>
      <Button onClick={onClickButton} title='Click to add an item'>+</Button>
    </div>
    <div className='view-body'>
      {list.map((ingredient) => {
        const title = 'Click to add a recipe for ' + ingredient.name;
        return <div className='view-tree-node' key={ingredient.id} onClick={() => onClickElement(ingredient)}
                    title={title}>
          <div>{ingredient.path}</div>
          <div>{ingredient.name}</div>
        </div>;
      })}
    </div>
  </View>;
};

export default React.memo(ViewTree);
