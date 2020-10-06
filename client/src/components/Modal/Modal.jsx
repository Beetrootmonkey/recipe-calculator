import React from 'react';
import './styling.css';

const Modal = ({children, className, ...props}) => {
  const classes = ['Modal', className].filter((e) => e != null);

  return <div tabIndex={0} className='modal-backdrop' {...props}>
    <div className={classes.join(' ')}>
      {children}
    </div>
  </div>;
};

export default React.memo(Modal);
