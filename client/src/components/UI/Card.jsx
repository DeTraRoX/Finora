import React from 'react';

const Card = ({
  children,
  className = '',
  hoverable = false,
  glass = true,
  onClick,
}) => {
  const baseClass = glass
    ? 'glass-panel rounded-2xl p-6 border border-dark-800'
    : 'bg-dark-900 rounded-2xl p-6 border border-dark-800';
  
  const hoverClass = hoverable ? 'glass-panel-hover cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseClass} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
