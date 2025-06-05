// src/hooks/useUsageTracking.js - COMPLETELY DISABLED VERSION (No API calls)
import { useState, useCallback } from 'react';

export const useUsageTracking = () => {
  // Static safe defaults - no API calls
  const [limits] = useState({
    monthly_token_limit: 50000,
    daily_token_limit: 10000,
    monthly_tokens_used: 100,
    daily_tokens_used: 0,
    daily_video_limit: 50,
    daily_videos_processed: 0,
    tier: 'superAdmin'
  });

  // Mock functions that never fail
  const fetchLimits = useCallback(async () => {
    console.log('🔧 Usage tracking disabled - using static values');
    return Promise.resolve();
  }, []);

  const trackAITokenUsage = useCallback(async (tokens, feature = 'general') => {
    console.log(`🔧 Mock tracking: ${tokens} tokens for ${feature}`);
    return Promise.resolve({ success: true, message: 'Tracking disabled' });
  }, []);

  const trackVideoProcessing = useCallback(async (videoId, extractionMethod = 'webshare') => { // eslint-disable-line no-unused-vars
    console.log(`🔧 Mock tracking: video ${videoId}`);
    return Promise.resolve({ success: true, message: 'Tracking disabled' });
  }, []);

  const trackEmailGeneration = useCallback(async (count = 1) => {
    console.log(`🔧 Mock tracking: ${count} emails generated`);
    return Promise.resolve({ success: true, message: 'Tracking disabled' });
  }, []);

  const trackSeriesCreated = useCallback(async (count = 1) => {
    console.log(`🔧 Mock tracking: ${count} series created`);
    return Promise.resolve({ success: true, message: 'Tracking disabled' });
  }, []);

  const trackEmailSaved = useCallback(async (count = 1) => {
    console.log(`🔧 Mock tracking: ${count} emails saved`);
    return Promise.resolve({ success: true, message: 'Tracking disabled' });
  }, []);

  const trackUsage = useCallback((tokens, feature) => {
    return trackAITokenUsage(tokens, feature);
  }, [trackAITokenUsage]);

  const canPerformAction = useCallback((actionType, tokensRequired = 0) => { // eslint-disable-line no-unused-vars
    // Always allow actions when tracking is disabled
    return true;
  }, []);

  const checkCanUseTokens = useCallback(async (requiredTokens) => {
    // Always allow when tracking is disabled
    return { 
      allowed: true, 
      available: 50000, 
      required: requiredTokens 
    };
  }, []);

  const getUsagePercentages = useCallback(() => {
    return {
      daily_tokens: 0,
      monthly_tokens: 1,
      daily_videos: 0
    };
  }, []);

  const getRemainingLimits = useCallback(() => {
    return {
      daily_tokens: 50000,
      monthly_tokens: 49900,
      daily_videos: 50
    };
  }, []);

  return {
    // State
    limits,
    loading: false,
    error: null,
    wsConnected: false,
    
    // Actions (all return success immediately)
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
    
    // Computed values (always allow usage)
    isNearLimit: false,
    isAtLimit: false,
    hasVideoQuota: true
  };
};