// src/hooks/useAssetGeneration.js - Google STT Only (Whisper removed)
import { useState, useCallback } from 'react';
import { videoApi, usageApi } from '../services/api';
import { useErrorHandler } from './useErrorHandler';

export function useAssetGeneration() {
  const { withErrorHandling } = useErrorHandler();
  const [generatedAssets, setGeneratedAssets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced state for cache and processing tracking
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [cacheStats, setCacheStats] = useState(null);
  const [extractionMethod, setExtractionMethod] = useState(null);

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
   * Enhanced video processing with Google STT only, cache awareness, and progress tracking
   */
  const processVideoEnhanced = useCallback(async (videoUrl, keywords = [], options = {}) => {
    setIsGenerating(true);
    setError(null);
    setProcessingProgress(0);
    setProcessingStage('Initializing...');
    setCacheStats(null);
    setExtractionMethod(null);

    try {
      console.log('🚀 Starting enhanced video processing with Google STT...');
      
      // Progress updates
      const updateProgress = (stage, progress) => {
        setProcessingStage(stage);
        setProcessingProgress(progress);
      };

      updateProgress('Checking for cached transcript...', 10);
      await new Promise(r => setTimeout(r, 500));

      // Use enhanced video API endpoint for Google STT processing
      const safeApiCall = withErrorHandling(videoApi.extractTranscriptEnhanced);
      const result = await safeApiCall({
        url: videoUrl,
        keywords: keywords || [],
        extraction_mode: options.extractionMode || 'google_stt_only',
        enable_cache: options.enableCache !== false, // Default to true
        force_refresh: options.forceRefresh || false
      });

      if (!result.success) {
        throw new Error(result.message || result.error || 'Video processing failed');
      }

      const data = result.data || result;

      // Handle cache status and performance metrics
      if (data.cached) {
        updateProgress('⚡ Found cached transcript!', 100);
        setCacheStats({
          cached: true,
          cacheSource: data.cache_source || 'unknown',
          costSaved: data.cost_saved || 0,
          processingTime: data.processing_time || 0.1
        });
      } else {
        // Show progress for fresh extraction with Google STT
        updateProgress('☁️ Processing with Google Speech-to-Text...', 30);
        await new Promise(r => setTimeout(r, 1000));
        updateProgress('🔄 Converting audio segments...', 60);
        await new Promise(r => setTimeout(r, 1500));
        updateProgress('📝 Assembling transcript...', 90);
        await new Promise(r => setTimeout(r, 500));
        
        updateProgress('✅ Transcript ready!', 100);
        setCacheStats({
          cached: false,
          processingTime: data.processing_time || 30,
          method: data.method,
          costEstimate: data.cost_estimate || 0.36
        });
      }

      setExtractionMethod(data.method || 'google_stt');

      console.log('✅ Enhanced video processing successful:', {
        method: data.method,
        cached: data.cached,
        transcriptLength: data.transcript?.length || 0,
        costSaved: data.cost_saved
      });

      return {
        success: true,
        transcript: data.transcript,
        method: data.method,
        cached: data.cached,
        cacheSource: data.cache_source,
        costSaved: data.cost_saved,
        processingTime: data.processing_time,
        wordCount: data.word_count,
        videoTitle: data.video_title,
        duration: data.duration
      };

    } catch (err) {
      console.error('❌ Enhanced video processing error:', err);
      setError(err.message);
      setProcessingStage('❌ Processing failed');
      
      if (!err.errorInfo) {
        throw err;
      }
      
      return {
        success: false,
        error: err.message,
        errorInfo: err.errorInfo
      };
    } finally {
      setIsGenerating(false);
    }
  }, [withErrorHandling]);

  /**
   * Enhanced website scanning with AI-powered analysis
   */
  const scanWebsiteEnhanced = useCallback(async (url, keywords = [], options = {}) => {
    setIsGenerating(true);
    setError(null);
    setProcessingProgress(0);
    setProcessingStage('Initializing website scan...');

    try {
      console.log('🌐 Starting enhanced website scanning with AI...');
      
      const updateProgress = (stage, progress) => {
        setProcessingStage(stage);
        setProcessingProgress(progress);
      };

      updateProgress('🔍 Analyzing page structure...', 20);
      await new Promise(r => setTimeout(r, 500));

      updateProgress('🧠 AI extracting insights...', 60);
      
      // Import from your existing API but with enhanced endpoint
      const { emailApi } = await import('../services/api');
      const safeApiCall = withErrorHandling(emailApi.scanPageEnhanced || emailApi.scanPage);
      
      const result = await safeApiCall({
        url: url,
        keywords: keywords || [],
        industry: options.industry || 'general',
        analysis_mode: options.analysisMode || 'ai_enhanced',
        enable_cache: options.enableCache !== false
      });

      if (!result.success) {
        throw new Error(result.message || result.error || 'Website scanning failed');
      }

      updateProgress('✅ Analysis complete!', 100);

      const data = result.data || result;
      
      // Enhanced data structure for AI analysis
      return {
        success: true,
        benefits: data.benefits || [],
        features: data.features || [],
        painPoints: data.pain_points || [],
        targetAudience: data.target_audience || 'General audience',
        contentAngles: data.content_angles || {},
        websiteData: data.website_data || {},
        cached: data.cached || false,
        processingTime: data.processing_time || 3,
        analysisMethod: data.analysis_method || 'ai_enhanced'
      };

    } catch (err) {
      console.error('❌ Enhanced website scanning error:', err);
      setError(err.message);
      setProcessingStage('❌ Scanning failed');
      
      if (!err.errorInfo) {
        throw err;
      }
      
      return {
        success: false,
        error: err.message,
        errorInfo: err.errorInfo
      };
    } finally {
      setIsGenerating(false);
    }
  }, [withErrorHandling]);

  /**
   * Generate assets using centralized API service (Enhanced with new data)
   */
  const generateAssets = useCallback(async (params) => {
    setIsGenerating(true);
    setError(null);
    setProcessingStage('Generating content with AI...');

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
      
      if (!err.errorInfo) {
        throw err;
      }
      
      return {
        success: false,
        error: err.message,
        errorInfo: err.errorInfo
      };
    } finally {
      setIsGenerating(false);
      setProcessingStage('');
    }
  }, [trackAITokenUsage, withErrorHandling]);

  // Get cache statistics
  const getCacheStats = useCallback(async () => {
    try {
      const { systemApi } = await import('../services/api');
      const result = await systemApi.getCacheStats();
      return result.success ? result.data : null;
    } catch (error) {
      console.warn('⚠️ Failed to get cache stats:', error);
      return null;
    }
  }, []);

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
    setProcessingProgress(0);
    setProcessingStage('');
    setCacheStats(null);
    setExtractionMethod(null);
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
    
    // Enhanced state for cache and progress tracking
    processingProgress,
    processingStage,
    cacheStats,
    extractionMethod,
    
    // Main actions
    generateAssets,
    generateMultipleAssets,
    clearAssets,
    removeAsset,
    
    // Enhanced processing methods
    processVideoEnhanced,
    scanWebsiteEnhanced,
    getCacheStats,
    
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