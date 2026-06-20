import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon: Icon = null,
  fullWidth = false,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:from-primary-500 hover:to-indigo-500 shadow-md shadow-primary-500/10 focus:ring-primary-500',
    secondary: 'bg-dark-800 text-dark-100 hover:bg-dark-700 hover:text-white border border-dark-700 focus:ring-dark-500',
    outline: 'bg-transparent text-dark-200 hover:bg-dark-900 border border-dark-700 hover:text-white focus:ring-dark-500',
    success: 'bg-gradient-to-r from-accent-success to-emerald-600 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-md shadow-emerald-500/10 focus:ring-accent-success',
    danger: 'bg-gradient-to-r from-accent-error to-red-600 text-white hover:from-red-500 hover:to-red-600 shadow-md shadow-red-500/10 focus:ring-accent-error',
    glass: 'glass-panel text-white hover:bg-dark-800/80 border border-white/10 hover:border-white/20',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3 text-base gap-2.5',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
};

export default Button;
