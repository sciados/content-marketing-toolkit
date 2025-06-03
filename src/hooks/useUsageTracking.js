
// src/hooks/useUsageTracking.js - ENHANCED with real-time updates
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
    setLoading(true);
    setError(null);
    
    try {
      const result = await usageApi.getLimits();
      
      if (result.success) {
        setLimits(result.limits);
        console.log('✅ Usage limits loaded:', result.limits);
      } else {
        throw new Error(result.error || 'Failed to fetch usage limits');
      }
    } catch (err) {
      console.error('❌ Failed to fetch usage limits:', err);
      setError(err.message);
      
      // Use fallback limits
      setLimits({
        monthly_token_limit: 2000,
        daily_token_limit: 200,
        monthly_tokens_used: 0,
        daily_tokens_used: 0,
        daily_video_limit: 10,
        daily_videos_processed: 0,
        tier: 'free'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Track AI token usage
  const trackAITokenUsage = useCallback(async (tokens, feature = 'general') => {
    try {
      const result = await usageApi.trackUsage({
        tokens,
        feature,
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        // Update local state
        setLimits(prev => ({
          ...prev,
          monthly_tokens_used: result.usage.monthly_tokens_used,
          daily_tokens_used: result.usage.daily_tokens_used
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
        metadata: {
          video_id: videoId,
          extraction_method: extractionMethod
        },
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        setLimits(prev => ({
          ...prev,
          daily_videos_processed: result.usage.daily_videos_processed
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
    // Note: _metadata parameter kept for API compatibility but not used in current implementation
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