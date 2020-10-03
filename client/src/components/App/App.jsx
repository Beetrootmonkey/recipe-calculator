import React, {useCallback, useState} from 'react';
import ItemModal from '../Modal/ItemModal';
import Navbar from '../Navbar/Navbar';
import ViewInstructions from '../View/ViewInstructions';
import ViewMapping from '../View/ViewMapping';
import ViewSummary from '../View/ViewSummary';
import ViewTree from '../View/ViewTree';
import './styling.css';

const App = () => {
  const [ingredients, setIngredients] = useState();
  const [loadingState, setLoadingState] = useState({});
  const [itemModalData, setItemModalData] = useState(false);
  const [itemModalInfo, setItemModalInfo] = useState(null);

  const loadIngredients = useCallback((searchValue) => {
    (async () => {
      setLoadingState((state) => ({...state, 'ingredients': true}));
      const response = await fetch('/ingredients?inputItemSearch=' + searchValue);
      const body = await response.json();
      setIngredients(body.ingredients);
      setItemModalInfo(body.info);
      setLoadingState((state) => ({...state, 'ingredients': false}));
      if (response.status !== 200) { // TODO: Error handling
        throw Error(body.message);
      }

    })();
  }, []);

  let itemModal = null;
  if (itemModalData) {
    itemModal = <ItemModal loadIngredients={loadIngredients}
                           ingredients={ingredients}
                           closeModal={() => setItemModalData(false)}
                           info={itemModalInfo}/>;
  }

  return <div className="App">
    <Navbar title='Recipe Calculator'/>
    <div className='content'>
      <div className='body'>
        <ViewMapping onClickButton={() => setItemModalData(true)}/>
        <ViewTree/>
        <ViewSummary/>
        <ViewInstructions/>
      </div>
    </div>
    {itemModal}
  </div>;
};

export default App;
