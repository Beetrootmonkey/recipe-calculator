import React, {useState} from 'react';
import {getUnitFromIngredientType} from '../../util/IngredientFormat';
import Icon from '../Icon/Icon';
import SummaryModal from '../Modal/SummaryModal';
import View from './View';

const NodeTypes = {
  ROOT: 'Root',
  LEAF: 'Leaf',
  INTERMEDIATE: 'Intermediate'
};

const ViewSummary = ({onClickElement, recipeMapping, recipeTreeRoots, onSetAmount}) => {
  const [modalData, setModalData] = useState(null);

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

      let output = recipe.outputs.find((output) => output.id === ingredient.id);
      const outputAmount = output.amount;
      const neededAmount = (ingredient.amount != null ? ingredient.amount : 1) * (ingredient.factor || 1);
      const factor = Math.ceil(neededAmount / outputAmount);

      const totalOutput = factor * outputAmount;
      if (totalOutput !== neededAmount) {
        entry.info = ' (produces ' + totalOutput + ')';
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
  });

  let modal;
  if (modalData) {
    modal = <SummaryModal ingredient={modalData} closeModal={() => setModalData(null)}
                          onConfirm={(amount) => onSetAmount(modalData, amount)}/>;
  }

  return <View className='ViewSummary'>
    <div className='view-header'>
      <div className='title'>Summary<small>
        <Icon type='help' className='help-icon'
              title={'Items here are automatically added when the tree view is updated, which in turn is updated when you add/change mappings.'}/></small>
      </div>
    </div>
    <div className='view-body'>
      {sortedList.map((ingredient) => {
        let name = ingredient.name;
        if (ingredient.info) {
          name += ingredient.info;
        }

        let amount = ingredient.amount;
        if (amount == null) {
          amount = 1;
        }

        let factor = ingredient.factor;
        if (factor == null) {
          factor = 1;
        }
        amount *= factor;

        const unit = getUnitFromIngredientType(ingredient.type);
        amount = amount + (unit ? ' ' + unit : '');

        const title = `Click to ${recipeMapping[ingredient.id] ? 'change' : 'add a'} mapping for ` + ingredient.name;

        return <div className={'view-entry ' + ingredient.nodeType} key={ingredient.id}
                    onClick={() => onClickElement(ingredient)}
                    title={title}>
          <div>
            <small>{amount}</small>
            {name}
            {ingredient.nodeType !== NodeTypes.INTERMEDIATE ? <small>{ingredient.nodeType}</small> : null}
          </div>
          {ingredient.nodeType === NodeTypes.ROOT ?
            <Icon type='edit' className='icon-button' title='Click to edit amount'
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalData(ingredient);
                  }}/> : null}
        </div>;
      })}
      {modal}
    </div>
  </View>;
};

export default React.memo(ViewSummary);
