// src/services/api/apiClient.js - CRITICAL Centralized API Client
import { supabase } from '../supabase/supabaseClient';

/**
 * Centralized API client with robust authentication, error handling, and retry logic
 * Handles all communication with the Python Flask backend
 */
class APIClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://aiworkers.onrender.com';
    this.timeout = 30000; // 30 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    
    console.log('🔧 APIClient initialized with base URL:', this.baseURL);
  }

  /**
   * Get current authentication token from Supabase session
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
      
      return session.access_token;
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
      throw error;
    }
  }

  /**
   * Build request headers with authentication
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
      
      // 🔍 DEBUG: Log token details
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
   * Sleep function for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enhanced fetch with timeout, retries, and error handling
   */
  async fetchWithRetry(url, options, attempt = 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`🚀 API Request (attempt ${attempt}):`, options.method || 'GET', url);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle different response types
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
        
        // Log error details
        console.error(`❌ API Error (${response.status}):`, {
          url,
          method: options.method || 'GET',
          status: response.status,
          error: errorData
        });
        
        throw error;
      }

      // Parse response
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }

      console.log(`✅ API Success:`, {
        url,
        method: options.method || 'GET',
        status: response.status,
        dataKeys: Object.keys(data || {})
      });

      return data;

    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort/timeout
      if (error.name === 'AbortError') {
        const timeoutError = new Error(`Request timeout after ${this.timeout}ms`);
        timeoutError.isTimeout = true;
        throw timeoutError;
      }

      // Retry logic for network errors (not auth errors)
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        console.warn(`⚠️ Retrying request (${attempt}/${this.retryAttempts}) after error:`, error.message);
        await this.sleep(this.retryDelay * attempt);
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Determine if an error should trigger a retry
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
   * GET request
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

    return this.fetchWithRetry(url.toString(), {
      method: 'GET',
      headers,
      ...options
    });
  }

  /**
   * POST request
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
   * PUT request
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
   * DELETE request
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
   * Health check endpoint (no auth required)
   */
  async healthCheck() {
    try {
      return await this.get('/', {}, { auth: false });
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        success: false,
        error: 'Backend unavailable',
        message: error.message
      };
    }
  }

  /**
   * Test authentication
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
   * Handle authentication errors gracefully
   */
  handleAuthError(error) {
    if (error.status === 401) {
      console.warn('🔐 Authentication required - redirecting to login');
      // The auth context will handle this automatically
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
   * Wrapper for API calls with standardized error handling
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
}

// Create and export singleton instance
export const apiClient = new APIClient();

// Export class for testing
export { APIClient };

// Default export
export default apiClient;