// src/context/ToastContext.jsx
import React, { createContext, useState } from 'react';
import Toast from '../components/ui/Toast';

// Create context
const ToastContext = createContext(null);

/**
 * Toast notification provider component
 * Manages toast notifications throughout the application
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const showToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  };

  // Remove a toast by ID
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Helper methods for specific toast types
  const showInfo = (message, duration) => showToast(message, 'info', duration);
  const showSuccess = (message, duration) => showToast(message, 'success', duration);
  const showWarning = (message, duration) => showToast(message, 'warning', duration);
  const showError = (message, duration) => showToast(message, 'error', duration);

  return (
    <ToastContext.Provider 
      value={{ 
        showToast, 
        showInfo, 
        showSuccess, 
        showWarning, 
        showError, 
        removeToast 
      }}
    >
      {children}
      
      {/* Toast container - positioned at top right of screen */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
