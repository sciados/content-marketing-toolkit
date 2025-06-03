// src/hooks/useAssetGeneration.js - UPDATED to use centralized API
import { useState, useCallback } from 'react';
import { videoApi, usageApi } from '../services/api';
import { useErrorHandler } from './useErrorHandler';

export function useAssetGeneration() {
  const { withErrorHandling } = useErrorHandler();
  const [generatedAssets, setGeneratedAssets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Track AI token usage using centralized API
   */
  const trackAITokenUsage = useCallback(async (tokensUsed) => {
    try {
      await usageApi.trackUsage({
        feature: 'video_asset_generation',
        tokensUsed: tokensUsed,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ Token usage tracked:', tokensUsed);
    } catch (error) {
      console.warn('⚠️ Failed to track token usage:', error);
      // Don't throw - this is not critical for the user
    }
  }, []);

  /**
   * Generate assets using centralized API service
   */
  const generateAssets = useCallback(async (params) => {
    setIsGenerating(true);
    setError(null);

    try {
      const {
        transcript,
        benefits,
        benefitIndices,
        assetTypes,
        generateVariants = false,
        project
      } = params;

      if (!transcript || !benefits || !benefitIndices) {
        throw new Error('Missing required parameters for asset generation');
      }

      console.log('🎯 Generating assets with centralized API:', {
        transcript: transcript.length,
        benefits: benefits.length,
        benefitIndices,
        assetTypes,
        generateVariants
      });

      // Use centralized API with error handling
      const safeApiCall = withErrorHandling(videoApi.generateAssets);
      const result = await safeApiCall({
        transcript,
        benefits,
        benefitIndices,
        assetTypes,
        generateVariants,
        project
      });

      if (!result.success) {
        throw new Error(result.message || result.error || 'Asset generation failed');
      }

      // Update state with generated assets
      setGeneratedAssets(result.assets || []);

      // Track token usage (already tracked on backend, but update local state)
      if (result.total_tokens) {
        await trackAITokenUsage(result.total_tokens);
      }

      console.log('✅ Asset generation successful:', {
        assetsGenerated: result.assets_generated,
        totalTokens: result.total_tokens
      });

      return {
        assets: result.assets,
        totalTokens: result.total_tokens,
        assetsGenerated: result.assets_generated,
        message: result.message
      };

    } catch (err) {
      console.error('❌ Asset generation error:', err);
      setError(err.message);
      
      // Don't show duplicate error if withErrorHandling already handled it
      if (!err.errorInfo) {
        throw err;
      }
      
      // Return error result instead of throwing if error was handled
      return {
        success: false,
        error: err.message,
        errorInfo: err.errorInfo
      };
    } finally {
      setIsGenerating(false);
    }
  }, [trackAITokenUsage, withErrorHandling]);

  // Specialized generation methods using the main generateAssets function
  const generateEmailSeries = useCallback(async (params) => {
    return generateAssets({
      ...params,
      assetTypes: ['email_series']
    });
  }, [generateAssets]);

  const generateBlogPost = useCallback(async (params) => {
    return generateAssets({
      ...params,
      assetTypes: ['blog_post']
    });
  }, [generateAssets]);

  const generateNewsletter = useCallback(async (params) => {
    return generateAssets({
      ...params,
      assetTypes: ['newsletter']
    });
  }, [generateAssets]);

  const generateSocialPosts = useCallback(async (params) => {
    return generateAssets({
      ...params,
      assetTypes: ['social_posts']
    });
  }, [generateAssets]);

  const generateAdCopy = useCallback(async (params) => {
    return generateAssets({
      ...params,
      assetTypes: ['ad_copy']
    });
  }, [generateAssets]);

  const generateMultipleAssets = useCallback(async (benefits, assetTypes, params = {}) => {
    const { transcript, project } = params;
    
    if (!transcript) {
      throw new Error('Transcript is required for asset generation');
    }

    const benefitIndices = benefits.map((_, index) => index);

    return generateAssets({
      transcript,
      benefits,
      benefitIndices,
      assetTypes,
      generateVariants: params.generateVariants || false,
      project
    });
  }, [generateAssets]);

  const clearAssets = useCallback(() => {
    setGeneratedAssets([]);
    setError(null);
  }, []);

  const removeAsset = useCallback((assetId) => {
    setGeneratedAssets(prev => prev.filter(asset => asset.id !== assetId));
  }, []);

  const estimateTokens = useCallback((benefits, assetTypes, generateVariants = false) => {
    const tokenEstimates = {
      email_series: 800,
      blog_post: 1200,
      newsletter: 400,
      social_posts: 600,
      ad_copy: 400,
      landing_page_copy: 1000
    };

    let total = 0;
    benefits.forEach(() => {
      assetTypes.forEach(type => {
        total += tokenEstimates[type] || 500;
      });
    });

    return generateVariants ? Math.floor(total * 1.5) : total;
  }, []);

  /**
   * Get asset generation history using centralized API
   */
  const getGenerationHistory = useCallback(async () => {
    try {
      const safeApiCall = withErrorHandling(usageApi.getHistory);
      const result = await safeApiCall({
        feature: 'video_asset_generation',
        days: 30
      });

      if (result.success) {
        return result.history || [];
      }
      
      return [];
    } catch (error) {
      console.warn('⚠️ Failed to get generation history:', error);
      return [];
    }
  }, [withErrorHandling]);

  /**
   * Check usage limits using centralized API
   */
  const checkUsageLimits = useCallback(async () => {
    try {
      const safeApiCall = withErrorHandling(usageApi.getLimits);
      const result = await safeApiCall();

      if (result.success) {
        return {
          canGenerate: result.remaining.daily_tokens > 100, // Need at least 100 tokens
          remainingTokens: result.remaining.daily_tokens,
          monthlyLimit: result.limits.monthly_tokens,
          dailyLimit: result.limits.daily_tokens
        };
      }
      
      // Default fallback
      return {
        canGenerate: true,
        remainingTokens: 5000,
        monthlyLimit: 100000,
        dailyLimit: 5000
      };
    } catch (error) {
      console.warn('⚠️ Failed to check usage limits:', error);
      // Allow generation on error
      return {
        canGenerate: true,
        remainingTokens: 5000,
        monthlyLimit: 100000,
        dailyLimit: 5000
      };
    }
  }, [withErrorHandling]);

  return {
    // State
    generatedAssets,
    isGenerating,
    error,
    
    // Main actions
    generateAssets,
    generateMultipleAssets,
    clearAssets,
    removeAsset,
    
    // Specialized generation methods
    generateEmailSeries,
    generateBlogPost,
    generateNewsletter,
    generateSocialPosts,
    generateAdCopy,
    
    // Utilities
    estimateTokens,
    getGenerationHistory,
    checkUsageLimits,
    
    // Legacy compatibility
    trackAITokenUsage
  };
}