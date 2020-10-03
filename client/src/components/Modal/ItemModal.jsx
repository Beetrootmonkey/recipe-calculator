import React, {useEffect} from 'react';
import {useDebounce} from '../../hooks/useDebounce';
import Button from '../Button/Button';
import Modal from './Modal';

const {useState} = require('react');

const ItemModal = ({className, loadIngredients, ingredients, closeModal, info}) => {
  const classes = ['Modal', className].filter((e) => e != null);
  const [searchInputValue, setSearchInputValue] = useState('');
  const searchValue = useDebounce(searchInputValue);

  useEffect(() => loadIngredients(searchValue), [searchValue]);

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

  return <Modal className='ItemModal'>
    <div className='modal-header'><h2>Pick an item</h2></div>
    <div className='modal-body'>
      <div className='body-top'>
        <input className='item-input-search-input' autoFocus value={searchInputValue} placeholder='Search'
               onChange={(e) => setSearchInputValue(e.target.value.toLowerCase())}/>
        {infoText}
      </div>
      <div className='ingredients'>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {(ingredients || []).map((e) => {
              return <tr key={e.id}>
                <td>{e.type}</td>
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

export default React.memo(ItemModal);
