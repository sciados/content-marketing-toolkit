// src/hooks/useUsageTracking.js - FIXED with Video2Promo support
import { useState, useCallback } from 'react';
import { subscriptions } from '../services/supabase/subscriptions';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Custom hook for tracking and managing usage limits
 */
export const useUsageTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Track email generation usage
   * @param {number} count - Number of emails generated (default: 1)
   */
  const trackEmailGeneration = useCallback(async (count = 1) => {
    setIsTracking(true);
    setError(null);
    
    try {
      await subscriptions.updateUsage('emails_generated', count);
      console.log(`Tracked ${count} email(s) generated`);
    } catch (err) {
      console.error('Error tracking email generation:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsTracking(false);
    }
  }, []);

  /**
   * Track email saving usage
   * @param {number} count - Number of emails saved (default: 1)
   */
  const trackEmailSaved = useCallback(async (count = 1) => {
    setIsTracking(true);
    setError(null);
    
    try {
      await subscriptions.updateUsage('emails_saved', count);
      console.log(`Tracked ${count} email(s) saved`);
    } catch (err) {
      console.error('Error tracking email saved:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsTracking(false);
    }
  }, []);

  /**
   * Track series creation usage
   * @param {number} count - Number of series created (default: 1)
   */
  const trackSeriesCreated = useCallback(async (count = 1) => {
    setIsTracking(true);
    setError(null);
    
    try {
      await subscriptions.updateUsage('series_created', count);
      console.log(`Tracked ${count} series created`);
    } catch (err) {
      console.error('Error tracking series creation:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsTracking(false);
    }
  }, []);

  /**
   * Track AI token usage
   * @param {number} tokens - Number of AI tokens used
   */
  const trackAITokenUsage = useCallback(async (tokens) => {
    if (!tokens || tokens <= 0) return;
    
    setIsTracking(true);
    setError(null);
    
    try {
      await subscriptions.updateUsage('ai_tokens_used', tokens);
      console.log(`Tracked ${tokens} AI tokens used`);
    } catch (err) {
      console.error('Error tracking AI token usage:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsTracking(false);
    }
  }, []);

  /**
   * Track Video2Promo project usage
   * @param {number} count - Number of projects created (default: 1)
   */
  const trackVideo2PromoProject = useCallback(async (count = 1) => {
    setIsTracking(true);
    setError(null);
    
    try {
      // For Video2Promo, we can track it as series or create a new usage type
      await subscriptions.updateUsage('series_created', count);
      console.log(`Tracked ${count} Video2Promo project(s) created`);
    } catch (err) {
      console.error('Error tracking Video2Promo project:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsTracking(false);
    }
  }, []);

  /**
   * Check if user can perform an action based on usage limits
   * @param {string} limitType - Type of limit to check ('emails', 'series', 'ai_tokens', 'video2promo_projects')
   * @returns {Promise<Object>} - { allowed: boolean, current: number, limit: number, remaining: number }
   */
  const checkUsageLimit = useCallback(async (limitType) => {
    try {
      console.log(`🔍 Checking usage limit for: ${limitType}`);
      
      // Map Video2Promo projects to series limits for now
      const mappedLimitType = limitType === 'video2promo_projects' ? 'series' : limitType;
      
      const result = await subscriptions.checkUsageLimit(mappedLimitType);
      console.log(`Usage check for ${limitType} (mapped to ${mappedLimitType}):`, result);
      
      // Ensure we return the expected structure
      if (!result || typeof result !== 'object') {
        console.warn(`Invalid usage limit result for ${limitType}:`, result);
        return {
          allowed: false,
          current_usage: 0,
          limit_value: 0,
          remaining: 0,
          message: 'Invalid usage data'
        };
      }
      
      return {
        allowed: result.allowed !== false, // Default to true if not explicitly false
        current_usage: result.current_usage || 0,
        limit_value: result.limit_value || 0,
        remaining: result.remaining || 0,
        message: result.message || 'Usage check completed'
      };
    } catch (err) {
      console.error(`Error checking usage limit for ${limitType}:`, err);
      setError(err.message);
      // Return safe defaults on error
      return {
        allowed: false,
        current_usage: 0,
        limit_value: 0,
        remaining: 0,
        message: `Error checking usage: ${err.message}`
      };
    }
  }, []);

  /**
   * Update usage using the backend API (for Video2Promo and other backend features)
   * @param {string} usageType - Type of usage to update
   * @param {number} amount - Amount to add (default: 1)
   */
  const updateUsage = useCallback(async (usageType, amount = 1) => {
    setIsTracking(true);
    setError(null);
    
    try {
      console.log(`🔍 Updating usage via backend: ${usageType} +${amount}`);
      
      // Try to get session for backend API call
      const session = JSON.parse(localStorage.getItem('supabase.auth.token'))?.currentSession;
      
      if (!session?.access_token) {
        throw new Error('No valid session for backend API call');
      }
      
      const response = await fetch(`${API_BASE}/api/usage/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          usage_type: usageType,
          amount: amount
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Backend API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`✅ Backend usage update successful:`, result);
      
    } catch (err) {
      console.error(`Error updating usage via backend for ${usageType}:`, err);
      
      // Fallback to Supabase method if backend fails
      try {
        console.log(`🔄 Falling back to Supabase for ${usageType}`);
        const mappedType = usageType === 'video2promo_projects' ? 'series_created' : usageType;
        await subscriptions.updateUsage(mappedType, amount);
        console.log(`✅ Supabase fallback successful for ${usageType}`);
      } catch (fallbackErr) {
        console.error(`❌ Both backend and Supabase failed for ${usageType}:`, fallbackErr);
        setError(fallbackErr.message);
        throw fallbackErr;
      }
    } finally {
      setIsTracking(false);
    }
  }, []);

  /**
   * Get current usage statistics
   * @returns {Promise<Object>} - Current month usage stats
   */
  const getCurrentUsage = useCallback(async () => {
    try {
      const stats = await subscriptions.getUsageStats();
      console.log('Current usage stats:', stats);
      return stats;
    } catch (err) {
      console.error('Error getting usage stats:', err);
      setError(err.message);
      // Return default stats on error
      return {
        emails_generated: 0,
        emails_saved: 0,
        ai_tokens_used: 0,
        series_created: 0
      };
    }
  }, []);

  /**
   * Check if user can generate emails (checks email limit)
   * @param {number} emailCount - Number of emails to generate
   * @returns {Promise<boolean>} - Whether generation is allowed
   */
  const canGenerateEmails = useCallback(async (emailCount = 1) => {
    try {
      const limit = await checkUsageLimit('emails');
      return limit.allowed && limit.remaining >= emailCount;
    } catch (err) {
      console.error('Error checking email generation limit:', err);
      return false;
    }
  }, [checkUsageLimit]);

  /**
   * Check if user can save emails (checks storage limit)
   * @param {number} emailCount - Number of emails to save
   * @returns {Promise<boolean>} - Whether saving is allowed
   */
  const canSaveEmails = useCallback(async (emailCount = 1) => {
    try {
      const limit = await checkUsageLimit('emails');
      return limit.allowed && limit.remaining >= emailCount;
    } catch (err) {
      console.error('Error checking email save limit:', err);
      return false;
    }
  }, [checkUsageLimit]);

  /**
   * Check if user can create series (checks series limit)
   * @returns {Promise<boolean>} - Whether series creation is allowed
   */
  const canCreateSeries = useCallback(async () => {
    try {
      const limit = await checkUsageLimit('series');
      return limit.allowed && limit.remaining >= 1;
    } catch (err) {
      console.error('Error checking series creation limit:', err);
      return false;
    }
  }, [checkUsageLimit]);

  /**
   * Check if user can create Video2Promo projects
   * @returns {Promise<boolean>} - Whether Video2Promo creation is allowed
   */
  const canCreateVideo2Promo = useCallback(async () => {
    try {
      const limit = await checkUsageLimit('video2promo_projects');
      return limit.allowed && limit.remaining >= 1;
    } catch (err) {
      console.error('Error checking Video2Promo creation limit:', err);
      return false;
    }
  }, [checkUsageLimit]);

  return {
    // Tracking functions
    trackEmailGeneration,
    trackEmailSaved,
    trackSeriesCreated,
    trackAITokenUsage,
    trackVideo2PromoProject, // NEW
    
    // Limit checking functions
    checkUsageLimit,
    getCurrentUsage,
    canGenerateEmails,
    canSaveEmails,
    canCreateSeries,
    canCreateVideo2Promo, // NEW
    
    // Backend integration
    updateUsage, // NEW - for backend API calls
    
    // State
    isTracking,
    error
  };
};
