import React from 'react';
import View from './View';
import Button from '../Button/Button';

const ViewInstructions = () => {

  return <View className='ViewInstructions'>
    <div className='view-header'>
      <div className='title'>Instructions</div>
      <Button>+</Button>
    </div>
  </View>;
};

export default React.memo(ViewInstructions);
