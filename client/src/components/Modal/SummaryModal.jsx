import React from 'react';
import {useDebounce} from '../../hooks/useDebounce';
import getCompactAmount from '../../util/getCompactAmount';
import Button from '../Button/Button';
import Modal from './Modal';

const {useState} = require('react');

const SummaryModal = ({ingredient, closeModal, onConfirm}) => {
  const classes = ['Modal', 'SummaryModal'];
  const [inputValue, setInputValue] = useState(ingredient && ingredient.amount ? ingredient.amount : '');
  const amount = useDebounce(inputValue);

  let title = 'Change amount for ' + (ingredient ? ingredient.name : '');

  let infoText = '';
  if (ingredient && ingredient.amount) {
    infoText = getCompactAmount(amount, ingredient.type);
    if (infoText + '' === amount + '') {
      infoText = '';
    } else {
      infoText = '= ' + infoText;
    }
  }

  return <Modal className={classes.join(' ')}>
    <div className='modal-header'><h2>{title}</h2></div>
    <div className='modal-body'>
      <div className='body-top'>
        <input className='search-input' type='number' autoFocus value={inputValue} placeholder='Amount'
               onChange={(e) => setInputValue(e.target.value.toLowerCase())}/>
        {infoText}
      </div>
      Content
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
