// src/hooks/useSupabase.js
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase/supabaseClient';

console.log('🔧 useSupabase.js: Loading...');
/**
 * Custom hook for Supabase authentication
 * Handles user authentication state and provides auth methods
 */
export const useSupabase = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        setUser(session?.user || null);
        
        // Set up auth state listener
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });
        
        return () => {
          if (authListener?.subscription) {
            authListener.subscription.unsubscribe();
          }
        };
      } catch (error) {
        console.error('Error getting auth user:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signup = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error logging out:', error);
      setError(error);
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
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error);
      throw error;
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
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword
  };
};
