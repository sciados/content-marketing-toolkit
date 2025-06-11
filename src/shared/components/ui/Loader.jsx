// src/components/ui/Loader.jsx
import React from 'react';

/**
 * Loading indicator component
 * @param {Object} props - Component props
 * @param {string} props.size - Loader size: 'sm', 'md', 'lg'
 * @param {string} props.color - Loader color
 * @param {string} props.text - Optional loading text
 */
export const Loader = ({ 
  size = 'md', 
  color = '#3182CE', 
  text = 'Loading...', 
  ...props 
}) => {
  // Define sizes
  const sizes = {
    sm: { width: '16px', height: '16px', border: '2px solid' },
    md: { width: '24px', height: '24px', border: '3px solid' },
    lg: { width: '40px', height: '40px', border: '4px solid' }
  };

  const loaderStyles = {
    display: 'inline-block',
    width: sizes[size].width,
    height: sizes[size].height,
    border: `${sizes[size].border} #E2E8F0`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px'
  };

  const textStyles = {
    marginTop: '8px',
    color: '#4A5568',
    fontSize: size === 'sm' ? '14px' : '16px'
  };

  return (
    <div style={containerStyles} {...props}>
      <div style={loaderStyles}></div>
      {text && <div style={textStyles}>{text}</div>}
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Add default export as well for backward compatibility
export default Loader;
