import React, {useEffect, useState} from 'react';
import LocalStorageKeys from '../../util/LocalStorageKeys';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import View from './View';

const NodeTypes = {
  ROOT: 'Root',
  LEAF: 'Leaf',
  INTERMEDIATE: 'Intermediate',
  STUMP: 'Stump'
};

const ViewTree = ({onClickButton, onClickElement, onRemoveElement, recipeMapping, recipeTreeRoots}) => {
  const [nodesClosedState, setNodesClosedState] = useState(JSON.parse(window.localStorage.getItem(LocalStorageKeys.TREE_NODES_CLOSED_STATE)) || {});
  // TODO: Nur mittelmäßig geil, dass die Einträge der selben Zutat sich immer alle auf einmal öffnen/schließen
  useEffect(() => localStorage.setItem(LocalStorageKeys.TREE_NODES_CLOSED_STATE, JSON.stringify(nodesClosedState)), [nodesClosedState]);

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
      <div className='title'>Tracked items<small>
        <Icon type='help' className='help-icon'
              title={'Add items that you want to track. Tracked items are represented as \'roots\' in this tree. ' +
              'You can choose how these items are crafted; you can even choose recipes for ingredients of recipes.'}/></small>
      </div>
      <Button onClick={onClickButton} title='Click to add an item'>+</Button>
    </div>
    <div className='view-body'>
      {list.map((ingredient) => {
        const title = `Click to ${recipeMapping[ingredient.id] ? 'change' : 'add a'} mapping for ` + ingredient.name;
        return <div className={'view-entry ' + ingredient.nodeType} key={ingredient.id}
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
              : '     '}
            {ingredient.type === 'ITEM' ? <img src={'/icons/' + ingredient.name} width="24" height="24"/> : null}
            {ingredient.name}
            {ingredient.recipeType ? <small>{'via ' + ingredient.recipeType}</small> : null}
          </div>
          {[NodeTypes.ROOT, NodeTypes.STUMP].includes(ingredient.nodeType) ?
            <Icon type='close' className='icon-button error' title='Click to remove recipe'
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveElement(ingredient.id);
                  }}/> : null}
        </div>;
      })}
    </div>
  </View>;
};

export default React.memo(ViewTree);
