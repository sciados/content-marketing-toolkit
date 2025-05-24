// src/hooks/useSupabase.js
import { useContext } from 'react';
import SupabaseContext from '../context/SupabaseContext';

/**
 * Custom hook for using Supabase authentication and client
 * @returns {Object} Supabase auth state and methods
 */
const useSupabase = () => {
  const context = useContext(SupabaseContext);
  
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  
  return context;
};

export default useSupabase;