import React, {useEffect, useState} from 'react';
import LocalStorageKeys from '../../util/LocalStorageKeys';
import RecipeModal from '../Modal/RecipeModal';
import Navbar from '../Navbar/Navbar';
import Project from '../Project/Project';
import './styling.css';

const App = () => {
  const [recipeModalData, setRecipeModalData] = useState(null);
  const [recipeMapping, setRecipeMapping] = useState(JSON.parse(localStorage.getItem(LocalStorageKeys.RECIPE_MAPPING)) || {});
  const [activeTab, setActiveTab] = useState(JSON.parse(window.localStorage.getItem(LocalStorageKeys.ACTIVE_TAB)) || 0);

  useEffect(() => localStorage.setItem(LocalStorageKeys.RECIPE_MAPPING, JSON.stringify(recipeMapping)), [recipeMapping]);
  useEffect(() => localStorage.setItem(LocalStorageKeys.ACTIVE_TAB, JSON.stringify(activeTab)), [activeTab]);

  let recipeModal = null;
  if (recipeModalData) {
    recipeModal = <RecipeModal outputItem={recipeModalData} closeModal={() => setRecipeModalData(null)}
                               onConfirm={(recipe) => setRecipeMapping((state) => {
                                 const newState = {...state};
                                 if (recipe == null) {
                                   delete newState[recipeModalData.id];
                                   return newState;
                                 }
                                 newState[recipeModalData.id] = {ingredient: recipeModalData, recipe};
                                 return newState;
                               })} chosenRecipe={recipeMapping[recipeModalData.id]}/>;
  }

  const renderTab = (index) => {
    return <span className={'tab' + (activeTab === index ? ' active' : '')}
                 onClick={() => setActiveTab(index)}>Project {index + 1}</span>;
  };

  const renderProject = (index) => {
    if (activeTab === index) {
      return <Project key={index} tab={index}
                      setRecipeModalData={setRecipeModalData} recipeMapping={recipeMapping}/>;
    }
    return null;
  };

  return <div className="App">
    <Navbar title='GT:NH Recipe Calculator v1.2.2'/>
    <div className='tabs'>
      {renderTab(0)}
      {renderTab(1)}
      {renderTab(2)}
      {renderTab(3)}
      {renderTab(4)}
      {renderTab(5)}
      {renderTab(6)}
      {renderTab(7)}
    </div>
    <div className='content'>
      {renderProject(0)}
      {renderProject(1)}
      {renderProject(2)}
      {renderProject(3)}
      {renderProject(4)}
      {renderProject(5)}
      {renderProject(6)}
      {renderProject(7)}
    </div>
    {recipeModal}
  </div>;
};

export default App;
