// src/components/ui/Alert.jsx
import React from 'react';

/**
 * Alert/notification component for displaying messages to users
 * @param {Object} props - Component props
 * @param {string} props.type - Alert type: 'success', 'error', 'warning', 'info'
 * @param {string} props.title - Optional title for the alert
 * @param {string|ReactNode} props.message - Alert message content
 * @param {boolean} props.dismissible - Whether the alert can be dismissed
 * @param {function} props.onDismiss - Function to call when alert is dismissed
 */
const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  dismissible = false, 
  onDismiss 
}) => {
  const styles = {
    container: {
      padding: '12px 16px',
      borderRadius: '4px',
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      ...getTypeStyles(type)
    },
    content: {
      flex: 1
    },
    title: {
      fontWeight: 'bold',
      marginBottom: title ? '4px' : 0
    },
    message: {
      margin: 0
    },
    dismissButton: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      marginLeft: '12px',
      padding: '0 4px',
      fontSize: '18px',
      lineHeight: 1,
      opacity: 0.7
    }
  };

  // Get styles based on alert type
  function getTypeStyles(type) {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#C6F6D5',
          color: '#276749',
          borderLeft: '4px solid #48BB78'
        };
      case 'error':
        return {
          backgroundColor: '#FED7D7',
          color: '#9B2C2C',
          borderLeft: '4px solid #F56565'
        };
      case 'warning':
        return {
          backgroundColor: '#FEEBC8',
          color: '#975A16',
          borderLeft: '4px solid #ED8936'
        };
      case 'info':
      default:
        return {
          backgroundColor: '#BEE3F8',
          color: '#2C5282',
          borderLeft: '4px solid #4299E1'
        };
    }
  }

  return (
    <div style={styles.container} role="alert">
      <div style={styles.content}>
        {title && <div style={styles.title}>{title}</div>}
        <p style={styles.message}>{message}</p>
      </div>
      
      {dismissible && onDismiss && (
        <button 
          style={styles.dismissButton} 
          onClick={onDismiss}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
};

export {Alert}
export default Alert;
