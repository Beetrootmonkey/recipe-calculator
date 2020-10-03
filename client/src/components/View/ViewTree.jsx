import React from 'react';
import Button from '../Button/Button';
import View from './View';

const ViewTree = () => {

  return <View className='View tree'>
    <header>
      <div className='title'>Tree</div>
      <Button>+</Button>
    </header>
  </View>;
};

export default React.memo(ViewTree);
