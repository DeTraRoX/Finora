import React from 'react';

const Input = React.forwardRef(({
  label,
  type = 'text',
  placeholder = '',
  name,
  value,
  onChange,
  onBlur,
  error = '',
  disabled = false,
  className = '',
  icon: Icon = null,
  required = false,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">
          {label} {required && <span className="text-accent-error font-sans">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-dark-500">
            <Icon className="h-4.5 w-4.5 stroke-[1.8]" />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full bg-dark-900 text-sm text-dark-100 rounded-xl px-4 py-3.5 placeholder-dark-600 border transition-all duration-200 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none ${
            Icon ? 'pl-11' : ''
          } ${
            error
              ? 'border-accent-error/60 focus:border-accent-error focus:ring-accent-error'
              : 'border-dark-800 hover:border-dark-700'
          }`}
          {...props}
        />
      </div>
      
      {error && (
        <span className="text-xs text-accent-error font-medium pl-1">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
