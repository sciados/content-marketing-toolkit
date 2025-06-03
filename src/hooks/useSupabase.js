// src/hooks/useSupabase.js - FIXED: No more temporary override needed
import { useContext } from 'react';
import SupabaseContext from '../context/SupabaseContext';

console.log('🔧 useSupabase.js: Loading...');

/**
 * Custom hook for using Supabase authentication and client
 * @returns {Object} Supabase auth state and methods
 */
const useSupabase = () => {
  const context = useContext(SupabaseContext);
  
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  
  // REMOVED: No more temporary override needed
  // The backend now handles subscription_tier separately from the Supabase user object
  
  return context;
};

export default useSupabase;