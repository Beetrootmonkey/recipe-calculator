import React from 'react';
import View from './View';
import Button from '../Button/Button';

const ViewMapping = ({onClickButton}) => {

  return <View className='View mapping'>
    <header>
      <div className='title'>Mapping</div>
      <Button onClick={onClickButton}>+</Button>
    </header>
  </View>;
};

export default React.memo(ViewMapping);
