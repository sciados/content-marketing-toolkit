// src/core/api/apiClient.js - MERGED ENHANCED VERSION
// Preserves all existing functionality + adds enhanced capabilities

// 🚀 ENHANCED: Use new core database structure
import { supabase } from '../database/supabaseClient';
// import { db } from '../database/db';

/**
 * Enhanced Centralized API Client with robust authentication, caching, and multi-platform support
 * Handles all communication with the Python Flask backend + new enhanced endpoints
 */
class EnhancedAPIClient {
  constructor() {
    // ✅ PRESERVED: Your configuration
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://aiworkers.onrender.com';
    this.timeout = 30000; // 30 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    
    // 🆕 NEW: Enhanced capabilities
    this.cacheEnabled = true;
    this.progressCallbacks = new Map();
    this.requestQueue = new Map();
    
    console.log('🔧 Enhanced APIClient initialized with base URL:', this.baseURL);
  }

  /**
   * ✅ PRESERVED: Get current authentication token from Supabase session
   */
  async getAuthToken() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        throw new Error(`Session error: ${error.message}`);
      }
      
      if (!session?.access_token) {
        throw new Error('No active session found');
      }
      
      // ✅ PRESERVED: Token debugging
      const token = session.access_token;
      console.log('🔍 Token debug:', {
        length: token.length,
        segments: token.split('.').length,
        preview: `${token.substring(0, 50)}...${token.substring(token.length - 20)}`,
        isExpired: session.expires_at < (Date.now() / 1000)
      });
      
      return token;
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
      throw error;
    }
  }

  /**
   * ✅ PRESERVED: Build request headers with authentication
   */
  async buildHeaders(includeAuth = true, additionalHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...additionalHeaders
    };

    if (includeAuth) {
      try {
        const token = await this.getAuthToken();
        
        // ✅ PRESERVED: Token debugging
        console.log('🔍 Token being sent:', {
          exists: !!token,
          length: token ? token.length : 0,
          firstChars: token ? token.substring(0, 20) : 'none',
          lastChars: token ? token.substring(token.length - 20) : 'none',
          segmentCount: token ? token.split('.').length : 0
        });
        
        headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.warn('⚠️ Could not add auth token to headers:', error.message);
      }
    }

    return headers;
  }

  /**
   * ✅ PRESERVED: Sleep function for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 🆕 NEW: Progress tracking for long-running operations
   */
  onProgress(requestId, callback) {
    this.progressCallbacks.set(requestId, callback);
  }

  /**
   * 🆕 NEW: Enhanced cache check
   */
  async checkCache(cacheKey) {
    if (!this.cacheEnabled) return null;
    
    try {
      // Integration point for global cache system
      const cached = localStorage.getItem(`api_cache_${cacheKey}`);
      if (cached) {
        const data = JSON.parse(cached);
        const isExpired = Date.now() - data.timestamp > (data.ttl || 3600000); // 1 hour default
        
        if (!isExpired) {
          return data.response;
        } else {
          localStorage.removeItem(`api_cache_${cacheKey}`);
        }
      }
    } catch (error) {
      console.warn('🔍 Cache check failed:', error.message);
    }
    
    return null;
  }

  /**
   * 🆕 NEW: Cache response
   */
  async setCache(cacheKey, response, ttl = 3600000) {
    if (!this.cacheEnabled) return;
    
    try {
      const cacheData = {
        response,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(`api_cache_${cacheKey}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('💾 Cache set failed:', error.message);
    }
  }

  /**
   * 🚀 ENHANCED: Fetch with timeout, retries, caching, and progress tracking
   */
  async fetchWithRetry(url, options, attempt = 1, cacheKey = null) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    // 🆕 NEW: Check cache first
    if (cacheKey && options.method === 'GET') {
      const cached = await this.checkCache(cacheKey);
      if (cached) {
        console.log('✅ Cache hit for:', url);
        clearTimeout(timeoutId);
        return { ...cached, fromCache: true };
      }
    }

    try {
      console.log(`🚀 API Request (attempt ${attempt}):`, options.method || 'GET', url);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // ✅ PRESERVED: Handle different response types
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Unknown error' };
        }
        
        const error = new Error(errorData.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        
        // ✅ PRESERVED: Error logging
        console.error(`❌ API Error (${response.status}):`, {
          url,
          method: options.method || 'GET',
          status: response.status,
          error: errorData
        });
        
        throw error;
      }

      // ✅ PRESERVED: Parse response
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }

      // 🆕 NEW: Cache successful GET responses
      if (cacheKey && options.method === 'GET' && response.ok) {
        await this.setCache(cacheKey, data);
      }

      console.log(`✅ API Success:`, {
        url,
        method: options.method || 'GET',
        status: response.status,
        dataKeys: Object.keys(data || {}),
        cached: false
      });

      return data;

    } catch (error) {
      clearTimeout(timeoutId);

      // ✅ PRESERVED: Handle abort/timeout
      if (error.name === 'AbortError') {
        const timeoutError = new Error(`Request timeout after ${this.timeout}ms`);
        timeoutError.isTimeout = true;
        throw timeoutError;
      }

      // ✅ PRESERVED: Retry logic for network errors
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        console.warn(`⚠️ Retrying request (${attempt}/${this.retryAttempts}) after error:`, error.message);
        await this.sleep(this.retryDelay * attempt);
        return this.fetchWithRetry(url, options, attempt + 1, cacheKey);
      }

      throw error;
    }
  }

  /**
   * ✅ PRESERVED: Determine if an error should trigger a retry
   */
  shouldRetry(error) {
    // Don't retry auth errors (401, 403) or client errors (4xx)
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
    
    // Retry network errors and server errors (5xx)
    return (
      error.isTimeout ||
      !error.status || 
      error.status >= 500 ||
      error.message.includes('fetch')
    );
  }

  /**
   * 🚀 ENHANCED: GET request with caching support
   */
  async get(endpoint, params = {}, options = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const headers = await this.buildHeaders(options.auth !== false, options.headers);
    
    // 🆕 NEW: Generate cache key for GET requests
    const cacheKey = options.cache !== false ? 
      `${endpoint}_${JSON.stringify(params)}`.replace(/[^a-zA-Z0-9]/g, '_') : null;

    return this.fetchWithRetry(url.toString(), {
      method: 'GET',
      headers,
      ...options
    }, 1, cacheKey);
  }

  /**
   * ✅ PRESERVED: POST request
   */
  async post(endpoint, data = {}, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.buildHeaders(options.auth !== false, options.headers);

    return this.fetchWithRetry(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      ...options
    });
  }

  /**
   * ✅ PRESERVED: PUT request
   */
  async put(endpoint, data = {}, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.buildHeaders(options.auth !== false, options.headers);

    return this.fetchWithRetry(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      ...options
    });
  }

  /**
   * ✅ PRESERVED: DELETE request
   */
  async delete(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.buildHeaders(options.auth !== false, options.headers);

    return this.fetchWithRetry(url, {
      method: 'DELETE',
      headers,
      ...options
    });
  }

  /**
   * 🚀 ENHANCED: Health check with enhanced services detection
   */
  async healthCheck() {
    try {
      const result = await this.get('/', {}, { auth: false });
      return {
        ...result,
        enhanced: {
          googleSTT: result.google_stt_enabled || false,
          cache: result.cache_enabled || false,
          proxy: result.proxy_configured || false
        }
      };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        success: false,
        error: 'Backend unavailable',
        message: error.message,
        enhanced: {
          googleSTT: false,
          cache: false,
          proxy: false
        }
      };
    }
  }

  /**
   * 🆕 NEW: Check health with cache stats
   */
  async checkHealth() {
    return this.healthCheck();
  }

  /**
   * ✅ PRESERVED: Test authentication
   */
  async testAuth() {
    try {
      const token = await this.getAuthToken();
      return {
        success: true,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 10)}...` : null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ✅ PRESERVED: Handle authentication errors gracefully
   */
  handleAuthError(error) {
    if (error.status === 401) {
      console.warn('🔐 Authentication required - redirecting to login');
      supabase.auth.signOut();
      return {
        success: false,
        error: 'authentication_required',
        message: 'Please log in to continue'
      };
    }
    
    if (error.status === 403) {
      return {
        success: false,
        error: 'access_denied',
        message: 'You do not have permission to perform this action'
      };
    }
    
    return {
      success: false,
      error: 'api_error',
      message: error.message || 'An unexpected error occurred'
    };
  }

  /**
   * ✅ PRESERVED: Wrapper for API calls with standardized error handling
   */
  async safeApiCall(apiMethod, ...args) {
    try {
      const result = await apiMethod.apply(this, args);
      
      // Ensure consistent response format
      if (typeof result === 'object' && result !== null) {
        return {
          success: result.success !== false,
          ...result
        };
      }
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      console.error('❌ API call failed:', error);
      
      // Handle auth errors specially
      if (error.status === 401 || error.status === 403) {
        return this.handleAuthError(error);
      }
      
      // Handle other errors
      return {
        success: false,
        error: error.status ? `http_${error.status}` : 'network_error',
        message: error.message || 'Request failed',
        details: error.data || null
      };
    }
  }

  /**
   * 🆕 NEW: Enhanced video processing endpoints
   */
  async extractVideoContentEnhanced(url, keywords, options = {}) {
    return this.post('/api/video2promo/extract-google-stt', {
      url,
      keywords: keywords || [],
      extraction_mode: options.extractionMode || 'google_stt_only',
      enable_cache: options.enableCache !== false,
      force_refresh: options.forceRefresh || false,
      platform: options.platform
    });
  }

  /**
   * 🆕 NEW: Check video cache status
   */
  async checkVideoCache(url) {
    return this.get('/cache/video-status', { url }, { auth: false });
  }

  /**
   * 🆕 NEW: Get extraction progress
   */
  async getExtractionProgress(extractionId) {
    return this.get(`/api/video2promo/extraction-progress/${extractionId}`);
  }

  /**
   * 🆕 NEW: Enhanced page scanning
   */
  async scanPageEnhanced(url, options = {}) {
    return this.post('/api/enhanced-page/scan-ai-enhanced', {
      url,
      keywords: options.keywords || [],
      industry: options.industry || 'general',
      analysis_mode: options.analysisMode || 'ai_enhanced',
      enable_cache: options.enableCache !== false,
      mercury_api: options.mercuryApi !== false
    });
  }

  /**
   * 🆕 NEW: Get global cache statistics
   */
  async getCacheStats() {
    return this.get('/cache/stats', {}, { auth: false });
  }

  /**
   * 🆕 NEW: Clear cache
   */
  async clearCache(pattern = null) {
    if (pattern) {
      // Clear specific cache pattern
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('api_cache_') && key.includes(pattern)
      );
      keys.forEach(key => localStorage.removeItem(key));
    } else {
      // Clear all API cache
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('api_cache_')
      );
      keys.forEach(key => localStorage.removeItem(key));
    }
    
    return { success: true, cleared: pattern || 'all' };
  }

  /**
   * 🆕 NEW: Enable/disable caching
   */
  setCacheEnabled(enabled) {
    this.cacheEnabled = enabled;
    console.log(`🔧 API caching ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Create and export singleton instance
export const apiClient = new EnhancedAPIClient();

// Export class for testing
export { EnhancedAPIClient };

// Default export
export default apiClient;