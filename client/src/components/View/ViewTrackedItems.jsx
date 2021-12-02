import React from 'react';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import View from './View';

const NodeTypes = {
  ROOT: 'Root',
  LEAF: 'Leaf',
  INTERMEDIATE: 'Intermediate',
  STUMP: 'Stump'
};

const ViewTrackedItems = ({onClickButton, onClickElement, onRemoveElement, recipeMapping, recipeTreeRoots, nodesClosedState, setNodesClosedState, setAmountModalData}) => {

  const list = [];
  const addInput = (ingredient, path, registeredIngredients = {}) => {
    const entry = {...ingredient, path};
    list.push(entry);
    const obj = recipeMapping[ingredient.id];
    if (obj == null) {
      if (entry.nodeType !== NodeTypes.ROOT) {
        entry.nodeType = NodeTypes.LEAF;
      } else {
        entry.nodeType = NodeTypes.STUMP;
      }
    }
  };
  Object.values(recipeTreeRoots || {}).forEach((ingredient) => {
    addInput({...ingredient, nodeType: NodeTypes.ROOT});
  });

  return <View className='ViewTrackedItems'>
    <div className='view-header'>
      <div className='title'><h2>Tracked items</h2><small>
        <Icon type='help' className='help-icon'
              title={'Add items that you want to track. Tracked items are represented as \'Root\' in this tree. ' +
              'You can choose how these items are crafted though clicking here or in \'Tasks\'. This view is more or ' +
              'less just an overview of the recipe structure. Use \'Tasks\' to gather and process items.'}/></small>
      </div>
      <span className='spacer'/>
      <span>
        <Button className={!list.length ? 'pulsating' : ''} size='big' onClick={onClickButton}>Add item</Button>
      </span>
    </div>
    <div className='view-body'>
      {list.length ? list.map((ingredient, index) => {
        const title = `ID: ${ingredient.id}`;
        const noRecipes = [NodeTypes.LEAF, NodeTypes.STUMP].includes(ingredient.nodeType);

        return <div
          className={'view-entry ' + ingredient.nodeType + (nodesClosedState[ingredient.id] ? ' closed' : ' open')}
          key={ingredient.id + '-' + index}
          title={title}>
          <div>
            {ingredient.path ? <small>{ingredient.path}</small> : null}
            <Icon type={nodesClosedState[ingredient.id] ? 'visibility_off' : 'visibility'}
                      className={'icon-button' + (noRecipes ? ' disabled' : '')}
                      title='Click toggle visibility of recipes for this item'
                      onClick={noRecipes ? null : (e) => {
                        e.stopPropagation();
                        setNodesClosedState((state) => ({
                          ...state,
                          [ingredient.id]: !nodesClosedState[ingredient.id]
                        }));
                      }}/>
            <img src={'/icons/' + ingredient.id} alt='' width="24" height="24"/>
            {ingredient.name}
            <small>{ingredient.amount || 1}</small>
          </div>
          <span className='spacer'/>
          <Icon type='build' className='icon-button' title='Click to edit amount to craft'
                onClick={(e) => {
                  e.stopPropagation();
                  setAmountModalData(ingredient);
                }}/>
          <Icon type='close' className='icon-button error' title='Click to remove tracked item'
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveElement(ingredient.id);
                }}/>
        </div>;
      }) : <div className='empty-content-hint'>Click on 'Add item' to start tracking</div>}
    </div>
  </View>;
};

export default React.memo(ViewTrackedItems);
