import React from 'react';
import './styling.css';

const Navbar = ({title}) => {

  return <div className='Navbar'><h2>{title}</h2></div>;
};

export default React.memo(Navbar);
