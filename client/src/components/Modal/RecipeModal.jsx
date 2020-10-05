import React, {useCallback, useEffect} from 'react';
import {useDebounce} from '../../hooks/useDebounce';
import {getUnitFromIngredientType} from '../../util/IngredientFormat';
import IngredientTypes from '../../util/IngredientTypes';
import Button from '../Button/Button';
import Modal from './Modal';

const {useState} = require('react');

const getTitleForIngredient = (ingredient) => {
  let title = ingredient.id;
  if (ingredient.mod) {
    return ingredient.mod + ' | ' + title;
  }
  return IngredientTypes[ingredient.type] + ' | ' + title;
};

const RecipeModal = ({outputItem, closeModal, onConfirm, chosenRecipe}) => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const searchValue = useDebounce(searchInputValue);

  const [data, setData] = useState(null);
  const [info, setInfo] = useState(null);

  const loadData = useCallback((searchValue) => {
    (async () => {
      const params = {outputItemId: outputItem ? outputItem.id : '', inputItemSearch: searchValue};
      const response = await fetch('/recipes?' + Object.entries(params)
        .map(([key, value]) => value != null && value !== '' ? key + '=' + value : null)
        .filter((e) => e)
        .join('&'));
      const body = await response.json();
      setData(body.data);
      setInfo(body.info);
      if (response.status !== 200) { // TODO: Error handling
        throw Error(body.message);
      }

    })();
  }, [outputItem]);

  useEffect(() => loadData(searchValue), [loadData, searchValue]);

  let title = 'Pick a recipe';
  if (chosenRecipe) {
    title = 'Change recipe';
  }
  if (outputItem) {
    title += ' for \'' + outputItem.name + '\'';
  }

  let infoText = '';
  if (info) {
    infoText = `${info.total} recipes available`;
    if (info.total !== info.filtered) {
      if (info.shown === info.filtered) {
        infoText = `Showing all ${info.shown} matches`;
      } else {
        infoText = `Showing ${info.shown} of ${info.filtered} matches`;
      }
    }
    if (info.shown === 0) {
      infoText = `No matches`;
    }
  }

  return <Modal className='RecipeModal' onKeyDown={(e) => {
    if (e.key === 'Escape') {
      closeModal();
      setSearchInputValue('');
    }
  }}>
    <div className='modal-header'><h2>{title}</h2></div>
    <div className='modal-body'>
      <div className='body-top'>
        <input className='search-input' autoFocus value={searchInputValue} placeholder='Search'
               onChange={(e) => setSearchInputValue(e.target.value.toLowerCase())}/>
        {infoText}
      </div>
      <div className='content-list'>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Input</th>
              <th>Output</th>
            </tr>
          </thead>
          <tbody>
            {[...chosenRecipe ? [chosenRecipe.recipe] : [],
              ...(data || []).filter((e) => chosenRecipe ? e.id !== chosenRecipe.recipe.id : true)].map((e) => {
              const isInUse = chosenRecipe ? e.id === chosenRecipe.recipe.id : false;
              return <tr className={'clickable' + (isInUse ? ' marked' : '')} key={e.id} onClick={() => {
                onConfirm(e);
                closeModal();
                setSearchInputValue('');
              }}>
                <td>{e.type}</td>
                <td>{e.inputs.map((ingredient) => {
                  const unit = getUnitFromIngredientType(ingredient.type);
                  return <span key={ingredient.id} className='ingredient'
                               title={getTitleForIngredient(ingredient)}>
                    {ingredient.amount ? <small>{ingredient.amount + (unit ? ' ' + unit : '')}</small> : null}
                    <img src={'/icons/' + ingredient.name} alt='' width="16" height="16"/>
                    <span>{ingredient.name}</span>
                  </span>;
                })}</td>
                <td>{e.outputs.map((ingredient) => {
                  const unit = getUnitFromIngredientType(ingredient.type);
                  return <span className='ingredient' key={ingredient.id}
                               title={getTitleForIngredient(ingredient)}>
                    {ingredient.amount ? <small>{ingredient.amount + (unit ? ' ' + unit : '')}</small> : null}
                    <img src={'/icons/' + ingredient.name} alt='' width="16" height="16"/>
                    <span>{ingredient.name}</span>
                  </span>;
                })}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
    <div className='modal-footer'>
      <Button size='big' onClick={() => {
        closeModal();
        setSearchInputValue('');
      }}>Close
      </Button>
      {chosenRecipe != null ? <Button size='big' onClick={() => {
        closeModal();
        setSearchInputValue('');
        onConfirm(null);
      }}>No recipe
      </Button> : null}
    </div>
  </Modal>;
};

export default React.memo(RecipeModal);
