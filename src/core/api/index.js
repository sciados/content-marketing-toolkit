// src/core/api/index.js - MERGED ENHANCED API SERVICES
// Preserves all existing functionality + adds enhanced capabilities

import { apiClient } from './apiClient';

/**
 * 🚀 ENHANCED: Video API Service with Google STT and cache integration
 */
export const videoApi = {
  // ✅ PRESERVED: Health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/api/video2promo/health', {}, { auth: false }),

  // 🚀 ENHANCED: Primary extraction method with Google STT and global cache
  extractTranscriptEnhanced: (data) => apiClient.safeApiCall(apiClient.post, '/api/video2promo/extract-google-stt', {
    url: data.url,
    keywords: data.keywords || [],
    extraction_mode: data.extraction_mode || 'google_stt_only',
    enable_cache: data.enable_cache !== false,
    force_refresh: data.force_refresh || false,
    chunk_duration: data.chunk_duration || 300, // 5 minutes default
    max_parallel: data.max_parallel || 3,
    platform: data.platform // 🆕 NEW: Platform detection support
  }),

  // 🆕 NEW: Check cache before processing
  checkVideoCache: (url) => apiClient.safeApiCall(apiClient.checkVideoCache, url),

  // ✅ PRESERVED: Progress tracking for long video processing
  getExtractionProgress: (extractionId) => apiClient.safeApiCall(apiClient.get, `/api/video2promo/extraction-progress/${extractionId}`),

  // ✅ PRESERVED: Fallback extraction method (redirects to enhanced)
  extractTranscript: (data) => apiClient.safeApiCall(apiClient.post, '/api/video2promo/extract-google-stt', {
    url: data.videoUrl || data.url,
    keywords: data.keywords || [],
    extraction_mode: data.extractionMode || data.extraction_mode || 'google_stt_only',
    enable_cache: true,
    force_refresh: false,
    platform: data.platform
  }),

  // ✅ PRESERVED: Analyze video benefits with platform context
  analyzeBenefits: (data) => apiClient.safeApiCall(apiClient.post, '/api/video2promo/analyze-benefits', {
    transcript: data.transcript,
    keywords: data.keywords || [],
    tone: data.tone || 'professional',
    platform: data.platform // 🆕 NEW: Include platform for context
  }),

  // ✅ PRESERVED: Generate video assets
  generateAssets: (data) => apiClient.safeApiCall(apiClient.post, '/api/video2promo/generate-assets', {
    transcript: data.transcript,
    assetTypes: data.assetTypes || ['social_posts'],
    targetAudience: data.targetAudience || 'general',
    tone: data.tone || 'professional',
    autoSave: data.autoSave !== false,
    platform: data.platform,
    cache_info: data.cache_info // 🆕 NEW: Include cache performance data
  }),

  // 🆕 NEW: Batch processing for multiple videos
  processBatch: (videos) => apiClient.safeApiCall(apiClient.post, '/api/video2promo/batch-process', {
    videos: videos.map(v => ({
      url: v.url,
      keywords: v.keywords || [],
      platform: v.platform
    })),
    extraction_mode: 'google_stt_only',
    enable_cache: true
  }),

  // 🆕 NEW: Get processing statistics
  getProcessingStats: () => apiClient.safeApiCall(apiClient.get, '/api/video2promo/stats')
};

/**
 * 🚀 ENHANCED: Email API Service with AI-powered website scanning
 */
export const emailApi = {
  // ✅ PRESERVED: Health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/api/email-generator/health', {}, { auth: false }),

  // 🚀 ENHANCED: Primary scanning method with Mercury API integration
  scanPageEnhanced: (data) => apiClient.safeApiCall(apiClient.post, '/api/enhanced-page/scan-ai-enhanced', {
    url: data.url,
    keywords: data.keywords || [],
    industry: data.industry || 'general',
    analysis_mode: data.analysis_mode || 'ai_enhanced',
    enable_cache: data.enable_cache !== false,
    mercury_api: data.mercury_api !== false, // Use Mercury API by default
    extract_content_angles: data.extract_content_angles !== false
  }),

  // ✅ PRESERVED: Campaign-ready website scanning
  scanPageForCampaign: (data) => apiClient.safeApiCall(apiClient.post, '/api/enhanced-page/scan-campaign-source', {
    url: data.url,
    keywords: data.keywords || [],
    industry: data.industry || 'general',
    campaign_id: data.campaign_id,
    target_audience: data.target_audience || 'general'
  }),

  // 🆕 NEW: Check page cache status
  checkPageCache: (url) => apiClient.safeApiCall(apiClient.get, '/api/enhanced-page/cache-status', { url }),

  // ✅ PRESERVED: Get cache statistics for page scanning
  getPageCacheStats: () => apiClient.safeApiCall(apiClient.get, '/api/enhanced-page/cache-stats', {}, { auth: false }),

  // ✅ PRESERVED: Fallback scanning method
  scanPage: (data) => apiClient.safeApiCall(apiClient.post, '/api/email-generator/scan-page', {
    url: data.url,
    keywords: data.keywords || [],
    industry: data.industry || 'general',
    autoSave: data.autoSave !== false
  }),

  // ✅ PRESERVED: Generate emails with enhancement tracking
  generateEmails: (data) => apiClient.safeApiCall(apiClient.post, '/api/email-generator/generate', {
    benefits: data.benefits,
    selectedBenefits: data.selectedBenefits,
    websiteData: data.websiteData || {},
    tone: data.tone || 'persuasive',
    industry: data.industry || 'general',
    affiliateLink: data.affiliateLink || '',
    autoSave: data.autoSave !== false,
    cache_info: data.cache_info // 🆕 NEW: Include cache performance data
  })
};

/**
 * 🚀 ENHANCED: Usage API Service with cache and performance tracking
 */
export const usageApi = {
  // ✅ PRESERVED: Health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/api/usage/health', {}, { auth: false }),

  // ✅ PRESERVED: Get usage limits
  getLimits: () => apiClient.safeApiCall(apiClient.get, '/api/usage/limits'),

  // 🚀 ENHANCED: Track usage with cache and performance metadata
  trackUsage: async (data) => {
    try {
      if (!data.feature) {
        console.warn('⚠️ trackUsage: feature is required, using default');
        data.feature = 'general';
      }
      
      if (typeof data.tokensUsed !== 'number') {
        console.warn('⚠️ trackUsage: tokensUsed must be a number, converting:', data.tokensUsed);
        data.tokensUsed = parseInt(data.tokensUsed) || 0;
      }

      const payload = {
        feature: data.feature,
        tokensUsed: data.tokensUsed,
        metadata: {
          ...data.metadata,
          // 🚀 ENHANCED: Cache and processing tracking
          cached: data.cached || false,
          processing_method: data.processing_method || 'google_stt',
          cost_saved: data.cost_saved || 0,
          processing_time: data.processing_time || 0,
          platform: data.platform,
          cache_hit_rate: data.cache_hit_rate || 0,
          enhancement_used: data.enhancement_used || 'google_stt',
          timestamp: new Date().toISOString()
        }
      };

      console.log('📊 Tracking enhanced usage:', payload);
      
      const result = await apiClient.safeApiCall(apiClient.post, '/api/usage/track', payload);
      
      if (result.success) {
        console.log('✅ Enhanced usage tracked successfully:', result);
        return result;
      } else {
        console.warn('⚠️ Usage tracking failed but continuing:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.warn('⚠️ Usage tracking error, continuing anyway:', error.message);
      return { 
        success: false, 
        error: error.message,
        message: 'Usage tracking failed but operation can continue'
      };
    }
  },

  // 🚀 ENHANCED: Get usage history with cache analytics
  getHistory: (params = {}) => apiClient.safeApiCall(apiClient.get, '/api/usage/history', {
    days: params.days || 30,
    feature: params.feature || '',
    limit: params.limit || 50,
    include_cache_stats: params.include_cache_stats || true, // 🆕 NEW: Include by default
    include_enhancement_stats: params.include_enhancement_stats || true
  }),

  // 🆕 NEW: Get cost savings from cache usage
  getCostSavings: (params = {}) => apiClient.safeApiCall(apiClient.get, '/api/usage/cost-savings', {
    days: params.days || 30,
    feature: params.feature || ''
  })
};

/**
 * ✅ PRESERVED: Content Library API Service (unchanged but with enhanced metadata)
 */
export const contentLibraryApi = {
  // ✅ PRESERVED: Health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/api/content-library/health', {}, { auth: false }),

  // ✅ PRESERVED: Content Library Operations
  getItems: (params = {}) => apiClient.safeApiCall(apiClient.get, '/api/content-library/items', {
    type: params.type || 'all',
    search: params.search || '',
    favorited: params.favorited || '',
    tags: params.tags || '',
    sort: params.sort || 'created_desc',
    limit: params.limit || '50',
    offset: params.offset || '0'
  }),

  createItem: (data) => apiClient.safeApiCall(apiClient.post, '/api/content-library/items', {
    content_type: data.content_type,
    title: data.title,
    content: data.content || '',
    description: data.description || '',
    tags: data.tags || [],
    source_url: data.source_url || null,
    metadata: {
      ...data.metadata,
      // 🆕 NEW: Enhanced metadata
      processing_method: data.processing_method || 'google_stt',
      cached: data.cached || false,
      platform: data.platform,
      enhancement_used: data.enhancement_used
    }
  }),

  getItem: (id) => apiClient.safeApiCall(apiClient.get, `/api/content-library/item/${id}`),

  updateItem: (id, data) => apiClient.safeApiCall(apiClient.put, `/api/content-library/item/${id}`, {
    title: data.title,
    content: data.content,
    description: data.description,
    tags: data.tags,
    metadata: data.metadata
  }),

  deleteItem: (id) => apiClient.safeApiCall(apiClient.delete, `/api/content-library/item/${id}`),

  toggleFavorite: (id, favorited) => apiClient.safeApiCall(apiClient.post, `/api/content-library/item/${id}/favorite`, {
    favorited: favorited
  }),

  trackUsage: (id, contentType) => apiClient.safeApiCall(apiClient.post, `/api/content-library/item/${id}/use`, {
    content_type: contentType
  }),

  getStats: () => apiClient.safeApiCall(apiClient.get, '/api/content-library/stats'),

  search: (params = {}) => apiClient.safeApiCall(apiClient.get, '/api/content-library/search', {
    query: params.query || '',
    type: params.type || 'all',
    limit: params.limit || '20'
  }),

  getTypes: () => apiClient.safeApiCall(apiClient.get, '/api/content-library/types'),

  // ✅ PRESERVED: Campaign Operations
  createCampaign: (data) => apiClient.safeApiCall(apiClient.post, '/api/content-library/campaigns', {
    name: data.name,
    category: data.category,
    keywords: data.keywords || [],
    description: data.description || '',
    input_sources: data.input_sources || []
  }),

  getCampaigns: (params = {}) => apiClient.safeApiCall(apiClient.get, '/api/content-library/campaigns', {
    category: params.category || '',
    status: params.status || '',
    search: params.search || '',
    limit: params.limit || '20',
    offset: params.offset || '0'
  }),

  getCampaign: (id) => apiClient.safeApiCall(apiClient.get, `/api/content-library/campaigns/${id}`),

  updateCampaign: (id, data) => apiClient.safeApiCall(apiClient.put, `/api/content-library/campaigns/${id}`, data),

  deleteCampaign: (id) => apiClient.safeApiCall(apiClient.delete, `/api/content-library/campaigns/${id}`),

  checkContentMatches: (data) => apiClient.safeApiCall(apiClient.post, '/api/content-library/check-matches', {
    type: data.type,
    url: data.url,
    data: data.data || {},
    category: data.category
  }),

  browseByCategory: (params = {}) => apiClient.safeApiCall(apiClient.get, '/api/content-library/browse', {
    category: params.category || '',
    type: params.type || 'all',
    search: params.search || '',
    limit: params.limit || '20'
  })
};

/**
 * 🚀 ENHANCED: System API Service with cache and performance monitoring
 */
export const systemApi = {
  // ✅ PRESERVED: Main health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/', {}, { auth: false }),

  // 🚀 ENHANCED: Cache statistics with global cache metrics
  getCacheStats: () => apiClient.safeApiCall(apiClient.getCacheStats),

  // 🆕 NEW: Global cache performance metrics
  getGlobalCacheStats: () => apiClient.safeApiCall(apiClient.get, '/cache/global-stats', {}, { auth: false }),

  // 🆕 NEW: Cache management
  clearCache: (pattern) => apiClient.safeApiCall(apiClient.clearCache, pattern),

  // ✅ PRESERVED: System status
  getSystemStatus: () => apiClient.safeApiCall(apiClient.get, '/system/status', {}, { auth: false }),

  // ✅ PRESERVED: Test API endpoint
  testApi: () => apiClient.safeApiCall(apiClient.get, '/api/test', {}, { auth: false }),

  // ✅ PRESERVED: Get API info
  getApiInfo: () => apiClient.safeApiCall(apiClient.get, '/api', {}, { auth: false }),

  // 🚀 ENHANCED: Google STT service status (primary method)
  getGoogleSTTStatus: () => apiClient.safeApiCall(apiClient.get, '/api/video2promo/google-stt-status', {}, { auth: false }),

  // ✅ PRESERVED: Mercury API status for enhanced page scanning
  getMercuryAPIStatus: () => apiClient.safeApiCall(apiClient.get, '/api/enhanced-page/mercury-status', {}, { auth: false }),

  // 🆕 NEW: Enhanced services status overview
  getEnhancedServicesStatus: async () => {
    try {
      const [googleSTT, mercury, cache] = await Promise.allSettled([
        systemApi.getGoogleSTTStatus(),
        systemApi.getMercuryAPIStatus(),
        systemApi.getCacheStats()
      ]);

      return {
        success: true,
        services: {
          googleSTT: {
            available: googleSTT.status === 'fulfilled' && googleSTT.value.success,
            status: googleSTT.value?.data || googleSTT.reason?.message || 'unknown'
          },
          mercury: {
            available: mercury.status === 'fulfilled' && mercury.value.success,
            status: mercury.value?.data || mercury.reason?.message || 'unknown'
          },
          cache: {
            available: cache.status === 'fulfilled' && cache.value.success,
            stats: cache.value?.data || {},
            status: cache.reason?.message || 'operational'
          }
        },
        processingMethod: 'google_stt_enhanced'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        services: {
          googleSTT: { available: false, status: 'error' },
          mercury: { available: false, status: 'error' },
          cache: { available: false, status: 'error' }
        }
      };
    }
  }
};

/**
 * 🚀 ENHANCED: Auth API Service with enhanced service detection
 */
export const authApi = {
  // ✅ PRESERVED: Test current authentication
  testAuth: () => apiClient.testAuth(),

  // ✅ PRESERVED: Check if backend is reachable
  checkBackend: async () => {
    try {
      const result = await systemApi.getHealth();
      return {
        success: true,
        available: result.success,
        message: result.success ? 'Backend is available' : 'Backend returned error',
        details: result,
        enhanced: result.enhanced || {}
      };
    } catch (error) {
      return {
        success: false,
        available: false,
        message: 'Backend is unreachable',
        error: error.message
      };
    }
  },

  // 🚀 ENHANCED: Check enhanced services status (Google STT focus)
  checkEnhancedServices: async () => {
    try {
      const result = await systemApi.getEnhancedServicesStatus();
      return {
        ...result,
        processingMethod: 'google_stt_enhanced',
        fallbackAvailable: true
      };
    } catch (error) {
      return {
        googleSTT: { available: false, error: error.message },
        mercuryAPI: { available: false, error: error.message },
        cache: { available: false, error: error.message },
        processingMethod: 'google_stt_enhanced',
        fallbackAvailable: true
      };
    }
  },

  // 🆕 NEW: Full system diagnostic
  runDiagnostic: async () => {
    const startTime = Date.now();
    
    try {
      const [backend, enhanced, auth] = await Promise.allSettled([
        authApi.checkBackend(),
        authApi.checkEnhancedServices(),
        authApi.testAuth()
      ]);

      return {
        success: true,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        results: {
          backend: backend.status === 'fulfilled' ? backend.value : { available: false, error: backend.reason.message },
          enhanced: enhanced.status === 'fulfilled' ? enhanced.value : { available: false, error: enhanced.reason.message },
          auth: auth.status === 'fulfilled' ? auth.value : { success: false, error: auth.reason.message }
        },
        recommendation: 'google_stt_enhanced'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }
};

/**
 * 🚀 COMPLETE: API object with all enhanced services
 */
export const api = {
  video: videoApi,
  email: emailApi,
  usage: usageApi,
  contentLibrary: contentLibraryApi,
  system: systemApi,
  auth: authApi,
  client: apiClient
};

/**
 * 🚀 ENHANCED: Comprehensive service health check with enhanced features
 */
export const checkAllServices = async () => {
  const services = ['video', 'email', 'usage', 'contentLibrary'];
  const results = {};

  await Promise.allSettled(
    services.map(async (service) => {
      try {
        const result = await api[service].getHealth();
        results[service] = {
          available: result.success,
          status: result.success ? 'healthy' : 'error',
          message: result.message || result.error || 'Unknown status',
          processingMethod: 'google_stt_enhanced',
          enhanced: result.enhanced || {}
        };
      } catch (error) {
        results[service] = {
          available: false,
          status: 'error',
          message: error.message || 'Service check failed'
        };
      }
    })
  );

  // 🚀 ENHANCED: Add enhanced services check
  try {
    const enhancedStatus = await authApi.checkEnhancedServices();
    results.enhanced = {
      googleSTT: enhancedStatus.googleSTT?.available || false,
      mercuryAPI: enhancedStatus.mercuryAPI?.available || false,
      cache: enhancedStatus.cache?.available || false,
      processingMethod: 'google_stt_enhanced',
      fallbackAvailable: enhancedStatus.fallbackAvailable || true
    };
  } catch (error) {
    results.enhanced = {
      googleSTT: false,
      mercuryAPI: false,
      cache: false,
      processingMethod: 'google_stt_enhanced',
      fallbackAvailable: true,
      error: error.message
    };
  }

  // 🆕 NEW: Overall system health score
  const healthyServices = Object.values(results).filter(r => r.available).length;
  const totalServices = Object.keys(results).length;
  const healthScore = Math.round((healthyServices / totalServices) * 100);

  return {
    ...results,
    summary: {
      healthScore,
      healthyServices,
      totalServices,
      recommendedMethod: 'google_stt_enhanced',
      cacheEnabled: results.enhanced?.cache || false
    }
  };
};

/**
 * 🆕 NEW: Quick cache performance check
 */
export const checkCachePerformance = async () => {
  try {
    const stats = await systemApi.getCacheStats();
    return {
      success: true,
      performance: stats.data || {},
      enabled: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      enabled: false
    };
  }
};

/**
 * ✅ PRESERVED: Export individual services and client for direct import
 */
export { apiClient } from './apiClient';

/**
 * Default export - complete enhanced API object
 */
export default api;