// src/services/ai/claudeAIService.js - UPDATED for Backend-Only Architecture

/**
 * Service for interacting with Claude AI API via Backend Only
 * UPDATED: All AI calls now go through backend, no direct frontend calls to Anthropic
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
      console.log('⚠️ All AI calls now go through backend - no direct Anthropic API calls');
    }
    
    // Prevent direct API calls from frontend
    if (typeof window !== 'undefined') {
      console.log('🔒 Claude AI Service running in browser - all calls will route through backend');
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
   * UPDATED: All calls now go through your Python backend
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
        console.log('🤖 Claude AI Backend Request:');
        console.log('- Prompt length:', prompt.length);
        console.log('- User tier:', tier);
        console.log('- Selected model:', modelConfig.model);
        console.log('- Max tokens:', maxTokens);
        console.log('- Temperature:', temperature);
        console.log('- Backend URL:', this.backendUrl);
        console.log('- First 200 chars of prompt:', prompt.substring(0, 200) + '...');
      }

      // Get auth headers
      const headers = await this.getAuthHeaders();

      // Make API call to YOUR backend instead of Anthropic directly
      const response = await fetch(`${this.backendUrl}/api/ai/generate-content`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: prompt,
          model: modelConfig.model,
          maxTokens: maxTokens,
          temperature: temperature,
          tier: tier
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
          contentLength: result.content?.length || 0,
          tokensUsed: result.tokensUsed || 0
        });
      }

      if (result.success && result.content) {
        return {
          success: true,
          content: result.content,
          tokensUsed: result.tokensUsed || 0,
          model: result.model || modelConfig.model,
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
   * Generate a focused email highlighting a single feature or benefit
   * UPDATED: Routes through backend instead of direct Anthropic calls
   */
  async generateFocusedEmail(params) {
    const { 
      focusItem, 
      emailNumber, 
      totalEmails, 
      websiteData, 
      websiteUrl, 
      keywords,
      tone, 
      industry, 
      includeCta, 
      affiliateLink,
      userTier,
      user,
      readingLevel = '5th grade',
      wordLimit = { min: 100, max: 300 },
      subjectLimit = 50,
      structure = 'problem-solution-cta'
    } = params;
    
    try {
      // Get the appropriate model for the user's tier
      const tier = userTier || user?.subscription_tier || 'free';
      const modelConfig = this.getModelForTier(tier);
      
      if (this.enableLogging) {
        console.log('🎯 Generating focused email via backend:', {
          focusItem,
          emailNumber,
          model: modelConfig.model,
          tier: tier,
          wordLimit,
          readingLevel
        });
      }

      // Get auth headers
      const headers = await this.getAuthHeaders();

      // Call backend email generation endpoint
      const response = await fetch(`${this.backendUrl}/api/ai/generate-focused-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          focusItem,
          emailNumber,
          totalEmails,
          websiteData,
          websiteUrl,
          keywords,
          tone,
          industry,
          includeCta,
          affiliateLink,
          tier,
          readingLevel,
          wordLimit,
          subjectLimit,
          structure,
          model: modelConfig.model
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend email generation failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return {
          subject: result.subject,
          body: result.body,
          usage: result.usage || {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            estimatedCost: 0,
            model: modelConfig.model,
            modelDisplayName: modelConfig.displayName,
            focusItem: focusItem,
            readingLevel: readingLevel,
            wordCount: this.countWords(result.body)
          }
        };
      } else {
        throw new Error(result.error || 'Backend email generation failed');
      }
      
    } catch (error) {
      console.error('Error generating focused email via backend:', error);
      throw this.handleError(error);
    }
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
   * Parse the email content to extract subject and body
   */
  parseEmailContent(content, affiliateLink = '') {
    let subject = '';
    let body = content;
    
    const subjectMatch = content.match(/Subject:(.+?)(?:\n\n|\r\n\r\n)/s);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      body = content.substring(subjectMatch[0].length).trim();
    } else {
      const lines = content.split('\n');
      if (lines.length > 1) {
        subject = lines[0].replace(/^subject:\s*/i, '').trim();
        body = lines.slice(1).join('\n').trim();
      }
    }
    
    // Ensure affiliate link is properly included
    if (affiliateLink) {
      body = this.ensureAffiliateLinkInContent(body, affiliateLink);
    }
    
    return { subject, body };
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
   * Ensure the affiliate link is properly included in the email content as HTML
   */
  ensureAffiliateLinkInContent(emailContent, affiliateLink) {
    if (!affiliateLink) return emailContent;
    
    // If affiliate link is already present, ensure it's formatted as HTML
    if (emailContent.includes(affiliateLink)) {
      return emailContent.replace(/\[(.*?)\]\((\S+?)\)/g, '<a href="$2">$1</a>');
    }
    
    // Look for call to action sections to insert the link
    const ctaMatch = emailContent.match(/\[Call to Action:(.+?)\]|\*\*Call to Action:?\*\*(.+?)(?:\n\n|\r\n\r\n|$)|Call to Action:(.+?)(?:\n\n|\r\n\r\n|$)/is);
    
    if (ctaMatch) {
      const ctaContent = ctaMatch[1] || ctaMatch[2] || ctaMatch[3];
      const ctaSection = ctaMatch[0];
      let updatedCTA;
      
      if (ctaContent.includes('Click here') || ctaContent.includes('click here')) {
        updatedCTA = ctaSection.replace(/(Click here|click here)/i, `<a href="${affiliateLink}">Click here</a>`);
      } else if (ctaContent.includes('Sign up') || ctaContent.includes('sign up')) {
        updatedCTA = ctaSection.replace(/(Sign up|sign up)/i, `<a href="${affiliateLink}">Sign up</a>`);
      } else {
        const learnMoreLink = `<a href="${affiliateLink}">Learn more</a>`;
        
        if (ctaSection.includes('[Call to Action:')) {
          updatedCTA = ctaSection.replace(/\[Call to Action:(.+?)\]/is, `[Call to Action:$1 - ${learnMoreLink}]`);
        } else if (ctaSection.includes('**Call to Action:**')) {
          updatedCTA = ctaSection.replace(/\*\*Call to Action:?\*\*(.+?)(?:\n\n|\r\n\r\n|$)/is, `**Call to Action:**$1 - ${learnMoreLink}\n\n`);
        } else {
          updatedCTA = ctaSection.replace(/Call to Action:(.+?)(?:\n\n|\r\n\r\n|$)/is, `Call to Action:$1 - ${learnMoreLink}\n\n`);
        }
      }
      
      return emailContent.replace(ctaSection, updatedCTA);
    }
    
    // If no specific CTA section found, add link before closing
    const signaturePattern = /Best regards,\s*\n\s*\[Your Name\]\s*\n\s*\[Your Title\]\s*\n\s*\[Your Company\]\s*$/i;
    if (signaturePattern.test(emailContent)) {
      const learnMoreLink = `<a href="${affiliateLink}">Learn more about our offerings</a>`;
      return emailContent.replace(signaturePattern, `${learnMoreLink}\n\nBest regards,\n[Your Name]\n[Your Title]\n[Your Company]`);
    }
    
    const closingMatch = emailContent.match(/(?:Regards|Sincerely|Cheers|Best),?\s*\n+.+?$/s);
    if (closingMatch) {
      const closingSection = closingMatch[0];
      const learnMoreLink = `<a href="${affiliateLink}">Learn more about our offerings</a>`;
      return emailContent.replace(closingSection, `${learnMoreLink}\n\n${closingSection}`);
    }
    
    // Last resort - append link at end
    return `${emailContent}\n\n<a href="${affiliateLink}">Learn more</a>`;
  }
  
  /**
   * Check if the Claude AI service is available via backend
   * UPDATED: Checks backend availability instead of direct Anthropic API
   */
  async isAvailable() {
    try {
      const response = await fetch(`${this.backendUrl}/api/ai/health`, {
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