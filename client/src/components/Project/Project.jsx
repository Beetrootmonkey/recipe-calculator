import React, {useEffect, useState} from 'react';
import CreationIntent from '../../util/CreationIntent';
import LocalStorageKeys from '../../util/LocalStorageKeys';
import IngredientModal from '../Modal/IngredientModal';
import ViewSummary from '../View/ViewSummary';
import ViewTree from '../View/ViewTree';
import './styling.css';

const Project = ({tab, setRecipeModalData, recipeMapping}) => {
  const prefix = tab ? 'project_' + tab + '_' : '';
  const [ingredientModalData, setIngredientModalData] = useState(null);
  const [recipeTreeRoots, setRecipeTreeRoots] = useState(JSON.parse(localStorage.getItem(prefix + LocalStorageKeys.TREE_ROOTS)) || {});
  const [nodesClosedState, setNodesClosedState] = useState(JSON.parse(window.localStorage.getItem(prefix + LocalStorageKeys.TREE_NODES_CLOSED_STATE)) || {});

  useEffect(() => localStorage.setItem(prefix + LocalStorageKeys.TREE_ROOTS, JSON.stringify(recipeTreeRoots)), [recipeTreeRoots]);
  useEffect(() => localStorage.setItem(prefix + LocalStorageKeys.TREE_NODES_CLOSED_STATE, JSON.stringify(nodesClosedState)), [nodesClosedState]);

  let ingredientModal = null;
  if (ingredientModalData) {
    ingredientModal = <IngredientModal intent={ingredientModalData} closeModal={() => setIngredientModalData(null)}
                                       onConfirm={(ingredient) => {
                                         if (ingredientModalData === CreationIntent.CREATE_MAPPING) {
                                           setRecipeModalData(ingredient);
                                         } else if (ingredientModalData === CreationIntent.CREATE_TREE) {
                                           setRecipeTreeRoots((state) => ({...state, [ingredient.id]: ingredient}));
                                         } else {
                                           console.log('UNKOWN OPTION');
                                         }
                                       }}/>;
  }

  return <div className='Project body'>
    <ViewTree onClickButton={() => setIngredientModalData(CreationIntent.CREATE_TREE)}
              onClickElement={(ingredient) => setRecipeModalData(ingredient)} recipeMapping={recipeMapping}
              recipeTreeRoots={recipeTreeRoots} nodesClosedState={nodesClosedState}
              setNodesClosedState={setNodesClosedState}
              onRemoveElement={(ingredientId) => setRecipeTreeRoots((state) => {
                const newState = {...state};
                delete newState[ingredientId];
                return newState;
              })}/>
    <ViewSummary tab={tab} onClickButton={() => setIngredientModalData(CreationIntent.CREATE_TREE)}
                 onClickElement={(ingredient) => setRecipeModalData(ingredient)} recipeMapping={recipeMapping}
                 recipeTreeRoots={recipeTreeRoots} nodesClosedState={nodesClosedState}
                 onSetAmount={(ingredient, amount) => setRecipeTreeRoots((state) => ({
                   ...state,
                   [ingredient.id]: {...ingredient, amount}
                 }))}/>

    {ingredientModal}
  </div>;
};

export default Project;
