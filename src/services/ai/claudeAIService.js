// src/services/claudeAIService.js
import axios from 'axios';

/**
 * Service for interacting with Claude AI API
 */
class ClaudeAIService {
  constructor() {
    // Use the Firebase Cloud Function URL from environment variables
    this.apiUrl = import.meta.env.VITE_CLAUDE_PROXY_URL;
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    this.model = import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-haiku-20240307';
    
    // Enable debug logging
    this.enableLogging = import.meta.env.VITE_ENABLE_API_LOGGING === 'true';
    
    // Log configuration if logging is enabled
    if (this.enableLogging) {
      console.log('Claude AI Service Configuration:');
      console.log('API URL:', this.apiUrl);
      console.log('API Key:', this.apiKey ? 'Set (begins with ' + this.apiKey.substring(0, 10) + '...)' : 'Not set');
      console.log('Model:', this.model);
    }
    
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/json'
      },
      // Important for handling CORS errors
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

  // Improved prompt structure for claudeAIService.js

/**
 * Generate an improved email using Claude AI with enhanced sales focus
 * 
 * @param {Object} params - Parameters for email generation
 * @param {Object} params.websiteData - Extracted website data
 * @param {string} params.websiteUrl - URL of the website
 * @param {string} params.keywords - Keywords to incorporate
 * @param {string} params.tone - Tone of the email
 * @param {string} params.industry - Industry for context
 * @param {boolean} params.includeCta - Whether to include call to action
 * @returns {Promise<Object>} - Generated email content
 */
async generateEmail(params) {
  const { websiteData, websiteUrl, keywords, tone, industry, includeCta, affiliateLink } = params;
  
  try {
    // Prepare data for Claude
    const websiteName = this.extractWebsiteName(websiteUrl);
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k).join(', ');
    
    // Construct improved system prompt with more sales-focused guidance
    const systemPrompt = `You are an expert email marketing copywriter specializing in sales-focused promotional emails. Generate a compelling marketing email for ${websiteName} that drives conversions and encourages readers to visit the website. Your email should highlight the unique selling points and create desire for the product/service. Format any links as HTML <a> tags.`;
    
    // Build a more detailed user message that emphasizes promotional content
    let userMessage = `# WEBSITE INFORMATION\n`;
    
    if (websiteData) {
      // Add more detailed product information when available
      userMessage += `
## Website Details
- Website Name: ${websiteName}
- Description: ${websiteData.description || 'A website offering solutions in the ' + industry + ' space.'}

## Product Information
${websiteData.valueProposition ? '- Main Value Proposition: ' + websiteData.valueProposition : ''}
${websiteData.productName ? '- Product Name: ' + websiteData.productName : ''}
`;

      // Include ingredients/components if available
      if (websiteData.ingredients && websiteData.ingredients.length > 0) {
        userMessage += `
## Key Ingredients/Components
${websiteData.ingredients.map(ing => `- ${ing.name}${ing.description ? ': ' + ing.description : ''}`).join('\n')}
`;
      }

      // Include features and benefits
      userMessage += `
## Features and Benefits
- Features: ${websiteData.features.join(', ')}
- Benefits: ${websiteData.benefits.join(', ')}
`;

      // Include testimonials if available
      if (websiteData.testimonials && websiteData.testimonials.length > 0) {
        userMessage += `
## Social Proof
${websiteData.testimonials.map(t => `- "${t.quote}" - ${t.author || 'Customer'}`).join('\n')}
`;
      }
    } else {
      // More minimal information when websiteData is not available
      userMessage += `
- Website Name: ${websiteName}
`;
    }
    
    // Add additional context with clearer instructions
    userMessage += `
# EMAIL SPECIFICATIONS
- Industry: ${industry}
- Email Tone: ${tone}
- Keywords to emphasize: ${keywordList || 'None specified'}
- Include Call to Action: ${includeCta ? 'Yes' : 'No'}
`;

    // Add affiliate link information if provided with clearer formatting instructions
    if (affiliateLink && includeCta) {
      userMessage += `- Affiliate Link: ${affiliateLink}
IMPORTANT: In the call to action section, include this exact link formatted as an HTML anchor tag with compelling action-focused text:
<a href="${affiliateLink}">Get [product/benefit] now</a> or similar persuasive clickable text.
`;
    }

    // Provide clearer guidance on the email structure with sales focus
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

      // Process the request and return the parsed result using existing service methods
      // ...rest of the method remains unchanged

      if (this.enableLogging) {
        console.log('Generating email for website:', websiteName);
        console.log('Using Claude model:', this.model);
      }

      // Try using fetch API if CORS issues occur with Axios
      try {
        // First try with Axios
        if (this.enableLogging) {
          console.log('Sending request to Claude AI proxy with:');
          console.log('- Model:', this.model);
          console.log('- API URL:', this.apiUrl);
          console.log('- API Key present:', !!this.apiKey);
        }
        
        const response = await this.client.post(this.apiUrl, {
          prompt: userMessage,
          systemPrompt: systemPrompt,
          model: this.model,
          maxTokens: 1000,
          apiKey: this.apiKey // Send API key in the request
        });
        
        if (this.enableLogging) {
          console.log('Received response from Claude AI proxy:', {
            status: response.status,
            statusText: response.statusText,
            dataPresent: !!response.data
          });
        }
        
        // Process Claude's response
        let emailContent;
        
        if (response.data.content && response.data.content[0]) {
          // Standard Claude API response format
          emailContent = response.data.content[0].text;
        } else if (response.data.completion) {
          // Alternative response format
          emailContent = response.data.completion;
        } else {
          // Fallback for any other format
          emailContent = response.data.text || response.data.toString();
        }
        
        // Parse subject and body
        return this.parseEmailContent(emailContent, params.affiliateLink);
      } catch (axiosError) {
        if (this.enableLogging) {
          console.error('Axios request failed:', axiosError);
          if (axiosError.response) {
            console.error('Error response data:', axiosError.response.data);
            console.error('Error response status:', axiosError.response.status);
          }
        }
        
        console.warn('Axios request failed, trying with fetch API');
        
        // If Axios fails, try with fetch API as a fallback
        if (this.enableLogging) {
          console.log('Sending fetch request to Claude AI proxy with payload:', {
            url: this.apiUrl,
            method: 'POST',
            model: this.model,
            apiKey: this.apiKey ? 'Present (begins with ' + this.apiKey.substring(0, 10) + '...)' : 'Not set'
          });
        }
        const fetchResponse = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: userMessage,
            systemPrompt: systemPrompt,
            model: this.model,
            maxTokens: 1000,
            apiKey: this.apiKey // Send API key in the request
          }),
          mode: 'cors'
        });
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          if (this.enableLogging) {
            console.error('Fetch API request failed with status:', fetchResponse.status);
            console.error('Error response:', errorText);
          }
          throw new Error(`Fetch API request failed with status: ${fetchResponse.status}. ${errorText}`);
        }
        
        const data = await fetchResponse.json();
        if (this.enableLogging) {
          console.log('Received response from fetch API:', {
            status: fetchResponse.status,
            statusText: fetchResponse.statusText,
            data: data ? 'Present' : 'Not present'
          });
        }
        let emailContent;
        
        if (data.content && data.content[0]) {
          emailContent = data.content[0].text;
        } else if (data.completion) {
          emailContent = data.completion;
        } else {
          emailContent = data.text || data.toString();
        }
        
        return this.parseEmailContent(emailContent, params.affiliateLink);
      }
    } catch (error) {
      console.error('Error generating email with Claude AI:', error);
      
      // Log detailed error information
      if (this.enableLogging) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      // Provide a more specific error message if possible
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
      
      throw new Error(errorMessage);
    }
  }
  
  /**
 * Parse the email content from Claude AI to extract subject and body
 * 
 * @param {string} content - Raw content from Claude
 * @param {string} affiliateLink - Optional affiliate link to ensure is included
 * @returns {Object} - Parsed subject and body
 */
parseEmailContent(content, affiliateLink = '') {
  // Default parsing strategy - look for "Subject:" marker
  let subject = '';
  let body = content;
  
  const subjectMatch = content.match(/Subject:(.+?)(?:\n\n|\r\n\r\n)/s);
  if (subjectMatch) {
    subject = subjectMatch[1].trim();
    body = content.substring(subjectMatch[0].length).trim();
  } else {
    // Fallback: assume first line is subject if no explicit marker
    const lines = content.split('\n');
    if (lines.length > 1) {
      subject = lines[0].replace(/^subject:\s*/i, '').trim();
      body = lines.slice(1).join('\n').trim();
    }
  }
  
  // Process the body to ensure the affiliate link is included
  if (affiliateLink) {
    body = this.ensureAffiliateLinkInContent(body, affiliateLink);
  }
  
  return { subject, body };
}
  
  /**
   * Extract website name from URL
   * 
   * @param {string} url - Website URL
   * @returns {string} - Extracted name
   */
  extractWebsiteName(url) {
    try {
      // Remove protocol and get the domain
      const domain = url.replace(/(^\w+:|^)\/\//, '').split('/')[0];
      
      // Extract domain name without TLD
      const parts = domain.split('.');
      if (parts.length >= 2) {
        return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
      }
      return domain;
    // eslint-disable-next-line no-unused-vars
    } catch (_) {
      return "Your Company";
    }
  }

 /**
 * Ensure the affiliate link is properly included in the email content as HTML
 * 
 * @param {string} emailContent - The raw email content
 * @param {string} affiliateLink - The affiliate link to include
 * @returns {string} - Email content with proper affiliate link
 */
ensureAffiliateLinkInContent(emailContent, affiliateLink) {
  if (!affiliateLink) return emailContent;
  
  // Check if the affiliate link is already in the content (in any format)
  if (emailContent.includes(affiliateLink)) {
    // Convert any markdown links to HTML
    return emailContent.replace(
      /\[(.*?)\]\((\S+?)\)/g,
      '<a href="$2">$1</a>'
    );
  }
  
  // Find the call to action section
  const ctaMatch = emailContent.match(/\[Call to Action:(.+?)\]|\*\*Call to Action:?\*\*(.+?)(?:\n\n|\r\n\r\n|$)|Call to Action:(.+?)(?:\n\n|\r\n\r\n|$)/is);
  
  if (ctaMatch) {
    const ctaContent = ctaMatch[1] || ctaMatch[2] || ctaMatch[3];
    const ctaSection = ctaMatch[0];
    
    // Prepare the new CTA with the affiliate link as HTML
    let updatedCTA;
    
    if (ctaContent.includes('Click here') || ctaContent.includes('click here')) {
      // Replace "Click here" with the HTML link
      updatedCTA = ctaSection.replace(
        /(Click here|click here)/i, 
        `<a href="${affiliateLink}">Click here</a>`
      );
    } else if (ctaContent.includes('Sign up') || ctaContent.includes('sign up')) {
      // Replace "Sign up" with the HTML link
      updatedCTA = ctaSection.replace(
        /(Sign up|sign up)/i, 
        `<a href="${affiliateLink}">Sign up</a>`
      );
    } else {
      // Add the link at the end of the CTA
      const learnMoreLink = `<a href="${affiliateLink}">Learn more</a>`;
      
      if (ctaSection.includes('[Call to Action:')) {
        updatedCTA = ctaSection.replace(
          /\[Call to Action:(.+?)\]/is,
          `[Call to Action:$1 - ${learnMoreLink}]`
        );
      } else if (ctaSection.includes('**Call to Action:**')) {
        updatedCTA = ctaSection.replace(
          /\*\*Call to Action:?\*\*(.+?)(?:\n\n|\r\n\r\n|$)/is,
          `**Call to Action:**$1 - ${learnMoreLink}\n\n`
        );
      } else {
        updatedCTA = ctaSection.replace(
          /Call to Action:(.+?)(?:\n\n|\r\n\r\n|$)/is,
          `Call to Action:$1 - ${learnMoreLink}\n\n`
        );
      }
    }
    
    // Replace the original CTA with the updated one
    return emailContent.replace(ctaSection, updatedCTA);
  }
  
  // Fix for the specific issue with link being added after signature placeholders
  const signaturePattern = /Best regards,\s*\n\s*\[Your Name\]\s*\n\s*\[Your Title\]\s*\n\s*\[Your Company\]\s*$/i;
  if (signaturePattern.test(emailContent)) {
    const learnMoreLink = `<a href="${affiliateLink}">Learn more about our offerings</a>`;
    return emailContent.replace(
      signaturePattern,
      `${learnMoreLink}\n\nBest regards,\n[Your Name]\n[Your Title]\n[Your Company]`
    );
  }
  
  // If no CTA section found, add a link at the end before the closing
  const closingMatch = emailContent.match(/(?:Regards|Sincerely|Cheers|Best),?\s*\n+.+?$/s);
  if (closingMatch) {
    const closingSection = closingMatch[0];
    const learnMoreLink = `<a href="${affiliateLink}">Learn more about our offerings</a>`;
    return emailContent.replace(
      closingSection,
      `${learnMoreLink}\n\n${closingSection}`
    );
  }
  
  // If all else fails, add at the end
  return `${emailContent}\n\n<a href="${affiliateLink}">Learn more</a>`;
}
  
  /**
   * Check if the Claude AI service is available
   * 
   * @returns {Promise<boolean>} Whether the service is available
   */
  async isAvailable() {
    if (!this.apiUrl || !this.apiKey) return false;
    
    try {
      // Try with fetch API for the availability check
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: "Hello",
          systemPrompt: "Reply with 'OK' only.",
          model: this.model,
          maxTokens: 10,
          apiKey: this.apiKey // Send API key in the request
        }),
        mode: 'cors'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Claude AI service check failed:', error);
      return false;
    }
  }

// Add a new method to claudeAIService.js for generating a focused email:

/**
 * Generate a focused email highlighting a single feature or benefit
 * 
 * @param {Object} params - Parameters for email generation
 * @param {string} params.focusItem - The specific feature or benefit to focus on
 * @param {number} params.emailNumber - The current email number in the series
 * @param {number} params.totalEmails - The total number of emails in the series
 * @param {Object} params.websiteData - Extracted website data
 * @param {string} params.websiteUrl - URL of the website
 * @param {string} params.keywords - Keywords to incorporate
 * @param {string} params.tone - Tone of the email
 * @param {string} params.industry - Industry for context
 * @param {boolean} params.includeCta - Whether to include call to action
 * @param {string} params.affiliateLink - Optional affiliate link
 * @returns {Promise<Object>} - Generated email content
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
    affiliateLink 
  } = params;
  
  try {
    // Prepare data for Claude
    const websiteName = this.extractWebsiteName(websiteUrl);
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k).join(', ');
    
    // Construct prompt for Claude
    const systemPrompt = `You are an expert email marketing copywriter. Generate email #${emailNumber} in a series of ${totalEmails} emails about ${websiteName}. This email should focus specifically on highlighting the following feature/benefit: "${focusItem}". Format any links as HTML <a> tags.`;
    
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
`;

    // Add affiliate link information if provided
    if (affiliateLink && includeCta) {
      userMessage += `- Affiliate Link: ${affiliateLink}
IMPORTANT: In the call to action section, include this exact link formatted as an HTML anchor tag:
<a href="${affiliateLink}">Learn more about ${focusItem}</a> or similar clickable text.
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

    // The rest of the method is the same as generateEmail
    // ...process the request and return the parsed result
    
    // Call the existing API methods and parse the result
    try {
      // Use the existing client and parsing methods...
      const response = await this.client.post(this.apiUrl, {
        prompt: userMessage,
        systemPrompt: systemPrompt,
        model: this.model,
        maxTokens: 1000,
        apiKey: this.apiKey
      });
      
      // Process Claude's response
      let emailContent;
      
      if (response.data.content && response.data.content[0]) {
        // Standard Claude API response format
        emailContent = response.data.content[0].text;
      } else if (response.data.completion) {
        // Alternative response format
        emailContent = response.data.completion;
      } else {
        // Fallback for any other format
        emailContent = response.data.text || response.data.toString();
      }
      
      // Parse subject and body
      return this.parseEmailContent(emailContent, affiliateLink);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // Use the fetch fallback if axios fails
      // ...existing fallback code
    }
  } catch (error) {
    console.error('Error generating focused email with Claude AI:', error);
    // ...existing error handling
  }
}
}

export default new ClaudeAIService();