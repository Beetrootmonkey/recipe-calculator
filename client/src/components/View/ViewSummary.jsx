import React, {useState} from 'react';
import getCompactAmount from '../../util/getCompactAmount';
import {getUnitFromIngredientType} from '../../util/IngredientFormat';
import Icon from '../Icon/Icon';
import SummaryModal from '../Modal/SummaryModal';
import View from './View';

const NodeTypes = {
  ROOT: 'Root',
  LEAF: 'Ingredients',
  INTERMEDIATE: 'Intermediate'
};

const ViewSummary = ({onClickElement, recipeMapping, recipeTreeRoots, onSetAmount}) => {
  const [modalData, setModalData] = useState(null);

  const ingredientAmounts = {};
  const list = [];
  const addInput = (ingredient) => {
    const entry = {...ingredient};
    if (ingredientAmounts[ingredient.id] == null) {
      list.push(entry);
    }
    ingredientAmounts[ingredient.id] = (ingredientAmounts[ingredient.id] || 0) + (ingredient.amount || 0);
    const obj = recipeMapping[ingredient.id];
    if (obj == null) {
      entry.nodeType = NodeTypes.LEAF;
      return;
    }
    const {recipe} = obj;
    if (recipe) {

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
        recipe.inputs.forEach((input) => addInput({...input, nodeType: NodeTypes.INTERMEDIATE, factor}));
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
    return 0;
  }).reverse();

  const groups = {};
  sortedList.forEach((ingredient) => {
    if (!groups[ingredient.nodeType]) {
      groups[ingredient.nodeType] = [];
    }
    groups[ingredient.nodeType].push(ingredient);
  });

  let modal;
  if (modalData) {
    modal = <SummaryModal ingredient={modalData} closeModal={() => setModalData(null)}
                          onConfirm={(amount) => onSetAmount(modalData, amount)}/>;
  }

  return <View className='ViewSummary'>
    <div className='view-header'>
      <div className='title'><h2>Summary</h2><small>
        <Icon type='help' className='help-icon'
              title={'Items here are automatically added when the tree view is updated, which in turn is updated when you add/change mappings.'}/></small>
      </div>
    </div>
    <div className='view-body'>
      {Object.entries(groups).map(([group, ingredientList]) => {
        return <div>
          <div className='view-summary-group'>{group}</div>
          {ingredientList.map((ingredient) => {
            let name = ingredient.name;

            let amount = ingredientAmounts[ingredient.id];
            if (amount == null) {
              amount = 1;
            }

            let factor = ingredient.factor;
            if (factor == null) {
              factor = 1;
            }
            amount *= factor;

            const unit = getUnitFromIngredientType(ingredient.type);
            const title = `Amount: ${amount + ' ' + unit} | Click to ${recipeMapping[ingredient.id]
              ? 'change'
              : 'add a'} mapping`;
            amount = getCompactAmount(amount, ingredient.type);


            return <div className={'view-entry ' + ingredient.nodeType} key={ingredient.id}
                        onClick={() => onClickElement(ingredient)}
                        title={title}>
              <div>
                <small>{amount}</small>
                {ingredient.type === 'ITEM' ? <img src={'/icons/' + ingredient.name} alt='' width="24" height="24"/> : null}
                {name}
                {ingredient.info ? <small>{ingredient.info}</small> : null}
              </div>
              {ingredient.nodeType === NodeTypes.ROOT ?
                <Icon type='edit' className='icon-button' title='Click to edit amount'
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalData(ingredient);
                      }}/> : null}
            </div>;
          })}
        </div>;
      })}
      {modal}
    </div>
  </View>;
};

export default React.memo(ViewSummary);
