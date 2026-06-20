import React from 'react';

const Badge = ({ children, variant = 'info', className = '' }) => {
  const styles = {
    success: 'bg-accent-success/10 text-accent-success border border-accent-success/20',
    warning: 'bg-accent-warning/10 text-accent-warning border border-accent-warning/20',
    error: 'bg-accent-error/10 text-accent-error border border-accent-error/20',
    info: 'bg-accent-info/10 text-accent-info border border-accent-info/20',
    primary: 'bg-primary-500/10 text-primary-400 border border-primary-500/20',
    dark: 'bg-dark-800 text-dark-300 border border-dark-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
