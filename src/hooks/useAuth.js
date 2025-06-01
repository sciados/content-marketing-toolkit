// src/hooks/useAuth.js - Supabase version
import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '../services/supabase/supabaseClient';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check for session and set up auth listener
  useEffect(() => {
    // Get current session
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    fetchSession();

    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    // Clean up the subscription
    return () => subscription.unsubscribe();
  }, []);

  // Clear any auth errors
  const clearError = () => {
    setAuthError(null);
  };

  // Sign up with email and password
  const register = async (email, password, userData = {}) => {
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    setAuthError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setAuthError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // Create a new email series
  const saveEmailSeries = async (seriesData, emailsData = []) => {
    if (!user) throw new Error('You must be logged in to save email series');
    
    try {
      // Insert the series first
      const { data: series, error: seriesError } = await supabase
        .from('email_series')
        .insert({
          ...seriesData,
          user_id: user.id
        })
        .select()
        .single();
      
      if (seriesError) throw seriesError;
      
      // If there are emails to insert
      if (emailsData.length > 0) {
        // Add user_id and series_id to all emails
        const formattedEmails = emailsData.map(email => ({
          ...email,
          user_id: user.id,
          series_id: series.id
        }));
        
        // Insert all emails
        const { error: emailsError } = await supabase
          .from('emails')
          .insert(formattedEmails);
        
        if (emailsError) throw emailsError;
      }
      
      return series.id;
    } catch (error) {
      console.error('Error saving email series:', error);
      throw error;
    }
  };

  // Save a single email
  const saveEmail = async (emailData) => {
    if (!user) throw new Error('You must be logged in to save emails');
    
    try {
      // Check if this email is part of a series
      if (emailData.seriesName && !emailData.seriesId) {
        // Check if a series with this name already exists
        const { data: existingSeries } = await supabase
          .from('email_series')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', emailData.seriesName)
          .maybeSingle();
        
        // If series exists, use it; otherwise create a new one
        let seriesId;
        
        if (existingSeries) {
          seriesId = existingSeries.id;
        } else {
          // Create a new series
          const { data: newSeries, error: seriesError } = await supabase
            .from('email_series')
            .insert({
              name: emailData.seriesName,
              domain: emailData.domain || '',
              user_id: user.id
            })
            .select()
            .single();
          
          if (seriesError) throw seriesError;
          seriesId = newSeries.id;
        }
        
        // Update the email data with the series ID
        emailData.seriesId = seriesId;
      }
      
      // Now save the email
      const { data, error } = await supabase
        .from('emails')
        .insert({
          subject: emailData.subject,
          body: emailData.body,
          benefit: emailData.benefit,
          layout: emailData.layout,
          email_number: emailData.emailNumber,
          series_id: emailData.seriesId,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Error saving email:', error);
      throw error;
    }
  };

  // Get all saved emails
  const getSavedEmails = async () => {
    if (!user) return [];
    
    try {
      // Get all emails
      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          email_series (
            id,
            name,
            domain
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Format the email data
      return data.map(email => ({
        id: email.id,
        subject: email.subject,
        body: email.body,
        benefit: email.benefit,
        emailNumber: email.email_number,
        layout: email.layout,
        createdAt: email.created_at,
        updatedAt: email.updated_at,
        seriesId: email.series_id,
        seriesName: email.email_series?.name || 'Unsorted Emails',
        domain: email.email_series?.domain || ''
      }));
    } catch (error) {
      console.error('Error getting saved emails:', error);
      throw error;
    }
  };

  // Get all email series
  const getEmailSeries = async () => {
    if (!user) return [];
    
    try {
      // Get all series with email counts
      const { data, error } = await supabase
        .from('email_series')
        .select(`
          id,
          name,
          domain,
          created_at,
          updated_at,
          emails:emails(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Format the series data
      return data.map(series => ({
        id: series.id,
        name: series.name,
        domain: series.domain,
        createdAt: series.created_at,
        updatedAt: series.updated_at,
        emailCount: series.emails[0]?.count || 0
      }));
    } catch (error) {
      console.error('Error getting email series:', error);
      throw error;
    }
  };

  // Delete an email
  const deleteEmail = async (emailId) => {
    if (!user) throw new Error('You must be logged in to delete emails');
    
    try {
      const { error } = await supabase
        .from('emails')
        .delete()
        .eq('id', emailId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  };

  // Delete an email series and all its emails
  const deleteEmailSeries = async (seriesId) => {
    if (!user) throw new Error('You must be logged in to delete email series');
    
    try {
      // Delete the series - emails will be deleted automatically due to cascade
      const { error } = await supabase
        .from('email_series')
        .delete()
        .eq('id', seriesId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting email series:', error);
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    authError,
    clearError,
    register,
    login,
    logout,
    resetPassword,
    saveEmail,
    saveEmailSeries,
    getSavedEmails,
    getEmailSeries,
    deleteEmail,
    deleteEmailSeries
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
