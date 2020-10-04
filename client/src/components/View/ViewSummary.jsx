import React from 'react';
import {getUnitFromIngredientType} from '../../util/IngredientFormat';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import View from './View';

const NodeTypes = {
  ROOT: 'Root',
  LEAF: 'Leaf',
  INTERMEDIATE: 'Intermediate'
};

const ViewSummary = ({onClickButton, onClickElement, recipeMapping, recipeTreeRoots}) => {

  const list = [];
  const addInput = (ingredient) => {
    const entry = {...ingredient};
    list.push(entry);
    const obj = recipeMapping[ingredient.id];
    if (obj == null) {
      entry.nodeType = NodeTypes.LEAF;
      return;
    }
    const {recipe} = obj;
    if (recipe) {
      if (recipe.inputs) {
        recipe.inputs.forEach((input) => addInput({...input, nodeType: NodeTypes.INTERMEDIATE}));
      } else {
        console.error('Found recipe with no inputs:', recipe);
      }
    }
  };
  Object.values(recipeTreeRoots || {}).forEach((ingredient) => {
    addInput({...ingredient, nodeType: NodeTypes.ROOT});
  });
  const sortedList = list.sort((a, b) => {
    if (a.nodeType === b.nodeType) {
      return a.name < b.name ? -1 : 1;
    }
    if (a.nodeType === NodeTypes.ROOT) {
      return -1;
    }
    if (b.nodeType === NodeTypes.ROOT) {
      return 1;
    }
    if (a.nodeType === NodeTypes.INTERMEDIATE) {
      return -1;
    }
    if (b.nodeType === NodeTypes.INTERMEDIATE) {
      return 1;
    }
  });

  return <View className='ViewSummary'>
    <div className='view-header'>
      <div className='title'>Summary<small>
        <Icon type='help' className='help-icon'
              title={'Items here are automatically added when the tree view is updated, which in turn is updated when you add/change mappings.'}/></small></div>
    </div>
    <div className='view-body'>
      {sortedList.map((ingredient) => {
        let name = ingredient.name;
        if (ingredient.amount != null) {
          name = ingredient.amount + getUnitFromIngredientType(ingredient.type) + ' ' + name;
        }

        const title = `Click to ${recipeMapping[ingredient.id] ? 'change' : 'add a'} mapping for ` + ingredient.name;

        return <div className={'view-summary-entry ' + ingredient.nodeType} key={ingredient.id} onClick={() => onClickElement(ingredient)}
                    title={title}>
          <div>{name}{ingredient.nodeType !== NodeTypes.INTERMEDIATE ? <small>{ingredient.nodeType}</small> : null}</div>
        </div>;
      })}
    </div>
  </View>;
};

export default React.memo(ViewSummary);
