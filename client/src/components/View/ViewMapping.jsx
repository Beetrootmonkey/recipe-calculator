import React from 'react';
import {getDisplayNameFromRecipeIngredient} from '../../util/IngredientFormat';
import View from './View';
import Button from '../Button/Button';

const ViewMapping = ({onClickButton, recipeMapping}) => {

  return <View className='ViewMapping'>
    <div className='view-header'>
      <div className='title'>Mapping</div>
      <Button onClick={onClickButton}>+</Button>
    </div>
    <div className='view-body'>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Recipe Type</th>
            <th>Input</th>
            <th>Output</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(recipeMapping || {}).map(([itemId, recipe]) => {
            return <tr key={itemId}>
              <td>{itemId}</td>
              <td>{recipe.type}</td>
              <td>{recipe.inputs.map(getDisplayNameFromRecipeIngredient).join(' + ')}</td>
              <td>{recipe.outputs.map(getDisplayNameFromRecipeIngredient).join(' + ')}</td>
            </tr>
          })}
        </tbody>
      </table>
    </div>
  </View>;
};

export default React.memo(ViewMapping);
