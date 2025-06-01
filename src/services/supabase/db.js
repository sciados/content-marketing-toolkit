// src/services/supabase/db.js
import { supabase } from './supabaseClient';

/**
 * Database interaction methods for Supabase
 */
export const db = {
  /**
   * Email Series Methods
   */
  emailSeries: {
    /**
     * Get all email series for a user
     * @param {string} userId - User ID
     * @returns {Promise} - Series data
     */
    getAll: async (userId) => {
      return await supabase
        .from('email_series')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    },
    
    /**
     * Get a specific email series
     * @param {string} userId - User ID
     * @param {string} seriesId - Series ID
     * @returns {Promise} - Series data
     */
    get: async (userId, seriesId) => {
      return await supabase
        .from('email_series')
        .select('*')
        .eq('user_id', userId)
        .eq('id', seriesId)
        .single();
    },
    
    /**
     * Create a new email series
     * @param {string} userId - User ID
     * @param {object} series - Series data
     * @returns {Promise} - Created series
     */
    create: async (userId, series) => {
      return await supabase
        .from('email_series')
        .insert({
          user_id: userId,
          name: series.name,
          domain: series.domain,
          url: series.url || '',
          tone: series.tone || 'neutral',
          industry: series.industry || 'general',
          generated_with_ai: series.generatedWithAI || false,
          keywords: series.keywords || '',
          email_count: series.emailCount || 0
        })
        .select();
    },
    
    /**
     * Update an email series
     * @param {string} userId - User ID
     * @param {string} seriesId - Series ID
     * @param {object} updates - Fields to update
     * @returns {Promise} - Updated series
     */
    update: async (userId, seriesId, updates) => {
      return await supabase
        .from('email_series')
        .update(updates)
        .eq('user_id', userId)
        .eq('id', seriesId)
        .select();
    },
    
    /**
     * Delete an email series
     * @param {string} userId - User ID
     * @param {string} seriesId - Series ID
     * @returns {Promise} - Delete response
     */
    delete: async (userId, seriesId) => {
      // First delete all emails in the series
      await supabase
        .from('emails')
        .delete()
        .eq('user_id', userId)
        .eq('series_id', seriesId);
      
      // Then delete the series itself
      return await supabase
        .from('email_series')
        .delete()
        .eq('user_id', userId)
        .eq('id', seriesId);
    },
    
    /**
     * Get emails in a series
     * @param {string} userId - User ID
     * @param {string} seriesId - Series ID
     * @returns {Promise} - Emails data
     */
    getEmails: async (userId, seriesId) => {
      return await supabase
        .from('emails')
        .select('*')
        .eq('user_id', userId)
        .eq('series_id', seriesId)
        .order('email_number', { ascending: true });
    },
    
    /**
     * Create a complete email series with emails
     * @param {string} userId - User ID
     * @param {object} seriesData - Series data
     * @param {array} emailsData - Array of email objects
     * @returns {Promise} - Created series with emails
     */
    createWithEmails: async (userId, seriesData, emailsData) => {
      // First create the series
      const { data: series, error: seriesError } = await supabase
        .from('email_series')
        .insert({
          user_id: userId,
          name: seriesData.name,
          domain: seriesData.domain,
          url: seriesData.url || '',
          tone: seriesData.tone || 'neutral',
          industry: seriesData.industry || 'general',
          generated_with_ai: seriesData.generatedWithAI || false,
          keywords: seriesData.keywords || '',
          email_count: emailsData.length
        })
        .select();
      
      if (seriesError) throw seriesError;
      
      // Get the series ID
      const seriesId = series[0].id;
      
      // Prepare emails with series ID
      const emailsToInsert = emailsData.map(email => ({
        user_id: userId,
        series_id: seriesId,
        subject: email.subject,
        body: email.body,
        benefit: email.benefit,
        email_number: email.emailNumber,
        layout: email.layout || 'standard',
        generated_with_ai: seriesData.generatedWithAI || false,
        domain: seriesData.domain
      }));
      
      // Insert all emails
      const { data: emails, error: emailsError } = await supabase
        .from('emails')
        .insert(emailsToInsert)
        .select();
      
      if (emailsError) throw emailsError;
      
      return {
        series: series[0],
        emails
      };
    }
  },
  
  /**
   * Email Methods
   */
  emails: {
    /**
     * Get all emails for a user
     * @param {string} userId - User ID
     * @returns {Promise} - Emails data
     */
    getAll: async (userId) => {
      return await supabase
        .from('emails')
        .select('*, email_series(id, name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    },
    
    /**
     * Get a specific email
     * @param {string} userId - User ID
     * @param {string} emailId - Email ID
     * @returns {Promise} - Email data
     */
    get: async (userId, emailId) => {
      return await supabase
        .from('emails')
        .select('*, email_series(id, name)')
        .eq('user_id', userId)
        .eq('id', emailId)
        .single();
    },
    
    /**
     * Save a new email
     * @param {string} userId - User ID
     * @param {object} email - Email data
     * @returns {Promise} - Created email
     */
    create: async (userId, email) => {
      return await supabase
        .from('emails')
        .insert({
          user_id: userId,
          series_id: email.seriesId,
          subject: email.subject,
          body: email.body,
          benefit: email.benefit,
          email_number: email.emailNumber || 1,
          layout: email.layout || 'standard',
          generated_with_ai: email.generatedWithAI || false,
          domain: email.domain
        })
        .select();
    },
    
    /**
     * Update an email
     * @param {string} userId - User ID
     * @param {string} emailId - Email ID
     * @param {object} updates - Fields to update
     * @returns {Promise} - Updated email
     */
    update: async (userId, emailId, updates) => {
      return await supabase
        .from('emails')
        .update(updates)
        .eq('user_id', userId)
        .eq('id', emailId)
        .select();
    },
    
    /**
     * Delete an email
     * @param {string} userId - User ID
     * @param {string} emailId - Email ID
     * @returns {Promise} - Delete response
     */
    delete: async (userId, emailId) => {
      return await supabase
        .from('emails')
        .delete()
        .eq('user_id', userId)
        .eq('id', emailId);
    },
    
    /**
     * Search emails
     * @param {string} userId - User ID
     * @param {string} query - Search query
     * @returns {Promise} - Matching emails
     */
    search: async (userId, query) => {
      // Search in subject and body
      return await supabase
        .from('emails')
        .select('*, email_series(id, name)')
        .eq('user_id', userId)
        .or(`subject.ilike.%${query}%,body.ilike.%${query}%`)
        .order('created_at', { ascending: false });
    }
  },

  ads: {
  /**
   * Get all active ads for display
   * @returns {Promise} - Active ads data
   */
  getActive: async () => {
    const now = new Date().toISOString();
    
    return await supabase
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('position', { ascending: true })
      .order('slot_number', { ascending: true });
  },
  
  /**
   * Get all ads (admin only)
   * @returns {Promise} - All ads data
   */
  getAll: async () => {
    return await supabase
      .from('ads')
      .select('*')
      .order('position', { ascending: true })
      .order('slot_number', { ascending: true });
  },
  
  /**
   * Create a new ad
   * @param {object} adData - Ad data
   * @returns {Promise} - Created ad
   */
  create: async (adData) => {
    return await supabase
      .from('ads')
      .insert([adData])
      .select();
  },
  
  /**
   * Update an ad
   * @param {string} adId - Ad ID
   * @param {object} updates - Fields to update
   * @returns {Promise} - Updated ad
   */
  update: async (adId, updates) => {
    return await supabase
      .from('ads')
      .update(updates)
      .eq('id', adId)
      .select();
  },
  
  /**
   * Delete an ad
   * @param {string} adId - Ad ID
   * @returns {Promise} - Delete response
   */
  delete: async (adId) => {
    return await supabase
      .from('ads')
      .delete()
      .eq('id', adId);
  },
  
  /**
   * Track ad click
   * @param {string} adId - Ad ID
   * @returns {Promise} - Update response
   */
  trackClick: async (adId) => {
    return await supabase.rpc('increment_ad_clicks', { ad_id: adId });
  },
  
  /**
   * Track ad impressions
   * @param {array} adIds - Array of ad IDs
   * @returns {Promise} - Update response
   */
  trackImpressions: async (adIds) => {
    if (!adIds || adIds.length === 0) return;
    return await supabase.rpc('increment_ad_impressions', { ad_ids: adIds });
  }
}  
};
