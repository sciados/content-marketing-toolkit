// src/services/ai/claudeAIService.js
import axios from 'axios';

/**
 * Service for interacting with Claude AI API with tier-based model selection
 */
class ClaudeAIService {
  constructor() {
    // Use the Firebase Cloud Function URL from environment variables
    this.apiUrl = import.meta.env.VITE_CLAUDE_PROXY_URL;
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    this.defaultModel = import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-haiku-20240307';
    
    // Enable debug logging
    this.enableLogging = import.meta.env.VITE_ENABLE_API_LOGGING === 'true';
    
    // Model configuration for different tiers
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
      console.log('Claude AI Service Configuration:');
      console.log('API URL:', this.apiUrl);
      console.log('API Key:', this.apiKey ? 'Set (begins with ' + this.apiKey.substring(0, 10) + '...)' : 'Not set');
      console.log('Default Model:', this.defaultModel);
      console.log('Available Tier Models:', Object.keys(this.tierModels));
    }
    
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: false
    });
    
    // Log if the proxy URL is not set
    if (!this.apiUrl) {
      console.warn('Claude AI proxy URL not set. Email generation may fail.');
    }
    
    // Log if the API key is not set
    if (!this.apiKey) {
      console.warn('Claude API key not set. Email generation may fail.');
    }
  }

  /**
   * Get the appropriate model configuration for a user's subscription tier
   * @param {string} userTier - User's subscription tier ('free', 'pro', 'gold')
   * @returns {Object} Model configuration object
   */
  getModelForTier(userTier = 'free') {
    const config = this.tierModels[userTier] || this.tierModels.free;
    
    if (this.enableLogging) {
      console.log(`🤖 Selected ${config.displayName} for ${userTier} tier user`);
      console.log('Model features:', config.features);
    }
    
    return config;
  }

  /**
   * Generate an improved email using Claude AI with tier-based model selection
   * @param {Object} params - Parameters for email generation
   * @param {Object} params.websiteData - Extracted website data
   * @param {string} params.websiteUrl - URL of the website
   * @param {string} params.keywords - Keywords to incorporate
   * @param {string} params.tone - Tone of the email
   * @param {string} params.industry - Industry for context
   * @param {boolean} params.includeCta - Whether to include call to action
   * @param {string} params.affiliateLink - Optional affiliate link
   * @param {string} params.userTier - User's subscription tier
   * @param {Object} params.user - User object with subscription info
   * @returns {Promise<Object>} - Generated email content with token usage
   */
  async generateEmail(params) {
    const { 
      websiteData, 
      websiteUrl, 
      keywords, 
      tone, 
      industry, 
      includeCta, 
      affiliateLink,
      userTier,
      user
    } = params;
    
    try {
      // Get the appropriate model for the user's tier
      const tier = userTier || user?.subscription_tier || 'free';
      const modelConfig = this.getModelForTier(tier);
      
      // Prepare data for Claude
      const websiteName = this.extractWebsiteName(websiteUrl);
      const keywordList = keywords?.split(',').map(k => k.trim()).filter(k => k).join(', ') || '';
      
      // Enhanced system prompt based on tier
      let systemPrompt = `You are an expert email marketing copywriter specializing in sales-focused promotional emails.`;
      
      if (tier === 'gold') {
        systemPrompt += ` You have access to premium AI capabilities and should create exceptionally high-quality, personalized content with advanced persuasion techniques.`;
      } else if (tier === 'pro') {
        systemPrompt += ` You should create high-quality, well-structured emails with good persuasion techniques and creativity.`;
      } else {
        systemPrompt += ` Create effective, professional emails with clear value propositions.`;
      }
      
      systemPrompt += ` Generate a compelling marketing email for ${websiteName} that drives conversions and encourages readers to visit the website. Format any links as HTML <a> tags.`;
      
      // Build detailed user message
      let userMessage = this.buildUserMessage({
        websiteData,
        websiteName,
        industry,
        tone,
        keywordList,
        includeCta,
        affiliateLink,
        tier
      });

      // Track input tokens for cost calculation
      const inputText = systemPrompt + userMessage;
      const estimatedInputTokens = this.estimateTokens(inputText);
      
      if (this.enableLogging) {
        console.log('🤖 Generating email with:', {
          websiteName,
          model: modelConfig.model,
          tier: tier,
          estimatedInputTokens,
          maxTokens: modelConfig.maxTokens
        });
      }

      // Make the API call
      const result = await this.makeClaudeRequest({
        userMessage,
        systemPrompt,
        model: modelConfig.model,
        maxTokens: modelConfig.maxTokens,
        affiliateLink
      });

      // Calculate output tokens and total cost
      const estimatedOutputTokens = this.estimateTokens(result.subject + result.body);
      const totalTokens = estimatedInputTokens + estimatedOutputTokens;
      const estimatedCost = this.calculateCost(estimatedInputTokens, estimatedOutputTokens, modelConfig.model);

      if (this.enableLogging) {
        console.log('🤖 Generation complete:', {
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
          totalTokens: totalTokens,
          estimatedCost: `$${estimatedCost.toFixed(6)}`,
          model: modelConfig.displayName
        });
      }

      return {
        ...result,
        usage: {
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
          totalTokens: totalTokens,
          estimatedCost: estimatedCost,
          model: modelConfig.model,
          modelDisplayName: modelConfig.displayName
        }
      };
      
    } catch (error) {
      console.error('Error generating email with Claude AI:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generate a focused email highlighting a single feature or benefit
   * @param {Object} params - Parameters for focused email generation
   * @returns {Promise<Object>} - Generated email content with token usage
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
      user
    } = params;
    
    try {
      // Get the appropriate model for the user's tier
      const tier = userTier || user?.subscription_tier || 'free';
      const modelConfig = this.getModelForTier(tier);
      
      const websiteName = this.extractWebsiteName(websiteUrl);
      const keywordList = keywords?.split(',').map(k => k.trim()).filter(k => k).join(', ') || '';
      
      // Enhanced system prompt for focused emails
      let systemPrompt = `You are an expert email marketing copywriter. Generate email #${emailNumber} in a series of ${totalEmails} emails about ${websiteName}.`;
      
      if (tier === 'gold') {
        systemPrompt += ` Use premium AI capabilities to create exceptionally persuasive, personalized content with advanced storytelling techniques.`;
      } else if (tier === 'pro') {
        systemPrompt += ` Create high-quality, engaging content with strong persuasion techniques.`;
      }
      
      systemPrompt += ` This email should focus specifically on highlighting the following feature/benefit: "${focusItem}". Format any links as HTML <a> tags.`;

      // Build focused user message
      let userMessage = this.buildFocusedUserMessage({
        websiteData,
        websiteName,
        focusItem,
        emailNumber,
        totalEmails,
        industry,
        tone,
        keywordList,
        includeCta,
        affiliateLink,
        tier
      });

      // Track tokens
      const inputText = systemPrompt + userMessage;
      const estimatedInputTokens = this.estimateTokens(inputText);

      if (this.enableLogging) {
        console.log('🎯 Generating focused email:', {
          focusItem,
          emailNumber,
          model: modelConfig.model,
          tier: tier,
          estimatedInputTokens
        });
      }

      // Make the API call
      const result = await this.makeClaudeRequest({
        userMessage,
        systemPrompt,
        model: modelConfig.model,
        maxTokens: modelConfig.maxTokens,
        affiliateLink
      });

      // Calculate costs
      const estimatedOutputTokens = this.estimateTokens(result.subject + result.body);
      const totalTokens = estimatedInputTokens + estimatedOutputTokens;
      const estimatedCost = this.calculateCost(estimatedInputTokens, estimatedOutputTokens, modelConfig.model);

      return {
        ...result,
        usage: {
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
          totalTokens: totalTokens,
          estimatedCost: estimatedCost,
          model: modelConfig.model,
          modelDisplayName: modelConfig.displayName,
          focusItem: focusItem
        }
      };
      
    } catch (error) {
      console.error('Error generating focused email with Claude AI:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Build user message for regular email generation
   * @private
   */
  buildUserMessage({ websiteData, websiteName, industry, tone, keywordList, includeCta, affiliateLink, tier }) {
    let userMessage = `# WEBSITE INFORMATION\n`;
    
    if (websiteData) {
      userMessage += `
## Website Details
- Website Name: ${websiteName}
- Description: ${websiteData.description || 'A website offering solutions in the ' + industry + ' space.'}

## Product Information
${websiteData.valueProposition ? '- Main Value Proposition: ' + websiteData.valueProposition : ''}
${websiteData.productName ? '- Product Name: ' + websiteData.productName : ''}
`;

      if (websiteData.ingredients && websiteData.ingredients.length > 0) {
        userMessage += `
## Key Ingredients/Components
${websiteData.ingredients.map(ing => `- ${ing.name}${ing.description ? ': ' + ing.description : ''}`).join('\n')}
`;
      }

      userMessage += `
## Features and Benefits
- Features: ${websiteData.features?.join(', ') || 'Not specified'}
- Benefits: ${websiteData.benefits?.join(', ') || 'Not specified'}
`;

      if (websiteData.testimonials && websiteData.testimonials.length > 0) {
        userMessage += `
## Social Proof
${websiteData.testimonials.map(t => `- "${t.quote}" - ${t.author || 'Customer'}`).join('\n')}
`;
      }
    } else {
      userMessage += `- Website Name: ${websiteName}\n`;
    }
    
    userMessage += `
# EMAIL SPECIFICATIONS
- Industry: ${industry}
- Email Tone: ${tone}
- Keywords to emphasize: ${keywordList || 'None specified'}
- Include Call to Action: ${includeCta ? 'Yes' : 'No'}
- User Tier: ${tier} (affects content quality and personalization level)
`;

    if (affiliateLink && includeCta) {
      userMessage += `- Affiliate Link: ${affiliateLink}
IMPORTANT: In the call to action section, include this exact link formatted as an HTML anchor tag with compelling action-focused text:
<a href="${affiliateLink}">Get [product/benefit] now</a> or similar persuasive clickable text.
`;
    }

    // Add tier-specific instructions
    if (tier === 'gold') {
      userMessage += `
# PREMIUM TIER INSTRUCTIONS (Gold)
Create an exceptionally high-quality email with:
- Advanced personalization techniques
- Sophisticated persuasion psychology
- Premium storytelling elements  
- Detailed benefit explanations with emotional triggers
- Professional, polished language throughout
`;
    } else if (tier === 'pro') {
      userMessage += `
# PROFESSIONAL TIER INSTRUCTIONS (Pro)
Create a high-quality email with:
- Good personalization
- Strong persuasion techniques
- Clear benefit-focused messaging
- Professional tone and structure
`;
    }

    userMessage += `
# EMAIL CREATION INSTRUCTIONS
Create a persuasive marketing email with:

1. An attention-grabbing subject line that creates curiosity or highlights the main benefit
2. A personalized greeting
3. A compelling opening that immediately communicates value
4. Specific details about the product/service with emphasis on benefits (not just features)
5. Evidence of effectiveness (testimonials, statistics, or results if available)
6. ${includeCta ? 'Strong call to action with sense of urgency' + (affiliateLink ? ' using the affiliate link as an HTML <a> tag' : '') : 'Brief closing that reinforces main benefits'}
7. Professional signature

## Email Content Guidelines:
- Focus heavily on benefits to the reader, not just features
- Include the keywords naturally within the text
- Use the specified tone consistently throughout
- Create desire by emphasizing transformation, results, or outcomes
- Keep paragraphs short and scannable
- Use power words that evoke emotion and drive action
- If ingredients/components are provided, highlight their unique benefits
- Make the email feel personal and directly addressed to the reader

${affiliateLink && includeCta ? `
## Link Placement Instructions:
- Include the affiliate link (${affiliateLink}) as an HTML anchor tag in the call to action section
- Format: <a href="${affiliateLink}">[compelling action text]</a>
- The link text should be benefit-focused or action-oriented
- Create urgency around the link (limited time, exclusive offer, etc.)
` : ''}

Format the email with proper spacing between paragraphs for optimal readability.
`;

    return userMessage;
  }

  /**
   * Build user message for focused email generation
   * @private
   */
  buildFocusedUserMessage({ websiteData, websiteName, focusItem, emailNumber, totalEmails, industry, tone, keywordList, includeCta, affiliateLink, tier }) {
    let userMessage = `Website Information:\n`;
    
    if (websiteData) {
      userMessage += `
- Website Name: ${websiteName}
- Description: ${websiteData.description}
- Main Focus Feature/Benefit for this email: "${focusItem}"
`;
    } else {
      userMessage += `
- Website Name: ${websiteName}
- Main Focus Feature/Benefit for this email: "${focusItem}"
`;
    }
    
    userMessage += `
Additional Context:
- This is email #${emailNumber} in a series of ${totalEmails} emails
- Industry: ${industry}
- Email Tone: ${tone}
- Keywords to emphasize: ${keywordList || 'None specified'}
- Include Call to Action: ${includeCta ? 'Yes' : 'No'}
- User Tier: ${tier}
`;

    if (affiliateLink && includeCta) {
      userMessage += `- Affiliate Link: ${affiliateLink}
IMPORTANT: In the call to action section, include this exact link formatted as an HTML anchor tag:
<a href="${affiliateLink}">Learn more about ${focusItem}</a> or similar clickable text.
`;
    }

    // Add tier-specific focus instructions
    if (tier === 'gold') {
      userMessage += `
PREMIUM FOCUS INSTRUCTIONS:
Create an exceptionally detailed exploration of "${focusItem}" with:
- Deep psychological triggers related to this specific benefit
- Advanced storytelling around "${focusItem}"
- Multiple angles of how "${focusItem}" transforms the user's experience
- Sophisticated language and premium positioning
`;
    } else if (tier === 'pro') {
      userMessage += `
PROFESSIONAL FOCUS INSTRUCTIONS:
Create a high-quality focused email that:
- Explores "${focusItem}" from multiple beneficial angles
- Uses strong persuasion techniques specific to this feature/benefit
- Provides clear, compelling reasons why "${focusItem}" matters
`;
    }

    userMessage += `
Create a focused marketing email with:
1. Subject line that highlights "${focusItem}"
2. Brief mention that this is email #${emailNumber} in a series of ${totalEmails}
3. Introduction that introduces the focused feature/benefit
4. Detailed explanation of how "${focusItem}" benefits the user
5. ${includeCta ? 'Clear call to action' + (affiliateLink ? ` with the affiliate link <a href="${affiliateLink}">Learn more about ${focusItem}</a>` : '') : 'Brief closing'}
6. Professional closing

Keep the email concise and focused specifically on "${focusItem}" - don't dilute the message by covering other features or benefits.

Format the email with proper spacing between paragraphs. Keep it simple and professional.
`;

    return userMessage;
  }

  /**
   * Make the actual Claude API request with fallback
   * @private
   */
  async makeClaudeRequest({ userMessage, systemPrompt, model, maxTokens, affiliateLink }) {
    try {
      // First try with Axios
      const response = await this.client.post(this.apiUrl, {
        prompt: userMessage,
        systemPrompt: systemPrompt,
        model: model,
        maxTokens: maxTokens,
        apiKey: this.apiKey
      });
      
      if (this.enableLogging) {
        console.log('✅ Axios request successful:', {
          status: response.status,
          model: model
        });
      }
      
      let emailContent = this.extractContentFromResponse(response.data);
      return this.parseEmailContent(emailContent, affiliateLink);
      
    } catch (axiosError) {
      if (this.enableLogging) {
        console.warn('Axios request failed, trying fetch:', axiosError.message);
      }
      
      // Fallback to fetch
      const fetchResponse = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          systemPrompt: systemPrompt,
          model: model,
          maxTokens: maxTokens,
          apiKey: this.apiKey
        }),
        mode: 'cors'
      });
      
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        throw new Error(`Fetch API request failed with status: ${fetchResponse.status}. ${errorText}`);
      }
      
      const data = await fetchResponse.json();
      let emailContent = this.extractContentFromResponse(data);
      return this.parseEmailContent(emailContent, affiliateLink);
    }
  }

  /**
   * Extract content from Claude API response
   * @private
   */
  extractContentFromResponse(data) {
    if (data.content && data.content[0]) {
      return data.content[0].text;
    } else if (data.completion) {
      return data.completion;
    } else {
      return data.text || data.toString();
    }
  }

  /**
   * Estimate tokens for cost calculation
   * @private
   */
  estimateTokens(text) {
    if (!text) return 0;
    // More accurate estimation: ~3.5 characters per token + 10% overhead
    const baseTokens = Math.ceil(text.length / 3.5);
    return Math.ceil(baseTokens * 1.1);
  }

  /**
   * Calculate cost based on model and token usage
   * @private
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
   * @private
   */
  handleError(error) {
    let errorMessage = 'Failed to generate email with AI. ';
    
    if (error.message.includes('API key')) {
      errorMessage += 'API key issue: ' + error.message;
    } else if (error.message.includes('model')) {
      errorMessage += 'Model issue: ' + error.message;
    } else if (error.message.includes('status')) {
      errorMessage += 'Server error: ' + error.message;
    } else {
      errorMessage += 'Please try again or use template fallback.';
    }
    
    return new Error(errorMessage);
  }

  /**
   * Parse the email content from Claude AI to extract subject and body
   * @param {string} content - Raw content from Claude
   * @param {string} affiliateLink - Optional affiliate link to ensure is included
   * @returns {Object} - Parsed subject and body
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
    
    if (emailContent.includes(affiliateLink)) {
      return emailContent.replace(/\[(.*?)\]\((\S+?)\)/g, '<a href="$2">$1</a>');
    }
    
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
    
    return `${emailContent}\n\n<a href="${affiliateLink}">Learn more</a>`;
  }
  
  /**
   * Check if the Claude AI service is available
   */
  async isAvailable() {
    if (!this.apiUrl || !this.apiKey) return false;
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Hello",
          systemPrompt: "Reply with 'OK' only.",
          model: this.defaultModel,
          maxTokens: 10,
          apiKey: this.apiKey
        }),
        mode: 'cors'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Claude AI service check failed:', error);
      return false;
    }
  }

  /**
   * Get model information for a specific tier
   * @param {string} tier - User tier
   * @returns {Object} Model information
   */
  getModelInfo(tier = 'free') {
    return this.getModelForTier(tier);
  }
}

export default new ClaudeAIService();