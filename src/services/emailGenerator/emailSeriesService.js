// src/services/emailGenerator/emailSeriesService.js
import { supabase } from '../supabase/supabaseClient';

export const createEmailSeries = async (userId, seriesData, emails = []) => {
  // Create the series
  const { data: series, error: seriesError } = await supabase
    .from('email_series')
    .insert({
      user_id: userId,
      name: seriesData.name,
      domain: seriesData.domain || ''
    })
    .select()
    .single();
  
  if (seriesError) throw seriesError;
  
  // If we have emails to add
  if (emails.length > 0) {
    // Format emails with user_id and series_id
    const emailsToInsert = emails.map(email => ({
      user_id: userId,
      series_id: series.id,
      subject: email.subject,
      body: email.body,
      benefit: email.benefit || '',
      email_number: email.emailNumber || null,
      layout: email.layout || 'standard'
    }));
    
    // Insert all emails
    const { error: emailsError } = await supabase
      .from('emails')
      .insert(emailsToInsert);
    
    if (emailsError) throw emailsError;
  }
  
  return series.id;
};

export const getEmailsInSeries = async (userId, seriesId) => {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('user_id', userId)
    .eq('series_id', seriesId)
    .order('email_number', { ascending: true });
  
  if (error) throw error;
  
  return data.map(email => ({
    id: email.id,
    subject: email.subject,
    body: email.body,
    benefit: email.benefit,
    emailNumber: email.email_number,
    layout: email.layout,
    createdAt: email.created_at,
    updatedAt: email.updated_at
  }));
};

export const getAllSeries = async (userId) => {
  const { data, error } = await supabase
    .from('email_series')
    .select(`
      *,
      emails (count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(series => ({
    id: series.id,
    name: series.name,
    domain: series.domain,
    emailCount: series.emails.length,
    createdAt: series.created_at,
    updatedAt: series.updated_at
  }));
};

export default {
  createEmailSeries,
  getEmailsInSeries,
  getAllSeries
};