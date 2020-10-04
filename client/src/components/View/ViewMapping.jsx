import React from 'react';
import {getDisplayNameFromRecipeIngredient} from '../../util/IngredientFormat';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import View from './View';

const ViewMapping = ({onClickButton, recipeMapping, onRemoveElement}) => {

  return <View className='ViewMapping'>
    <div className='view-header'>
      <div className='title'>Mapping<small>
        <Icon type='help' className='help-icon'
              title={'Add default recipes that should be used to craft a given item. You can either add a mapping ' +
              '(output item + recipe) manually, or via clicking on an item in the other views. Mappings can be removed anytime.'}/></small>
      </div>
      <Button onClick={onClickButton} title='Click to add a recipe'>+</Button>
    </div>
    <div className='view-body'>
      {Object.values(recipeMapping || {}).map(({ingredient, recipe}) => {
        const title = recipe.type + ' | ' + recipe.inputs.map(getDisplayNameFromRecipeIngredient)
          .join(' + ') + ' = ' + recipe.outputs.map(getDisplayNameFromRecipeIngredient).join(' + ');
        return <div className='view-entry' key={ingredient.id}>
          <div title={title}>{ingredient.name}</div>
          <Icon type='close' className='icon-button error' title={'Click to remove mapping for ' + ingredient.name}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveElement(ingredient.id);
                }}/>
        </div>;
      })}
    </div>
  </View>;
};

export default React.memo(ViewMapping);
