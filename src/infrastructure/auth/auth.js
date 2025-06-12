// src/infrastructure/auth/auth.js
import { supabase } from '../../core/database/supabaseClient';

/**
 * Authentication service for Supabase
 */
export const auth = {
  /**
   * Get the current session
   * @returns {Promise<Object>} Session data
   */
  getSession: async () => {
    return await supabase.auth.getSession();
  },

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication data
   */
  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication data
   */
  signUp: async (email, password) => {
    return await supabase.auth.signUp({
      email,
      password
    });
  },

  /**
   * Sign out the current user
   * @returns {Promise<Object>} Result object
   */
  signOut: async () => {
    return await supabase.auth.signOut();
  },

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<Object>} Result object
   */
  resetPassword: async (email) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
  },

  /**
   * Update user password
   * @param {string} password - New password
   * @returns {Promise<Object>} Result object
   */
  updatePassword: async (password) => {
    return await supabase.auth.updateUser({
      password
    });
  },

  /**
   * Get the current user
   * @returns {Promise<Object>} User data
   */
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Update user data
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Result object
   */
  updateUser: async (userData) => {
    return await supabase.auth.updateUser(userData);
  }
};

// Default export for compatibility
export default auth;
