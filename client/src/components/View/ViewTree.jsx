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

const ViewTree = ({onClickButton, onClickElement, onRemoveElement, recipeMapping, recipeTreeRoots, nodesClosedState, setNodesClosedState}) => {

  const list = [];
  const addInput = (ingredient, path, registeredIngredients = {}) => {
    registeredIngredients = {...registeredIngredients};
    const entry = {...ingredient, path};
    list.push(entry);
    const obj = recipeMapping[ingredient.id];
    if (obj == null) {
      if (entry.nodeType !== NodeTypes.ROOT) {
        entry.nodeType = NodeTypes.LEAF;
      } else {
        entry.nodeType = NodeTypes.STUMP;
      }
      return;
    }

    const {recipe} = obj;
    if (recipe) {
      entry.recipeType = recipe.type;

      if (registeredIngredients[ingredient.id]) {
        // Has been used before
        return;
      }

      registeredIngredients[ingredient.id] = ingredient;
      if (nodesClosedState[ingredient.id]) {
        return;
      }

      if (recipe.inputs) {
        recipe.inputs.forEach((input) => addInput({
          ...input,
          nodeType: NodeTypes.INTERMEDIATE
        }, '      ' + (path || ''), registeredIngredients));
      } else {
        console.error('Found recipe with no inputs:', recipe);
      }
    }
  };
  Object.values(recipeTreeRoots || {}).forEach((ingredient) => {
    addInput({...ingredient, nodeType: NodeTypes.ROOT});
  });

  return <View className='ViewTree'>
    <div className='view-header'>
      <div className='title'><h2>Tracked items</h2><small>
        <Icon type='help' className='help-icon'
              title={'Add items that you want to track. Tracked items are represented as \'Root\' in this tree. ' +
              'You can choose how these items are crafted though clicking here or in \'Tasks\'. This view is more or ' +
              'less just an overview of the recipe structure. Use \'Tasks\' to gather and process items.'}/></small>
      </div>
      <span>
        <Button className={!list.length ? 'pulsating' : ''} size='big' onClick={onClickButton}>Add item</Button>
      </span>
    </div>
    <div className='view-body'>
      {list.length ? list.map((ingredient, index) => {
        const title = `Click to ${recipeMapping[ingredient.id] ? 'change' : 'add a'} recipe for ` + ingredient.name;
        return <div
          className={'view-entry ' + ingredient.nodeType + (nodesClosedState[ingredient.id] ? ' closed' : ' open')}
          key={ingredient.id + '-' + index}
          onClick={() => onClickElement(ingredient)}
          title={title}>
          <div>
            {ingredient.path ? <small>{ingredient.path}</small> : null}
            {![NodeTypes.LEAF, NodeTypes.STUMP].includes(ingredient.nodeType)
              ? <Icon type={nodesClosedState[ingredient.id] ? 'chevron_right' : 'expand_more'}
                      className='icon-button'
                      title='Click see more'
                      onClick={(e) => {
                        e.stopPropagation();
                        setNodesClosedState((state) => ({
                          ...state,
                          [ingredient.id]: !nodesClosedState[ingredient.id]
                        }));
                      }}/>
              : <span className='bullet'>{'  •  '}</span>}
            <img src={'/icons/' + ingredient.id} alt='' width="24" height="24"/>
            {ingredient.name}
            {ingredient.recipeType ? <small><i>{'via ' + ingredient.recipeType}</i></small> : null}
          </div>
          {[NodeTypes.ROOT, NodeTypes.STUMP].includes(ingredient.nodeType) ?
            <Icon type='close' className='icon-button error' title='Click to remove recipe'
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveElement(ingredient.id);
                  }}/> : null}
        </div>;
      }) : <div className='empty-content-hint'>Click on 'Add item' to start tracking</div>}
    </div>
  </View>;
};

export default React.memo(ViewTree);
