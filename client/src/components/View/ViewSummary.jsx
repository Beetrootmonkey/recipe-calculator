import React, {useEffect, useState} from 'react';
import getCompactAmount from '../../util/getCompactAmount';
import {getUnitFromIngredientType} from '../../util/IngredientFormat';
import LocalStorageKeys from '../../util/LocalStorageKeys';
import Icon from '../Icon/Icon';
import SummaryModal from '../Modal/SummaryModal';
import View from './View';

const NodeTypes = {
  ROOT: 'Root',
  LEAF: 'Gather',
  INTERMEDIATE: 'Process'
};

const ViewSummary = ({onClickElement, recipeMapping, recipeTreeRoots, onSetAmount}) => {
  const [modalData, setModalData] = useState(null);
  const [checkboxState, setCheckboxState] = useState(JSON.parse(localStorage.getItem(LocalStorageKeys.SUMMARY_CHECK_BOX_STATE)) || {});

  useEffect(() => localStorage.setItem(LocalStorageKeys.SUMMARY_CHECK_BOX_STATE, JSON.stringify(checkboxState)), [checkboxState]);

  const ingredientMaxDepths = {};
  const ingredientTypes = {};
  const ingredientNames = {};
  const addInput = (ingredient, depth) => {
    ingredientTypes[ingredient.id] = ingredient.type;
    ingredientNames[ingredient.id] = ingredient.name;
    if (ingredientMaxDepths[ingredient.id] == null) {
      ingredientMaxDepths[ingredient.id] = depth;
    } else {
      ingredientMaxDepths[ingredient.id] = Math.max(ingredientMaxDepths[ingredient.id], depth);
    }

    const {recipe} = recipeMapping[ingredient.id] || {};
    if (recipe) {

      // let output = recipe.outputs.find((output) => output.id === ingredient.id);
      // const outputAmount = output.amount;
      // const neededAmount = (ingredient.amount != null ? ingredient.amount : 1) * (ingredient.factor || 1);
      // const factor = Math.ceil(neededAmount / outputAmount);

      if (recipe.inputs) {
        recipe.inputs.forEach((input) => addInput({
          ...input
        }, depth + 1));
      } else {
        console.error('Found recipe with no inputs:', recipe);
      }
    }
  };

  Object.values(recipeTreeRoots || {}).forEach((ingredient) => {
    addInput({...ingredient}, 0);
  });

  const ingredientAmounts = {};
  Object.entries(recipeTreeRoots)
    .forEach(([ingredientId, ingredient]) => ingredientAmounts[ingredientId] = ingredient.amount);

  const list = Object.entries(ingredientMaxDepths).map(([ingredientId, depth]) => {
    const {recipe} = recipeMapping[ingredientId] || {};
    if (recipe) {
      return {ingredientId, recipe, depth};
    } else {
      // Leaf = atomic ingredient without a recipe
      return {ingredientId, depth};
    }
  }).filter((e) => e).sort((a, b) => {
    if (a.depth === b.depth) {
      if (a.recipe === b.recipe) { // Only the case if both are NULL
        return 0;
      }
      return a.recipe ? -1 : 1;
    }
    return a.depth < b.depth ? -1 : 1;
  }).map(({ingredientId, recipe, depth}) => {
    let neededAmount = ingredientAmounts[ingredientId];

    if (!recipe) {
      return {
        ingredientId,
        recipe,
        depth,
        totalOutputAmount: neededAmount,
        overhead: 0,
        timesToCraft: 1,
        nodeType: NodeTypes.LEAF
      };
    }

    const recipeOutputAmount = recipe.outputs.find((output) => output.id === ingredientId).amount;
    const timesToCraft = Math.ceil(neededAmount / recipeOutputAmount);
    const totalOutputAmount = recipeOutputAmount * timesToCraft;
    const overhead = totalOutputAmount - neededAmount;

    recipe.inputs.forEach((input) => {
      if (ingredientAmounts[input.id] == null) {
        ingredientAmounts[input.id] = 0;
      }
      ingredientAmounts[input.id] += input.amount * timesToCraft;
    });

    return {
      ingredientId,
      recipe,
      depth,
      totalOutputAmount,
      overhead,
      timesToCraft,
      nodeType: recipeTreeRoots[ingredientId] ? NodeTypes.ROOT : NodeTypes.INTERMEDIATE
    };
  }).reverse();

  const groups = {};
  list.forEach(({nodeType, ...props}) => {
    if (!groups[nodeType]) {
      groups[nodeType] = [];
    }
    groups[nodeType].push(props);
  });

  console.log('groups', groups);

  let modal;
  if (modalData) {
    modal = <SummaryModal ingredient={modalData} closeModal={() => setModalData(null)}
                          onConfirm={(amount) => onSetAmount(modalData, amount)}/>;
  }

  return <View className='ViewSummary'>
    <div className='view-header'>
      <div className='title'><h2>Summary</h2><small>
        <Icon type='help' className='help-icon'
              title={'Items here are automatically added when the tree view is updated, which in turn is updated when you add/change mappings. ' +
              'Use this view to work your way up to your tracked items.'}/></small>
      </div>
    </div>
    <div className='view-body'>
      {Object.entries(groups).map(([nodeType, ingredientList]) => {
        return <div key={nodeType}>
          <div className='view-summary-group'>{nodeType}</div>
          {ingredientList.map(({ingredientId, recipe, depth, totalOutputAmount, overhead, timesToCraft}) => {
            let name = ingredientNames[ingredientId];
            let info;

            const unit = getUnitFromIngredientType(ingredientTypes[ingredientId]);
            let amount = totalOutputAmount - overhead;
            if (overhead) {
              info = '(+' + (overhead) + (unit ? ' ' + unit : '') + ')';
            }

            const title = `Amount: ${amount + ' ' + unit} | Click to ${recipe ? 'change' : 'add a'} mapping`;
            amount = getCompactAmount(amount, ingredientTypes[ingredientId]);

            return <div className={'view-entry ' + nodeType + (checkboxState[ingredientId] ? ' checked' : '')} key={ingredientId}
                        onClick={() => onClickElement({id: ingredientId, name: ingredientNames[ingredientId]})}
                        title={title}>
              <div className={'content ' + (nodeType !== NodeTypes.LEAF ? 'process' : 'ingredient')}>
                <span className={(nodeType !== NodeTypes.LEAF ? 'process' : 'ingredient') + '-header'}>
                  <img src={'/icons/' + name} alt='' width="24" height="24"/>
                  <small>{amount}</small>
                  {info ? <small>{info}</small> : null}
                  {name}
                  {/*{' ' + ingredientMaxDepths[ingredient.id]}*/}
                  {recipe ? <small>{'via ' + recipe.type}</small> : null}
                </span>
                {nodeType === NodeTypes.ROOT ?
                  <Icon type='edit' className='icon-button' title='Click to edit amount'
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalData(recipeTreeRoots[ingredientId]);
                        }}/> : null}
                {nodeType !== NodeTypes.LEAF ? <div className='input'>
                  {recipe ? recipe.inputs.map((input) => {
                    return <div key={input.id}>
                      <img src={'/icons/' + input.name} alt='' width="24" height="24"/>
                      {input.amount ? <small>{getCompactAmount(input.amount * timesToCraft, input.type)}</small> : null}
                      {input.name}
                    </div>;
                  }) : null}
                </div> : null}
              </div>
              <div className='icon-button-wrapper'>
                <div>
                  <Icon type={checkboxState[ingredientId] ? 'check_box' : 'check_box_outline_blank'} className='icon-button'
                        title={checkboxState[ingredientId] ? 'Undo marking task as \'done\'' : 'Mark task as \'done\''}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCheckboxState((state) => ({...state, [ingredientId]: !state[ingredientId]}));
                        }}/>
                </div>
              </div>
            </div>;
          })}
        </div>;
      })}
      {modal}
    </div>
  </View>;
};

export default React.memo(ViewSummary);
