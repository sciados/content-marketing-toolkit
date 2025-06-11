// src/components/ui/Input.jsx
import React from 'react';

const Input = ({
  type = 'text',
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
  hint,
  className = '',
  labelClassName = '',
  inputClassName = '',
  ...props
}) => {
  const uniqueId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`form-control ${className}`}>
      {label && (
        <label htmlFor={uniqueId} className={`form-label ${labelClassName}`}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={uniqueId}
        name={name || uniqueId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`form-input ${error ? 'border-error-500 focus:ring-error-500' : ''} ${disabled ? 'bg-neutral-100 cursor-not-allowed' : ''} ${inputClassName}`}
        {...props}
      />
      
      {hint && !error && <p className="mt-1 text-sm text-neutral-500">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export {Input}
export default Input;
