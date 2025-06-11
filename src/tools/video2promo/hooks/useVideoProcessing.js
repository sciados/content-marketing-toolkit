// src/tools/video2promo/hooks/useVideoProcessing.js - MERGED VERSION
// Preserves all existing functionality + adds enhanced capabilities

import { useState, useCallback } from 'react';

// 🚀 ENHANCED: Use your existing shared structure
import { useAuth } from '../../../shared/hooks/useAuth';
import { useUsageTracking } from '../../../shared/hooks/useUsageTracking';
import { validateVideoUrl } from '../../../shared/utils/videoUrlValidation';

// 🆕 NEW: Enhanced cache and API client integration
import { useGlobalCache } from '../../../shared/hooks/useGlobalCache';
import { apiClient } from '../../../core/api/apiClient';

// ✅ PRESERVED: Enhanced API_BASE with fallback and debugging
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://aiworkers.onrender.com';

export const useVideoProcessing = () => {
  const { user, session } = useAuth();
  const { checkUsageLimit } = useUsageTracking();
  
  // 🆕 NEW: Global cache integration for cost savings
  const { getCachedResult, setCachedResult, cacheStats } = useGlobalCache();
  
  // ✅ PRESERVED: Your complete state structure
  const [state, setState] = useState({
    currentStep: 'input',
    videoUrl: '',
    transcript: null,
    extractedBenefits: [],
    selectedBenefits: [],
    extractedFeatures: [],
    websiteData: null,
    keywords: [],
    utmParams: {},
    generatedAssets: {},
    loading: false,
    error: null,
    processingStage: '',
    // ✅ PRESERVED: Enhanced status tracking
    backendStatus: 'unknown',
    proxyStatus: 'unknown',
    retryCount: 0,
    // ✅ PRESERVED: Multi-platform tracking
    detectedPlatform: null,
    supportedPlatforms: [],
    // 🆕 NEW: Cache and performance tracking
    cacheHit: false,
    costSavings: 0,
    processingMethod: null,
    extractionTime: null
  });

  // ✅ PRESERVED: Platform-specific suggestions (unchanged)
  const getPlatformSpecificSuggestion = useCallback((platform) => {
    const suggestions = {
      'YouTube': 'Make sure the video is public or unlisted (not private). Check if the video has captions enabled.',
      'Vimeo': 'Ensure the video is public and not password-protected. Private Vimeo videos cannot be processed.',
      'TikTok': 'Make sure the TikTok video is public and not restricted to followers only.',
      'Dailymotion': 'Verify the video is publicly accessible and not region-restricted.',
      'Twitch': 'Ensure the VOD is available and not subscriber-only content.'
    };
    
    return suggestions[platform] || 'Please check that the video is publicly accessible and try again.';
  }, []);

  // ✅ PRESERVED: Backend health check with enhancements
  const checkBackendHealth = useCallback(async () => {
    try {
      // 🆕 NEW: Use enhanced API client if available, fallback to direct fetch
      let response, data;
      
      try {
        // Try enhanced API client first
        data = await apiClient.checkHealth();
        setState(prev => ({
          ...prev,
          backendStatus: 'healthy',
          proxyStatus: data.proxy_status?.configured ? 'configured' : 'not-configured',
          supportedPlatforms: data.supported_platforms || ['YouTube', 'Vimeo', 'TikTok', 'Dailymotion', 'Twitch']
        }));
      // eslint-disable-next-line no-unused-vars
      } catch (apiClientError) {
        // Fallback to direct fetch (your existing method)
        console.log('🔄 API client unavailable, using direct fetch');
        response = await fetch(`${API_BASE}/`);
        data = await response.json();
        
        setState(prev => ({
          ...prev,
          backendStatus: 'healthy',
          proxyStatus: data.proxy_status?.configured ? 'configured' : 'not-configured',
          supportedPlatforms: data.supported_platforms || ['YouTube', 'Vimeo', 'TikTok', 'Dailymotion', 'Twitch']
        }));
      }
      
      return data;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setState(prev => ({
        ...prev,
        backendStatus: 'error',
        proxyStatus: 'unknown'
      }));
      return null;
    }
  }, []);

  // 🆕 NEW: Check cache for existing transcript
  const checkVideoCache = useCallback(async (videoUrl) => {
    try {
      const cacheKey = `video_transcript_${btoa(videoUrl).replace(/[^a-zA-Z0-9]/g, '')}`;
      const cachedData = await getCachedResult(cacheKey);
      
      if (cachedData && cachedData.transcript) {
        return {
          cached: true,
          data: cachedData,
          savings: cachedData.estimatedCost || 0.10 // Default cost savings
        };
      }
      
      return { cached: false };
    } catch (error) {
      console.log('🔍 Cache check failed, proceeding with fresh extraction:', error.message);
      return { cached: false };
    }
  }, [getCachedResult]);

  // 🚀 ENHANCED: Multi-platform transcript extraction with cache integration
  const extractTranscript = useCallback(async (videoUrl) => {
    const startTime = Date.now();
    
    try {
      // ✅ PRESERVED: Authentication check
      if (!session?.access_token) {
        throw new Error('Please log in to use Video2Promo. Authentication is required for backend processing.');
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: 'Validating video URL...',
        cacheHit: false,
        costSavings: 0
      }));

      // ✅ PRESERVED: URL validation with multi-platform support
      const urlValidation = validateVideoUrl(videoUrl);
      if (!urlValidation.isValid) {
        throw new Error(urlValidation.error);
      }

      // Update detected platform
      setState(prev => ({
        ...prev,
        detectedPlatform: urlValidation.platform,
        processingStage: `Detected ${urlValidation.platform} video. Checking cache...`
      }));

      // 🆕 NEW: Check cache first for cost savings
      const cacheResult = await checkVideoCache(videoUrl);
      if (cacheResult.cached) {
        setState(prev => ({
          ...prev,
          transcript: cacheResult.data.transcript,
          currentStep: 'transcript',
          processingStage: `✅ Found cached transcript! Saved processing time and costs.`,
          loading: false,
          cacheHit: true,
          costSavings: cacheResult.savings,
          processingMethod: 'cache',
          extractionTime: Date.now() - startTime,
          retryCount: 0
        }));

        return {
          success: true,
          transcript: cacheResult.data.transcript,
          extractionMethod: 'cache',
          fromCache: true,
          costSavings: cacheResult.savings,
          wordCount: cacheResult.data.wordCount,
          platform: urlValidation.platform,
          processingTime: Date.now() - startTime
        };
      }

      // ✅ PRESERVED: Backend health check
      setState(prev => ({
        ...prev,
        processingStage: `No cache found. Checking backend status...`
      }));

      const healthCheck = await checkBackendHealth();
      if (!healthCheck) {
        throw new Error('Backend service is currently unavailable. Please try again in a moment.');
      }

      setState(prev => ({
        ...prev,
        processingStage: `Extracting transcript from ${urlValidation.platform}${healthCheck.proxy_status?.configured ? ' via secure proxy' : ''}...`
      }));

      // ✅ PRESERVED: API validation
      if (!API_BASE || API_BASE === 'undefined') {
        throw new Error('Backend API URL not configured. Please check VITE_API_BASE_URL environment variable.');
      }
      
      const cleanUrl = videoUrl.trim();
      
      // ✅ PRESERVED: Request body structure
      const requestBody = {
        url: cleanUrl,
        keywords: [],
        extraction_mode: 'smart',
        platform: urlValidation.platform
      };
      
      // ✅ PRESERVED: Headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      };
      
      // 🆕 ENHANCED: Try Google STT first, fallback to standard API
      let apiUrl = `${API_BASE}/api/video2promo/extract-google-stt`;
      let extractionMethod = 'google-stt';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout
      
      try {
        setState(prev => ({
          ...prev,
          processingStage: `Processing ${urlValidation.platform} video with Google STT...`
        }));

        let response = await fetch(apiUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        // 🆕 NEW: Fallback to standard extraction if Google STT fails
        if (!response.ok && response.status !== 401 && response.status !== 403) {
          console.log('🔄 Google STT failed, trying standard extraction...');
          apiUrl = `${API_BASE}/api/video2promo/extract-transcript`;
          extractionMethod = 'standard';
          
          setState(prev => ({
            ...prev,
            processingStage: `Google STT unavailable, using standard extraction for ${urlValidation.platform}...`
          }));

          response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });
        }

        clearTimeout(timeoutId);

        // ✅ PRESERVED: Response parsing
        const responseText = await response.text();
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Failed to parse response as JSON:', parseError);
          throw new Error(`Invalid response format from backend. Please try again.`);
        }

        // ✅ PRESERVED: Error handling with platform-specific messages
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication expired. Please refresh the page and log in again.');
          } else if (response.status === 403) {
            throw new Error('Access denied. Please check your subscription tier or usage limits.');
          } else if (response.status === 404) {
            const errorMsg = responseData.error || `Could not extract transcript from ${urlValidation.platform} video`;
            const suggestion = responseData.suggestion || getPlatformSpecificSuggestion(urlValidation.platform);
            const proxyNote = healthCheck.proxy_status?.configured ? 
              ' Our proxy service is active and should help with blocked videos.' :
              ' Note: Proxy service is not configured, which may cause issues with some videos.';
            
            throw new Error(`${errorMsg}. ${suggestion}${proxyNote}`);
          } else if (response.status >= 500) {
            throw new Error(`Backend server error processing ${urlValidation.platform} video. Please try again in a few minutes.`);
          } else {
            throw new Error(responseData.error || `Backend error: ${response.status}`);
          }
        }

        // ✅ PRESERVED: Response handling
        const transcript = responseData.data?.transcript || responseData.transcript;
        
        if (!transcript || transcript.trim().length === 0) {
          throw new Error(`No transcript content was extracted from the ${urlValidation.platform} video. The video might not contain speech or the audio quality might be too low.`);
        }

        // 🆕 NEW: Cache the successful result for future use
        try {
          const cacheKey = `video_transcript_${btoa(videoUrl).replace(/[^a-zA-Z0-9]/g, '')}`;
          const cacheData = {
            transcript: transcript,
            platform: urlValidation.platform,
            extractionMethod: extractionMethod,
            wordCount: responseData.data?.word_count || responseData.wordCount || transcript.split(' ').length,
            estimatedCost: 0.10, // Cost to extract this transcript
            extractedAt: new Date().toISOString()
          };
          
          await setCachedResult(cacheKey, cacheData);
          console.log('💾 Transcript cached for future use');
        } catch (cacheError) {
          console.log('⚠️ Failed to cache result, but continuing:', cacheError.message);
        }

        setState(prev => ({
          ...prev,
          transcript: transcript,
          currentStep: 'transcript',
          processingStage: `Transcript extracted successfully from ${urlValidation.platform} using ${extractionMethod}${healthCheck.proxy_status?.configured ? ' (via proxy)' : ''}`,
          loading: false,
          retryCount: 0,
          processingMethod: extractionMethod,
          extractionTime: Date.now() - startTime
        }));

        return {
          success: true,
          transcript: transcript,
          extractionMethod: extractionMethod,
          wordCount: responseData.data?.word_count || responseData.wordCount,
          platform: urlValidation.platform,
          proxyUsed: responseData.data?.method?.includes('proxy') || false,
          fromCache: false,
          processingTime: Date.now() - startTime
        };

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error(`Request timed out processing ${urlValidation.platform} video. The video might be too long or the server is busy. Please try again.`);
        }
        throw fetchError;
      }

    } catch (error) {
      console.error('❌ Transcript extraction error:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        processingStage: '',
        retryCount: prev.retryCount + 1
      }));
      
      return {
        success: false,
        error: error.message
      };
    }
  }, [session, checkBackendHealth, getPlatformSpecificSuggestion, checkVideoCache, setCachedResult]);

  // ✅ PRESERVED: Retry function with enhancements
  const retryExtraction = useCallback(async (videoUrl) => {
    if (state.retryCount >= 3) {
      throw new Error('Maximum retry attempts reached. Please try a different video or contact support.');
    }
    
    setState(prev => ({
      ...prev,
      processingStage: `Retrying ${prev.detectedPlatform || 'video'} extraction... (Attempt ${prev.retryCount + 1}/3)`
    }));
    
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return await extractTranscript(videoUrl);
  }, [state.retryCount, extractTranscript]);

  // 🚀 ENHANCED: processVideo with cache awareness
  const processVideo = useCallback(async (videoUrl, additionalData = {}) => {
    try {
      // ✅ PRESERVED: URL validation
      if (!videoUrl || typeof videoUrl !== 'string') {
        throw new Error('Please provide a valid video URL');
      }

      const urlValidation = validateVideoUrl(videoUrl);
      if (!urlValidation.isValid) {
        throw new Error(urlValidation.error);
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: 'Checking usage limits...',
        videoUrl: videoUrl.trim(),
        detectedPlatform: urlValidation.platform,
        keywords: additionalData.keywords || [],
        utmParams: additionalData.utm_params || {}
      }));

      // ✅ PRESERVED: Usage limit check
      const canProceed = await checkUsageLimit('video2promo_projects');

      if (!canProceed || typeof canProceed !== 'object') {
        throw new Error('Unable to verify usage limits. Please try again.');
      }
      
      if (!canProceed.allowed) {
        const message = canProceed.message || 
          `Video2Promo limit reached. Current: ${canProceed.current_usage || 0}, Limit: ${canProceed.limit_value || 0}`;
        throw new Error(message);
      }

      // ✅ PRESERVED: Extract transcript with retry logic
      let transcriptResult = await extractTranscript(videoUrl.trim());
      
      // Auto-retry on certain failures
      if (!transcriptResult.success && state.retryCount < 2) {
        console.log(`🔄 First attempt failed for ${urlValidation.platform} video, trying again...`);
        transcriptResult = await retryExtraction(videoUrl.trim());
      }
      
      if (!transcriptResult.success) {
        throw new Error('Failed to extract transcript: ' + transcriptResult.error);
      }

      return transcriptResult;
    } catch (error) {
      console.error('❌ Video processing failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        processingStage: ''
      }));
      
      return {
        success: false,
        error: error.message
      };
    }
  }, [checkUsageLimit, extractTranscript, retryExtraction, state.retryCount]);

  // ✅ PRESERVED: analyzeTranscript function with platform context
  const analyzeTranscript = useCallback(async (transcript, keywords = [], tone = 'professional') => {
    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: `Analyzing ${prev.detectedPlatform || 'video'} transcript for benefits...`
      }));

      const response = await fetch(`${API_BASE}/api/video2promo/analyze-benefits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ 
          transcript, 
          keywords, 
          tone,
          platform: state.detectedPlatform
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze transcript');
      }

      const data = await response.json();
      
      const benefits = data.analysis.key_benefits || [];
      const features = data.analysis.features || [];
      
      setState(prev => ({
        ...prev,
        extractedBenefits: benefits,
        extractedFeatures: features,
        selectedBenefits: new Array(benefits.length).fill(true),
        websiteData: {
          title: `${prev.detectedPlatform || 'Video'} Analysis - ${tone} tone`,
          description: data.analysis.main_value_proposition || 'Video content analysis',
          targetAudience: data.analysis.target_audience || 'General audience',
          painPoints: data.analysis.pain_points_addressed || [],
          emotionalTriggers: data.analysis.emotional_triggers || []
        },
        currentStep: 'benefits',
        loading: false,
        processingStage: ''
      }));

      return {
        success: true,
        analysis: data.analysis,
        extractedBenefits: benefits,
        extractedFeatures: features,
        platform: state.detectedPlatform
      };
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        processingStage: ''
      }));
      
      return {
        success: false,
        error: error.message
      };
    }
  }, [session, state.detectedPlatform]);

  // ✅ PRESERVED: Reset function with enhanced cleanup
  const reset = useCallback(() => {
    setState({
      currentStep: 'input',
      videoUrl: '',
      transcript: null,
      extractedBenefits: [],
      selectedBenefits: [],
      extractedFeatures: [],
      websiteData: null,
      keywords: [],
      utmParams: {},
      generatedAssets: {},
      loading: false,
      error: null,
      processingStage: '',
      // Reset enhanced status
      backendStatus: 'unknown',
      proxyStatus: 'unknown',
      retryCount: 0,
      // Reset platform tracking
      detectedPlatform: null,
      supportedPlatforms: [],
      // Reset cache and performance tracking
      cacheHit: false,
      costSavings: 0,
      processingMethod: null,
      extractionTime: null
    });
  }, []);

  return {
    // ✅ PRESERVED: Complete state
    ...state,
    
    // ✅ PRESERVED: All existing actions  
    processVideo,
    extractTranscript,
    analyzeTranscript,
    retryExtraction,
    checkBackendHealth,
    reset,
    
    // 🆕 NEW: Enhanced actions
    checkVideoCache,
    
    // ✅ PRESERVED: Computed values
    canProceedToNextStep: !state.loading && !state.error,
    hasTranscript: state.transcript && state.transcript.length > 0,
    hasBenefits: state.extractedBenefits && state.extractedBenefits.length > 0,
    isProcessing: state.loading,
    canRetry: !state.loading && state.error && state.retryCount < 3,
    
    // ✅ PRESERVED: Multi-platform specific properties
    isPlatformSupported: state.detectedPlatform && state.supportedPlatforms.includes(state.detectedPlatform),
    platformInfo: state.detectedPlatform ? {
      name: state.detectedPlatform,
      supported: state.supportedPlatforms.includes(state.detectedPlatform)
    } : null,
    
    // 🆕 NEW: Cache and performance info
    cacheInfo: {
      hit: state.cacheHit,
      savings: state.costSavings,
      stats: cacheStats
    },
    
    // ✅ ENHANCED: Debug info with new fields
    debug: {
      transcriptLength: state.transcript?.length || 0,
      benefitsCount: state.extractedBenefits?.length || 0,
      selectedCount: state.selectedBenefits?.filter(Boolean).length || 0,
      processingStage: state.processingStage,
      userTier: user?.subscription_tier || 'free',
      backendUrl: API_BASE,
      backendStatus: state.backendStatus,
      proxyStatus: state.proxyStatus,
      retryCount: state.retryCount,
      detectedPlatform: state.detectedPlatform,
      supportedPlatforms: state.supportedPlatforms,
      // New debug fields
      cacheHit: state.cacheHit,
      costSavings: state.costSavings,
      processingMethod: state.processingMethod,
      extractionTime: state.extractionTime
    }
  };
};