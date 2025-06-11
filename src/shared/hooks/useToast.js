// src/hooks/useToast.js
import { useContext } from 'react';
import ToastContext from '../context/ToastContext';

/**
 * Custom hook for using the toast notification system
 * @returns {Object} Toast notification methods
 */
const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export { useToast }
export default useToast;
