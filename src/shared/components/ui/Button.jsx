// src/components/ui/Button.jsx
import React from 'react';

/**
 * Reusable button component
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant: 'primary', 'secondary', 'outline', 'link'
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} props.isLoading - Whether the button is in loading state
 * @param {boolean} props.isDisabled - Whether the button is disabled
 * @param {string} props.loadingText - Text to show while loading
 * @param {function} props.onClick - Click handler
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  loadingText,
  onClick,
  className = '',
  ...props
}) => {
  // Base classes for all buttons
  const baseClasses = "inline-flex items-center justify-center font-bold rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Variant classes with proper Tailwind hover states
  const variantClasses = {
    primary: 'bg-blue-600 text-white border-transparent hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white border-transparent hover:bg-gray-700 focus:ring-gray-500',
    outline: 'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    link: 'bg-transparent text-blue-600 border-transparent p-0 hover:underline focus:ring-blue-500'
  };

  // Disabled/loading state classes
  const disabledClasses = isDisabled || isLoading 
    ? 'opacity-60 cursor-not-allowed pointer-events-none' 
    : 'cursor-pointer';

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabledClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      className={buttonClasses}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
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
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export { Button };
export default Button;
