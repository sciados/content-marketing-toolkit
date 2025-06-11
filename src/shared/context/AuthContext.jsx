// src/shared/context/AuthContext.jsx - Connected to Infrastructure Auth Service
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../../infrastructure/auth/auth';
import { supabase } from '../../core/database/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('🔧 AuthProvider initializing with infrastructure auth service...');

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔧 Getting initial session...');
        const { data, error } = await auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          setError(error);
        } else if (data.session) {
          console.log('✅ Found existing session for:', data.session.user.email);
          setUser(data.session.user);
          setSession(data.session);
        } else {
          console.log('📋 No existing session found');
        }
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Set up auth state listener
  useEffect(() => {
    console.log('🔧 Setting up auth listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session ? 'with session' : 'no session');
        
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          setError(null);
        } else {
          setUser(null);
          setSession(null);
        }
      }
    );

    return () => {
      console.log('🔧 Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  // Wrap auth service methods
  const login = useCallback(async (email, password) => {
    console.log('🔐 Login attempt for:', email);
    setLoading(true);
    setError(null);
    
    try {
      const result = await auth.signIn(email, password);
      console.log('✅ Login successful');
      return result;
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email, password) => {
    console.log('📝 Signup attempt for:', email);
    setLoading(true);
    setError(null);
    
    try {
      const result = await auth.signUp(email, password);
      console.log('✅ Signup successful');
      return result;
    } catch (err) {
      console.error('❌ Signup failed:', err);
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('🔓 Logout initiated');
    setLoading(true);
    
    try {
      const result = await auth.signOut();
      console.log('✅ Logout successful');
      return result;
    } catch (err) {
      console.error('❌ Logout failed:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    console.log('🔑 Password reset for:', email);
    try {
      return await auth.resetPassword(email);
    } catch (err) {
      console.error('❌ Password reset failed:', err);
      setError(err);
      return { error: err };
    }
  }, []);

  const updatePassword = useCallback(async (password) => {
    console.log('🔑 Password update');
    try {
      return await auth.updatePassword(password);
    } catch (err) {
      console.error('❌ Password update failed:', err);
      setError(err);
      return { error: err };
    }
  }, []);

  // Create auth value
  const authValue = {
    // Core state
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    isLoading: loading,
    
    // Auth methods (both naming conventions)
    login,
    signIn: login,
    signup,
    signUp: signup,
    logout,
    signOut: logout,
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

  console.log('🔧 AuthProvider state:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    hasSession: !!session, 
    loading,
    hasError: !!error 
  });

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;