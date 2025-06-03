import { supabase } from '../supabase/supabaseClient';

// Backend API URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://aiworkers.onrender.com';

/**
 * Centralized API client with consistent auth and error handling
 */
class ApiClient {
  constructor() {
    this.baseURL = API_BASE;
  }

  /**
   * Get consistent auth headers using Supabase session
   */
  async getAuthHeaders() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.access_token) {
        console.warn('No valid session for API calls');
        return {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        };
      }

      return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'Origin': window.location.origin
      };
    } catch (error) {
      console.error('Failed to get auth headers:', error);
      return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin
      };
    }
  }

  /**
   * Generic request method with error handling and timeout
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();
    
    const config = {
      headers: {
        ...headers,
        ...options.headers,
      },
      timeout: options.timeout || 30000,
      ...options,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Get response text first to handle both JSON and text responses
      const responseText = await response.text();
      
      // Try to parse as JSON
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      // eslint-disable-next-line no-unused-vars
      } catch (parseError) {
        // If not JSON, treat as text
        responseData = { message: responseText };
      }

      if (!response.ok) {
        // Handle specific error status codes
        if (response.status === 401) {
          throw new Error('Authentication expired. Please refresh the page and log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your subscription tier or usage limits.');
        } else if (response.status === 404) {
          throw new Error(responseData.error || responseData.message || 'Resource not found');
        } else if (response.status >= 500) {
          throw new Error('Backend server error. Please try again in a few minutes.');
        } else {
          throw new Error(responseData.error || responseData.message || `API error: ${response.status}`);
        }
      }

      return responseData;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      // Re-throw our custom errors
      throw error;
    }
  }

  /**
   * GET request helper
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request helper
   */
  async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  /**
   * PUT request helper
   */
  async put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  /**
   * DELETE request helper
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // ==========================================
  // HEALTH & SYSTEM ENDPOINTS
  // ==========================================

  /**
   * Main health check - matches the backend '/health' endpoint
   */
  async getHealth() {
    try {
      const response = await this.get('/');
      return {
        connected: true,
        message: response.message || 'Backend connected',
        version: response.version || '4.0',
        services: response.services || {},
        cache_status: response.cache_status || {},
        proxy_status: response.proxy_status || {},
        ...response
      };
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      return await this.get('/cache/stats');
    } catch (error) {
      console.error('Cache stats failed:', error);
      throw error;
    }
  }

  /**
   * Get detailed system status
   */
  async getSystemStatus() {
    try {
      return await this.get('/system/status');
    } catch (error) {
      console.error('System status failed:', error);
      throw error;
    }
  }

  // ==========================================
  // VIDEO PROCESSING ENDPOINTS
  // ==========================================

  /**
   * Extract YouTube video transcript
   */
  async extractTranscript(data) {
    try {
      return await this.post('/api/video2promo/extract-transcript', data);
    } catch (error) {
      console.error('Transcript extraction failed:', error);
      throw error;
    }
  }

  /**
   * Analyze transcript for benefits and insights
   */
  async analyzeBenefits(data) {
    try {
      return await this.post('/api/video2promo/analyze-benefits', data);
    } catch (error) {
      console.error('Benefit analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate promotional assets
   */
  async generateAssets(data) {
    try {
      return await this.post('/api/video2promo/generate-assets', data);
    } catch (error) {
      console.error('Asset generation failed:', error);
      throw error;
    }
  }

  // ==========================================
  // EMAIL GENERATION ENDPOINTS (when implemented)
  // ==========================================

  /**
   * Scan and analyze sales page
   */
  async scanPage(data) {
    try {
      return await this.post('/api/email-generator/scan-page', data);
    } catch (error) {
      console.error('Page scan failed:', error);
      throw error;
    }
  }

  /**
   * Generate email series
   */
  async generateEmails(data) {
    try {
      return await this.post('/api/email-generator/generate', data);
    } catch (error) {
      console.error('Email generation failed:', error);
      throw error;
    }
  }

  // ==========================================
  // USAGE TRACKING ENDPOINTS (when implemented)
  // ==========================================

  /**
   * Get usage limits and current consumption
   */
  async getUsageLimits() {
    try {
      return await this.get('/api/usage/limits');
    } catch (error) {
      console.error('Usage limits check failed:', error);
      throw error;
    }
  }

  /**
   * Track token usage
   */
  async trackUsage(data) {
    try {
      return await this.post('/api/usage/track', data);
    } catch (error) {
      console.error('Usage tracking failed:', error);
      throw error;
    }
  }

  /**
   * Get usage history
   */
  async getUsageHistory(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/api/usage/history?${queryString}` : '/api/usage/history';
      return await this.get(endpoint);
    } catch (error) {
      console.error('Usage history failed:', error);
      throw error;
    }
  }

  // ==========================================
  // CONTENT LIBRARY ENDPOINTS (when implemented)
  // ==========================================

  /**
   * Get content library items
   */
  async getContentLibraryItems(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/api/content-library/items?${queryString}` : '/api/content-library/items';
      return await this.get(endpoint);
    } catch (error) {
      console.error('Content library fetch failed:', error);
      throw error;
    }
  }

  /**
   * Create content library item
   */
  async createContentLibraryItem(data) {
    try {
      return await this.post('/api/content-library/items', data);
    } catch (error) {
      console.error('Content library creation failed:', error);
      throw error;
    }
  }

  /**
   * Get specific content library item
   */
  async getContentLibraryItem(id) {
    try {
      return await this.get(`/api/content-library/item/${id}`);
    } catch (error) {
      console.error('Content library item fetch failed:', error);
      throw error;
    }
  }

  /**
   * Update content library item
   */
  async updateContentLibraryItem(id, data) {
    try {
      return await this.put(`/api/content-library/item/${id}`, data);
    } catch (error) {
      console.error('Content library update failed:', error);
      throw error;
    }
  }

  /**
   * Delete content library item
   */
  async deleteContentLibraryItem(id) {
    try {
      return await this.delete(`/api/content-library/item/${id}`);
    } catch (error) {
      console.error('Content library deletion failed:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleContentLibraryFavorite(id) {
    try {
      return await this.post(`/api/content-library/item/${id}/favorite`);
    } catch (error) {
      console.error('Content library favorite toggle failed:', error);
      throw error;
    }
  }

  /**
   * Increment usage count
   */
  async incrementContentLibraryUsage(id) {
    try {
      return await this.post(`/api/content-library/item/${id}/use`);
    } catch (error) {
      console.error('Content library usage increment failed:', error);
      throw error;
    }
  }

  /**
   * Get content library statistics
   */
  async getContentLibraryStats() {
    try {
      return await this.get('/api/content-library/stats');
    } catch (error) {
      console.error('Content library stats failed:', error);
      throw error;
    }
  }

  /**
   * Search content library
   */
  async searchContentLibrary(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/api/content-library/search?${queryString}` : '/api/content-library/search';
      return await this.get(endpoint);
    } catch (error) {
      console.error('Content library search failed:', error);
      throw error;
    }
  }

  /**
   * Get available content types
   */
  async getContentLibraryTypes() {
    try {
      return await this.get('/api/content-library/types');
    } catch (error) {
      console.error('Content library types fetch failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;