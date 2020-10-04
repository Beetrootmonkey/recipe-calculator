import React from 'react';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import View from './View';

const NodeTypes = {
  ROOT: 'Root',
  LEAF: 'Leaf',
  INTERMEDIATE: 'Intermediate'
};

const ViewTree = ({onClickButton, onClickElement, onRemoveElement, recipeMapping, recipeTreeRoots}) => {

  const registeredIngredients = {};
  const list = [];
  const addInput = (ingredient, path) => {
    const entry = {...ingredient, path};
    list.push(entry);
    const obj = recipeMapping[ingredient.id];
    if (obj == null) {
      if (entry.nodeType == null) {
        entry.nodeType = NodeTypes.LEAF;
      }
      return;
    }

    if (registeredIngredients[ingredient.id]) {
      // Has been used before
      return;
    }
    registeredIngredients[ingredient.id] = ingredient;

    const {recipe} = obj;
    if (recipe) {
      entry.recipeType = recipe.type;
      if (recipe.inputs) {
        recipe.inputs.forEach((input) => addInput({...input, nodeType: NodeTypes.INTERMEDIATE}, (path == null
          ? '└─    '
          : '      ') + (path || '')));
      } else {
        console.error('Found recipe with no inputs:', recipe);
      }
    }
  };
  Object.values(recipeTreeRoots || {}).forEach((ingredient) => {
    addInput({...ingredient, nodeType: NodeTypes.ROOT});
  });

  return <View className='ViewTree'>
    <div className='view-header'>
      <div className='title'>Tree<small>
        <Icon type='help' className='help-icon'
              title={'Add items that you want to track. Tracked items are represented as \'roots\' in this tree. ' +
              'You can choose how these items are crafted; you can even choose recipes for ingredients of recipes! ' +
              'If you ever need to, you can simply remove a tracked item by clicking the corresponding x-button.'}/></small>
      </div>
      <Button onClick={onClickButton} title='Click to add an item'>+</Button>
    </div>
    <div className='view-body'>
      {list.map((ingredient) => {
        const title = `Click to ${recipeMapping[ingredient.id] ? 'change' : 'add a'} mapping for ` + ingredient.name;
        return <div className={'view-entry ' + ingredient.nodeType} key={ingredient.id} onClick={() => onClickElement(ingredient)}
                    title={title}>
          <div>
            {ingredient.path ? <small>{ingredient.path}</small> : null}
            {ingredient.name}
            {ingredient.recipeType ? <small>{'via ' + ingredient.recipeType}</small> : null}
          </div>
          {ingredient.nodeType === NodeTypes.ROOT ?
            <Icon type='close' className='icon-button error' title='Click to remove recipe'
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveElement(ingredient.id);
                  }}/> : null}
        </div>;
      })}
    </div>
  </View>;
};

export default React.memo(ViewTree);
