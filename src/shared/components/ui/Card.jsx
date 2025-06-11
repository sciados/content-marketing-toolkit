// src/components/ui/Card.jsx
import React from 'react';

/**
 * Card component for displaying content in a bordered container
 * @param {Object} props - Component props
 * @param {string} props.title - Optional card title
 * @param {ReactNode} props.children - Card content
 * @param {string} props.variant - Card variant: 'default', 'outlined', 'elevated'
 */
const Card = ({ 
  title, 
  children, 
  variant = 'default', 
  ...props 
}) => {
  // Define styles based on variant
  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    };
    
    switch (variant) {
      case 'outlined':
        return {
          ...baseStyles,
          border: '1px solid #E2E8F0',
          backgroundColor: 'white'
        };
      case 'elevated':
        return {
          ...baseStyles,
          border: 'none',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        };
      case 'default':
      default:
        return {
          ...baseStyles,
          border: '1px solid #E2E8F0',
          backgroundColor: 'white'
        };
    }
  };

  const titleStyles = {
    fontWeight: 'bold',
    fontSize: '18px',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #E2E8F0'
  };

  return (
    <div style={getCardStyles()} {...props}>
      {title && <div style={titleStyles}>{title}</div>}
      {children}
    </div>
  );
};

export {Card}
export default Card;
