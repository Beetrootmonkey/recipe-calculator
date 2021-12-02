import React, {useEffect, useState} from 'react';
import CreationIntent from '../../util/CreationIntent';
import LocalStorageKeys from '../../util/LocalStorageKeys';
import IngredientModal from '../Modal/IngredientModal';
import SummaryModal from '../Modal/SummaryModal';
import ViewSummary from '../View/ViewSummary';
import ViewTrackedItems from '../View/ViewTrackedItems';
import './styling.css';

const Project = ({tab, setRecipeModalData, recipeMapping}) => {
  const prefix = tab ? 'project_' + tab + '_' : '';
  const [ingredientModalData, setIngredientModalData] = useState(null);
  const [amountModalData, setAmountModalData] = useState(null);
  const [recipeTreeRoots, setRecipeTreeRoots] = useState(JSON.parse(localStorage.getItem(prefix + LocalStorageKeys.TREE_ROOTS)) || {});
  const [nodesClosedState, setNodesClosedState] = useState(JSON.parse(window.localStorage.getItem(prefix + LocalStorageKeys.TREE_NODES_CLOSED_STATE)) || {});


  useEffect(() => localStorage.setItem(prefix + LocalStorageKeys.TREE_ROOTS, JSON.stringify(recipeTreeRoots)), [prefix, recipeTreeRoots]);
  useEffect(() => localStorage.setItem(prefix + LocalStorageKeys.TREE_NODES_CLOSED_STATE, JSON.stringify(nodesClosedState)), [prefix, nodesClosedState]);

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

  let amountModal;
  if (amountModalData) {
    amountModal = <SummaryModal ingredient={amountModalData} closeModal={() => setAmountModalData(null)}
                          onConfirm={amountModalData.onConfirm || ((amount) => setRecipeTreeRoots((state) => ({
                            ...state,
                            [amountModalData.id]: {...amountModalData, amount}
                          })))}
                          inStock={amountModalData.inStock} amountInStock={amountModalData.amountInStock}/>;
  }

  return <div className='Project body'>
    <ViewTrackedItems onClickButton={() => setIngredientModalData(CreationIntent.CREATE_TREE)}
                      onClickElement={(ingredient) => setRecipeModalData(ingredient)} recipeMapping={recipeMapping}
                      recipeTreeRoots={recipeTreeRoots} nodesClosedState={nodesClosedState}
                      setNodesClosedState={setNodesClosedState}
                      onRemoveElement={(ingredientId) => setRecipeTreeRoots((state) => {
                        const newState = {...state};
                        delete newState[ingredientId];
                        return newState;
                      })} setAmountModalData={setAmountModalData}

    />
    {/*<ViewTree onClickButton={() => setIngredientModalData(CreationIntent.CREATE_TREE)}*/}
    {/*          onClickElement={(ingredient) => setRecipeModalData(ingredient)} recipeMapping={recipeMapping}*/}
    {/*          recipeTreeRoots={recipeTreeRoots} nodesClosedState={nodesClosedState}*/}
    {/*          setNodesClosedState={setNodesClosedState}*/}
    {/*          onRemoveElement={(ingredientId) => setRecipeTreeRoots((state) => {*/}
    {/*            const newState = {...state};*/}
    {/*            delete newState[ingredientId];*/}
    {/*            return newState;*/}
    {/*          })}/>*/}
    <ViewSummary tab={tab} onClickButton={() => setIngredientModalData(CreationIntent.CREATE_TREE)}
                 onClickElement={(ingredient) => setRecipeModalData(ingredient)} recipeMapping={recipeMapping}
                 recipeTreeRoots={recipeTreeRoots} nodesClosedState={nodesClosedState} setAmountModalData={setAmountModalData}
    />

    {ingredientModal}
    {amountModal}
  </div>;
};

export default Project;
