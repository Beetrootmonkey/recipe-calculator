import React, {useEffect, useState} from 'react';
import CreationIntent from '../../util/CreationIntent';
import LocalStorageKeys from '../../util/LocalStorageKeys';
import IngredientModal from '../Modal/IngredientModal';
import RecipeModal from '../Modal/RecipeModal';
import Navbar from '../Navbar/Navbar';
import ViewMapping from '../View/ViewMapping';
import ViewTree from '../View/ViewTree';
import './styling.css';

const App = () => {
  const [ingredientModalData, setIngredientModalData] = useState(null);
  const [recipeModalData, setRecipeModalData] = useState(null);
  const [recipeMapping, setRecipeMapping] = useState(JSON.parse(localStorage.getItem(LocalStorageKeys.RECIPE_MAPPING)) || {});
  const [recipeTreeRoots, setRecipeTreeRoots] = useState(JSON.parse(localStorage.getItem(LocalStorageKeys.TREE_ROOTS)) || {});

  useEffect(() => localStorage.setItem(LocalStorageKeys.RECIPE_MAPPING, JSON.stringify(recipeMapping)), [recipeMapping]);


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

  let recipeModal = null;
  if (recipeModalData) {
    recipeModal = <RecipeModal outputItem={recipeModalData} closeModal={() => setRecipeModalData(null)}
                               onConfirm={(recipe) => setRecipeMapping((state) => ({
                                 ...state,
                                 [recipeModalData.id]: {ingredient: recipeModalData, recipe}
                               }))}/>;
  }

  return <div className="App">
    <Navbar title='Recipe Calculator'/>
    <div className='content'>
      <div className='body'>
        <ViewMapping onClickButton={() => setIngredientModalData(CreationIntent.CREATE_MAPPING)}
                     recipeMapping={recipeMapping}
                     onRemoveElement={(ingredientId) => setRecipeMapping((state) => {
                         const newState = {...state};
                         delete newState[ingredientId];
                         return newState;
                       })}/>
        <ViewTree onClickButton={() => setIngredientModalData(CreationIntent.CREATE_TREE)}
                  onClickElement={(ingredient) => setRecipeModalData(ingredient)} recipeMapping={recipeMapping}
                  recipeTreeRoots={recipeTreeRoots}/>
        {/*<ViewSummary/>*/}
        {/*<ViewInstructions/>*/}
      </div>
    </div>
    {ingredientModal}
    {recipeModal}
  </div>;
};

export default App;
