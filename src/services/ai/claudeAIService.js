// src/services/ai/claudeAIService.js - Updated with Video2Promo support

import axios from 'axios';

/**
 * Service for interacting with Claude AI API with tier-based model selection
 * Updated for Video2Promo benefit extraction and email generation
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
      console.log('🤖 Claude AI Service Configuration:');
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
      console.warn('⚠️ Claude AI proxy URL not set. Email generation may fail.');
    }
    
    // Log if the API key is not set
    if (!this.apiKey) {
      console.warn('⚠️ Claude API key not set. Email generation may fail.');
    }
  }

  /**
   * Get the appropriate model configuration for a user's subscription tier
   */
  getModelForTier(userTier = 'free') {
    const config = this.tierModels[userTier] || this.tierModels.free;
    
    if (this.enableLogging) {
      console.log(`🎯 Selected ${config.displayName} for ${userTier} tier user`);
      console.log('Model features:', config.features);
    }
    
    return config;
  }

  /**
   * NEW: Generate content using Claude AI (for Video2Promo benefit extraction)
   */
  async generateContent(prompt, options = {}) {
    try {
      const {
        temperature = 0.7,
        maxTokens = 4000,
        tier = 'free'
      } = options;

      // Get model configuration for tier
      const modelConfig = this.getModelForTier(tier);
      const selectedModel = modelConfig.model;

      if (this.enableLogging) {
        console.log('🤖 Claude AI Debug Information:');
        console.log('- Prompt length:', prompt.length);
        console.log('- User tier:', tier);
        console.log('- Selected model:', selectedModel);
        console.log('- Max tokens:', maxTokens);
        console.log('- Temperature:', temperature);
        console.log('- First 200 chars of prompt:', prompt.substring(0, 200) + '...');
        
        // Check if prompt contains actual transcript data
        const hasTranscriptData = prompt.includes('TRANSCRIPT TO ANALYZE:') && 
                                 prompt.length > 1000 && 
                                 !prompt.includes('template') && 
                                 !prompt.includes('example');
        
        console.log('- Contains real transcript data:', hasTranscriptData);
        
        if (!hasTranscriptData) {
          console.warn('⚠️ Warning: Prompt appears to lack real transcript data');
        }
      }

      // Make the API call using existing method
      const response = await this.makeDirectClaudeRequest({
        prompt: prompt,
        model: selectedModel,
        maxTokens: maxTokens,
        temperature: temperature
      });

      if (this.enableLogging) {
        console.log('✅ Claude Response received, length:', response.content?.[0]?.text?.length || 0);
        
        if (response.content?.[0]?.text) {
          const responseText = response.content[0].text;
          console.log('🔍 Response analysis:');
          console.log('- Contains JSON:', responseText.includes('{') && responseText.includes('}'));
          console.log('- Contains "benefits":', responseText.toLowerCase().includes('benefits'));
          console.log('- Contains "template":', responseText.toLowerCase().includes('template'));
          console.log('- First 200 chars:', responseText.substring(0, 200));
        }
      }

      if (response.content && response.content[0] && response.content[0].text) {
        const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);
        
        return {
          success: true,
          content: response.content[0].text,
          tokensUsed: tokensUsed,
          model: selectedModel,
          usage: response.usage
        };
      } else {
        throw new Error('Invalid response format from Claude API');
      }
      
    } catch (error) {
      console.error('❌ Claude AI Service Error:', error);
      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  }

  /**
   * NEW: Make direct API request to Claude (for Video2Promo)
   */
  async makeDirectClaudeRequest(params) {
    const { prompt, model, maxTokens, temperature = 0.7 } = params;

    try {
      // Try with your existing proxy first
      const response = await this.client.post(this.apiUrl, {
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [{
          role: 'user',
          content: prompt
        }],
        apiKey: this.apiKey
      });

      if (this.enableLogging) {
        console.log('✅ Direct Claude API request successful:', {
          status: response.status,
          model: model
        });
      }

      return response.data;

    } catch (axiosError) {
      if (this.enableLogging) {
        console.warn('❌ Direct Claude request failed:', axiosError.message);
      }

      // Fallback to fetch
      const fetchResponse = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: maxTokens,
          temperature: temperature,
          messages: [{
            role: 'user',
            content: prompt
          }],
          apiKey: this.apiKey
        }),
        mode: 'cors'
      });

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        console.error('❌ Claude API Error:', errorText);
        throw new Error(`Claude API error: ${fetchResponse.status} - ${errorText}`);
      }

      const data = await fetchResponse.json();
      
      if (this.enableLogging) {
        console.log('✅ Fetch Claude API request successful');
      }

      return data;
    }
  }

  /**
   * Generate a focused email highlighting a single feature or benefit
   * Updated for 5th grade reading level and affiliate marketing focus
   */
  async generateFocusedEmail(params) {
    const { 
      focusItem, 
      emailNumber, 
      totalEmails, 
      websiteData, 
      websiteUrl, 
      keywords, // Kept for backwards compatibility
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
    
    // Use keywords in debug log to avoid unused variable warning
    if (this.enableLogging && keywords) {
      console.log('Keywords provided (for future use):', keywords);
    }
    
    try {
      // Get the appropriate model for the user's tier
      const tier = userTier || user?.subscription_tier || 'free';
      const modelConfig = this.getModelForTier(tier);
      
      const websiteName = this.extractWebsiteName(websiteUrl);
      
      // Enhanced system prompt for 5th grade reading level
      let systemPrompt = `You are an expert email marketing copywriter who specializes in creating promotional affiliate marketing emails written at a 5th grade reading level.

CRITICAL REQUIREMENTS:
- Write ALL content at a 5th grade reading level (simple words, short sentences)
- Keep email between ${wordLimit.min}-${wordLimit.max} words total
- Subject line must be under ${subjectLimit} characters
- Use simple, everyday words that a 10-year-old would understand
- Avoid complex words, industry jargon, or technical terms
- Keep sentences short and clear
- Focus on benefits, not features
- Use ${structure} structure

EMAIL STRUCTURE REQUIRED:
1. Short, catchy subject line (under ${subjectLimit} characters)
2. Opening that explains a common problem or need
3. Middle that describes how the product solves that problem
4. Strong call to action with the affiliate link
5. Simple, friendly closing

TONE: Write in a ${tone} tone while keeping language simple and clear.
READING LEVEL: ${readingLevel}
INCLUDE CTA: ${includeCta ? 'Yes' : 'No'}`;

      if (tier === 'gold') {
        systemPrompt += ` Use premium persuasion techniques but keep language at 5th grade level.`;
      } else if (tier === 'pro') {
        systemPrompt += ` Use professional persuasion while maintaining simple language.`;
      }

      // Build user message for 5th grade level
      let userMessage = this.buildFifthGradeUserMessage({
        websiteData,
        websiteName,
        focusItem,
        emailNumber,
        totalEmails,
        industry,
        tone,
        includeCta,
        affiliateLink,
        tier,
        wordLimit,
        subjectLimit
      });

      // Track tokens
      const inputText = systemPrompt + userMessage;
      const estimatedInputTokens = this.estimateTokens(inputText);

      if (this.enableLogging) {
        console.log('🎯 Generating 5th grade focused email:', {
          focusItem,
          emailNumber,
          model: modelConfig.model,
          tier: tier,
          estimatedInputTokens,
          wordLimit,
          readingLevel
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
          focusItem: focusItem,
          readingLevel: '5th grade',
          wordCount: this.countWords(result.body)
        }
      };
      
    } catch (error) {
      console.error('Error generating focused email with Claude AI:', error);
      throw this.handleError(error);
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
   * Build user message for 5th grade reading level emails
   */
  buildFifthGradeUserMessage({ websiteData, websiteName, focusItem, emailNumber, totalEmails, industry, tone, includeCta, affiliateLink, tier, wordLimit, subjectLimit }) {
    // Use websiteData in debug log to avoid unused variable warning
    if (this.enableLogging && websiteData) {
      console.log('Website data available for context:', !!websiteData);
    }
    
    let userMessage = `# EMAIL ASSIGNMENT

Create a promotional affiliate marketing email about "${focusItem}" for ${websiteName}.

## WEBSITE INFORMATION
- Website Name: ${websiteName}
- Main Benefit Focus: "${focusItem}"
- Industry: ${industry}
- Email ${emailNumber} of ${totalEmails} in series

## 5TH GRADE READING LEVEL REQUIREMENTS
CRITICAL: Write everything at a 5th grade reading level.

USE SIMPLE WORDS ONLY:
- Say "get" not "obtain" or "acquire"
- Say "help" not "assist" or "facilitate" 
- Say "make better" not "enhance" or "improve"
- Say "start" not "commence" or "begin"
- Say "hard" not "difficult" or "challenging"
- Say "show" not "demonstrate" or "illustrate"
- Say "buy" not "purchase" or "invest in"
- Say "great" not "excellent" or "exceptional"
- Say "many" not "numerous" or "multiple"
- Say "change" not "transform" or "modify"

SENTENCE RULES:
- Keep sentences short (under 15 words each)
- Use simple sentence structure
- One idea per sentence
- No complex grammar

## EMAIL STRUCTURE (${wordLimit.min}-${wordLimit.max} words total)

### 1. SUBJECT LINE (under ${subjectLimit} characters)
Create a short, catchy subject that:
- Uses simple words a 10-year-old knows
- Creates curiosity about the benefit
- Stays under ${subjectLimit} characters
- Makes people want to open the email

### 2. OPENING (20-40 words)
Start with a common problem that relates to "${focusItem}":
- Ask a simple question about their problem
- Use words everyone understands  
- Make them feel understood
- Connect to their daily life

### 3. MIDDLE SECTION (60-120 words)
Explain how ${websiteName} solves their problem:
- Use simple words to describe the solution
- Focus on benefits they can understand
- Keep sentences short and clear
- Make it sound easy to use
- Show how it helps with "${focusItem}"
- Add social proof with simple language

### 4. CALL TO ACTION (20-40 words)`;

    if (includeCta) {
      userMessage += `
Create urgency with the affiliate link:`;
      
      if (affiliateLink) {
        userMessage += `
- Include this exact link: ${affiliateLink}
- Format as HTML: <a href="${affiliateLink}">simple action words</a>
- Use action words like "Get this now" or "Try it today"
- Create urgency but keep language simple`;
      } else {
        userMessage += `
- Use placeholder: [AffiliateLinkHere]
- Format as HTML: <a href="[AffiliateLinkHere]">simple action words</a>
- Use action words like "Get this now" or "Try it today"`;
      }
    } else {
      userMessage += `
Create a simple closing statement without links.`;
    }

    userMessage += `

### 5. CLOSING (10-20 words)
Simple, friendly closing that matches ${tone} tone.

## TONE REQUIREMENTS
Write in ${tone} tone while keeping language simple:`;

    if (tone === 'persuasive') {
      userMessage += `
- Sound helpful and encouraging
- Make them want to try it
- Build excitement about the benefit`;
    } else if (tone === 'urgent') {
      userMessage += `
- Create urgency with simple words
- Make them feel they need to act fast
- Use words like "hurry" and "don't wait"`;
    } else if (tone === 'professional') {
      userMessage += `
- Sound trustworthy and reliable
- Be helpful but professional
- Keep it business-like but simple`;
    } else if (tone === 'friendly') {
      userMessage += `
- Sound like a helpful friend
- Be warm and caring
- Use casual, simple language`;
    } else if (tone === 'educational') {
      userMessage += `
- Teach them something new
- Explain things simply
- Help them understand the benefit`;
    }

    // Add tier-specific instructions
    if (tier === 'gold') {
      userMessage += `

## PREMIUM TIER INSTRUCTIONS (Gold)
Create exceptional quality while keeping 5th grade reading level:
- Use more persuasive simple words
- Add emotional simple language
- Create stronger desire for the benefit
- Use premium but simple positioning`;
    } else if (tier === 'pro') {
      userMessage += `

## PROFESSIONAL TIER INSTRUCTIONS (Pro)  
Create high quality while keeping 5th grade reading level:
- Use strong but simple persuasion
- Add good emotional triggers
- Make the benefit very appealing
- Professional but simple language`;
    }

    userMessage += `

## FINAL REMINDERS
- Total email: ${wordLimit.min}-${wordLimit.max} words
- Subject: Under ${subjectLimit} characters  
- Reading level: 5th grade (10-year-old can understand)
- Focus: How "${focusItem}" helps solve their problem
- Structure: Problem → Solution → Call to Action
- Language: Simple, clear, no big words

Format the response with:
Subject: [your subject line]

[email body with proper spacing]`;

    return userMessage;
  }

  /**
   * Make the actual Claude API request with fallback
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
   */
  estimateTokens(text) {
    if (!text) return 0;
    // More accurate estimation: ~3.5 characters per token + 10% overhead
    const baseTokens = Math.ceil(text.length / 3.5);
    return Math.ceil(baseTokens * 1.1);
  }

  /**
   * Calculate cost based on model and token usage
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
    
    if (error.message.includes('API key')) {
      errorMessage += 'API key issue: ' + error.message;
    } else if (error.message.includes('model')) {
      errorMessage += 'Model issue: ' + error.message;
    } else if (error.message.includes('status')) {
      errorMessage += 'Server error: ' + error.message;
    } else {
      errorMessage += 'Please try again or check AI service configuration.';
    }
    
    return new Error(errorMessage);
  }

  /**
   * Parse the email content from Claude AI to extract subject and body
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
   * Check if the Claude AI service is available
   */
  async isAvailable() {
    if (!this.apiUrl || !this.apiKey) {
      console.warn('Claude AI service not properly configured');
      return false;
    }
    
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
      
      const isOk = response.ok;
      if (this.enableLogging) {
        console.log('Claude AI availability check:', isOk ? 'Available' : 'Unavailable');
      }
      
      return isOk;
    } catch (error) {
      console.error('Claude AI service check failed:', error);
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

// Export a single instance and the class for Video2Promo compatibility
const claudeAIService = new ClaudeAIService();

export { claudeAIService };
export default claudeAIService;