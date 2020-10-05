import React from 'react';
import {useDebounce} from '../../hooks/useDebounce';
import getCompactAmount from '../../util/getCompactAmount';
import {getDisplayNameFromRecipeIngredient, getUnitFromIngredientType} from '../../util/IngredientFormat';
import Button from '../Button/Button';
import Modal from './Modal';

const {useState} = require('react');

const SummaryModal = ({ingredient, closeModal, onConfirm, inStock, amountInStock}) => {
  const classes = ['Modal', 'SummaryModal'];
  const [inputValue, setInputValue] = useState(ingredient && ingredient.amount && !inStock ? ingredient.amount : (inStock && amountInStock ? amountInStock : ''));
  const amount = useDebounce(inputValue);

  let title = 'Change amount for \'' + (ingredient ? ingredient.name : '') + '\'';
  if (inStock) {
    title = 'Change amount in stock for \'' + (ingredient ? ingredient.name : '') + '\'';
  }

  let infoText = '';
  if (ingredient && ingredient.amount && !inStock) {
    infoText = getCompactAmount(amount, ingredient.type);
    if (infoText + '' === amount + '') {
      infoText = '';
    } else {
      infoText = '= ' + infoText;
    }
  } else if (inStock) {
    const unit = getUnitFromIngredientType(ingredient.type);
    const amountText = ingredient.amount + (unit ? ' ' + unit : '');
    const compactText = getCompactAmount(ingredient.amount, ingredient.type);
    infoText = 'Maximum: ' + amountText + (amountText !== compactText ? ' (' + compactText + ')' : '');
  }

  return <Modal className={classes.join(' ')} onKeyDown={(e) => {
    if (e.key === 'Escape') {
      closeModal();
      setInputValue('');
    }
  }}>
    <div className='modal-header'><h2>{title}</h2></div>
    <div className='modal-body'>
      <div className='body'>
        <input className='search-input' type='number' autoFocus value={inputValue} placeholder={inStock ? 'In stock' : 'Amount'}
               onChange={(e) => setInputValue(e.target.value.toLowerCase())}/>
        {infoText}
      </div>
    </div>
    <div className='modal-footer'>
      <Button size='big' onClick={() => {
        closeModal();
        setInputValue('');
      }}>Close
      </Button>
      <Button size='big' onClick={() => {
        closeModal();
        setInputValue('');
        onConfirm(amount);
      }}>Accept
      </Button>
    </div>
  </Modal>;
};

export default React.memo(SummaryModal);
