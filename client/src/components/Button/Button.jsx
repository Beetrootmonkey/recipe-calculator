import React from 'react';
import './styling.css';

const Button = ({children, className, onClick, size = 'default'}) => {
  const classes = ['Button', className, 'size-' + size].filter((e) => e != null);

  return <button className={classes.join(' ')} onClick={onClick}>{children}</button>;
};

export default React.memo(Button);
