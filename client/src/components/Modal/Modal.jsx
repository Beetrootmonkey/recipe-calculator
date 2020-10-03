import React from 'react';
import './styling.css';

const Modal = ({children, className}) => {
  const classes = ['Modal', className].filter((e) => e != null);

  return <div className='modal-backdrop'>
    <div className={classes.join(' ')}>
      {children}
    </div>
  </div>;
};

export default React.memo(Modal);
