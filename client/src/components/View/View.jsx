import React from 'react';
import './styling.css';

const View = ({children, className}) => {
  const classes = ['View', className].filter((e) => e != null);

  return <div className={classes.join(' ')}>{children}</div>;
};

export default React.memo(View);
