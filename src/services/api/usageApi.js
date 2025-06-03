// src/services/api/usageApi.js
import apiClient from './apiClient.js';

class UsageApi {
  constructor() {
    this.baseEndpoint = '/api/usage';
  }

  /**
   * Get user's usage limits and current consumption
   */
  async getLimits() {
    try {
      const response = await apiClient.get(`${this.baseEndpoint}/limits`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Failed to fetch usage limits:', error);
      return {
        success: false,
        error: error.message,
        // Fallback data for development
        data: {
          limits: {
            monthly_tokens: 100000,
            daily_tokens: 5000,
            daily_videos: 50
          },
          current_usage: {
            monthly_tokens_used: 25000,
            daily_tokens_used: 1200,
            daily_videos_used: 5
          },
          remaining: {
            monthly_tokens: 75000,
            daily_tokens: 3800,
            daily_videos: 45
          },
          subscription_tier: 'free'
        }
      };
    }
  }

  /**
   * Track token usage for a specific feature
   */
  async trackUsage(feature, tokens) {
    try {
      const response = await apiClient.post(`${this.baseEndpoint}/track`, {
        feature,
        tokens,
        timestamp: new Date().toISOString()
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Failed to track usage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get usage history with filtering options
   */
  async getHistory(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) {
        queryParams.append('start_date', filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append('end_date', filters.endDate);
      }
      if (filters.feature) {
        queryParams.append('feature', filters.feature);
      }
      if (filters.limit) {
        queryParams.append('limit', filters.limit);
      }

      const endpoint = `${this.baseEndpoint}/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Failed to fetch usage history:', error);
      return {
        success: false,
        error: error.message,
        // Fallback data
        data: {
          history: [],
          total_records: 0,
          period: {
            start_date: filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: filters.endDate || new Date().toISOString()
          }
        }
      };
    }
  }

  /**
   * Get usage statistics and analytics
   */
  async getStats(period = '30d') {
    try {
      const response = await apiClient.get(`${this.baseEndpoint}/stats?period=${period}`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
      return {
        success: false,
        error: error.message,
        // Fallback stats
        data: {
          period,
          total_tokens: 25000,
          total_videos: 15,
          features_used: ['video2promo', 'email_generator'],
          daily_average: 833,
          peak_day: new Date().toISOString().split('T')[0],
          peak_usage: 2500
        }
      };
    }
  }

  /**
   * Check if user can perform an action based on limits
   */
  async checkLimits(feature, requiredTokens = 0) {
    try {
      const limitsResponse = await this.getLimits();
      
      if (!limitsResponse.success) {
        // Allow if we can't check limits (fallback)
        return {
          allowed: true,
          reason: 'Could not verify limits'
        };
      }

      const { limits, current_usage } = limitsResponse.data;
      
      // Check daily token limit
      const dailyRemaining = limits.daily_tokens - (current_usage.daily_tokens_used || 0);
      if (requiredTokens > dailyRemaining) {
        return {
          allowed: false,
          reason: 'Daily token limit exceeded',
          current: current_usage.daily_tokens_used || 0,
          limit: limits.daily_tokens,
          required: requiredTokens
        };
      }

      // Check monthly token limit
      const monthlyRemaining = limits.monthly_tokens - (current_usage.monthly_tokens_used || 0);
      if (requiredTokens > monthlyRemaining) {
        return {
          allowed: false,
          reason: 'Monthly token limit exceeded',
          current: current_usage.monthly_tokens_used || 0,
          limit: limits.monthly_tokens,
          required: requiredTokens
        };
      }

      // Check daily video limit for video processing features
      if (feature === 'video2promo') {
        const videosRemaining = limits.daily_videos - (current_usage.daily_videos_used || 0);
        if (videosRemaining <= 0) {
          return {
            allowed: false,
            reason: 'Daily video processing limit exceeded',
            current: current_usage.daily_videos_used || 0,
            limit: limits.daily_videos
          };
        }
      }

      return {
        allowed: true,
        remaining: {
          daily_tokens: dailyRemaining,
          monthly_tokens: monthlyRemaining,
          daily_videos: limits.daily_videos - (current_usage.daily_videos_used || 0)
        }
      };

    } catch (error) {
      console.error('Failed to check limits:', error);
      // Allow if we can't check (fail open for better UX)
      return {
        allowed: true,
        reason: 'Could not verify limits',
        error: error.message
      };
    }
  }

  /**
   * Get usage percentage for progress bars
   */
  calculateUsagePercentages(usageData) {
    try {
      const { limits, current_usage } = usageData;
      
      return {
        daily_tokens: Math.min(
          Math.round(((current_usage.daily_tokens_used || 0) / limits.daily_tokens) * 100),
          100
        ),
        monthly_tokens: Math.min(
          Math.round(((current_usage.monthly_tokens_used || 0) / limits.monthly_tokens) * 100),
          100
        ),
        daily_videos: Math.min(
          Math.round(((current_usage.daily_videos_used || 0) / limits.daily_videos) * 100),
          100
        )
      };
    } catch (error) {
      console.error('Failed to calculate usage percentages:', error);
      return {
        daily_tokens: 0,
        monthly_tokens: 0,
        daily_videos: 0
      };
    }
  }
}

// Create singleton instance
const usageApi = new UsageApi();

export default usageApi;