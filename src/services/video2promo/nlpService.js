// src/services/video2promo/nlpService.js - FIXED VERSION

import { claudeAIService } from '../ai/claudeAIService.js';
// import { enhanceExtractedData } from '../emailGenerator/dataEnhancer.js';

class NLPService {
  constructor() {
    this.maxTranscriptLength = 8000; // Limit for API calls
  }

  // NEW METHOD: Bridge Video2Promo transcript data to Email Generator format
  /**
 * Bridge function: Convert Video2Promo transcript analysis to Email Generator format
 * This allows video benefits to be processed by your existing email generation system
 */
// REPLACE the convertTranscriptToEmailFormat method in your nlpService.js with this:

async convertTranscriptToEmailFormat(transcript, videoData, options = {}) {
  try {
    console.log('🔗 Converting Video2Promo transcript to Email Generator format...');
    console.log('Video data:', videoData);
    console.log('Options:', options);
    
    // 1. First, let's use the direct Claude AI approach instead of extractBenefits
    const transcriptText = this.prepareTranscriptText(transcript);
    
    if (!transcriptText || transcriptText.length < 100) {
      throw new Error('Transcript too short or empty for analysis');
    }
    
    console.log('✅ Prepared transcript text length:', transcriptText.length);
    console.log('🔍 Sample transcript content:', transcriptText.substring(0, 300) + '...');
    
    // 2. Use Claude AI directly (same way as webpage email generation)
    const analysisPrompt = this.buildTranscriptAnalysisPrompt(transcriptText, options);
    
    console.log('🤖 Calling Claude AI for transcript analysis...');
    
    // Import your working Claude AI service
    const { claudeAIService } = await import('../ai/claudeAIService.js');
    
    const response = await claudeAIService.generateContent(analysisPrompt, {
      temperature: 0.3,
      maxTokens: 2000,
      tier: options.userTier || 'free'
    });
    
    if (!response.success || !response.content) {
      console.error('Claude AI analysis failed:', response.error);
      throw new Error(`Claude AI analysis failed: ${response.error || 'No content generated'}`);
    }
    
    console.log('✅ Claude AI response received');
    console.log('🔍 Response content preview:', response.content.substring(0, 200) + '...');
    
    // 3. Parse the Claude response to extract real benefits
    const extractedBenefits = this.parseClaudeAnalysisResponse(response.content);
    
    if (!extractedBenefits || extractedBenefits.length === 0) {
      console.warn('⚠️ No benefits extracted from Claude response, using content-based extraction');
      return this.fallbackContentExtraction(transcriptText, videoData, options);
    }
    
    console.log('✅ Successfully extracted', extractedBenefits.length, 'benefits from Claude analysis');
    
    // 4. Convert to the format your email generator expects (simple strings)
    const benefitStrings = extractedBenefits.map(benefit => {
      // Convert structured benefit to simple string format
      if (typeof benefit === 'object' && benefit.title) {
        return benefit.description && benefit.description.length > benefit.title.length 
          ? benefit.description 
          : benefit.title;
      }
      return typeof benefit === 'string' ? benefit : String(benefit);
    });
    
    // 5. Create the extractedData format that dataEnhancer expects
    const extractedData = {
      headings: benefitStrings.slice(0, 5), // First 5 as headings
      bullets: benefitStrings.slice(2, 8),  // Overlap for more data
      testimonials: [], // Videos rarely have testimonials
      productName: videoData?.title || 'YouTube Video Product',
      description: videoData?.description || 'Marketing content extracted from video',
      content: transcriptText,
      price: '',
      url: videoData?.url || '',
      domain: videoData?.channelName || 'YouTube Video'
    };
    
    console.log('📊 Created extractedData:', {
      headings: extractedData.headings.length,
      bullets: extractedData.bullets.length,
      contentLength: extractedData.content.length
    });
    
    // 6. Use your existing dataEnhancer (same as webpage email generation)
    const { enhanceExtractedData } = await import('../emailGenerator/dataEnhancer.js');
    
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
    
    // 7. Return in the same format as your email generator expects
    return {
      success: true,
      benefits: enhancedData.benefits,
      features: enhancedData.features,
      websiteData: enhancedData.websiteData,
      originalAnalysis: { benefits: extractedBenefits },
      conversionMetadata: {
        originalBenefitCount: extractedBenefits.length,
        finalBenefitCount: enhancedData.benefits.length,
        tokensUsed: response.tokensUsed || 0,
        source: 'claude_transcript_analysis'
      }
    };
    
  } catch (error) {
    console.error('❌ Transcript to email format conversion failed:', error);
    
    // Fallback to content-based extraction if Claude fails
    try {
      console.log('🔄 Attempting fallback content extraction...');
      return this.fallbackContentExtraction(
        this.prepareTranscriptText(transcript), 
        videoData, 
        options
      );
    } catch (fallbackError) {
      console.error('❌ Fallback extraction also failed:', fallbackError);
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

// NEW: Build analysis prompt specifically for transcript content
buildTranscriptAnalysisPrompt(transcriptText, options) {
  const industryContext = options.industry || 'general marketing';
  
  return `You are analyzing a video transcript to extract specific marketing benefits and selling points. 

TRANSCRIPT CONTENT:
"${transcriptText}"

ANALYSIS TASK:
Extract 5-8 specific benefits, features, or selling points mentioned in this video transcript.

INSTRUCTIONS:
1. Focus on actual benefits discussed in the video
2. Look for specific results, outcomes, or advantages mentioned
3. Include any statistics, numbers, or proof points 
4. Extract pain points that are addressed
5. Find unique selling propositions or differentiators
6. DO NOT create generic benefits - only use what's actually in the transcript

FORMAT: Return as a simple numbered list, like:
1. [Actual benefit from transcript]
2. [Another real benefit mentioned]
3. [Specific result or outcome discussed]
etc.

CONTEXT: This is for ${industryContext} content targeting potential customers.

Extract only real, specific benefits that are actually discussed in this video transcript.`;
}

// NEW: Parse Claude's analysis response into structured benefits
parseClaudeAnalysisResponse(content) {
  try {
    console.log('🔍 Parsing Claude analysis response...');
    
    const benefits = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for numbered list items
      const numberedMatch = trimmed.match(/^\d+\.\s*(.+)$/);
      if (numberedMatch) {
        const benefitText = numberedMatch[1].trim();
        if (benefitText.length > 10) { // Reasonable length
          benefits.push({
            title: this.extractBenefitTitle(benefitText),
            description: benefitText,
            category: 'feature',
            strength: 'medium',
            source: 'claude_analysis'
          });
        }
        continue;
      }
      
      // Look for bullet points
      const bulletMatch = trimmed.match(/^[-•*]\s*(.+)$/);
      if (bulletMatch) {
        const benefitText = bulletMatch[1].trim();
        if (benefitText.length > 10) {
          benefits.push({
            title: this.extractBenefitTitle(benefitText),
            description: benefitText,
            category: 'feature',
            strength: 'medium',
            source: 'claude_analysis'
          });
        }
        continue;
      }
      
      // Look for sentences that might be benefits
      if (trimmed.length > 20 && 
          (trimmed.toLowerCase().includes('benefit') ||
           trimmed.toLowerCase().includes('advantage') ||
           trimmed.toLowerCase().includes('helps') ||
           trimmed.toLowerCase().includes('results') ||
           trimmed.includes('$') ||
           trimmed.includes('%'))) {
        benefits.push({
          title: this.extractBenefitTitle(trimmed),
          description: trimmed,
          category: 'outcome',
          strength: 'medium',
          source: 'claude_analysis'
        });
      }
    }
    
    console.log('✅ Parsed', benefits.length, 'benefits from Claude response');
    return benefits;
    
  } catch (error) {
    console.error('❌ Failed to parse Claude response:', error);
    return [];
  }
}

// NEW: Fallback content extraction when Claude fails
async fallbackContentExtraction(transcriptText, videoData, options) {
  console.log('🔄 Using fallback content extraction method...');
  
  try {
    // Extract key phrases that look like benefits from the transcript
    const benefits = [];
    const sentences = transcriptText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for specific patterns in the email marketing transcript
    const benefitPatterns = [
      /generates?\s+[\d$]+.*for every.*\$/i,
      /great tool for.*business/i,
      /connect with.*audience/i,
      /convert.*subscribers.*customers/i,
      /build.*email list/i,
      /email marketing strategy/i,
      /\$\d+.*return/i,
      /save.*time/i,
      /increase.*productivity/i
    ];
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      
      // Check if sentence matches benefit patterns
      if (benefitPatterns.some(pattern => pattern.test(trimmed))) {
        benefits.push(trimmed);
      }
    });
    
    // If no pattern matches found, extract sentences with key marketing terms
    if (benefits.length === 0) {
      const marketingTerms = ['marketing', 'email', 'business', 'customers', 'revenue', 'growth', 'strategy'];
      
      sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        const lowerText = trimmed.toLowerCase();
        
        if (marketingTerms.some(term => lowerText.includes(term)) && trimmed.length > 30) {
          benefits.push(trimmed);
        }
      });
    }
    
    // Ensure we have at least some benefits
    if (benefits.length === 0) {
      benefits.push(
        'High ROI Email Marketing Strategy',
        'Build and Grow Your Email List',
        'Convert Subscribers to Customers',
        'Professional Email Marketing Approach'
      );
    }
    
    // Create extractedData format
    const extractedData = {
      headings: benefits.slice(0, 5),
      bullets: benefits.slice(0, 8),
      testimonials: [],
      productName: videoData?.title || 'YouTube Video Product',
      description: videoData?.description || 'Marketing content extracted from video',
      content: transcriptText,
      price: '',
      url: videoData?.url || '',
      domain: videoData?.channelName || 'YouTube Video'
    };
    
    // Use dataEnhancer
    const { enhanceExtractedData } = await import('../emailGenerator/dataEnhancer.js');
    const enhancedData = enhanceExtractedData(extractedData, options.keywords || '', options.industry || 'general');
    
    console.log('✅ Fallback extraction completed with', enhancedData.benefits.length, 'benefits');
    
    return {
      success: true,
      benefits: enhancedData.benefits,
      features: enhancedData.features,
      websiteData: enhancedData.websiteData,
      originalAnalysis: { benefits: benefits },
      conversionMetadata: {
        originalBenefitCount: benefits.length,
        finalBenefitCount: enhancedData.benefits.length,
        tokensUsed: 0,
        source: 'fallback_content_extraction'
      }
    };
    
  } catch (error) {
    console.error('❌ Fallback content extraction failed:', error);
    throw error;
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