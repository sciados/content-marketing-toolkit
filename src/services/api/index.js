// src/services/api/index.js - Complete API Services
import { apiClient } from './apiClient';

/**
 * Video API Service - Video2Promo endpoints
 */
export const videoApi = {
  // Health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/api/video2promo/health', {}, { auth: false }),

  // Extract video transcript
  extractTranscript: (data) => apiClient.safeApiCall(apiClient.post, '/api/video2promo/extract-transcript', {
    videoUrl: data.videoUrl,
    forceRefresh: data.forceRefresh || false,
    autoSave: data.autoSave !== false // Default to true
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
    autoSave: data.autoSave !== false // Default to true
  })
};

/**
 * Email API Service - Email Generator endpoints
 */
export const emailApi = {
  // Health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/api/email-generator/health', {}, { auth: false }),

  // Scan sales page
  scanPage: (data) => apiClient.safeApiCall(apiClient.post, '/api/email-generator/scan-page', {
    url: data.url,
    keywords: data.keywords || [],
    industry: data.industry || 'general',
    autoSave: data.autoSave !== false // Default to true
  }),

  // Generate emails
  generateEmails: (data) => apiClient.safeApiCall(apiClient.post, '/api/email-generator/generate', {
    benefits: data.benefits,
    selectedBenefits: data.selectedBenefits,
    websiteData: data.websiteData || {},
    tone: data.tone || 'persuasive',
    industry: data.industry || 'general',
    affiliateLink: data.affiliateLink || '',
    autoSave: data.autoSave !== false // Default to true
  })
};

/**
 * Usage API Service - Usage tracking endpoints
 */
export const usageApi = {
  // Health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/api/usage/health', {}, { auth: false }),

  // Get usage limits - FIXED: This is the correct endpoint
  getLimits: () => apiClient.safeApiCall(apiClient.get, '/api/usage/limits'),

  // Track token usage - FIXED: With proper error handling
  trackUsage: async (data) => {
    try {
      // Validate required fields
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
        metadata: data.metadata || {}
      };

      console.log('📊 Tracking usage:', payload);
      
      const result = await apiClient.safeApiCall(apiClient.post, '/api/usage/track', payload);
      
      if (result.success) {
        console.log('✅ Usage tracked successfully:', result);
        return result;
      } else {
        console.warn('⚠️ Usage tracking failed but continuing:', result.error);
        // Don't throw error - allow app to continue
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.warn('⚠️ Usage tracking error, continuing anyway:', error.message);
      // Return a non-throwing error response
      return { 
        success: false, 
        error: error.message,
        message: 'Usage tracking failed but operation can continue'
      };
    }
  },

  // Get usage history - FIXED: Proper parameter handling
  getHistory: (params = {}) => apiClient.safeApiCall(apiClient.get, '/api/usage/history', {
    days: params.days || 30,
    feature: params.feature || '',
    limit: params.limit || 50
  }),
}

/**
 * Content Library API Service - Content management endpoints
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

  // NEW: Campaign Operations
  
  // Create a new campaign
  createCampaign: (data) => apiClient.safeApiCall(apiClient.post, '/api/content-library/campaigns', {
    name: data.name,
    category: data.category,
    keywords: data.keywords || [],
    description: data.description || '',
    input_sources: data.input_sources || []
  }),

  // Get user's campaigns
  getCampaigns: (params = {}) => apiClient.safeApiCall(apiClient.get, '/api/content-library/campaigns', {
    category: params.category || '',
    status: params.status || '',
    search: params.search || '',
    limit: params.limit || '20',
    offset: params.offset || '0'
  }),

  // Get specific campaign
  getCampaign: (id) => apiClient.safeApiCall(apiClient.get, `/api/content-library/campaigns/${id}`),

  // Update campaign
  updateCampaign: (id, data) => apiClient.safeApiCall(apiClient.put, `/api/content-library/campaigns/${id}`, data),

  // Delete campaign
  deleteCampaign: (id) => apiClient.safeApiCall(apiClient.delete, `/api/content-library/campaigns/${id}`),

  // Check for existing content matches
  checkContentMatches: (data) => apiClient.safeApiCall(apiClient.post, '/api/content-library/check-matches', {
    type: data.type,
    url: data.url,
    data: data.data || {},
    category: data.category
  }),

  // Browse content by category
  browseByCategory: (params = {}) => apiClient.safeApiCall(apiClient.get, '/api/content-library/browse', {
    category: params.category || '',
    type: params.type || 'all',
    search: params.search || '',
    limit: params.limit || '20'
  })
};

/**
 * System API Service - Health and system endpoints
 */
export const systemApi = {
  // Main health check
  getHealth: () => apiClient.safeApiCall(apiClient.get, '/', {}, { auth: false }),

  // Cache statistics
  getCacheStats: () => apiClient.safeApiCall(apiClient.get, '/cache/stats', {}, { auth: false }),

  // System status
  getSystemStatus: () => apiClient.safeApiCall(apiClient.get, '/system/status', {}, { auth: false }),

  // Test API endpoint
  testApi: () => apiClient.safeApiCall(apiClient.get, '/api/test', {}, { auth: false }),

  // Get API info
  getApiInfo: () => apiClient.safeApiCall(apiClient.get, '/api', {}, { auth: false })
};

/**
 * Auth API Service - Authentication utilities
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
  }
};

/**
 * Complete API object with all services
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
 * Convenience function to check all service health
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
          message: result.message || result.error || 'Unknown status'
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