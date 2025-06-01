// src/services/ai/claudeAIService.js - FINAL FIXED VERSION

/**
 * Service for interacting with Claude AI API via Backend Only
 * UPDATED: Removed generateFocusedEmail - all email generation goes through useEmailGenerator
 */
class ClaudeAIService {
  constructor() {
    // Backend API URL - All AI calls go through your Python backend
    this.backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://aiworkers.onrender.com';
    
    // Remove direct Anthropic API configuration - backend handles this now
    this.apiUrl = null;
    this.apiKey = null;
    
    // Enable debug logging
    this.enableLogging = import.meta.env.VITE_ENABLE_API_LOGGING === 'true';
    
    // Model configuration for different tiers (for display purposes only)
    this.tierModels = {
      'free': {
        model: 'claude-3-haiku-20240307',
        displayName: 'Claude 3 Haiku',
        maxTokens: 2000,
        features: ['Fast generation', 'Basic quality', 'Cost-effective']
      },
      'pro': {
        model: 'claude-3-5-sonnet-20241022',
        displayName: 'Claude 3.5 Sonnet',
        maxTokens: 6000,
        features: ['High quality', 'Advanced reasoning', 'Better creativity']
      },
      'gold': {
        model: 'claude-3-5-sonnet-20241022',
        displayName: 'Claude 3.5 Sonnet Premium',
        maxTokens: 8000,
        features: ['Highest quality', 'Advanced features', 'Priority processing']
      }
    };
    
    // Log configuration if logging is enabled
    if (this.enableLogging) {
      console.log('🤖 Claude AI Service Configuration (Backend-Only):');
      console.log('Backend URL:', this.backendUrl);
      console.log('Available Tier Models:', Object.keys(this.tierModels));
      console.log('⚠️ All email generation now goes through useEmailGenerator hook');
    }
    
    // Prevent direct API calls from frontend
    if (typeof window !== 'undefined') {
      console.log('🔒 Claude AI Service running in browser - email generation via useEmailGenerator');
    }
  }

  /**
   * Get the appropriate model configuration for a user's subscription tier
   */
  getModelForTier(userTier = 'free') {
    const config = this.tierModels[userTier] || this.tierModels.free;
    
    if (this.enableLogging) {
      console.log(`🎯 Selected ${config.displayName} for ${userTier} tier user (backend will handle)`);
      console.log('Model features:', config.features);
    }
    
    return config;
  }

  /**
   * Get auth headers for backend API calls
   */
  async getAuthHeaders() {
    // Import supabase dynamically to avoid issues
    try {
      const { supabase } = await import('../supabase/supabaseClient');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.access_token) {
        console.warn('No valid session for Claude AI API calls');
        return {
          'Content-Type': 'application/json'
        };
      }
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      };
    } catch (error) {
      console.error('Failed to get auth headers for Claude AI:', error);
      return {
        'Content-Type': 'application/json'
      };
    }
  }

  /**
   * Generate content using Claude AI via Backend
   * NOTE: For email generation, use useEmailGenerator hook instead
   */
  async generateContent(prompt, options = {}) {
    try {
      const {
        temperature = 0.7,
        maxTokens = 4000,
        tier = 'free'
      } = options;

      // Get model configuration for tier (for display/logging only)
      const modelConfig = this.getModelForTier(tier);

      if (this.enableLogging) {
        console.log('🤖 Claude AI Backend Request (General Content):');
        console.log('- Prompt length:', prompt.length);
        console.log('- User tier:', tier);
        console.log('- Selected model:', modelConfig.model);
        console.log('- Max tokens:', maxTokens);
        console.log('- Temperature:', temperature);
        console.log('- Backend URL:', this.backendUrl);
        console.log('- Note: For email generation, use useEmailGenerator hook');
      }

      // Get auth headers
      const headers = await this.getAuthHeaders();

      // Make API call for general content generation
      // NOTE: This is for general AI content, NOT email generation
      const response = await fetch(`${this.backendUrl}/api/video2promo/analyze-benefits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transcript: prompt,
          keywords: [],
          tone: 'professional'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend AI request failed: ${response.status}`);
      }

      const result = await response.json();

      if (this.enableLogging) {
        console.log('✅ Claude Backend Response received:', {
          success: result.success,
          analysis: !!result.analysis
        });
      }

      if (result.success && result.analysis) {
        return {
          success: true,
          content: JSON.stringify(result.analysis),
          tokensUsed: result.tokens_used || 0,
          model: result.model_used || modelConfig.model,
          usage: result.usage || {}
        };
      } else {
        throw new Error(result.error || 'Backend AI generation failed');
      }
      
    } catch (error) {
      console.error('❌ Claude AI Backend Error:', error);
      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  }

  /**
   * REMOVED: generateFocusedEmail method
   * All email generation now goes through useEmailGenerator hook directly
   */
  generateFocusedEmail() {
    console.warn('⚠️ generateFocusedEmail removed - use useEmailGenerator hook instead');
    throw new Error('Email generation moved to useEmailGenerator hook. Use generateEmails() from that hook instead.');
  }

  /**
   * REMOVED: No longer make direct Claude API requests from frontend
   * All AI requests now go through your Python backend
   */
  async makeDirectClaudeRequest() {
    console.warn('⚠️ Direct Claude requests disabled - all AI calls now go through backend');
    throw new Error('Direct Claude API calls disabled. Use backend endpoints instead.');
  }

  /**
   * REMOVED: No longer make direct Claude API requests from frontend
   */
  async makeClaudeRequest() {
    console.warn('⚠️ Direct Claude requests disabled - all AI calls now go through backend');
    throw new Error('Direct Claude API calls disabled. Use backend endpoints instead.');
  }

  /**
   * Extract content from backend AI response
   */
  extractContentFromResponse(data) {
    if (data.content) {
      return data.content;
    } else if (data.body) {
      return data.body;
    } else {
      return data.text || data.toString();
    }
  }

  /**
   * Count words in text
   */
  countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  }

  /**
   * Estimate tokens for cost calculation (approximate)
   */
  estimateTokens(text) {
    if (!text) return 0;
    // More accurate estimation: ~3.5 characters per token + 10% overhead
    const baseTokens = Math.ceil(text.length / 3.5);
    return Math.ceil(baseTokens * 1.1);
  }

  /**
   * Calculate cost based on model and token usage (approximate)
   */
  calculateCost(inputTokens, outputTokens, model) {
    const pricing = {
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
      'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 }
    };
    
    const modelPricing = pricing[model] || pricing['claude-3-haiku-20240307'];
    
    return ((inputTokens / 1000) * modelPricing.input) + ((outputTokens / 1000) * modelPricing.output);
  }

  /**
   * Handle and format errors
   */
  handleError(error) {
    let errorMessage = 'Failed to generate content with AI. ';
    
    if (error.message.includes('Backend')) {
      errorMessage += 'Backend service error: ' + error.message;
    } else if (error.message.includes('auth')) {
      errorMessage += 'Authentication error: ' + error.message;
    } else if (error.message.includes('status')) {
      errorMessage += 'Server error: ' + error.message;
    } else {
      errorMessage += 'Please try again or check backend service.';
    }
    
    return new Error(errorMessage);
  }

  /**
   * Extract website name from URL
   */
  extractWebsiteName(url) {
    try {
      const domain = url.replace(/(^\w+:|^)\/\//, '').split('/')[0];
      const parts = domain.split('.');
      if (parts.length >= 2) {
        return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
      }
      return domain;
    } catch {
      return "Your Company";
    }
  }

  /**
   * Check if the Claude AI service is available via backend
   * UPDATED: Checks backend availability instead of direct Anthropic API
   */
  async isAvailable() {
    try {
      const response = await fetch(`${this.backendUrl}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const isOk = response.ok;
      if (this.enableLogging) {
        console.log('Claude AI backend availability check:', isOk ? 'Available' : 'Unavailable');
      }
      
      return isOk;
    } catch (error) {
      console.error('Claude AI backend service check failed:', error);
      return false;
    }
  }

  /**
   * Get model information for a specific tier
   */
  getModelInfo(tier = 'free') {
    return this.getModelForTier(tier);
  }
}

// Export a single instance and the class
const claudeAIService = new ClaudeAIService();

export { claudeAIService };
export default claudeAIService;