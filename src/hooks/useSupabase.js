// src/hooks/useSupabase.js - Simple solution with tier override
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
  
  // TEMP: Override tier for testing (until Supabase profile is fixed)
  if (context.user) {
    context.user.subscription_tier = 'gold';
  }
  
  return context;
};

export default useSupabase;