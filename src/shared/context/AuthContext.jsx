// src/shared/context/AuthContext.jsx - Fixed without circular dependency
import React, { createContext } from 'react';
import SupabaseContext from './SupabaseContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const supabaseContext = React.useContext(SupabaseContext);
  
  if (!supabaseContext) {
    throw new Error('AuthProvider must be used within a SupabaseProvider');
  }

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
    from: (table) => supabase.from(table),
    
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