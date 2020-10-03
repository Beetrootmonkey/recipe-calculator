import React from 'react';
import {getDisplayNameFromRecipeIngredient} from '../../util/IngredientFormat';
import Button from '../Button/Button';
import View from './View';

const ViewMapping = ({onClickButton, recipeMapping}) => {

  return <View className='ViewMapping'>
    <div className='view-header'>
      <div className='title'>Mapping</div>
      <Button onClick={onClickButton}>+</Button>
    </div>
    <div className='view-body'>
      <table>
        <tbody>
          {Object.values(recipeMapping || {}).map(({ingredient, recipe}) => {
            const title = recipe.type + ' | ' + recipe.inputs.map(getDisplayNameFromRecipeIngredient)
              .join(' + ') + ' = ' + recipe.outputs.map(getDisplayNameFromRecipeIngredient).join(' + ');
            return <tr key={ingredient.id} title={title}>
              <td>{ingredient.name}</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  </View>;
};

export default React.memo(ViewMapping);
