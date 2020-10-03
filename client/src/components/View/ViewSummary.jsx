import React from 'react';
import View from './View';
import Button from '../Button/Button';

const ViewSummary = () => {

  return <View className='View summary'>
    <header>
      <div className='title'>Summary</div>
      <Button>+</Button>
    </header>
  </View>;
};

export default React.memo(ViewSummary);
