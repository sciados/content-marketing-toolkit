// src/context/SupabaseProvider.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase/supabaseClient';
import SupabaseContext from './SupabaseContext';

const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    // Get current session
    const checkSession = async () => {
      try {
        setLoading(true);
        
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        console.log("Session data:", data);
        
        if (data.session) {
          setUser(data.session.user);
          console.log("User found:", data.session.user.email);
        } else {
          console.log("No active session found");
          setUser(null);
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("Login successful:", data.user?.email);
      setUser(data.user);
      
      return { data, error: null };
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };
  
  // Sign up with email and password
  const signup = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Attempting signup for:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("Signup successful:", data);
      
      if (data.user && data.session) {
        setUser(data.user);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Attempting logout");
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      console.log("Logout successful");
      setUser(null);
      
      // Force redirect to login
      window.location.href = '/auth/login';
      return { error: null };
    } catch (error) {
      console.error('Error logging out:', error);
      setError(error);
      
      // Even on error, force logout state and redirect
      setUser(null);
      window.location.href = '/auth/login';
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

  console.log("SupabaseProvider state:", { 
    userExists: !!user, 
    loading
  });

  // Provide BOTH naming conventions but without unnecessary try/catch
  const value = {
    user,
    loading,
    error,
    login,
    signIn: login,  // Alias for login - no extra try/catch
    signup,
    signUp: signup,  // Alias for signup - no extra try/catch
    logout,
    signOut: logout, // Alias for logout - no extra try/catch
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