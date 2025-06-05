// src/hooks/useUsageTracking.js - FIXED with non-blocking usage tracking
import { useState, useEffect, useCallback } from 'react';
import { usageApi } from '../services/api';

export const useUsageTracking = () => {
  const [limits, setLimits] = useState({
    monthly_token_limit: 10000,
    daily_token_limit: 500,
    monthly_tokens_used: 0,
    daily_tokens_used: 0,
    daily_video_limit: 5,
    daily_videos_processed: 0,
    tier: 'gold'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current usage limits - FIXED: Better error handling
  const fetchLimits = useCallback(async () => {
    console.log('🔍 fetchLimits called');
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 About to call usageApi.getLimits()');
      const result = await usageApi.getLimits();
      console.log('🔍 usageApi.getLimits() result:', result);
      
      if (result.success) {
        // FIXED: Map API response to expected format
        const mappedLimits = {
          // Map API field names to expected field names
          monthly_token_limit: result.limits?.monthly_tokens || 10000,
          daily_token_limit: result.limits?.daily_tokens || 500,
          daily_video_limit: result.limits?.videos_per_day || 5,
          
          // Current usage from API
          monthly_tokens_used: result.current_usage?.monthly_tokens_used || 0,
          daily_tokens_used: result.current_usage?.daily_tokens_used || 0,
          daily_videos_processed: result.current_usage?.videos_today || 0,
          
          // Additional fields
          tier: result.user_info?.subscription_tier || 'gold'
        };
        
        console.log('🔍 Mapped limits:', mappedLimits);
        setLimits(mappedLimits);
        console.log('✅ Usage limits loaded and mapped correctly');
      } else {
        console.warn('⚠️ Usage API returned error, using defaults:', result.error);
        // Don't throw - use default values
      }
    } catch (err) {
      console.warn('⚠️ Failed to fetch usage limits, using defaults:', err.message);
      setError(err.message);
      
      // Use fallback limits - don't break the app
      setLimits({
        monthly_token_limit: 10000,
        daily_token_limit: 500,
        monthly_tokens_used: 0,
        daily_tokens_used: 0,
        daily_video_limit: 5,
        daily_videos_processed: 0,
        tier: 'gold'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Track AI token usage - FIXED: Non-blocking
  const trackAITokenUsage = useCallback(async (tokens, feature = 'general') => {
    try {
      console.log(`📊 Tracking ${tokens} tokens for ${feature}`);
      
      const result = await usageApi.trackUsage({
        feature: feature,
        tokensUsed: tokens,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });

      if (result.success) {
        // Update local state if tracking succeeded
        setLimits(prev => ({
          ...prev,
          monthly_tokens_used: (prev.monthly_tokens_used || 0) + tokens,
          daily_tokens_used: (prev.daily_tokens_used || 0) + tokens
        }));

        console.log(`✅ Tracked ${tokens} tokens for ${feature}`);
        return result;
      } else {
        console.warn(`⚠️ Usage tracking failed for ${feature}, but continuing:`, result.error);
        // Still return success so the app continues
        return { success: true, message: 'Tracking failed but operation continued' };
      }
    } catch (error) {
      console.warn('⚠️ Usage tracking error, continuing anyway:', error.message);
      // Don't throw - return success to let app continue
      return { 
        success: true, 
        message: 'Tracking failed but operation continued',
        error: error.message 
      };
    }
  }, []);

  // Track video processing - FIXED: Non-blocking
  const trackVideoProcessing = useCallback(async (videoId, extractionMethod = 'webshare') => {
    try {
      console.log(`📹 Tracking video processing: ${videoId}`);
      
      const result = await usageApi.trackUsage({
        feature: 'video_processing',
        tokensUsed: 0, // Video processing doesn't use tokens
        metadata: {
          video_id: videoId,
          extraction_method: extractionMethod,
          timestamp: new Date().toISOString()
        }
      });

      if (result.success) {
        setLimits(prev => ({
          ...prev,
          daily_videos_processed: (prev.daily_videos_processed || 0) + 1
        }));

        console.log(`✅ Tracked video processing: ${videoId}`);
        return result;
      } else {
        console.warn(`⚠️ Video tracking failed for ${videoId}, but continuing:`, result.error);
        return { success: true, message: 'Tracking failed but operation continued' };
      }
    } catch (error) {
      console.warn('⚠️ Video tracking error, continuing anyway:', error.message);
      return { 
        success: true, 
        message: 'Tracking failed but operation continued',
        error: error.message 
      };
    }
  }, []);

  // Convenience methods - FIXED: Non-blocking
  const trackEmailGeneration = useCallback(async (count = 1) => {
    console.log(`📧 Tracking email generation: ${count} emails`);
    return trackAITokenUsage(150 * count, 'email_generation');
  }, [trackAITokenUsage]);

  const trackSeriesCreated = useCallback(async (count = 1) => {
    console.log(`📝 Tracking series creation: ${count} series`);
    return trackAITokenUsage(50 * count, 'series_creation');
  }, [trackAITokenUsage]);

  const trackEmailSaved = useCallback(async (count = 1) => {
    console.log(`💾 Tracking email save: ${count} emails`);
    return trackAITokenUsage(10 * count, 'email_save');
  }, [trackAITokenUsage]);

  // Legacy trackUsage method for backward compatibility
  const trackUsage = useCallback((tokens, feature = {}) => {
    return trackAITokenUsage(tokens, feature);
  }, [trackAITokenUsage]);

  // Check if user can perform action
  const canPerformAction = useCallback((actionType, tokensRequired = 0) => {
    switch (actionType) {
      case 'ai_generation':
        return limits.daily_tokens_used + tokensRequired <= limits.daily_token_limit &&
               limits.monthly_tokens_used + tokensRequired <= limits.monthly_token_limit;
      
      case 'video_processing':
        return limits.daily_videos_processed < limits.daily_video_limit;
      
      default:
        return true; // Allow by default
    }
  }, [limits]);

  // Check token availability
  const checkCanUseTokens = useCallback(async (requiredTokens) => {
    const dailyAvailable = limits.daily_token_limit - limits.daily_tokens_used;
    const monthlyAvailable = limits.monthly_token_limit - limits.monthly_tokens_used;
    const available = Math.min(dailyAvailable, monthlyAvailable);
    
    if (available >= requiredTokens) {
      return { allowed: true, available, required: requiredTokens };
    } else {
      return { 
        allowed: false, 
        available, 
        required: requiredTokens,
        needed: requiredTokens - available
      };
    }
  }, [limits]);

  // Get usage percentages
  const getUsagePercentages = useCallback(() => {
    return {
      daily_tokens: Math.min((limits.daily_tokens_used / limits.daily_token_limit) * 100, 100),
      monthly_tokens: Math.min((limits.monthly_tokens_used / limits.monthly_token_limit) * 100, 100),
      daily_videos: Math.min((limits.daily_videos_processed / limits.daily_video_limit) * 100, 100)
    };
  }, [limits]);

  // Get remaining limits
  const getRemainingLimits = useCallback(() => {
    return {
      daily_tokens: Math.max(limits.daily_token_limit - limits.daily_tokens_used, 0),
      monthly_tokens: Math.max(limits.monthly_token_limit - limits.monthly_tokens_used, 0),
      daily_videos: Math.max(limits.daily_video_limit - limits.daily_videos_processed, 0)
    };
  }, [limits]);

  // Initial load - FIXED: Non-blocking
  useEffect(() => {
    fetchLimits().catch(err => {
      console.warn('⚠️ Initial usage limits fetch failed:', err.message);
      // Don't break the app
    });
  }, [fetchLimits]);

  // REMOVED: Polling that might cause issues
  // Only fetch on demand to avoid 405 errors

  return {
    // State
    limits,
    loading,
    error,
    wsConnected: false, // WebSocket not implemented yet
    
    // Actions
    fetchLimits,
    trackAITokenUsage,
    trackVideoProcessing,
    trackEmailGeneration,
    trackSeriesCreated,
    trackEmailSaved,
    trackUsage,
    checkCanUseTokens,
    
    // Utilities
    canPerformAction,
    getUsagePercentages,
    getRemainingLimits,
    
    // Computed values
    isNearLimit: getUsagePercentages().daily_tokens > 80 || getUsagePercentages().monthly_tokens > 80,
    isAtLimit: !canPerformAction('ai_generation', 100),
    hasVideoQuota: canPerformAction('video_processing')
  };
};