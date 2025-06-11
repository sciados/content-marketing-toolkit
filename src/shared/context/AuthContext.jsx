// src/shared/context/AuthContext.jsx - Properly connected to SupabaseProvider
import React, { createContext, useContext } from 'react';
import SupabaseContext from './SupabaseContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Get the Supabase context
  const supabaseContext = useContext(SupabaseContext);
  
  // If no Supabase context, provide minimal stub (don't crash)
  if (!supabaseContext) {
    console.warn('⚠️ AuthProvider: SupabaseContext not found, using stub values');
    
    const stubValue = {
      user: null,
      session: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Stub methods
      login: async () => ({ data: null, error: new Error('Supabase not connected') }),
      signIn: async () => ({ data: null, error: new Error('Supabase not connected') }),
      signup: async () => ({ data: null, error: new Error('Supabase not connected') }),
      signUp: async () => ({ data: null, error: new Error('Supabase not connected') }),
      logout: async () => ({ error: null }),
      signOut: async () => ({ error: null }),
      resetPassword: async () => ({ error: null }),
      updatePassword: async () => ({ error: null }),
      
      // Stub database access
      supabase: null,
      from: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
      
      // Helper methods
      getUserId: () => null,
      getUserEmail: () => null,
      isAdmin: () => false,
      isSuperuser: () => false
    };

    return (
      <AuthContext.Provider value={stubValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Extract all the methods from SupabaseProvider
  const { 
    user, 
    session, 
    loading, 
    error,
    login,
    signIn, 
    signup,
    signUp,
    logout,
    signOut, 
    resetPassword,
    updatePassword,
    supabase 
  } = supabaseContext;

  console.log('✅ AuthProvider: Connected to SupabaseProvider', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading 
  });

  // Create useAuth compatible interface
  const authValue = {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    isLoading: loading,
    
    // Auth methods (provide both naming conventions)
    login,
    signIn: signIn || login,
    signup,
    signUp: signUp || signup,
    logout,
    signOut: signOut || logout,
    resetPassword,
    updatePassword,
    
    // Direct Supabase access for database queries
    supabase,
    from: (table) => supabase?.from(table),
    
    // Helper methods
    getUserId: () => user?.id,
    getUserEmail: () => user?.email,
    isAdmin: () => user?.email === 'appsmartdesk@gmail.com' || user?.id === 'e7eb009a-d165-4ab0-972f-dda205a03a85',
    isSuperuser: () => user?.email === 'appsmartdesk@gmail.com' || user?.id === 'e7eb009a-d165-4ab0-972f-dda205a03a85'
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;