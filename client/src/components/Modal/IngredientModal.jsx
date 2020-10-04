import React, {useCallback, useEffect} from 'react';
import {useDebounce} from '../../hooks/useDebounce';
import CreationIntent from '../../util/CreationIntent';
import IngredientTypes from '../../util/IngredientTypes';
import Button from '../Button/Button';
import Modal from './Modal';

const {useState} = require('react');

const IngredientModal = ({className, intent, closeModal, onConfirm}) => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const searchValue = useDebounce(searchInputValue);

  const [data, setData] = useState(null);
  const [info, setInfo] = useState(null);

  const loadData = useCallback((searchValue) => {
    (async () => {
      const response = await fetch('/ingredients?inputItemSearch=' + searchValue);
      const body = await response.json();
      setData(body.data);
      setInfo(body.info);
      if (response.status !== 200) { // TODO: Error handling
        throw Error(body.message);
      }

    })();
  }, []);

  useEffect(() => loadData(searchValue), [searchValue, loadData]);

  let title = 'Pick an item';
  if (intent === CreationIntent.CREATE_MAPPING) {
    title = 'Setting recipe - Step 1: ' + title;
  } else if (intent === CreationIntent.CREATE_TREE) {
    title = 'Creating new item tree - ' + title;
  }

  let infoText = '';
  if (info) {
      infoText = `${info.total} items available`;
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

  return <Modal className='IngredientModal'>
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
              <th/>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((e) => {
              return <tr className='clickable' key={e.id} onClick={() => {
                onConfirm(e);
                closeModal();
                setSearchInputValue('');
              }}>
                <td>{e.mod || IngredientTypes[e.type]}</td>
                <td className='image'><img src={'/icons/' + e.name} alt='' width="32" height="32"/></td>
                <td>{e.name}</td>
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
    </div>
  </Modal>;
};

export default React.memo(IngredientModal);
