// src/services/video2promo/nlpService.js - FIXED VERSION

import { claudeAIService } from '../ai/claudeAIService.js';
import { enhanceExtractedData } from '../emailGenerator/dataEnhancer.js';

class NLPService {
  constructor() {
    this.maxTranscriptLength = 8000; // Limit for API calls
  }

  // NEW METHOD: Bridge Video2Promo transcript data to Email Generator format
  /**
 * Bridge function: Convert Video2Promo transcript analysis to Email Generator format
 * This allows video benefits to be processed by your existing email generation system
 */
async convertTranscriptToEmailFormat(transcript, videoData, options = {}) {
  try {
    console.log('🔗 Converting Video2Promo transcript to Email Generator format...');
    console.log('Video data:', videoData);
    console.log('Options:', options);
    
    // 1. Extract benefits using your existing Claude analysis
    const benefitAnalysis = await this.extractBenefits(transcript, options);
    
    if (!benefitAnalysis.success) {
      console.error('Benefit extraction failed:', benefitAnalysis.error);
      throw new Error(`Failed to extract benefits from transcript: ${benefitAnalysis.error}`);
    }
    
    console.log('✅ Benefits extracted:', benefitAnalysis.benefits.length);
    
    // 2. Convert your Claude AI benefits to the format that dataEnhancer expects
    // This mimics the structure that htmlExtractor.js produces
    const extractedData = {
      // Convert benefit objects to simple heading strings
      headings: benefitAnalysis.benefits
        .filter(b => b.category === 'feature' || b.category === 'outcome' || b.strength === 'high')
        .slice(0, 8) // Limit headings
        .map(b => b.title || b.description?.substring(0, 100) || 'Video Benefit'),
        
      // Convert benefit descriptions to bullet points
      bullets: benefitAnalysis.benefits
        .filter(b => b.category !== 'feature' && b.description && b.description.length > 20)
        .slice(0, 12) // Limit bullets
        .map(b => b.description.substring(0, 200)), // Limit length
        
      // Create testimonials from proof points and emotional hooks
      testimonials: benefitAnalysis.benefits
        .filter(b => b.category === 'proof' || b.category === 'emotional')
        .slice(0, 3) // Limit testimonials
        .map(b => ({
          quote: b.description || b.title,
          author: 'Video testimonial'
        })),
        
      // Video metadata mapped to "website" format
      productName: videoData?.title || videoData?.channelName || 'YouTube Video Product',
      description: videoData?.description || `Marketing content extracted from video`,
      content: this.prepareTranscriptText(transcript), // Your existing method
      price: '', // Videos rarely have direct pricing
      url: videoData?.url || '',
      domain: videoData?.channelName || videoData?.domain || 'YouTube Video'
    };
    
    console.log('📊 Converted data structure:', {
      headings: extractedData.headings.length,
      bullets: extractedData.bullets.length,
      testimonials: extractedData.testimonials.length,
      contentLength: extractedData.content.length
    });
    
    // 3. Use your EXISTING dataEnhancer - no changes needed to that file!
    console.log('🔧 Processing through existing dataEnhancer...');
    const enhancedData = enhanceExtractedData(
      extractedData, 
      options.keywords || '', 
      options.industry || 'general'
    );
    
    console.log('✅ Data enhanced successfully!');
    console.log('📈 Final results:', {
      benefits: enhancedData.benefits.length,
      features: enhancedData.features.length,
      websiteDataName: enhancedData.websiteData?.name
    });
    
    // 4. Return in the same format as your email generator expects
    return {
      success: true,
      benefits: enhancedData.benefits,
      features: enhancedData.features,
      websiteData: enhancedData.websiteData,
      originalAnalysis: benefitAnalysis, // Keep original for debugging
      conversionMetadata: {
        originalBenefitCount: benefitAnalysis.benefits.length,
        finalBenefitCount: enhancedData.benefits.length,
        tokensUsedForExtraction: benefitAnalysis.tokensUsed || 0,
        source: 'video_transcript'
      }
    };
    
  } catch (error) {
    console.error('❌ Transcript to email format conversion failed:', error);
    return {
      success: false,
      error: error.message,
      benefits: [],
      features: [],
      websiteData: null
    };
  }
}

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

      // Extract benefits using AI
      const benefits = await this.analyzeWithClaude(transcriptText, options);
      
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

  // Use Claude AI to analyze transcript and extract benefits
  async analyzeWithClaude(transcriptText, options = {}) {
    try {
      const prompt = this.buildAnalysisPrompt(transcriptText, options);
      
      console.log('Sending transcript to Claude for analysis...');
      console.log('Prompt length:', prompt.length);

      const response = await claudeAIService.generateContent(prompt, {
        temperature: 0.3, // Lower temperature for more focused analysis
        maxTokens: 2000,
        tier: options.userTier || 'free'
      });

      if (!response.success || !response.content) {
        throw new Error('Claude AI analysis failed: ' + (response.error || 'No content generated'));
      }

      console.log('Claude response received:', response.content.substring(0, 200) + '...');

      // Parse the structured response
      const parsedBenefits = this.parseClaudeResponse(response.content);
      
      if (parsedBenefits.length === 0) {
        throw new Error('No benefits found in Claude response');
      }

      return parsedBenefits;

    } catch (error) {
      console.error('Claude analysis failed:', error);
      throw error;
    }
  }

  // Build comprehensive analysis prompt for Claude
  buildAnalysisPrompt(transcriptText, options) {
    const industryContext = options.industry || 'general marketing';
    const targetAudience = options.audience || 'potential customers';

    return `Please analyze this video transcript and extract specific, actionable benefits and selling points. This is for a ${industryContext} context targeting ${targetAudience}.

TRANSCRIPT TO ANALYZE:
"${transcriptText}"

ANALYSIS REQUIREMENTS:
1. Extract 5-8 specific benefits mentioned or implied in the video
2. Identify key pain points the video addresses
3. Find compelling statistics, results, or proof points
4. Note any unique selling propositions or differentiators
5. Capture emotional hooks and motivational elements

FORMAT YOUR RESPONSE AS JSON:
{
  "benefits": [
    {
      "title": "Clear benefit title",
      "description": "Detailed explanation of the benefit",
      "category": "feature|outcome|emotional|proof",
      "strength": "high|medium|low",
      "timestamp": "approximate minute in video if identifiable"
    }
  ],
  "painPoints": [
    "Specific problems mentioned in the video"
  ],
  "proofPoints": [
    "Statistics, testimonials, or evidence mentioned"
  ],
  "uniqueSellingPoints": [
    "What makes this product/service different"
  ],
  "emotionalHooks": [
    "Fear, desire, or aspiration triggers mentioned"
  ],
  "keyQuotes": [
    "Most impactful direct quotes from the transcript"
  ]
}

IMPORTANT: 
- Base your analysis ONLY on the actual transcript content provided
- Do NOT use generic or template benefits
- Extract specific details, numbers, and claims from the video
- If the transcript doesn't contain clear benefits, focus on what IS actually discussed
- Be specific about what the video actually claims or promises`;
  }

  // Parse Claude's structured response
  parseClaudeResponse(responseContent) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        // Fallback: parse unstructured response
        return this.parseUnstructuredResponse(responseContent);
      }

      const jsonData = JSON.parse(jsonMatch[0]);
      
      if (!jsonData.benefits || !Array.isArray(jsonData.benefits)) {
        throw new Error('Invalid JSON structure in Claude response');
      }

      // Convert to our expected format
      const benefits = jsonData.benefits.map((benefit, index) => ({
        id: `benefit_${index + 1}`,
        title: benefit.title || `Benefit ${index + 1}`,
        description: benefit.description || '',
        category: benefit.category || 'feature',
        strength: benefit.strength || 'medium',
        source: 'transcript_analysis',
        timestamp: benefit.timestamp || null
      }));

      // Add additional insights if available
      if (jsonData.painPoints) {
        benefits.push(...jsonData.painPoints.map((point, index) => ({
          id: `pain_${index + 1}`,
          title: `Addresses: ${point}`,
          description: `This video tackles the problem: ${point}`,
          category: 'pain_point',
          strength: 'high',
          source: 'transcript_analysis'
        })));
      }

      if (jsonData.proofPoints) {
        benefits.push(...jsonData.proofPoints.map((point, index) => ({
          id: `proof_${index + 1}`,
          title: `Proven Result`,
          description: point,
          category: 'proof',
          strength: 'high',
          source: 'transcript_analysis'
        })));
      }

      return benefits;

    } catch (error) {
      console.error('JSON parsing failed, trying unstructured parsing:', error);
      return this.parseUnstructuredResponse(responseContent);
    }
  }

  // Fallback parser for unstructured Claude responses
  parseUnstructuredResponse(content) {
    try {
      const benefits = [];
      const lines = content.split('\n').filter(line => line.trim());
      
      let currentBenefit = null;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Look for benefit indicators
        if (trimmed.match(/^\d+\.|^-|^\*|^•/) || 
            trimmed.toLowerCase().includes('benefit') ||
            trimmed.toLowerCase().includes('advantage') ||
            trimmed.toLowerCase().includes('feature')) {
          
          if (currentBenefit) {
            benefits.push(currentBenefit);
          }
          
          currentBenefit = {
            id: `benefit_${benefits.length + 1}`,
            title: trimmed.replace(/^\d+\.|^-|^\*|^•/, '').trim(),
            description: '',
            category: 'feature',
            strength: 'medium',
            source: 'transcript_analysis'
          };
        } else if (currentBenefit && trimmed.length > 0) {
          // Add to description
          currentBenefit.description += (currentBenefit.description ? ' ' : '') + trimmed;
        }
      }
      
      if (currentBenefit) {
        benefits.push(currentBenefit);
      }
      
      // If still no benefits found, extract from sentences
      if (benefits.length === 0) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
        
        benefits.push(...sentences.slice(0, 5).map((sentence, index) => ({
          id: `extracted_${index + 1}`,
          title: `Key Point ${index + 1}`,
          description: sentence.trim(),
          category: 'insight',
          strength: 'medium',
          source: 'transcript_analysis'
        })));
      }
      
      return benefits;
      
    } catch (error) {
      console.error('Unstructured parsing failed:', error);
      return [];
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
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
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