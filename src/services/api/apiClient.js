// src/services/api/apiClient.js
import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://aiworkers.onrender.com';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.requestTimeout = 30000; // 30 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Get authentication headers from Supabase session
   */
  async getAuthHeaders() {
    try {
      if (!supabase) {
        console.warn('Supabase not initialized - using mock auth');
        return {
          'Authorization': 'Bearer mock-token-for-development'
        };
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting Supabase session:', error);
        throw new Error('Authentication failed');
      }

      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      return {
        'Authorization': `Bearer ${session.access_token}`
      };
    } catch (error) {
      console.error('Auth headers error:', error);
      throw error;
    }
  }

  /**
   * Sleep function for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with retry logic and auth
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      data = null,
      headers = {},
      requireAuth = true,
      timeout = this.requestTimeout,
      retries = this.retryAttempts
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Prepare headers
        const requestHeaders = { ...this.defaultHeaders, ...headers };
        
        // Add auth headers if required
        if (requireAuth) {
          try {
            const authHeaders = await this.getAuthHeaders();
            Object.assign(requestHeaders, authHeaders);
          } catch (authError) {
            console.error('Authentication failed:', authError);
            throw new Error('Authentication required');
          }
        }

        // Prepare request config
        const requestConfig = {
          method,
          headers: requestHeaders,
          signal: AbortSignal.timeout(timeout)
        };

        // Add body for non-GET requests
        if (data && method !== 'GET') {
          requestConfig.body = JSON.stringify(data);
        }

        // Make request
        console.log(`🚀 API ${method} ${url}`, { attempt: attempt + 1, data });
        
        const response = await fetch(url, requestConfig);
        
        // Handle response
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.message || `HTTP ${response.status}`);
          error.status = response.status;
          error.data = errorData;
          throw error;
        }

        const responseData = await response.json();
        console.log(`✅ API ${method} ${url}`, responseData);
        return responseData;

      } catch (error) {
        console.error(`❌ API ${method} ${url} (attempt ${attempt + 1}):`, error);

        // Don't retry for certain errors
        if (
          error.status === 401 || // Unauthorized
          error.status === 403 || // Forbidden
          error.status === 422 || // Validation error
          error.name === 'AbortError' || // Timeout
          attempt === retries // Last attempt
        ) {
          throw this.handleError(error, method, endpoint);
        }

        // Wait before retry
        if (attempt < retries) {
          await this.sleep(this.retryDelay * (attempt + 1));
        }
      }
    }
  }

  /**
   * Handle and format errors consistently
   */
  handleError(error, method, endpoint) {
    console.error(`API Error ${method} ${endpoint}:`, error);

    // Format error for UI consumption
    const formattedError = {
      message: 'An error occurred',
      status: error.status || 500,
      endpoint,
      method,
      timestamp: new Date().toISOString()
    };

    // Customize message based on error type
    if (error.status === 401) {
      formattedError.message = 'Authentication required. Please log in again.';
      formattedError.type = 'AUTH_ERROR';
    } else if (error.status === 403) {
      formattedError.message = 'Access denied. Please check your permissions.';
      formattedError.type = 'PERMISSION_ERROR';
    } else if (error.status === 422) {
      formattedError.message = error.data?.message || 'Invalid request data.';
      formattedError.type = 'VALIDATION_ERROR';
      formattedError.field = error.data?.field;
    } else if (error.status === 429) {
      formattedError.message = 'Rate limit exceeded. Please try again later.';
      formattedError.type = 'RATE_LIMIT_ERROR';
    } else if (error.status >= 500) {
      formattedError.message = 'Server error. Please try again later.';
      formattedError.type = 'SERVER_ERROR';
    } else if (error.name === 'AbortError') {
      formattedError.message = 'Request timeout. Please try again.';
      formattedError.type = 'TIMEOUT_ERROR';
    } else if (!navigator.onLine) {
      formattedError.message = 'No internet connection. Please check your network.';
      formattedError.type = 'NETWORK_ERROR';
    } else {
      formattedError.message = error.message || 'An unexpected error occurred.';
      formattedError.type = 'UNKNOWN_ERROR';
    }

    return formattedError;
  }

  /**
   * Convenience methods for different HTTP verbs
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', data });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', data });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Health check endpoint (no auth required)
   */
  async healthCheck() {
    try {
      const response = await this.get('/', { requireAuth: false, timeout: 5000 });
      return {
        healthy: true,
        data: response
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Check authentication status
   */
  async checkAuth() {
    try {
      const authHeaders = await this.getAuthHeaders();
      return {
        authenticated: true,
        headers: authHeaders
      };
    } catch (error) {
      return {
        authenticated: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;

// Export helper functions
export const { get, post, put, delete: del } = apiClient;
export { supabase };