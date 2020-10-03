import React from 'react';
import {getDisplayNameFromRecipeIngredient} from '../../util/IngredientFormat';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import View from './View';

const ViewMapping = ({onClickButton, recipeMapping, onRemoveElement}) => {

  return <View className='ViewMapping'>
    <div className='view-header'>
      <div className='title'>Mapping</div>
      <Button onClick={onClickButton} title='Click to add a recipe'>+</Button>
    </div>
    <div className='view-body'>
      {Object.values(recipeMapping || {}).map(({ingredient, recipe}) => {
        const title = recipe.type + ' | ' + recipe.inputs.map(getDisplayNameFromRecipeIngredient)
          .join(' + ') + ' = ' + recipe.outputs.map(getDisplayNameFromRecipeIngredient).join(' + ');
        return <div className='view-mapping-entry' key={ingredient.id}>
          <div className='view-mapping-entry-name' title={title}>{ingredient.name}</div>
          <Icon type='close' className='remove-button' title='Click to remove recipe' onClick={() => onRemoveElement(ingredient.id)}/>
        </div>;
      })}
    </div>
  </View>;
};

export default React.memo(ViewMapping);
