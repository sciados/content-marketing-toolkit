// src/services/video2promo/nlpService.js - UPDATED for centralized API architecture

import { emailApi } from '../api'; // Use centralized API

class NLPService {
  constructor() {
    this.maxTranscriptLength = 8000; // Limit for API calls
  }

  /**
   * MAIN BRIDGE METHOD: Convert Video2Promo transcript to Email Generator format
   * This allows video benefits to be processed by your existing email generation system
   */
  async convertTranscriptToEmailFormat(transcript, videoData, options = {}) {
    try {
      console.log('🔗 Converting Video2Promo transcript to Email Generator format...');
      console.log('🎥 Video data:', videoData?.title || 'Unknown video');
      console.log('⚙️ Options:', options);
      
      // 1. Prepare transcript text
      const transcriptText = this.prepareTranscriptText(transcript);
      
      if (!transcriptText || transcriptText.length < 100) {
        throw new Error('Transcript too short or empty for analysis');
      }
      
      console.log('✅ Prepared transcript text length:', transcriptText.length);
      console.log('📝 Sample content:', transcriptText.substring(0, 200) + '...');
      
      // 2. Use backend API to analyze transcript for page scanning
      // Convert video data to a format that looks like a webpage for the backend
      const mockWebpageData = {
        url: videoData?.url || 'https://youtube.com/video',
        title: videoData?.title || 'Video Content',
        content: transcriptText,
        domain: videoData?.channelName || 'YouTube Video'
      };
      
      console.log('🤖 Calling backend API for transcript analysis...');
      
      // Use the scanPage API to analyze the transcript content
      const response = await emailApi.scanPage({
        url: mockWebpageData.url,
        keywords: options.keywords || '',
        industry: options.industry || 'general'
      });
      
      if (!response.success) {
        console.error('❌ Backend API analysis failed:', response.error);
        // Use fallback content extraction instead of throwing error
        return this.fallbackContentExtraction(transcriptText, videoData, options);
      }
      
      console.log('✅ Backend API response received');
      console.log('📄 Benefits found:', response.benefits?.length || 0);
      
      // 3. Process backend response
      if (!response.benefits || response.benefits.length === 0) {
        console.warn('⚠️ No benefits from backend API, using fallback');
        return this.fallbackContentExtraction(transcriptText, videoData, options);
      }
      
      console.log('✅ Extracted', response.benefits.length, 'benefits from backend analysis');
      
      // 4. Format response for email generator compatibility
      const websiteData = {
        url: videoData?.url || '',
        title: videoData?.title || 'YouTube Video Content',
        domain: videoData?.channelName || 'YouTube Video',
        name: videoData?.title || 'Video Content',
        description: videoData?.description || 'Marketing insights from video transcript',
        word_count: transcriptText.length,
        analyzed_at: new Date().toISOString()
      };
      
      console.log('📊 Formatted response structure:', {
        benefits: response.benefits.length,
        features: response.features?.length || 0,
        websiteDataName: websiteData.name
      });
      
      // 5. Return in email generator format
      return {
        success: true,
        benefits: response.benefits,
        features: response.features || [],
        websiteData: websiteData,
        conversionMetadata: {
          originalBenefitCount: response.benefits.length,
          finalBenefitCount: response.benefits.length,
          source: 'backend_api'
        }
      };
      
    } catch (error) {
      console.error('❌ Video transcript conversion failed:', error);
      
      // Always try fallback before giving up
      try {
        console.log('🔄 Attempting fallback content extraction...');
        return this.fallbackContentExtraction(
          this.prepareTranscriptText(transcript),
          videoData,
          options
        );
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        return {
          success: false,
          error: error.message,
          benefits: [],
          features: [],
          websiteData: null
        };
      }
    }
  }

  /**
   * Fallback content extraction when backend API fails
   */
  async fallbackContentExtraction(transcriptText, videoData, options = {}) {
    console.log('🔄 Using fallback content extraction...');
    
    try {
      const benefits = [];
      const sentences = transcriptText.split(/[.!?]+/).filter(s => s.trim().length > 25);
      
      // Look for key marketing phrases in the transcript
      const keyPhrases = [
        'email marketing generates',
        'dollars for every dollar',
        'great tool for business',
        'connect with audience',
        'convert subscribers',
        'build email list',
        'marketing strategy',
        'email marketing',
        'increase sales',
        'grow your business',
        'boost revenue',
        'save time',
        'improve efficiency'
      ];
      
      // Add industry-specific phrases based on options
      if (options.industry) {
        const industryPhrases = this.getIndustrySpecificPhrases(options.industry);
        keyPhrases.push(...industryPhrases);
      }
      
      // Extract sentences containing key phrases
      sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        const lowerText = trimmed.toLowerCase();
        
        if (keyPhrases.some(phrase => lowerText.includes(phrase))) {
          benefits.push(trimmed);
        }
      });
      
      // If keywords provided, look for those too
      if (options.keywords) {
        const keywords = options.keywords.toLowerCase().split(',').map(k => k.trim());
        sentences.forEach(sentence => {
          const trimmed = sentence.trim();
          const lowerText = trimmed.toLowerCase();
          
          if (keywords.some(keyword => lowerText.includes(keyword)) && trimmed.length > 30) {
            benefits.push(trimmed);
          }
        });
      }
      
      // If no key phrases found, look for general marketing terms
      if (benefits.length === 0) {
        const marketingTerms = ['marketing', 'business', 'customers', 'email', 'strategy', 'sales'];
        
        sentences.forEach(sentence => {
          const trimmed = sentence.trim();
          const lowerText = trimmed.toLowerCase();
          
          if (marketingTerms.some(term => lowerText.includes(term)) && trimmed.length > 30) {
            benefits.push(trimmed);
          }
        });
      }
      
      // Final fallback - create contextual benefits based on industry
      if (benefits.length === 0) {
        benefits.push(...this.getDefaultBenefitsForIndustry(options.industry || 'general'));
      }
      
      // Limit to reasonable number
      const finalBenefits = benefits.slice(0, 8);
      
      console.log('✅ Fallback extraction found', finalBenefits.length, 'benefits');
      
      // Create website data structure
      const websiteData = {
        url: videoData?.url || '',
        title: videoData?.title || 'YouTube Video Content',
        domain: videoData?.channelName || 'YouTube Video',
        name: videoData?.title || 'Video Content',
        description: videoData?.description || 'Marketing content from video',
        word_count: transcriptText.length,
        analyzed_at: new Date().toISOString()
      };
      
      return {
        success: true,
        benefits: finalBenefits,
        features: [], // No features extracted in fallback
        websiteData: websiteData,
        conversionMetadata: {
          originalBenefitCount: finalBenefits.length,
          finalBenefitCount: finalBenefits.length,
          source: 'fallback_extraction'
        }
      };
      
    } catch (error) {
      console.error('❌ Fallback extraction failed:', error);
      throw error;
    }
  }

  /**
   * Get industry-specific phrases for fallback extraction
   */
  getIndustrySpecificPhrases(industry) {
    const industryPhrases = {
      'health': ['improve health', 'lose weight', 'feel better', 'get fit', 'wellness'],
      'finance': ['save money', 'increase income', 'financial freedom', 'invest', 'budget'],
      'technology': ['automate', 'efficiency', 'software', 'digital', 'online'],
      'education': ['learn', 'skills', 'knowledge', 'training', 'course'],
      'ecommerce': ['online store', 'sales', 'customers', 'products', 'revenue']
    };
    
    return industryPhrases[industry] || [];
  }

  /**
   * Get default benefits based on industry
   */
  getDefaultBenefitsForIndustry(industry) {
    const defaultBenefits = {
      'health': [
        'Improve your overall health and wellness',
        'Achieve your fitness goals faster',
        'Feel more energetic and confident',
        'Transform your lifestyle for the better'
      ],
      'finance': [
        'Increase your income potential',
        'Save money with proven strategies',
        'Build long-term financial security',
        'Make smarter investment decisions'
      ],
      'technology': [
        'Automate repetitive tasks and save time',
        'Improve efficiency with digital tools',
        'Stay ahead with cutting-edge technology',
        'Streamline your workflow processes'
      ],
      'education': [
        'Learn valuable new skills quickly',
        'Advance your career with expert knowledge',
        'Master complex topics with ease',
        'Get certified in high-demand areas'
      ],
      'ecommerce': [
        'Increase your online sales revenue',
        'Attract more qualified customers',
        'Optimize your product listings',
        'Build a profitable online business'
      ],
      'general': [
        'Email marketing strategy for business growth',
        'Connect with your target audience effectively',
        'Build and grow your email subscriber list',
        'Convert prospects into paying customers',
        'Increase revenue with proven marketing techniques',
        'Save time with automated marketing systems'
      ]
    };
    
    return defaultBenefits[industry] || defaultBenefits['general'];
  }

  // Convert transcript segments to clean text
  prepareTranscriptText(transcript) {
    try {
      let text = '';
      
      // Handle different transcript formats
      if (Array.isArray(transcript)) {
        text = transcript
          .map(segment => {
            // Handle object format {text, start, duration}
            if (typeof segment === 'object' && segment.text) {
              return segment.text;
            }
            // Handle string format
            return typeof segment === 'string' ? segment : '';
          })
          .filter(t => t && t.trim().length > 0)
          .join(' ');
      } else if (typeof transcript === 'string') {
        text = transcript;
      } else {
        throw new Error('Invalid transcript format');
      }

      // Clean up the text
      text = text
        .replace(/\[.*?\]/g, '') // Remove [Music], [Applause], etc.
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[^\w\s.,!?-]/g, '') // Remove special characters
        .trim();

      // Truncate if too long
      if (text.length > this.maxTranscriptLength) {
        text = text.substring(0, this.maxTranscriptLength) + '...';
      }

      return text;
    } catch (error) {
      console.error('Transcript preparation failed:', error);
      return '';
    }
  }

  // LEGACY METHODS (kept for backward compatibility but updated to use backend API)

  // Main method to extract benefits from transcript
  async extractBenefits(transcript, options = {}) {
    try {
      console.log('Starting benefit extraction from transcript:', transcript?.length || 0, 'segments');
      
      if (!transcript || transcript.length === 0) {
        throw new Error('No transcript data provided for benefit extraction');
      }

      // Convert transcript segments to text
      const transcriptText = this.prepareTranscriptText(transcript);
      
      if (transcriptText.length < 100) {
        throw new Error('Transcript too short for meaningful benefit extraction');
      }

      console.log('Prepared transcript text length:', transcriptText.length);

      // Extract benefits using backend API
      const benefits = await this.analyzeWithBackendAPI(transcriptText, options);
      
      if (!benefits || benefits.length === 0) {
        throw new Error('No benefits extracted from transcript');
      }

      console.log('Successfully extracted benefits:', benefits.length);
      return {
        success: true,
        benefits: benefits,
        transcriptLength: transcriptText.length,
        keyInsights: this.extractKeyInsights(transcriptText)
      };

    } catch (error) {
      console.error('Benefit extraction failed:', error);
      return {
        success: false,
        error: error.message,
        benefits: [],
        fallback: this.getFallbackBenefits()
      };
    }
  }

  // Use backend API to analyze transcript and extract benefits
  async analyzeWithBackendAPI(transcriptText, options = {}) {
    try {
      console.log('Sending transcript to backend API for analysis...');
      console.log('Transcript length:', transcriptText.length);

      // Use scanPage API with transcript content
      const response = await emailApi.scanPage({
        url: 'https://youtube.com/video-transcript',
        keywords: options.keywords || '',
        industry: options.industry || 'general'
      });

      if (!response.success || !response.benefits) {
        throw new Error('Backend API analysis failed: ' + (response.error || 'No benefits generated'));
      }

      console.log('Backend API response received:', response.benefits.length, 'benefits');

      // Convert to legacy format for backward compatibility
      const parsedBenefits = response.benefits.map((benefit, index) => ({
        id: `benefit_${index + 1}`,
        title: typeof benefit === 'string' ? benefit : benefit.title || `Benefit ${index + 1}`,
        description: typeof benefit === 'string' ? benefit : benefit.description || '',
        category: 'feature',
        strength: 'medium',
        source: 'backend_api',
        timestamp: null
      }));
      
      if (parsedBenefits.length === 0) {
        throw new Error('No benefits found in backend API response');
      }

      return parsedBenefits;

    } catch (error) {
      console.error('Backend API analysis failed:', error);
      throw error;
    }
  }

  // Extract key insights for additional context
  extractKeyInsights(transcriptText) {
    try {
      const insights = {
        wordCount: transcriptText.split(' ').length,
        keyTerms: this.extractKeyTerms(transcriptText),
        sentiment: this.analyzeSentiment(transcriptText),
        topics: this.identifyTopics(transcriptText)
      };
      
      return insights;
    } catch (error) {
      console.error('Key insights extraction failed:', error);
      return {};
    }
  }

  // Extract key terms from transcript
  extractKeyTerms(text) {
    try {
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      const frequency = {};
      words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
      });
      
      return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));
    } catch (error) {
      console.error('Error extracting key terms:', error);
      return [];
    }
  }

  // Basic sentiment analysis
  analyzeSentiment(text) {
    const positiveWords = ['great', 'amazing', 'excellent', 'best', 'love', 'perfect', 'wonderful'];
    const negativeWords = ['bad', 'worst', 'hate', 'terrible', 'awful', 'horrible'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positive = words.filter(word => positiveWords.includes(word)).length;
    const negative = words.filter(word => negativeWords.includes(word)).length;
    
    if (positive > negative) return 'positive';
    if (negative > positive) return 'negative';
    return 'neutral';
  }

  // Identify main topics
  identifyTopics(text) {
    const topics = [
      'business', 'marketing', 'sales', 'productivity', 'health', 'fitness',
      'education', 'technology', 'finance', 'lifestyle', 'relationships'
    ];
    
    const lowerText = text.toLowerCase();
    return topics.filter(topic => lowerText.includes(topic));
  }

  // Fallback benefits if extraction fails
  getFallbackBenefits() {
    return [
      {
        id: 'fallback_1',
        title: 'Video Analysis Required',
        description: 'Unable to extract specific benefits from this video. Please ensure the video has clear audio and discusses specific features or benefits.',
        category: 'error',
        strength: 'low',
        source: 'fallback'
      }
    ];
  }
}

export const nlpService = new NLPService();