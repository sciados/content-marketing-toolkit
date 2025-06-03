// src/hooks/useUsageTracking.js - FIXED data mapping
import { useState, useEffect, useCallback } from 'react';
import { usageApi } from '../services/api';

export const useUsageTracking = () => {
  const [limits, setLimits] = useState({
    monthly_token_limit: 2000,
    daily_token_limit: 200,
    monthly_tokens_used: 0,
    daily_tokens_used: 0,
    daily_video_limit: 10,
    daily_videos_processed: 0,
    tier: 'free'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current usage limits
  const fetchLimits = useCallback(async () => {
    console.log('🔍 fetchLimits called')
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 About to call usageApi.getLimits()')
      const result = await usageApi.getLimits();
      console.log('🔍 usageApi.getLimits() result:', result)
      
      if (result.success) {
        // FIXED: Map API response to expected format
        const mappedLimits = {
          // Map API field names to expected field names
          monthly_token_limit: result.limits?.monthly_tokens || result.data?.limits?.monthly_tokens || 10000,
          daily_token_limit: result.limits?.daily_tokens || result.data?.limits?.daily_tokens || 500,
          daily_video_limit: result.limits?.videos_per_day || result.data?.limits?.videos_per_day || 5,
          
          // Current usage from API
          monthly_tokens_used: result.current_usage?.monthly_tokens_used || result.data?.current_usage?.monthly_tokens_used || 0,
          daily_tokens_used: result.current_usage?.daily_tokens_used || result.data?.current_usage?.daily_tokens_used || 0,
          daily_videos_processed: result.current_usage?.videos_today || result.data?.current_usage?.videos_today || 0,
          
          // Additional fields
          tier: result.user_info?.subscription_tier || result.data?.user_info?.subscription_tier || 'gold'
        };
        
        console.log('🔍 Mapped limits:', mappedLimits);
        setLimits(mappedLimits);
        console.log('✅ Usage limits loaded and mapped correctly');
      } else {
        console.error('❌ Usage API returned error:', result)
        throw new Error(result.error || 'Failed to fetch usage limits');
      }
    } catch (err) {
      console.error('❌ Failed to fetch usage limits:', err);
      setError(err.message);
      
      // Use fallback limits with correct field names
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

  // Track AI token usage
  const trackAITokenUsage = useCallback(async (tokens, feature = 'general') => {
    try {
      const result = await usageApi.trackUsage({
        feature: feature,
        tokensUsed: tokens, // FIXED: Use correct field name
        metadata: {
          timestamp: new Date().toISOString()
        }
      });

      if (result.success) {
        // Update local state with correct field mapping
        setLimits(prev => ({
          ...prev,
          monthly_tokens_used: result.data?.usage?.monthly_tokens_used || prev.monthly_tokens_used,
          daily_tokens_used: result.data?.usage?.daily_tokens_used || prev.daily_tokens_used
        }));

        console.log(`✅ Tracked ${tokens} tokens for ${feature}`);
        return result;
      } else {
        throw new Error(result.error || 'Failed to track usage');
      }
    } catch (error) {
      console.error('❌ Failed to track token usage:', error);
      throw error;
    }
  }, []);

  // Track video processing
  const trackVideoProcessing = useCallback(async (videoId, extractionMethod = 'webshare') => {
    try {
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
          daily_videos_processed: result.data?.usage?.videos_today || prev.daily_videos_processed + 1
        }));

        console.log(`✅ Tracked video processing: ${videoId}`);
        return result;
      } else {
        throw new Error(result.error || 'Failed to track video processing');
      }
    } catch (error) {
      console.error('❌ Failed to track video processing:', error);
      throw error;
    }
  }, []);

  // Convenience methods for backward compatibility
  const trackEmailGeneration = useCallback((count = 1) => {
    return trackAITokenUsage(150 * count, 'email_generation');
  }, [trackAITokenUsage]);

  const trackSeriesCreated = useCallback((count = 1) => {
    return trackAITokenUsage(50 * count, 'series_creation');
  }, [trackAITokenUsage]);

  const trackEmailSaved = useCallback((count = 1) => {
    return trackAITokenUsage(10 * count, 'email_save');
  }, [trackAITokenUsage]);

  // trackUsage method with metadata parameter (kept for API compatibility)
  const trackUsage = useCallback((tokens, feature, _metadata = {}) => { // eslint-disable-line no-unused-vars
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
        return true;
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

  // Initial load
  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  // Polling for usage updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchLimits, 30000);
    return () => clearInterval(interval);
  }, [fetchLimits]);

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
    isAtLimit: !canPerformAction('ai_generation', 100), // Check if user can use 100 tokens
    hasVideoQuota: canPerformAction('video_processing')
  };
};