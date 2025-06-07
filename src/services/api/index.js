// src/services/api/index.js - Enhanced API Services (Google STT Only - Whisper removed)
import { apiClient } from './apiClient';

/**
 * Enhanced Video API Service - Google STT Only
 */
export const videoApi = {
  // Health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/api/video2promo/health', {}, { auth: false }),

  // Enhanced transcript extraction with Google STT and global cache
  extractTranscriptEnhanced: (data) => apiClient.safeApiCall(apiClient.post, '/api/video2promo/extract-google-stt', {
    url: data.url,
    keywords: data.keywords || [],
    extraction_mode: data.extraction_mode || 'google_stt_only',
    enable_cache: data.enable_cache !== false,
    force_refresh: data.force_refresh || false,
    chunk_duration: data.chunk_duration || 300, // 5 minutes default
    max_parallel: data.max_parallel || 3
  }),

  // Progress tracking for long video processing
  getExtractionProgress: (extractionId) => apiClient.safeApiCall(apiClient.get, `/api/video2promo/extraction-progress/${extractionId}`),

  // Extract video transcript using Google STT (updated endpoint and field names)
  extractTranscript: (data) => apiClient.safeApiCall(apiClient.post, '/api/video2promo/extract-targeted', {
    url: data.videoUrl || data.url,
    keywords: data.keywords || [],
    extraction_mode: data.extractionMode || data.extraction_mode || 'google_stt_only'
  }),

  // Analyze video benefits
  analyzeBenefits: (data) => apiClient.safeApiCall(apiClient.post, '/api/video2promo/analyze-benefits', {
    transcript: data.transcript,
    keywords: data.keywords || [],
    tone: data.tone || 'professional'
  }),

  // Generate video assets
  generateAssets: (data) => apiClient.safeApiCall(apiClient.post, '/api/video2promo/generate-assets', {
    transcript: data.transcript,
    assetTypes: data.assetTypes || ['social_posts'],
    targetAudience: data.targetAudience || 'general',
    tone: data.tone || 'professional',
    autoSave: data.autoSave !== false
  })
};

/**
 * Enhanced Email API Service - AI-Powered Website Scanning
 */
export const emailApi = {
  // Health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/api/email-generator/health', {}, { auth: false }),

  // AI-enhanced page scanning with Mercury API integration
  scanPageEnhanced: (data) => apiClient.safeApiCall(apiClient.post, '/api/enhanced-page/scan-ai-enhanced', {
    url: data.url,
    keywords: data.keywords || [],
    industry: data.industry || 'general',
    analysis_mode: data.analysis_mode || 'ai_enhanced',
    enable_cache: data.enable_cache !== false,
    mercury_api: data.mercury_api !== false, // Use Mercury API by default
    extract_content_angles: data.extract_content_angles !== false
  }),

  // Campaign-ready website scanning
  scanPageForCampaign: (data) => apiClient.safeApiCall(apiClient.post, '/api/enhanced-page/scan-campaign-source', {
    url: data.url,
    keywords: data.keywords || [],
    industry: data.industry || 'general',
    campaign_id: data.campaign_id,
    target_audience: data.target_audience || 'general'
  }),

  // Get cache statistics for page scanning
  getPageCacheStats: () => apiClient.safeApiCall(apiClient.get, '/api/enhanced-page/cache-stats', {}, { auth: false }),

  // Scan sales page (fallback to traditional method)
  scanPage: (data) => apiClient.safeApiCall(apiClient.post, '/api/email-generator/scan-page', {
    url: data.url,
    keywords: data.keywords || [],
    industry: data.industry || 'general',
    autoSave: data.autoSave !== false
  }),

  // Generate emails
  generateEmails: (data) => apiClient.safeApiCall(apiClient.post, '/api/email-generator/generate', {
    benefits: data.benefits,
    selectedBenefits: data.selectedBenefits,
    websiteData: data.websiteData || {},
    tone: data.tone || 'persuasive',
    industry: data.industry || 'general',
    affiliateLink: data.affiliateLink || '',
    autoSave: data.autoSave !== false
  })
};

/**
 * Usage API Service - Enhanced with cache tracking
 */
export const usageApi = {
  // Health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/api/usage/health', {}, { auth: false }),

  // Get usage limits
  getLimits: () => apiClient.safeApiCall(apiClient.get, '/api/usage/limits'),

  // Track token usage with enhanced metadata
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
          // Enhanced metadata for cache and processing tracking
          cached: data.cached || false,
          processing_method: data.processing_method || 'google_stt',
          cost_saved: data.cost_saved || 0,
          processing_time: data.processing_time || 0,
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

  // Get usage history with enhanced filtering
  getHistory: (params = {}) => apiClient.safeApiCall(apiClient.get, '/api/usage/history', {
    days: params.days || 30,
    feature: params.feature || '',
    limit: params.limit || 50,
    include_cache_stats: params.include_cache_stats || false
  }),
}

/**
 * Content Library API Service - Enhanced campaign operations
 */
export const contentLibraryApi = {
  // Health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/api/content-library/health', {}, { auth: false }),

  // Content Library Operations (existing)
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
    metadata: data.metadata || {}
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

  // Campaign Operations
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
 * Enhanced System API Service - Cache and performance monitoring
 */
export const systemApi = {
  // Main health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/', {}, { auth: false }),

  // Enhanced cache statistics with global cache metrics
  getCacheStats: () => apiClient.safeApiCall(apiClient.get, '/cache/stats', {}, { auth: false }),

  // Global cache performance metrics
  getGlobalCacheStats: () => apiClient.safeApiCall(apiClient.get, '/cache/global-stats', {}, { auth: false }),

  // System status
  getSystemStatus: () => apiClient.safeApiCall(apiClient.get, '/system/status', {}, { auth: false }),

  // Test API endpoint
  testApi: () => apiClient.safeApiCall(apiClient.get, '/api/test', {}, { auth: false }),

  // Get API info
  getApiInfo: () => apiClient.safeApiCall(apiClient.get, '/api', {}, { auth: false }),

  // Google STT service status
  getGoogleSTTStatus: () => apiClient.safeApiCall(apiClient.get, '/api/video2promo/google-stt-status', {}, { auth: false }),

  // Mercury API status for enhanced page scanning
  getMercuryAPIStatus: () => apiClient.safeApiCall(apiClient.get, '/api/enhanced-page/mercury-status', {}, { auth: false })
};

/**
 * Enhanced Auth API Service - Authentication utilities
 */
export const authApi = {
  // Test current authentication
  testAuth: () => apiClient.testAuth(),

  // Check if backend is reachable
  checkBackend: async () => {
    try {
      const result = await systemApi.getHealth();
      return {
        success: true,
        available: result.success,
        message: result.success ? 'Backend is available' : 'Backend returned error',
        details: result
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

  // Check enhanced services status (Google STT only)
  checkEnhancedServices: async () => {
    try {
      const [googleSTT, mercuryAPI, cacheStats] = await Promise.allSettled([
        systemApi.getGoogleSTTStatus(),
        systemApi.getMercuryAPIStatus(),
        systemApi.getCacheStats()
      ]);

      return {
        googleSTT: googleSTT.status === 'fulfilled' ? googleSTT.value : { available: false },
        mercuryAPI: mercuryAPI.status === 'fulfilled' ? mercuryAPI.value : { available: false },
        cache: cacheStats.status === 'fulfilled' ? cacheStats.value : { available: false },
        processingMethod: 'google_stt_only'
      };
    } catch (error) {
      return {
        googleSTT: { available: false, error: error.message },
        mercuryAPI: { available: false, error: error.message },
        cache: { available: false, error: error.message },
        processingMethod: 'google_stt_only'
      };
    }
  }
};

/**
 * Complete API object with all enhanced services
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
 * Convenience function to check all service health including enhanced features
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
          processingMethod: 'google_stt_only'
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

  // Add enhanced services check
  try {
    const enhancedStatus = await authApi.checkEnhancedServices();
    results.enhanced = {
      googleSTT: enhancedStatus.googleSTT.available,
      mercuryAPI: enhancedStatus.mercuryAPI.available,
      cache: enhancedStatus.cache.available,
      processingMethod: 'google_stt_only'
    };
  } catch (error) {
    results.enhanced = {
      googleSTT: false,
      mercuryAPI: false,
      cache: false,
      processingMethod: 'google_stt_only',
      error: error.message
    };
  }

  return results;
};

/**
 * Export individual services and client for direct import
 */
export { apiClient } from './apiClient';

/**
 * Default export - complete API object
 */
export default api;