import React, {useEffect, useState} from 'react';
import getCompactAmount from '../../util/getCompactAmount';
import {getUnitFromIngredientType} from '../../util/IngredientFormat';
import LocalStorageKeys from '../../util/LocalStorageKeys';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import Modal from '../Modal/Modal';
import SummaryModal from '../Modal/SummaryModal';
import View from './View';

const NodeTypes = {
  ROOT: 'Root',
  LEAF: 'Gather',
  INTERMEDIATE: 'Process'
};

const RecipeListDisplayOptions = {
  IN_ORDER: 'Show tasks in order of processing',
  GROUPED_BY_TYPE: 'Show tasks grouped by recipe type'
};

const RecipeListDisplayTypes = {
  IN_ORDER: 'IN_ORDER',
  GROUPED_BY_TYPE: 'GROUPED_BY_TYPE'
};

const CheckboxStates = {
  UNCHECKED: 'UNCHECKED',
  INDETERMINATE: 'INDETERMINATE',
  CHECKED: 'CHECKED'
};

const ViewSummary = ({tab, onClickElement, recipeMapping, recipeTreeRoots, onSetAmount, nodesClosedState}) => {
  const prefix = tab ? 'project_' + tab + '_' : '';
  const [modalData, setModalData] = useState(null);
  const [clearEverythingModalData, setClearEverythingModalData] = useState(false);
  const [checkboxState, setCheckboxState] = useState(JSON.parse(localStorage.getItem(prefix + LocalStorageKeys.SUMMARY_CHECK_BOX_STATE)) || {});
  const [ingredientsInStock, setIngredientsInStock] = useState(JSON.parse(localStorage.getItem(prefix + LocalStorageKeys.SUMMARY_INGREDIENTS_IN_STOCK)) || {});
  const [recipeListDisplayType, setRecipeListDisplayType] = useState(localStorage.getItem(LocalStorageKeys.SUMMARY_RECIPE_LIST_DISPLAY_TYPE) || RecipeListDisplayTypes.IN_ORDER);
  const [hideCompletedTasks, setHideCompletedTasks] = useState(JSON.parse(localStorage.getItem(LocalStorageKeys.SUMMARY_HIDE_COMPLETED_TASKS)) || false);
  const [hideTools, setHideTools] = useState(JSON.parse(localStorage.getItem(LocalStorageKeys.SUMMARY_HIDE_TOOLS)) || false);
  const [hideNonCompletableTasks, setHideNonCompletableTasks] = useState(JSON.parse(localStorage.getItem(LocalStorageKeys.SUMMARY_HIDE_NON_COMPLETABLE_TASKS)) || false);
  const [fadingState, setFadingState] = useState({});

  useEffect(() => localStorage.setItem(prefix + LocalStorageKeys.SUMMARY_CHECK_BOX_STATE, JSON.stringify(checkboxState)), [checkboxState]);
  useEffect(() => localStorage.setItem(prefix + LocalStorageKeys.SUMMARY_INGREDIENTS_IN_STOCK, JSON.stringify(ingredientsInStock)), [ingredientsInStock]);
  useEffect(() => localStorage.setItem(LocalStorageKeys.SUMMARY_RECIPE_LIST_DISPLAY_TYPE, recipeListDisplayType), [recipeListDisplayType]);
  useEffect(() => localStorage.setItem(LocalStorageKeys.SUMMARY_HIDE_COMPLETED_TASKS, JSON.stringify(hideCompletedTasks)), [hideCompletedTasks]);
  useEffect(() => localStorage.setItem(LocalStorageKeys.SUMMARY_HIDE_TOOLS, JSON.stringify(hideTools)), [hideTools]);
  useEffect(() => localStorage.setItem(LocalStorageKeys.SUMMARY_HIDE_NON_COMPLETABLE_TASKS, JSON.stringify(hideNonCompletableTasks)), [hideNonCompletableTasks]);

  const ingredientMaxDepths = {};
  const ingredientTypes = {};
  const ingredientNames = {};
  const ingredientIconNames = {};
  const addInput = (ingredient, depth) => {
    ingredientTypes[ingredient.id] = ingredient.type;
    ingredientNames[ingredient.id] = ingredient.name;
    ingredientIconNames[ingredient.id] = ingredient.iconName;
    if (ingredientMaxDepths[ingredient.id] == null) {
      ingredientMaxDepths[ingredient.id] = depth;
    } else {
      ingredientMaxDepths[ingredient.id] = Math.max(ingredientMaxDepths[ingredient.id], depth);
    }

    const {recipe} = recipeMapping[ingredient.id] || {};
    if (recipe && !nodesClosedState[ingredient.id]) {
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
    .forEach(([ingredientId, ingredient]) => ingredientAmounts[ingredientId] = ingredient.amount || 1);

  const list = Object.entries(ingredientMaxDepths).map(([ingredientId, depth]) => {
    const {recipe} = recipeMapping[ingredientId] || {};
    if (recipe && !nodesClosedState[ingredientId]) {
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
    let neededAmount = ingredientAmounts[ingredientId] - (ingredientsInStock[ingredientId] || 0);

    if (!recipe) {
      return {
        ingredientId,
        recipe,
        depth,
        totalOutputAmount: neededAmount,
        overhead: 0,
        timesToCraft: 1,
        nodeType: recipeTreeRoots[ingredientId] ? NodeTypes.ROOT : NodeTypes.LEAF
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
    const isTool = () => {
      return !ingredientAmounts[props.ingredientId];
    };

    if (hideCompletedTasks && checkboxState[props.ingredientId] === CheckboxStates.CHECKED) {
      return;
    }
    if (hideTools && isTool()) {
      return;
    }
    if (hideNonCompletableTasks && props.recipe && props.recipe.inputs.find((input) => checkboxState[input.id] !== CheckboxStates.CHECKED) && nodeType !== NodeTypes.ROOT) {
      return;
    }

    let type = nodeType;
    if (recipeListDisplayType === RecipeListDisplayTypes.GROUPED_BY_TYPE) {
      type = props.recipe ? props.recipe.type : nodeType;
    }
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(props);
  });

  let modal;
  if (modalData) {
    modal = <SummaryModal ingredient={modalData} closeModal={() => setModalData(null)}
                          onConfirm={modalData.onConfirm || ((amount) => onSetAmount(modalData, amount))}
                          inStock={modalData.inStock} amountInStock={modalData.amountInStock}/>;
  }

  let clearEverythingModal;
  if (clearEverythingModalData) {
    clearEverythingModal = <Modal className='clear-everything' onKeyDown={(e) => {
      if (e.key === 'Escape') {
        setClearEverythingModalData(false);
      }
    }}>
      <div className='modal-body'>
        {(checkboxState != null && Object.keys(checkboxState).length > 0) || (ingredientsInStock != null && Object.keys(ingredientsInStock).length > 0)
          ? 'You are about to clear all stock and checkbox data. Are you sure you want to continue?'
          : <span>
            <div>There is nothing to clear.</div>
            <div>Come back after you finish crafting and want to reset.</div>
        </span>}
      </div>
      <div className='modal-footer'>
        <Button size='big' onClick={() => setClearEverythingModalData(false)}>Close</Button>
        {(checkboxState != null && Object.keys(checkboxState).length > 0) || (ingredientsInStock != null && Object.keys(ingredientsInStock).length > 0)
          ? <Button size='big' onClick={() => {
            setClearEverythingModalData(false);
            setIngredientsInStock({});
            setCheckboxState({});
          }}>Yes, continue
          </Button>
          : <span/>}
      </div>
    </Modal>;
  }

  return <View className='ViewSummary'>
    <div className='view-header'>
      <span className='title'><h2>Tasks</h2><small>
        <Icon type='help' className='help-icon'
              title={'This view will show ingredients you need to gather and recipes you need to do. ' +
              'Do these tasks from top to bottom. You can tell the system if you already have items in stock by clicking ' +
              'the pencil button next to ingredients. Click the pencil button next to the tracked item (\'Root\') to ' +
              'change the amount you want to craft. Use the \'Clear\' button to reset stock and checkbox data.'}/></small>
      </span>
      <div className='icon-button-wrapper'>
        <Icon type='format_paint'
              className={'icon-button big' + (!hideTools ? ' active' : '')}
              title={!hideTools ? 'Click to hide tools in \'Gather\'' : 'Click to show tools in \'Gather\''}
              onClick={() => setHideTools(!hideTools)}
        />
      </div>
      <div className='icon-button-wrapper'>
        <Icon type='done_all'
              className={'icon-button big' + (!hideCompletedTasks ? ' active' : '')}
              title={!hideCompletedTasks ? 'Click to hide completed tasks' : 'Click to keep/show completed tasks'}
              onClick={() => setHideCompletedTasks(!hideCompletedTasks)}
        />
      </div>
      <div className='icon-button-wrapper'>
        <Icon type='watch_later'
              className={'icon-button big' + (!hideNonCompletableTasks ? ' active' : '')}
              title={!hideNonCompletableTasks ? 'Click to hide tasks that you cannot complete yet. This is based on the checkboxes of previous tasks.' : 'Click to keep/show tasks that you cannot complete yet. This is based on the checkboxes of previous tasks.'}
              onClick={() => setHideNonCompletableTasks(!hideNonCompletableTasks)}
        />
      </div>
      <span className='spacer'/>
      <select value={recipeListDisplayType} onChange={(e) => setRecipeListDisplayType(e.target.value)}>
        <option value={RecipeListDisplayTypes.IN_ORDER}>{RecipeListDisplayOptions.IN_ORDER}</option>
        <option value={RecipeListDisplayTypes.GROUPED_BY_TYPE}>{RecipeListDisplayOptions.GROUPED_BY_TYPE}</option>
      </select>
      <span>
        <Button size='big' onClick={() => setClearEverythingModalData(true)}>Clear</Button>
      </span>
    </div>
    <div className='view-body'>
      {Object.entries(groups).length ? Object.entries(groups).sort(([groupA], [groupB]) => {
        if (groupA === 'Gather') {
          return -1;
        }
        if (groupB === 'Gather') {
          return 1;
        }
        return groupA < groupB ? -1 : 1;
      }).map(([group, ingredientList]) => {
        return <div key={group}>
          <div className='view-summary-group'>{group}</div>
          {ingredientList.sort(({ingredientId: ingredientIdA}, {ingredientId: ingredientIdB}) => {
            if (group === 'Gather') {
              const nameA = ingredientNames[ingredientIdA];
              const nameB = ingredientNames[ingredientIdB];
              const amountA = ingredientAmounts[ingredientIdA];
              const amountB = ingredientAmounts[ingredientIdB];
              const typeA = ingredientTypes[ingredientIdA];
              const typeB = ingredientTypes[ingredientIdB];

              if (nameA === nameB || (!nameA.includes('Ingot') && !nameB.includes('Ingot')) || (nameA.includes('Ingot') && nameB.includes('Ingot'))) {
                if (typeA === typeB) {
                  if (amountA === amountB) {
                    return ingredientIdA < ingredientIdB ? -1 : 1;
                  } else if (amountA < amountB) {
                    return -1;
                  } else {
                    return 1;
                  }
                } else if (typeA === 'ITEM') {
                  return -1;
                } else if (typeB === 'ITEM') {
                  return 1;
                } else if (typeA === 'ORE DICT') {
                  return -1;
                } else {
                  return 1;
                }
              } else if (nameA.includes('Ingot') && !nameB.includes('Ingot')) {
                return -1;
              } else if (!nameA.includes('Ingot') && nameB.includes('Ingot')) {
                return 1;
              }
            }
            return 0;
          }).map(({ingredientId, recipe, depth, totalOutputAmount, overhead, timesToCraft}) => {
            let name = ingredientNames[ingredientId];

            let amount = totalOutputAmount;

            const unit = getUnitFromIngredientType(ingredientTypes[ingredientId]);
            const title = `ID: ${ingredientId}\nAmount: ${amount + (unit ? ' ' + unit : '')}\nClick to ${recipe ? 'change' : 'add a'} recipe`;
            const amountTextLeft = getCompactAmount(amount, ingredientTypes[ingredientId]);
            const amountTextTotal = ingredientsInStock[ingredientId]
              ? getCompactAmount(amount + ingredientsInStock[ingredientId], ingredientTypes[ingredientId])
              : amountTextLeft;

            return <div className={'view-entry ' + group + (checkboxState[ingredientId] === CheckboxStates.CHECKED
              ? ' checked'
              : (checkboxState[ingredientId] === CheckboxStates.INDETERMINATE
                ? ' in-progress'
                : '')) + (fadingState[ingredientId] ? ' fading' : ' unchecked')}
                        key={ingredientId}
                        onClick={() => onClickElement({id: ingredientId, name: ingredientNames[ingredientId]})}
                        title={title}>
              <div className={'content ' + (group !== NodeTypes.LEAF ? 'process' : 'ingredient')}>
                <span className={(group !== NodeTypes.LEAF ? 'process' : 'ingredient') + '-header'}>
                  <img src={'/icons/' + ingredientId} alt='' width="24" height="24"/>
                  <span className={recipeTreeRoots[ingredientId] ? 'item-name-big' : ''}>{recipeTreeRoots[ingredientId]
                    ? '[Tracked item] ' + name
                    : name}</span>
                  <small>{group === 'Gather' ? amountTextTotal : amountTextLeft}</small>
                  {amountTextTotal !== amountTextLeft && checkboxState[ingredientId] !== CheckboxStates.CHECKED && group === 'Gather'
                    ?
                    <small>{'(left: ' + (amountTextLeft || 'none') + ')'}</small>
                    : null}
                  {/*{ingredientsInStock[ingredientId] ?*/}
                  {/*  <small>{' (+' + getCompactAmount(ingredientsInStock[ingredientId], ingredientTypes[ingredientId]) + ' in stock)'}</small> : null}*/}
                  {recipe && recipeListDisplayType !== RecipeListDisplayTypes.GROUPED_BY_TYPE ?
                    <small><i>{'[via ' + recipe.type + ']'}</i></small> : null}
                </span>
                {group !== NodeTypes.LEAF ? <div className='input'>
                  {recipe ? recipe.inputs.map((input) => {
                    return <div key={input.id}>
                      <img src={'/icons/' + input.id} alt='' width="24" height="24"/>
                      {input.name}
                      {input.amount ? <small>{getCompactAmount(input.amount * timesToCraft, input.type)}</small> : null}
                    </div>;
                  }) : null}
                </div> : null}
              </div>
              <span className='spacer'/>
              <span className='icon-button-wrapper'>
                {recipeTreeRoots[ingredientId]
                  ? <Icon type='build' className='icon-button' title='Click to edit amount to craft'
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalData(recipeTreeRoots[ingredientId]);
                          }}/>
                  : <Icon type='storage' className='icon-button' title='Click to edit amount in stock'
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalData({
                              id: ingredientId,
                              name: ingredientNames[ingredientId],
                              type: ingredientTypes[ingredientId],
                              amount: amount + (ingredientsInStock[ingredientId] || 0),
                              amountInStock: ingredientsInStock[ingredientId],
                              inStock: true,
                              onConfirm: (newAmount) => {
                                const val = Math.min(Math.max(amount + (ingredientsInStock[ingredientId] || 0), 0), newAmount);
                                setIngredientsInStock((state) => ({
                                  ...state,
                                  [ingredientId]: val
                                }));
                                // if (val === Math.max(amount + (ingredientsInStock[ingredientId] || 0), 0)) {
                                //   setCheckboxState((state) => ({...state, [ingredientId]: CheckboxStates.CHECKED}));
                                // }
                              }
                            });
                          }}/>}
              </span>
              <div className='icon-button-wrapper'>
                <div>
                  <Icon type={(checkboxState[ingredientId] === CheckboxStates.CHECKED
                    ? 'check_box'
                    : (checkboxState[ingredientId] === CheckboxStates.INDETERMINATE
                      ? 'indeterminate_check_box'
                      : 'check_box_outline_blank'))}
                        className={'icon-button big'}
                        title={(checkboxState[ingredientId] === CheckboxStates.CHECKED
                          ? 'Mark task as \'open\''
                          : (checkboxState[ingredientId] === CheckboxStates.INDETERMINATE
                            ? 'Mark task as \'done\''
                            : 'Mark task as \'in progress\''))}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (fadingState[ingredientId]) {
                            // Ignore
                          } else if (checkboxState[ingredientId] === CheckboxStates.INDETERMINATE) {
                            if (hideCompletedTasks) {
                              setFadingState((state) => ({...state, [ingredientId]: true}));
                              window.setTimeout(() => {
                                setCheckboxState((state) => ({...state, [ingredientId]: CheckboxStates.CHECKED}));
                                setFadingState((state) => ({...state, [ingredientId]: false}));
                              }, 400);
                            } else {
                              setCheckboxState((state) => ({...state, [ingredientId]: CheckboxStates.CHECKED}));
                            }
                          } else if (checkboxState[ingredientId] === CheckboxStates.CHECKED) {
                            setCheckboxState((state) => ({...state, [ingredientId]: !state[ingredientId]}));
                          } else {
                            setCheckboxState((state) => ({...state, [ingredientId]: CheckboxStates.INDETERMINATE}));
                          }
                        }}/>
                </div>
              </div>
            </div>;
          })}
        </div>;
      }) : <div className='empty-content-hint'>Click on 'Add item' to start tracking</div>}
      {modal}
      {clearEverythingModal}
    </div>
  </View>;
};

export default React.memo(ViewSummary);
