// src/shared/context/AuthContext.jsx - Complete Final Version with Safety Checks
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../../infrastructure/auth/auth';
import { supabase } from '../../core/database/supabaseClient';

// Create context with default value to prevent undefined errors
const AuthContext = createContext({
  user: null,
  session: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isLoading: false,
  login: () => Promise.resolve({ data: null, error: new Error('Not initialized') }),
  signIn: () => Promise.resolve({ data: null, error: new Error('Not initialized') }),
  signup: () => Promise.resolve({ data: null, error: new Error('Not initialized') }),
  signUp: () => Promise.resolve({ data: null, error: new Error('Not initialized') }),
  logout: () => Promise.resolve({ error: null }),
  signOut: () => Promise.resolve({ error: null }),
  resetPassword: () => Promise.resolve({ error: null }),
  updatePassword: () => Promise.resolve({ error: null }),
  supabase: null,
  from: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
  getUserId: () => null,
  getUserEmail: () => null,
  isAdmin: () => false,
  isSuperuser: () => false
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  console.log('🔧 AuthProvider rendering...', { 
    hasAuth: !!auth, 
    hasSupabase: !!supabase, 
    initialized, 
    hasUser: !!user 
  });

  // Initialize auth state safely
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔧 Initializing auth...', { hasAuth: !!auth, hasSupabase: !!supabase });
      
      if (!auth) {
        console.warn('⚠️ Auth service not available, using mock state');
        setInitialized(true);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          setError(error);
        } else if (data.session) {
          console.log('✅ Found session for:', data.session.user.email);
          setUser(data.session.user);
          setSession(data.session);
        } else {
          console.log('📋 No session found');
        }
      } catch (err) {
        console.error('❌ Auth init error:', err);
        setError(err);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Set up auth listener only if Supabase is available
  useEffect(() => {
    if (!supabase) {
      console.warn('⚠️ Supabase not available, skipping auth listener');
      return;
    }

    console.log('🔧 Setting up auth listener...');
    
    try {
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
    } catch (err) {
      console.error('❌ Failed to set up auth listener:', err);
    }
  }, []);

  // Auth methods with safety checks
  const login = useCallback(async (email, password) => {
    if (!auth) {
      console.warn('⚠️ Auth service not available for login');
      return { data: null, error: new Error('Auth service not available') };
    }

    console.log('🔐 Login for:', email);
    setLoading(true);
    setError(null);
    
    try {
      const result = await auth.signIn(email, password);
      console.log('✅ Login result:', result.data ? 'success' : 'failed');
      return result;
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email, password) => {
    if (!auth) {
      console.warn('⚠️ Auth service not available for signup');
      return { data: null, error: new Error('Auth service not available') };
    }

    console.log('📝 Signup for:', email);
    setLoading(true);
    setError(null);
    
    try {
      const result = await auth.signUp(email, password);
      console.log('✅ Signup result:', result.data ? 'success' : 'failed');
      return result;
    } catch (err) {
      console.error('❌ Signup error:', err);
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) {
      console.warn('⚠️ Auth service not available for logout');
      setUser(null);
      setSession(null);
      return { error: null };
    }

    console.log('🔓 Logout');
    setLoading(true);
    
    try {
      const result = await auth.signOut();
      setUser(null);
      setSession(null);
      console.log('✅ Logout successful');
      return result;
    } catch (err) {
      console.error('❌ Logout error:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    if (!auth) {
      console.warn('⚠️ Auth service not available for reset password');
      return { error: new Error('Auth service not available') };
    }

    console.log('🔑 Reset password for:', email);
    try {
      const result = await auth.resetPassword(email);
      console.log('✅ Reset password result:', result);
      return result;
    } catch (err) {
      console.error('❌ Reset password error:', err);
      setError(err);
      return { error: err };
    }
  }, []);

  const updatePassword = useCallback(async (password) => {
    if (!auth) {
      console.warn('⚠️ Auth service not available for update password');
      return { error: new Error('Auth service not available') };
    }

    console.log('🔑 Update password');
    try {
      const result = await auth.updatePassword(password);
      console.log('✅ Update password result:', result);
      return result;
    } catch (err) {
      console.error('❌ Update password error:', err);
      setError(err);
      return { error: err };
    }
  }, []);

  // Create auth value with guaranteed properties
  const authValue = {
    // Core state
    user: user || null,
    session: session || null,
    loading: Boolean(loading),
    error: error || null,
    isAuthenticated: Boolean(user),
    isLoading: Boolean(loading),
    initialized: Boolean(initialized),
    
    // Auth methods
    login,
    signIn: login,
    signup,
    signUp: signup,
    logout,
    signOut: logout,
    resetPassword,
    updatePassword,
    
    // Database access
    supabase: supabase || null,
    from: (table) => {
      if (!supabase) {
        console.warn('⚠️ Supabase not available for table query:', table);
        return { 
          select: () => Promise.resolve({ data: [], error: new Error('Supabase not available') }),
          insert: () => Promise.resolve({ data: null, error: new Error('Supabase not available') }),
          update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not available') }) }),
          delete: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not available') }) })
        };
      }
      return supabase.from(table);
    },
    
    // Helper methods
    getUserId: () => user?.id || null,
    getUserEmail: () => user?.email || null,
    isAdmin: () => user?.email === 'appsmartdesk@gmail.com' || user?.id === 'e7eb009a-d165-4ab0-972f-dda205a03a85',
    isSuperuser: () => user?.email === 'appsmartdesk@gmail.com' || user?.id === 'e7eb009a-d165-4ab0-972f-dda205a03a85'
  };

  console.log('🔧 AuthProvider final state:', { 
    hasUser: !!authValue.user, 
    userEmail: authValue.user?.email,
    hasSession: !!authValue.session, 
    loading: authValue.loading,
    initialized: authValue.initialized,
    hasAuth: !!auth,
    hasSupabase: !!supabase
  });

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;