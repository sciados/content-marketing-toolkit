// src/services/video2promo/nlpService.js
import claudeAIService from '../ai/claudeAIService.js';

class NLPService {
  constructor() {
    this.enableLogging = import.meta.env.VITE_ENABLE_API_LOGGING === 'true';
  }

  async extractBenefits(transcript, keywords = [], userTier = 'free') {
    try {
      if (this.enableLogging) {
        console.log('🧠 Extracting benefits for transcript:', {
          transcriptLength: transcript.length,
          keywords,
          userTier
        });
      }

      // Use Claude AI service's makeClaudeRequest method directly
      const prompt = this.buildBenefitExtractionPrompt(transcript, keywords);
      const systemPrompt = "You are an expert marketing analyst who extracts key benefits from video content. Always respond with valid JSON.";
      
      // Get model config for the user's tier
      const modelConfig = claudeAIService.getModelForTier(userTier);
      
      try {
        const response = await claudeAIService.makeClaudeRequest({
          userMessage: prompt,
          systemPrompt: systemPrompt,
          model: modelConfig.model,
          maxTokens: Math.min(1000, modelConfig.maxTokens),
          affiliateLink: ''
        });
        
        // The response from makeClaudeRequest returns {subject, body}
        // We need the body content for benefits
        const content = response.body || response.subject || JSON.stringify(response);
        return this.parseBenefits(content);
        
      } catch (claudeError) {
        if (this.enableLogging) {
          console.warn('Claude AI request failed:', claudeError.message);
        }
        
        // Fallback to mock data in development
        if (import.meta.env.DEV) {
          console.warn('🧪 Using mock benefits for development');
          return this.getMockBenefits(transcript, keywords);
        }
        
        throw claudeError;
      }

    } catch (error) {
      console.error('Error extracting benefits:', error);
      
      // Always fallback to mock data in development
      if (import.meta.env.DEV) {
        console.warn('🧪 Using mock benefits due to error');
        return this.getMockBenefits(transcript, keywords);
      }
      
      throw new Error(`Failed to extract benefits: ${error.message}`);
    }
  }

  buildBenefitExtractionPrompt(transcript, keywords) {
    const keywordText = keywords.length > 0 ? keywords.join(', ') : 'general benefits';
    
    return `Analyze this video transcript and extract 5-7 core benefits or value propositions that would appeal to potential customers.

Keywords to emphasize: ${keywordText}

Transcript:
${transcript}

Please return ONLY a valid JSON response in this exact format:
{
  "benefits": [
    {
      "title": "Clear benefit title (max 60 characters)",
      "description": "2-3 sentence description explaining the benefit in simple language",
      "supporting_text": "relevant quote from the transcript that supports this benefit",
      "confidence": 0.85
    }
  ]
}

Focus on concrete benefits that solve real problems. Use simple language that anyone can understand. Make sure the JSON is valid and properly formatted.`;
  }

  parseBenefits(response) {
    try {
      // Handle different response formats
      let content = response;
      if (typeof response === 'object' && response.content) {
        content = response.content;
      }
      
      // Clean up the response if it has markdown formatting or extra text
      if (typeof content === 'string') {
        // Look for JSON in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = jsonMatch[0];
        }
        
        // Remove markdown formatting
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      const parsed = JSON.parse(content);
      const benefits = parsed.benefits || [];
      
      if (this.enableLogging) {
        console.log('✅ Benefits extracted:', benefits.length, 'benefits found');
      }
      
      // Validate benefits structure
      const validBenefits = benefits.filter(benefit => 
        benefit.title && benefit.description && typeof benefit.confidence === 'number'
      );
      
      return validBenefits.length > 0 ? validBenefits : this.getMockBenefits('', []);
      
    } catch (error) {
      console.error('Failed to parse benefits JSON:', error);
      console.log('Raw response:', response);
      
      // Return mock benefits if parsing fails
      return this.getMockBenefits('', []);
    }
  }

  /**
   * Generate mock benefits for development/testing
   * @param {string} transcript - Video transcript
   * @param {Array} keywords - Keywords array
   * @returns {Array} - Mock benefits
   */
  getMockBenefits(transcript, keywords) {
    const mockBenefits = [
      {
        title: "Save Time and Increase Productivity",
        description: "This solution dramatically reduces the time spent on repetitive tasks, allowing you to focus on what matters most. Users typically see 40-60% time savings within the first week.",
        supporting_text: "This product will revolutionize the way you work and save you countless hours.",
        confidence: 0.9
      },
      {
        title: "Cutting-Edge Technology Advantage", 
        description: "Leverage the latest technological innovations to stay ahead of the competition. Our advanced algorithms and AI-driven features provide superior results compared to traditional methods.",
        supporting_text: "With our cutting-edge technology, you'll achieve results faster than ever before.",
        confidence: 0.85
      },
      {
        title: "Proven Track Record of Success",
        description: "Join a community of satisfied customers who have already transformed their business. Our solution has been tested and proven by thousands of users across various industries.",
        supporting_text: "Join thousands of satisfied customers who have transformed their business.",
        confidence: 0.8
      },
      {
        title: "Limited-Time Opportunity",
        description: "This exclusive offer won't last forever. Take advantage of special pricing and bonuses available only to early adopters and committed users.",
        supporting_text: "Don't miss out on this limited-time opportunity to change your life.",
        confidence: 0.75
      },
      {
        title: "Easy to Implement and Use",
        description: "Get started quickly with our user-friendly interface and comprehensive onboarding process. No technical expertise required - anyone can achieve professional results.",
        supporting_text: "Welcome to this amazing product demonstration.",
        confidence: 0.7
      }
    ];

    // Filter based on keywords if provided
    if (keywords && keywords.length > 0) {
      return mockBenefits.filter(benefit => 
        keywords.some(keyword => 
          benefit.title.toLowerCase().includes(keyword.toLowerCase()) ||
          benefit.description.toLowerCase().includes(keyword.toLowerCase())
        )
      ).slice(0, 5);
    }

    return mockBenefits.slice(0, 5);
  }

  /**
   * Check if Claude AI service is available
   * @returns {boolean} - Whether service is configured
   */
  async isServiceAvailable() {
    try {
      return await claudeAIService.isAvailable();
    } catch (error) {
      console.error('Error checking Claude AI availability:', error);
      return false;
    }
  }

  /**
   * Get service status for debugging
   * @returns {Object} - Service status information
   */
  async getServiceStatus() {
    const available = await this.isServiceAvailable();
    return {
      available,
      service: !!claudeAIService,
      hasApiUrl: !!claudeAIService.apiUrl,
      hasApiKey: !!claudeAIService.apiKey,
      enableLogging: this.enableLogging
    };
  }
}

export const nlpService = new NLPService();