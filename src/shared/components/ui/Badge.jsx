// src/components/ui/Badge.jsx
import React from 'react';

const Badge = ({
  children,
  colorScheme = 'blue',
  variant = 'solid',
  ...props
}) => {
  // Color schemes
  const colors = {
    blue: {
      solid: { bg: '#3182CE', color: 'white' },
      outline: { border: '1px solid #3182CE', color: '#3182CE' },
      subtle: { bg: '#EBF8FF', color: '#3182CE' }
    },
    green: {
      solid: { bg: '#38A169', color: 'white' },
      outline: { border: '1px solid #38A169', color: '#38A169' },
      subtle: { bg: '#F0FFF4', color: '#38A169' }
    },
    red: {
      solid: { bg: '#E53E3E', color: 'white' },
      outline: { border: '1px solid #E53E3E', color: '#E53E3E' },
      subtle: { bg: '#FFF5F5', color: '#E53E3E' }
    },
    gray: {
      solid: { bg: '#718096', color: 'white' },
      outline: { border: '1px solid #718096', color: '#718096' },
      subtle: { bg: '#F7FAFC', color: '#718096' }
    },
    purple: {
      solid: { bg: '#805AD5', color: 'white' },
      outline: { border: '1px solid #805AD5', color: '#805AD5' },
      subtle: { bg: '#FAF5FF', color: '#805AD5' }
    }
  };

  // Base styles
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 8px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    height: '24px',
    lineHeight: '1'
  };

  // Combine styles
  const badgeStyle = {
    ...baseStyle,
    ...colors[colorScheme][variant]
  };

  return (
    <span style={badgeStyle} {...props}>
      {children}
    </span>
  );
};

export {Badge}
export default Badge;
