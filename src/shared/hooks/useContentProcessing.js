// src/shared/hooks/useContentProcessing.js - MERGED ENHANCED VERSION
// Preserves all existing functionality + adds enhanced multi-tool capabilities

import { useState, useCallback } from 'react';

// 🚀 ENHANCED: Use your existing shared structure
import { useErrorHandler } from './useErrorHandler';

// 🚀 ENHANCED: Use new API architecture
import { videoApi, emailApi, usageApi, systemApi } from '../../core/api';

// 🆕 NEW: Use your existing global cache
import { useGlobalCache } from './useGlobalCache';

export function useContentProcessing() {
  const { withErrorHandling } = useErrorHandler();
  
  // 🆕 NEW: Use your existing global cache integration
  const { 
    checkCache, 
    storeInCache, 
    globalStats,
    calculateEstimatedCost 
  } = useGlobalCache();
  
  // ✅ PRESERVED: Your complete state structure
  const [generatedAssets, setGeneratedAssets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // ✅ PRESERVED: Enhanced state for cache and processing tracking
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [cacheStats, setCacheStats] = useState(null);
  const [extractionMethod, setExtractionMethod] = useState(null);
  
  // 🆕 NEW: Multi-tool processing state
  const [activeProcessingType, setActiveProcessingType] = useState(null);
  const [costSavingsTotal, setCostSavingsTotal] = useState(0);
  const [processingHistory, setProcessingHistory] = useState([]);

  /**
   * ✅ PRESERVED: Track AI token usage using centralized API
   */
  const trackAITokenUsage = useCallback(async (tokensUsed, metadata = {}) => {
    try {
      await usageApi.trackUsage({
        feature: metadata.feature || 'content_processing',
        tokensUsed: tokensUsed,
        metadata: {
          timestamp: new Date().toISOString(),
          processing_method: extractionMethod || 'google_stt',
          cached: cacheStats?.cached || false,
          cost_saved: cacheStats?.costSaved || 0,
          ...metadata
        }
      });
      console.log('✅ Enhanced token usage tracked:', tokensUsed, metadata);
    } catch (error) {
      console.warn('⚠️ Failed to track token usage:', error);
      // Don't throw - this is not critical for the user
    }
  }, [extractionMethod, cacheStats]);

  /**
   * 🆕 NEW: Check cache using your existing implementation
   */
  const checkContentCache = useCallback(async (url) => {
    try {
      // Use your existing cache check method
      const cachedData = await checkCache(url, {
        quality: 'standard',
        includeKeywords: false,
        format: 'text'
      });
      
      if (cachedData) {
        return {
          cached: true,
          data: cachedData,
          source: 'global_cache',
          savings: calculateEstimatedCost(url, {}) || 0.10
        };
      }

      return { cached: false };
    } catch (error) {
      console.log('🔍 Cache check failed, proceeding with fresh processing:', error.message);
      return { cached: false };
    }
  }, [checkCache, calculateEstimatedCost]);

  /**
   * 🚀 ENHANCED: Video processing with global cache integration
   */
  const processVideoEnhanced = useCallback(async (videoUrl, keywords = [], options = {}) => {
    setIsGenerating(true);
    setError(null);
    setProcessingProgress(0);
    setProcessingStage('Initializing...');
    setActiveProcessingType('video');
    setCacheStats(null);
    setExtractionMethod(null);

    const startTime = Date.now();

    try {
      console.log('🚀 Starting enhanced video processing with global cache integration...');
      
      // Progress updates
      const updateProgress = (stage, progress) => {
        setProcessingStage(stage);
        setProcessingProgress(progress);
      };

      updateProgress('Checking global cache...', 10);
      
      // 🆕 NEW: Check your existing global cache first
      const cacheResult = await checkContentCache(videoUrl);
      
      if (cacheResult.cached) {
        updateProgress('⚡ Found cached transcript! Instant results.', 100);
        setCacheStats({
          cached: true,
          cacheSource: cacheResult.source,
          costSaved: cacheResult.savings,
          processingTime: Date.now() - startTime
        });
        
        // Update cost savings total
        setCostSavingsTotal(prev => prev + cacheResult.savings);

        return {
          success: true,
          transcript: cacheResult.data.transcript,
          method: 'cache',
          cached: true,
          cacheSource: cacheResult.source,
          costSaved: cacheResult.savings,
          processingTime: Date.now() - startTime,
          wordCount: cacheResult.data.wordCount,
          platform: cacheResult.data.platform
        };
      }

      await new Promise(r => setTimeout(r, 500));

      // ✅ PRESERVED: Use enhanced video API endpoint for Google STT processing
      updateProgress('Processing with Google Speech-to-Text...', 30);
      
      const safeApiCall = withErrorHandling(videoApi.extractTranscriptEnhanced);
      const result = await safeApiCall({
        url: videoUrl,
        keywords: keywords || [],
        extraction_mode: options.extractionMode || 'google_stt_only',
        enable_cache: options.enableCache !== false,
        force_refresh: options.forceRefresh || false,
        platform: options.platform
      });

      if (!result.success) {
        throw new Error(result.message || result.error || 'Video processing failed');
      }

      const data = result.data || result;

      // ✅ PRESERVED: Handle cache status and performance metrics
      if (data.cached) {
        updateProgress('⚡ Found cached transcript!', 100);
        setCacheStats({
          cached: true,
          cacheSource: data.cache_source || 'api_cache',
          costSaved: data.cost_saved || 0,
          processingTime: data.processing_time || 0.1
        });
        setCostSavingsTotal(prev => prev + (data.cost_saved || 0));
      } else {
        // Show progress for fresh extraction with Google STT
        updateProgress('☁️ Processing with Google Speech-to-Text...', 60);
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

        // 🆕 NEW: Cache the result using your existing method
        try {
          await storeInCache(videoUrl, {
            transcript: data.transcript,
            platform: data.platform || options.platform,
            wordCount: data.word_count,
            estimatedCost: data.cost_estimate || 0.36,
            extractedAt: new Date().toISOString()
          });
          console.log('💾 Transcript cached using your global cache system');
        } catch (cacheError) {
          console.log('⚠️ Failed to cache globally, but continuing:', cacheError.message);
        }
      }

      setExtractionMethod(data.method || 'google_stt');

      // 🆕 NEW: Add to processing history
      const processingRecord = {
        id: Date.now(),
        type: 'video',
        url: videoUrl,
        method: data.method || 'google_stt',
        cached: data.cached || false,
        processingTime: Date.now() - startTime,
        costSaved: data.cost_saved || 0,
        timestamp: new Date().toISOString()
      };
      setProcessingHistory(prev => [processingRecord, ...prev.slice(0, 9)]); // Keep last 10

      console.log('✅ Enhanced video processing successful:', {
        method: data.method,
        cached: data.cached,
        transcriptLength: data.transcript?.length || 0,
        costSaved: data.cost_saved,
        platform: data.platform
      });

      return {
        success: true,
        transcript: data.transcript,
        method: data.method,
        cached: data.cached,
        cacheSource: data.cache_source,
        costSaved: data.cost_saved,
        processingTime: Date.now() - startTime,
        wordCount: data.word_count,
        videoTitle: data.video_title,
        duration: data.duration,
        platform: data.platform
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
      setActiveProcessingType(null);
    }
  }, [withErrorHandling, checkContentCache, storeInCache]);

  /**
   * 🚀 ENHANCED: Website scanning with global cache integration
   */
  const scanWebsiteEnhanced = useCallback(async (url, keywords = [], options = {}) => {
    setIsGenerating(true);
    setError(null);
    setProcessingProgress(0);
    setProcessingStage('Initializing website scan...');
    setActiveProcessingType('website');

    const startTime = Date.now();

    try {
      console.log('🌐 Starting enhanced website scanning with global cache...');
      
      const updateProgress = (stage, progress) => {
        setProcessingStage(stage);
        setProcessingProgress(progress);
      };

      updateProgress('Checking global cache...', 10);
      
      const cacheResult = await checkContentCache(url);
      
      if (cacheResult.cached) {
        updateProgress('⚡ Found cached analysis! Instant results.', 100);
        setCacheStats({
          cached: true,
          cacheSource: cacheResult.source,
          costSaved: cacheResult.savings,
          processingTime: Date.now() - startTime
        });
        
        setCostSavingsTotal(prev => prev + cacheResult.savings);

        return {
          success: true,
          ...cacheResult.data,
          cached: true,
          processingTime: Date.now() - startTime
        };
      }

      updateProgress('🔍 Analyzing page structure...', 20);
      await new Promise(r => setTimeout(r, 500));

      updateProgress('🧠 AI extracting insights...', 60);
      
      // ✅ PRESERVED: Use enhanced email API endpoint
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
      
      // 🆕 NEW: Cache the result globally if it wasn't cached
      if (!data.cached) {
        try {
          await storeInCache(url, {
            benefits: data.benefits || [],
            features: data.features || [],
            painPoints: data.pain_points || [],
            targetAudience: data.target_audience || 'General audience',
            contentAngles: data.content_angles || {},
            websiteData: data.website_data || {},
            analysisMethod: data.analysis_method || 'ai_enhanced',
            estimatedCost: 0.15,
            analyzedAt: new Date().toISOString()
          });
          console.log('💾 Website analysis cached using your global cache system');
        } catch (cacheError) {
          console.log('⚠️ Failed to cache globally, but continuing:', cacheError.message);
        }
      }

      setCacheStats({
        cached: data.cached || false,
        processingTime: Date.now() - startTime,
        method: data.analysis_method || 'ai_enhanced'
      });

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
        processingTime: Date.now() - startTime,
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
      setActiveProcessingType(null);
    }
  }, [withErrorHandling, checkContentCache, storeInCache]);

  /**
   * ✅ PRESERVED: Generate assets using centralized API service (Enhanced with cache tracking)
   */
  const generateAssets = useCallback(async (params) => {
    setIsGenerating(true);
    setError(null);
    setProcessingStage('Generating content with AI...');
    setActiveProcessingType('assets');

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

      console.log('🎯 Generating assets with enhanced API:', {
        transcript: transcript.length,
        benefits: benefits.length,
        benefitIndices,
        assetTypes,
        generateVariants
      });

      // ✅ PRESERVED: Use centralized API with error handling
      const safeApiCall = withErrorHandling(videoApi.generateAssets);
      const result = await safeApiCall({
        transcript,
        benefits,
        benefitIndices,
        assetTypes,
        generateVariants,
        project,
        // 🆕 NEW: Include cache performance data
        cache_info: cacheStats
      });

      if (!result.success) {
        throw new Error(result.message || result.error || 'Asset generation failed');
      }

      // ✅ PRESERVED: Update state with generated assets
      setGeneratedAssets(result.assets || []);

      // ✅ PRESERVED: Track token usage with enhanced metadata
      if (result.total_tokens) {
        await trackAITokenUsage(result.total_tokens, {
          feature: 'asset_generation',
          asset_types: assetTypes,
          cached_input: cacheStats?.cached || false,
          processing_method: extractionMethod
        });
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
      setActiveProcessingType(null);
      setProcessingStage('');
    }
  }, [trackAITokenUsage, withErrorHandling, cacheStats, extractionMethod]);

  // 🚀 ENHANCED: Get cache statistics with global cache integration
  const getCacheStats = useCallback(async () => {
    try {
      const [apiStats] = await Promise.allSettled([
        systemApi.getCacheStats()
      ]);

      return {
        api: apiStats.status === 'fulfilled' && apiStats.value.success ? apiStats.value.data : null,
        global: globalStats,
        totalSavings: costSavingsTotal
      };
    } catch (error) {
      console.warn('⚠️ Failed to get cache stats:', error);
      return { totalSavings: costSavingsTotal };
    }
  }, [globalStats, costSavingsTotal]);

  // ✅ PRESERVED: Specialized generation methods using the main generateAssets function
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

  // 🚀 ENHANCED: Clear function with global cache awareness
  const clearAssets = useCallback(() => {
    setGeneratedAssets([]);
    setError(null);
    setProcessingProgress(0);
    setProcessingStage('');
    setCacheStats(null);
    setExtractionMethod(null);
    setActiveProcessingType(null);
    // Keep cost savings total and processing history
  }, []);

  const removeAsset = useCallback((assetId) => {
    setGeneratedAssets(prev => prev.filter(asset => asset.id !== assetId));
  }, []);

  // ✅ PRESERVED: Token estimation with enhanced accuracy
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
   * ✅ PRESERVED: Get asset generation history using centralized API
   */
  const getGenerationHistory = useCallback(async () => {
    try {
      const safeApiCall = withErrorHandling(usageApi.getHistory);
      const result = await safeApiCall({
        feature: 'content_processing',
        days: 30,
        include_cache_stats: true
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
   * ✅ PRESERVED: Check usage limits using centralized API
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

  // 🆕 NEW: Reset cost savings tracking
  const resetCostSavings = useCallback(() => {
    setCostSavingsTotal(0);
    setProcessingHistory([]);
  }, []);

  return {
    // ✅ PRESERVED: Core state
    generatedAssets,
    isGenerating,
    error,
    
    // ✅ PRESERVED: Enhanced state for cache and progress tracking
    processingProgress,
    processingStage,
    cacheStats,
    extractionMethod,
    
    // 🆕 NEW: Multi-tool processing state
    activeProcessingType,
    costSavingsTotal,
    processingHistory,
    
    // ✅ PRESERVED: Main actions
    generateAssets,
    generateMultipleAssets,
    clearAssets,
    removeAsset,
    
    // 🚀 ENHANCED: Processing methods with global cache
    processVideoEnhanced,
    scanWebsiteEnhanced,
    getCacheStats,
    checkContentCache,
    
    // ✅ PRESERVED: Specialized generation methods
    generateEmailSeries,
    generateBlogPost,
    generateNewsletter,
    generateSocialPosts,
    generateAdCopy,
    
    // ✅ PRESERVED: Utilities
    estimateTokens,
    getGenerationHistory,
    checkUsageLimits,
    trackAITokenUsage,
    
    // 🆕 NEW: Enhanced utilities
    resetCostSavings,
    
    // 🆕 NEW: Performance insights
    performance: {
      totalProcessed: processingHistory.length,
      averageProcessingTime: processingHistory.length > 0 
        ? processingHistory.reduce((sum, record) => sum + record.processingTime, 0) / processingHistory.length 
        : 0,
      cacheHitRate: processingHistory.length > 0 
        ? (processingHistory.filter(record => record.cached).length / processingHistory.length) * 100 
        : 0,
      totalCostSaved: costSavingsTotal
    }
  };
}