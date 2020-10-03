import React from 'react';
import View from './View';
import Button from '../Button/Button';

const ViewInstructions = () => {

  return <View className='instructions'>
    <header>
      <div className='title'>Instructions</div>
      <Button>+</Button>
    </header>
  </View>;
};

export default React.memo(ViewInstructions);
