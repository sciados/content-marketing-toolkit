// src/context/AuthContext.js - ENHANCED Authentication Context (Provider Only)
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../shared/hooks/useAuth'
import { authApi } from '../../core/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Core auth state
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Additional state
  const [backendConnected, setBackendConnected] = useState(false);
  const [subscription, setSubscription] = useState(null);

  console.log('🔧 Enhanced AuthProvider initializing...');

  /**
   * Check backend connectivity
   */
  const checkBackendConnection = useCallback(async () => {
    try {
      const result = await authApi.checkBackend();
      setBackendConnected(result.available);
      
      if (!result.available) {
        console.warn('⚠️ Backend is not available:', result.message);
      } else {
        console.log('✅ Backend connection verified');
      }
      
      return result.available;
    } catch (error) {
      console.error('❌ Backend check failed:', error);
      setBackendConnected(false);
      return false;
    }
  }, []);

  /**
   * Test authentication with backend
   */
  const testBackendAuth = useCallback(async () => {
    if (!session?.access_token) {
      return { success: false, error: 'No session token' };
    }

    try {
      const result = await authApi.testAuth();
      console.log('🔐 Backend auth test:', result);
      return result;
    } catch (error) {
      console.error('❌ Backend auth test failed:', error);
      return { success: false, error: error.message };
    }
  }, [session]);

  /**
   * Update user session and related data
   */
  const updateSession = useCallback(async (newSession) => {
    setSession(newSession);
    setUser(newSession?.user || null);

    if (newSession?.user) {
      console.log('✅ Session updated for user:', newSession.user.email);
      
      // Test backend authentication
      if (backendConnected) {
        const authTest = await testBackendAuth();
        if (!authTest.success) {
          console.warn('⚠️ Backend auth test failed:', authTest.error);
        }
      }
    } else {
      console.log('🔓 Session cleared');
      setSubscription(null);
    }
  }, [backendConnected, testBackendAuth]);

  /**
   * Initialize auth state
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔧 Initializing authentication...');
        setLoading(true);
        setError(null);

        // Check backend first
        await checkBackendConnection();

        // Get current session
        const { data: sessionData, error: sessionError } = await useAuth.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }

        if (mounted) {
          if (sessionData.session) {
            await updateSession(sessionData.session);
          } else {
            await updateSession(null);
          }
        }

      } catch (err) {
        console.error('❌ Auth initialization error:', err);
        if (mounted) {
          setError(err);
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [checkBackendConnection, updateSession]);

  /**
   * Set up auth state listener
   */
  useEffect(() => {
    console.log('🔧 Setting up auth state listener...');
    
    const { data: { subscription: authSubscription } } = useAuth.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session ? 'with session' : 'no session');
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await updateSession(session);
        } else if (event === 'SIGNED_OUT') {
          await updateSession(null);
        }
      }
    );

    return () => {
      console.log('🔧 Cleaning up auth listener');
      authSubscription.unsubscribe();
    };
  }, [updateSession]);

  /**
   * Login function
   */
  const login = useCallback(async (email, password) => {
    console.log('🔐 Login attempt for:', email);
    
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await useAuth.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw error;
      }

      console.log('✅ Login successful for:', email);
      return { data, error: null };

    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Signup function
   */
  const signup = useCallback(async (email, password, userData = {}) => {
    console.log('📝 Signup attempt for:', email);
    
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await useAuth.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        throw error;
      }

      console.log('✅ Signup successful for:', email);
      return { data, error: null };

    } catch (error) {
      console.error('❌ Signup failed:', error);
      setError(error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    console.log('🔓 Logout initiated');
    
    try {
      setLoading(true);
      setError(null);

      const { error } = await useAuth.auth.signOut();

      if (error) {
        console.error('❌ Logout error:', error);
        throw error;
      }

      console.log('✅ Logout successful');
      return { error: null };

    } catch (error) {
      console.error('❌ Logout failed:', error);
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset password function
   */
  const resetPassword = useCallback(async (email) => {
    console.log('🔑 Password reset requested for:', email);
    
    try {
      setLoading(true);
      setError(null);

      const { error } = await useAuth.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('❌ Password reset error:', error);
        throw error;
      }

      console.log('✅ Password reset email sent');
      return { error: null };

    } catch (error) {
      console.error('❌ Password reset failed:', error);
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update password function
   */
  const updatePassword = useCallback(async (password) => {
    console.log('🔑 Password update initiated');
    
    try {
      setLoading(true);
      setError(null);

      const { error } = await useAuth.auth.updateUser({
        password
      });

      if (error) {
        console.error('❌ Password update error:', error);
        throw error;
      }

      console.log('✅ Password updated successfully');
      return { error: null };

    } catch (error) {
      console.error('❌ Password update failed:', error);
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get current auth token
   */
  const getToken = useCallback(async () => {
    try {
      if (!session?.access_token) {
        const { data } = await useAuth.auth.getSession();
        return data.session?.access_token || null;
      }
      return session.access_token;
    } catch (error) {
      console.error('❌ Failed to get token:', error);
      return null;
    }
  }, [session]);

  /**
   * Refresh session
   */
  const refreshSession = useCallback(async () => {
    console.log('🔄 Refreshing session...');
    
    try {
      const { data, error } = await useAuth.auth.refreshSession();
      
      if (error) {
        console.error('❌ Session refresh error:', error);
        throw error;
      }

      if (data.session) {
        await updateSession(data.session);
        console.log('✅ Session refreshed');
      }

      return { data, error: null };

    } catch (error) {
      console.error('❌ Session refresh failed:', error);
      return { data: null, error };
    }
  }, [updateSession]);

  // Enhanced state logging
  console.log('🔧 Auth Context State:', {
    hasUser: !!user,
    userEmail: user?.email,
    hasSession: !!session,
    hasToken: !!(session?.access_token),
    loading,
    backendConnected,
    hasError: !!error
  });

  const value = {
    // Core state
    user,
    session,
    loading,
    error,
    
    // Additional state
    backendConnected,
    subscription,
    
    // Auth methods
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    
    // Legacy method names for compatibility
    signIn: login,
    signUp: signup,
    signOut: logout,
    
    // Utility methods
    getToken,
    refreshSession,
    checkBackendConnection,
    testBackendAuth,
    
    // Computed properties
    isAuthenticated: !!user && !!session,
    isLoading: loading,
    hasError: !!error,
    
    // useAuth client (for advanced usage)
    useAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;