// src/components/Common/Button.jsx
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
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    borderRadius: '4px',
    cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: isDisabled ? 0.6 : 1,
  };

  // Size styles
  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '14px' },
    md: { padding: '8px 16px', fontSize: '16px' },
    lg: { padding: '12px 24px', fontSize: '18px' }
  };

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: '#3182CE',
      color: 'white',
      border: 'none',
      '&:hover': {
        backgroundColor: '#2B6CB0'
      }
    },
    secondary: {
      backgroundColor: '#718096',
      color: 'white',
      border: 'none',
      '&:hover': {
        backgroundColor: '#4A5568'
      }
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#3182CE',
      border: '1px solid #3182CE',
      '&:hover': {
        backgroundColor: '#EBF8FF'
      }
    },
    link: {
      backgroundColor: 'transparent',
      color: '#3182CE',
      border: 'none',
      padding: 0,
      '&:hover': {
        textDecoration: 'underline'
      }
    }
  };

  // Combine styles
  const buttonStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isDisabled || isLoading ? { pointerEvents: 'none' } : {})
  };

  // Apply hover styles on hover (only if not disabled/loading)
  const [isHovered, setIsHovered] = React.useState(false);
  
  const combinedStyles = {
    ...buttonStyles,
    ...(isHovered && !isDisabled && !isLoading && variantStyles[variant]['&:hover'])
  };

  return (
    <button
      style={combinedStyles}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {isLoading ? (
        <>
          <span 
            style={{ 
              display: 'inline-block', 
              width: '14px', 
              height: '14px', 
              border: '2px solid currentColor', 
              borderTopColor: 'transparent', 
              borderRadius: '50%', 
              marginRight: '8px',
              animation: 'spin 1s linear infinite'
            }}
          />
          {loadingText || children}
        </>
      ) : (
        children
      )}
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export {Button}
export default Button;