// src/hooks/useUsageTracking.js
import { useState, useCallback } from 'react';
import { subscriptions } from '../services/supabase/subscriptions';

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
   * Check if user can perform an action based on usage limits
   * @param {string} limitType - Type of limit to check ('emails', 'series', 'ai_tokens')
   * @returns {Promise<Object>} - { allowed: boolean, current: number, limit: number, remaining: number }
   */
  const checkUsageLimit = useCallback(async (limitType) => {
    try {
      const result = await subscriptions.checkUsageLimit(limitType);
      console.log(`Usage check for ${limitType}:`, result);
      return result;
    } catch (err) {
      console.error(`Error checking usage limit for ${limitType}:`, err);
      setError(err.message);
      // Return safe defaults on error
      return {
        allowed: false,
        current_usage: 0,
        limit_value: 0,
        remaining: 0
      };
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

  return {
    // Tracking functions
    trackEmailGeneration,
    trackEmailSaved,
    trackSeriesCreated,
    trackAITokenUsage,
    
    // Limit checking functions
    checkUsageLimit,
    getCurrentUsage,
    canGenerateEmails,
    canSaveEmails,
    canCreateSeries,
    
    // State
    isTracking,
    error
  };
};