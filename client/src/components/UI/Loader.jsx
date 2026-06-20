import React from 'react';

const Loader = ({ size = 'md', className = '', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-16 w-16 border-4',
  };

  const loaderContent = (
    <div
      className={`animate-spin rounded-full border-t-primary-500 border-r-transparent border-b-primary-500 border-l-transparent ${sizeClasses[size]} ${className}`}
      role="status"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-md flex flex-col items-center justify-center">
        {loaderContent}
        <span className="mt-4 text-xs font-semibold text-dark-400 uppercase tracking-widest animate-pulse">
          Processing...
        </span>
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
