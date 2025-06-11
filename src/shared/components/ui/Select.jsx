// src/components/ui/Select.jsx
import React from 'react';

const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  error,
  hint,
  className = '',
  labelClassName = '',
  selectClassName = '',
  ...props
}) => {
  const uniqueId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`form-control ${className}`}>
      {label && (
        <label htmlFor={uniqueId} className={`form-label ${labelClassName}`}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={uniqueId}
        name={name || uniqueId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`form-select ${error ? 'border-error-500 focus:ring-error-500' : ''} ${disabled ? 'bg-neutral-100 cursor-not-allowed' : ''} ${selectClassName}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {hint && !error && <p className="mt-1 text-sm text-neutral-500">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export {Select}
export default Select;
