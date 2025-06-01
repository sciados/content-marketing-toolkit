// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
      setLoading(false);
    };

    getInitialSession();

    // Set up auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Auth methods
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const register = async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  // Email methods
  const saveEmail = async (emailData) => {
    if (!user) throw new Error('You must be logged in to save emails');
    
    // Check if this is part of a series
    if (emailData.seriesName) {
      let seriesId = emailData.seriesId;
      
      // If no series ID provided, create or find the series
      if (!seriesId) {
        // Check if series with this name exists
        let { data: existingSeries } = await supabase
          .from('email_series')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', emailData.seriesName)
          .single();
        
        if (existingSeries) {
          seriesId = existingSeries.id;
        } else {
          // Create new series
          const { data, error } = await supabase
            .from('email_series')
            .insert({
              user_id: user.id,
              name: emailData.seriesName,
              domain: emailData.domain || ''
            })
            .select()
            .single();
          
          if (error) throw error;
          seriesId = data.id;
        }
      }
      
      // Now save the email with the series ID
      const { data, error } = await supabase
        .from('emails')
        .insert({
          user_id: user.id,
          series_id: seriesId,
          subject: emailData.subject || 'No Subject',
          body: emailData.body || '',
          benefit: emailData.benefit || '',
          email_number: emailData.emailNumber || null,
          layout: emailData.layout || 'standard'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data.id;
    } else {
      // Save standalone email
      const { data, error } = await supabase
        .from('emails')
        .insert({
          user_id: user.id,
          subject: emailData.subject || 'No Subject',
          body: emailData.body || '',
          benefit: emailData.benefit || '',
          layout: emailData.layout || 'standard'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data.id;
    }
  };

  const getSavedEmails = async () => {
    if (!user) return [];
    
    // Get all emails with their series information
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
    
    // Transform to match your expected format
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
  };

  // Method to get all email series
  const getEmailSeries = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('email_series')
      .select(`
        *,
        emails (count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(series => ({
      id: series.id,
      name: series.name,
      domain: series.domain,
      createdAt: series.created_at,
      updatedAt: series.updated_at,
      emailCount: series.emails?.[0]?.count || 0
    }));
  };

  // Delete an email
  const deleteEmail = async (emailId) => {
    if (!user) throw new Error('You must be logged in to delete emails');
    
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', emailId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    return true;
  };

  // Delete a series and all its emails
  const deleteEmailSeries = async (seriesId) => {
    if (!user) throw new Error('You must be logged in to delete series');
    
    // Supabase will handle cascading deletes based on foreign key constraints
    const { error } = await supabase
      .from('email_series')
      .delete()
      .eq('id', seriesId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    return true;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    saveEmail,
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

export default AuthContext;
