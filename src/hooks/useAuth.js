// src/hooks/useAuth.js - Separate Auth Hook for Fast Refresh
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Custom hook to access authentication context
 * Separated from AuthProvider for React Fast Refresh compatibility
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;