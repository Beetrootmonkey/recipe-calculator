import React from 'react';
import './styling.css';

const Icon = ({className, size = 'default', type, ...props}) => {
  const classes = ['Icon', 'material-icons', className, 'size-' + size].filter((e) => e != null);

  return <i className={classes.join(' ')} {...props}>{type}</i>;
};

export default React.memo(Icon);
