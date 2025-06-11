// src/components/ui/Toast.jsx
import React, { useState } from 'react';

/**
 * Toast notification component
 * Displays a message with an icon and optional close button
 */
const Toast = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Fade out animation before closing
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Match this with the CSS transition duration
  };

  // Set up the base styles
  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    minWidth: '300px',
    maxWidth: '450px',
    padding: '12px 16px',
    borderRadius: '6px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'opacity 300ms, transform 300ms',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(-10px)'
  };

  // Different styles for different types
  const typeStyles = {
    info: {
      backgroundColor: '#EBF5FF',
      borderLeft: '4px solid #3B82F6',
      color: '#1E40AF'
    },
    success: {
      backgroundColor: '#ECFDF5',
      borderLeft: '4px solid #10B981',
      color: '#065F46'
    },
    warning: {
      backgroundColor: '#FFFBEB',
      borderLeft: '4px solid #F59E0B',
      color: '#92400E'
    },
    error: {
      backgroundColor: '#FEF2F2',
      borderLeft: '4px solid #EF4444',
      color: '#991B1B'
    }
  };

  // Merge the styles
  const toastStyles = {
    ...baseStyles,
    ...typeStyles[type] || typeStyles.info
  };

  // Get the appropriate icon
  const getIcon = () => {
    switch (type) {
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={toastStyles}>
      <div style={{ marginRight: '12px' }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1 }}>{message}</div>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginLeft: '8px',
          padding: '4px',
          color: 'inherit',
          opacity: 0.6
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
