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

  // TODO: Add request method, error handling, timeout logic
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
