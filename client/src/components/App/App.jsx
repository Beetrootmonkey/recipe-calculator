import React, {useState} from 'react';
import CreationIntent from '../../util/CreationIntent';
import IngredientModal from '../Modal/IngredientModal';
import RecipeModal from '../Modal/RecipeModal';
import Navbar from '../Navbar/Navbar';
import ViewInstructions from '../View/ViewInstructions';
import ViewMapping from '../View/ViewMapping';
import ViewSummary from '../View/ViewSummary';
import ViewTree from '../View/ViewTree';
import './styling.css';

const App = () => {
  const [ingredientModalData, setIngredientModalData] = useState(null);
  const [recipeModalData, setRecipeModalData] = useState(null);

  let ingredientModal = null;
  if (ingredientModalData) {
    ingredientModal = <IngredientModal intent={ingredientModalData} closeModal={() => setIngredientModalData(null)}
                                       onConfirm={(item) => {
                                         if (ingredientModalData === CreationIntent.CREATE_MAPPING) {
                                           setRecipeModalData(item);
                                           console.log('Opening recipe modal');
                                         } else if (ingredientModalData === CreationIntent.CREATE_TREE) {
                                           console.log('Creating tree');
                                         } else {
                                           console.log('UNKOWN OPTION');
                                         }
                                       }}/>;
  }

    console.log('recipeModalData', recipeModalData);
  let recipeModal = null;
  if (recipeModalData) {
    recipeModal = <RecipeModal outputItem={recipeModalData} closeModal={() => setRecipeModalData(null)}
                               onConfirm={(recipeId) => console.log('Creating mapping')}/>;
  }

  return <div className="App">
    <Navbar title='Recipe Calculator'/>
    <div className='content'>
      <div className='body'>
        <ViewMapping onClickButton={() => setIngredientModalData(CreationIntent.CREATE_MAPPING)}/>
        <ViewTree onClickButton={() => setIngredientModalData(CreationIntent.CREATE_TREE)}/>
        <ViewSummary/>
        <ViewInstructions/>
      </div>
    </div>
    {ingredientModal}
    {recipeModal}
  </div>;
};

export default App;
