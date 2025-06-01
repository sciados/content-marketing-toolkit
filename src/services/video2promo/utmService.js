// src/services/video2promo/utmService.js
class UTMService {
  /**
   * Build UTM tracking URL
   * @param {string} baseUrl - Base affiliate URL
   * @param {Object} utmParams - UTM parameters
   * @returns {string} - Complete tracking URL
   */
  buildTrackingUrl(baseUrl, utmParams = {}) {
    if (!baseUrl) return '';

    try {
      const url = new URL(baseUrl);
      
      // Add UTM parameters
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value && value.trim()) {
          url.searchParams.set(key, value.trim());
        }
      });

      return url.toString();
    } catch (error) {
      console.error('Error building tracking URL:', error);
      return baseUrl;
    }
  }

  /**
   * Validate UTM parameters
   * @param {Object} params - UTM parameters to validate
   * @returns {Object} - Validation results
   */
  validateUTMParams(params) {
    const errors = {};
    const warnings = {};

    // Check for recommended parameters
    if (!params.utm_source) {
      warnings.utm_source = 'Source parameter recommended for tracking';
    }
    if (!params.utm_medium) {
      warnings.utm_medium = 'Medium parameter recommended for tracking';
    }
    if (!params.utm_campaign) {
      warnings.utm_campaign = 'Campaign parameter recommended for tracking';
    }

    // Validate parameter format
    Object.entries(params).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        // Check for spaces (should use underscores or hyphens)
        if (value.includes(' ')) {
          warnings[key] = 'Consider using underscores or hyphens instead of spaces';
        }
        
        // Check length
        if (value.length > 100) {
          errors[key] = 'Parameter too long (max 100 characters)';
        }

        // Check for invalid characters
        if (/[<>"]/.test(value)) {
          errors[key] = 'Contains invalid characters (<, >, ")';
        }
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate suggested UTM parameters based on context
   * @param {Object} context - Context for suggestions
   * @returns {Object} - Suggested UTM parameters
   */
  generateSuggestions(context = {}) {
    const { 
      projectName = 'video2promo',
      contentType = 'email',
      campaignDate = new Date(),
      videoTitle = ''
    } = context;

    const monthYear = campaignDate.toISOString().slice(0, 7).replace('-', '');
    const cleanVideoTitle = videoTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 30);

    return {
      utm_source: 'video2promo',
      utm_medium: contentType,
      utm_campaign: cleanVideoTitle ? `${cleanVideoTitle}_${monthYear}` : `${projectName}_${monthYear}`,
      utm_content: `${contentType}_variant_a`
    };
  }

  /**
   * Parse UTM parameters from URL
   * @param {string} url - URL to parse
   * @returns {Object} - Extracted UTM parameters
   */
  parseUTMParams(url) {
    const utmParams = {};
    
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      
      // Extract UTM parameters
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        const value = params.get(param);
        if (value) {
          utmParams[param] = value;
        }
      });
      
    } catch (error) {
      console.error('Error parsing UTM parameters:', error);
    }

    return utmParams;
  }

  /**
   * Clean UTM parameter value
   * @param {string} value - Parameter value to clean
   * @returns {string} - Cleaned value
   */
  cleanUTMValue(value) {
    if (!value || typeof value !== 'string') return '';
    
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_-]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 100);
  }

  /**
   * Get UTM parameter descriptions
   * @returns {Object} - Parameter descriptions
   */
  getParameterDescriptions() {
    return {
      utm_source: {
        name: 'Source',
        description: 'Identifies which site sent the traffic (e.g., google, newsletter, email)',
        examples: ['email', 'social', 'newsletter', 'referral', 'direct']
      },
      utm_medium: {
        name: 'Medium',
        description: 'Identifies what type of link was used (e.g., cost per click, email)',
        examples: ['email', 'social', 'cpc', 'banner', 'affiliate']
      },
      utm_campaign: {
        name: 'Campaign',
        description: 'Identifies a specific product promotion or strategic campaign',
        examples: ['spring_sale', 'product_launch', 'webinar_promo', 'video_series']
      },
      utm_term: {
        name: 'Term',
        description: 'Identifies search terms (mainly for paid search)',
        examples: ['marketing_software', 'email_tools', 'automation']
      },
      utm_content: {
        name: 'Content',
        description: 'Identifies what specifically was clicked (for A/B testing)',
        examples: ['header_link', 'sidebar_ad', 'email_cta', 'variant_a']
      }
    };
  }

  /**
   * Build tracking URLs for A/B testing
   * @param {string} baseUrl - Base URL
   * @param {Object} baseParams - Base UTM parameters
   * @param {Array} variants - Array of variant names
   * @returns {Array} - Array of tracking URLs
   */
  buildVariantUrls(baseUrl, baseParams = {}, variants = ['a', 'b']) {
    return variants.map(variant => {
      const variantParams = {
        ...baseParams,
        utm_content: `${baseParams.utm_content || 'variant'}_${variant}`
      };
      
      return {
        variant,
        url: this.buildTrackingUrl(baseUrl, variantParams),
        params: variantParams
      };
    });
  }
}

export const utmService = new UTMService();
