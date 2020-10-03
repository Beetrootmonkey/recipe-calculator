import React from 'react';
import Button from '../Button/Button';
import View from './View';

const ViewTree = ({onClickButton}) => {

  return <View className='View tree'>
    <header>
      <div className='title'>Tree</div>
      <Button onClick={onClickButton}>+</Button>
    </header>
  </View>;
};

export default React.memo(ViewTree);
