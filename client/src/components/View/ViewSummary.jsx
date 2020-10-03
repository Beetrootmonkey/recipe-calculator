import React from 'react';
import View from './View';
import Button from '../Button/Button';

const ViewSummary = () => {

  return <View className='ViewSummary'>
    <div className='view-header'>
      <div className='title'>Summary</div>
      <Button>+</Button>
    </div>
  </View>;
};

export default React.memo(ViewSummary);
