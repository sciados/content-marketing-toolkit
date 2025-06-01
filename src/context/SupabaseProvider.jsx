// src/context/SupabaseProvider.jsx - DEBUG VERSION with extensive logging
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase/supabaseClient';
import SupabaseContext from './SupabaseContext';

const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('🔧 App.jsx: Starting to load...');

  // Initialize auth state
  useEffect(() => {
    console.log('🔧 SupabaseProvider: useEffect running...');
    
    // Get current session
    const checkSession = async () => {
      try {
        console.log('🔧 SupabaseProvider: Starting session check...');
        setLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        console.log('🔧 SupabaseProvider: getSession result:', { data, error });
        
        if (error) {
          console.error('🔧 SupabaseProvider: Session check error:', error);
          throw error;
        }
        
        if (data.session) {
          console.log('🔧 SupabaseProvider: Setting user and session');
          setUser(data.session.user);
          setSession(data.session);
          console.log('🔧 SupabaseProvider: User email:', data.session.user.email);
          console.log('🔧 SupabaseProvider: Token exists:', !!data.session.access_token);
        } else {
          console.log('🔧 SupabaseProvider: No session found, clearing state');
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error('🔧 SupabaseProvider: Error in checkSession:', err);
        setError(err);
        setUser(null);
        setSession(null);
      } finally {
        console.log('🔧 SupabaseProvider: Session check complete, setting loading to false');
        setLoading(false);
      }
    };
    
    checkSession();
    
    console.log('🔧 App.jsx: About to render SupabaseProvider');
    
    // Set up auth state listener
    console.log('🔧 SupabaseProvider: Setting up auth listener...');
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔧 SupabaseProvider: Auth state changed:', event);
        console.log('🔧 SupabaseProvider: New session:', session ? 'exists' : 'null');
        
        if (session?.user) {
          console.log('🔧 SupabaseProvider: Setting user from auth change:', session.user.email);
          setUser(session.user);
          setSession(session);
        } else {
          console.log('🔧 SupabaseProvider: Clearing user from auth change');
          setUser(null);
          setSession(null);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      console.log('🔧 SupabaseProvider: Cleaning up auth listener');
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    console.log('🔧 SupabaseProvider: Login called with email:', email);
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔧 SupabaseProvider: Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('🔧 SupabaseProvider: Login response:', { data, error });
      
      if (error) {
        console.error('🔧 SupabaseProvider: Login error:', error);
        throw error;
      }
      
      if (data.session && data.user) {
        console.log('🔧 SupabaseProvider: Login successful, setting state');
        setUser(data.user);
        setSession(data.session);
        console.log('🔧 SupabaseProvider: Login - User email:', data.user.email);
        console.log('🔧 SupabaseProvider: Login - Token exists:', !!data.session.access_token);
      } else {
        console.warn('🔧 SupabaseProvider: Login successful but no session/user in response');
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('🔧 SupabaseProvider: Login catch block error:', error);
      setError(error);
      return { data: null, error };
    } finally {
      console.log('🔧 SupabaseProvider: Login finally block, setting loading to false');
      setLoading(false);
    }
  };
  
  // Sign up with email and password
  const signup = async (email, password) => {
    console.log('🔧 SupabaseProvider: Signup called with email:', email);
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      console.log('🔧 SupabaseProvider: Signup response:', { data, error });
      
      if (error) throw error;
      
      if (data.user && data.session) {
        console.log('🔧 SupabaseProvider: Signup successful with session');
        setUser(data.user);
        setSession(data.session);
      } else {
        console.log('🔧 SupabaseProvider: Signup successful but no immediate session (confirmation required?)');
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('🔧 SupabaseProvider: Signup error:', error);
      setError(error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    console.log('🔧 SupabaseProvider: Logout called');
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      console.log('🔧 SupabaseProvider: Logout successful, clearing state');
      setUser(null);
      setSession(null);
      
      return { error: null };
    } catch (error) {
      console.error('🔧 SupabaseProvider: Logout error:', error);
      setError(error);
      setUser(null);
      setSession(null);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Current state logging
  console.log('🔧 SupabaseProvider: Current state:', { 
    userExists: !!user, 
    userEmail: user?.email,
    sessionExists: !!session,
    hasAccessToken: !!(session?.access_token),
    loading,
    errorExists: !!error
  });

  // Provide context value
  const value = {
    user,
    session,
    loading,
    error,
    login,
    signIn: login,
    signup,
    signUp: signup,
    logout,
    signOut: logout,
    resetPassword,
    updatePassword,
    supabase
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );  
};

export default SupabaseProvider;