// src/services/common/unifiedBenefitExtractor.js - MODULAR SYSTEM

import { claudeAIService } from '../ai/claudeAIService.js';

/**
 * Unified Benefit Extraction System
 * Works with any text source: websites, transcripts, PDFs, manual input
 */
class UnifiedBenefitExtractor {
  constructor() {
    this.enableLogging = import.meta.env.VITE_ENABLE_API_LOGGING === 'true';
  }

  /**
   * Main method: Extract benefits from any text source
   * Returns data in the same format as your website scanner
   */
  async extractBenefitsFromText(textContent, metadata = {}) {
    try {
      const {
        source = 'unknown', // 'website', 'transcript', 'pdf', 'manual'
        sourceUrl = '',
        keywords = '',
        industry = 'general',
        userTier = 'free',
        productName = '',
        description = ''
      } = metadata;

      if (this.enableLogging) {
        console.log('🔍 Unified Benefit Extraction:', {
          source,
          textLength: textContent?.length || 0,
          userTier,
          keywords
        });
      }

      // Prepare text for analysis
      const cleanedText = this.prepareTextForAnalysis(textContent, source);
      
      if (!cleanedText || cleanedText.length < 100) {
        throw new Error(`Insufficient content for benefit extraction. Need at least 100 characters, got ${cleanedText?.length || 0}`);
      }

      // Extract benefits using AI
      const aiResults = await this.analyzeWithAI(cleanedText, {
        source,
        keywords,
        industry,
        userTier,
        productName,
        description
      });

      // Transform AI results to match your existing format
      const extractedData = this.transformToUnifiedFormat(aiResults, {
        source,
        sourceUrl,
        productName,
        description,
        domain: this.extractDomain(sourceUrl)
      });

      if (this.enableLogging) {
        console.log('✅ Benefits extracted:', {
          benefits: extractedData.extractedBenefits?.length || 0,
          features: extractedData.extractedFeatures?.length || 0,
          source: extractedData.websiteData?.source
        });
      }

      return extractedData;

    } catch (error) {
      console.error('❌ Unified benefit extraction failed:', error);
      return this.createFallbackResults(metadata);
    }
  }

  /**
   * Prepare text for analysis based on source type
   */
  prepareTextForAnalysis(textContent, source) {
    if (!textContent) return '';

    let cleanedText = textContent;

    // Handle different input formats based on source type
    if (Array.isArray(textContent)) {
      // Transcript format: [{text, start, duration}, ...]
      if (this.enableLogging) {
        console.log(`Processing ${source} array format with ${textContent.length} segments`);
      }
      
      cleanedText = textContent
        .map(segment => {
          if (typeof segment === 'object' && segment.text) {
            return segment.text;
          }
          return typeof segment === 'string' ? segment : '';
        })
        .filter(text => text.trim().length > 0)
        .join(' ');
    } else if (typeof textContent === 'object') {
      // Website format: {content, headings, bullets, ...}
      if (this.enableLogging) {
        console.log(`Processing ${source} object format`);
      }
      
      const parts = [];
      if (textContent.content) parts.push(textContent.content);
      if (textContent.headings) parts.push(...textContent.headings);
      if (textContent.bullets) parts.push(...textContent.bullets);
      cleanedText = parts.join(' ');
    } else {
      if (this.enableLogging) {
        console.log(`Processing ${source} as plain text`);
      }
    }

    // Clean up the text
    cleanedText = cleanedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?$%-]/g, '') // Remove special characters but keep punctuation and $
      .trim();

    // Truncate if too long (keep within AI token limits)
    const maxLength = source === 'transcript' ? 8000 : 6000; // Allow more for transcripts
    if (cleanedText.length > maxLength) {
      cleanedText = cleanedText.substring(0, maxLength) + '...';
      if (this.enableLogging) {
        console.log(`Truncated ${source} content from ${textContent.length} to ${maxLength} chars`);
      }
    }

    return cleanedText;
  }

  /**
   * Analyze text with AI to extract benefits and features
   */
  async analyzeWithAI(textContent, options = {}) {
    const {
      source = 'unknown',
      keywords = '',
      industry = 'general',
      userTier = 'free',
      productName = '',
      description = ''
    } = options;

    const prompt = this.buildAnalysisPrompt(textContent, {
      source,
      keywords,
      industry,
      productName,
      description
    });

    const response = await claudeAIService.generateContent(prompt, {
      tier: userTier,
      temperature: 0.3, // Lower temperature for more focused analysis
      maxTokens: 2000
    });

    if (!response.success) {
      throw new Error('AI analysis failed: ' + (response.error || 'Unknown error'));
    }

    return this.parseAIResponse(response.content);
  }

  /**
   * Build analysis prompt for AI
   */
  buildAnalysisPrompt(textContent, options) {
    const {
      source,
      keywords,
      industry,
      productName,
      description
    } = options;

    return `Analyze this ${source} content and extract specific benefits and features for marketing purposes.

CONTENT TO ANALYZE:
"${textContent}"

CONTEXT:
- Source: ${source}
- Industry: ${industry}
- Product Name: ${productName || 'Not specified'}
- Description: ${description || 'Not specified'}
- Keywords: ${keywords || 'None specified'}

EXTRACT THE FOLLOWING:

1. BENEFITS (5-8 items): Specific advantages or outcomes users get
   - Focus on results, outcomes, and value delivered
   - Make them specific and compelling
   - Each should be 3-15 words

2. FEATURES (3-6 items): Specific capabilities or characteristics
   - Focus on what the product/service does or has
   - Keep them concise and clear
   - Each should be 2-10 words

3. PRODUCT INFO:
   - Main value proposition (1-2 sentences)
   - Target audience (1-2 words)
   - Primary use case (1-2 sentences)

FORMAT YOUR RESPONSE AS JSON:
{
  "benefits": [
    "Specific benefit that users get",
    "Another concrete outcome or advantage",
    ...
  ],
  "features": [
    "Specific feature or capability",
    "Another feature",
    ...
  ],
  "valueProposition": "Main value proposition in 1-2 sentences",
  "targetAudience": "Primary target audience",
  "primaryUseCase": "Main use case description"
}

IMPORTANT:
- Extract ONLY benefits and features actually mentioned or clearly implied
- Make benefits outcome-focused (what users achieve)
- Make features capability-focused (what the product does)
- Be specific, not generic
- Base everything on the actual content provided`;
  }

  /**
   * Parse AI response into structured data
   */
  parseAIResponse(responseContent) {
    try {
      // Try to extract JSON from response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
          features: Array.isArray(parsed.features) ? parsed.features : [],
          valueProposition: parsed.valueProposition || '',
          targetAudience: parsed.targetAudience || '',
          primaryUseCase: parsed.primaryUseCase || ''
        };
      }

      // Fallback: try to parse unstructured response
      return this.parseUnstructuredResponse(responseContent);

    } catch (error) {
      console.error('AI response parsing failed:', error);
      return this.parseUnstructuredResponse(responseContent);
    }
  }

  /**
   * Parse unstructured AI response
   */
  parseUnstructuredResponse(content) {
    const benefits = [];
    const features = [];
    
    const lines = content.split('\n').filter(line => line.trim());
    let currentSection = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('benefit')) {
        currentSection = 'benefits';
        continue;
      } else if (trimmed.toLowerCase().includes('feature')) {
        currentSection = 'features';
        continue;
      }
      
      // Extract items with bullet points or numbers
      if (trimmed.match(/^\d+\.|^-|^\*|^•/)) {
        const item = trimmed.replace(/^\d+\.|^-|^\*|^•/, '').trim();
        if (item.length > 5 && item.length < 100) {
          if (currentSection === 'benefits') {
            benefits.push(item);
          } else if (currentSection === 'features') {
            features.push(item);
          }
        }
      }
    }
    
    return {
      benefits: benefits.slice(0, 8), // Limit to 8 benefits
      features: features.slice(0, 6), // Limit to 6 features
      valueProposition: '',
      targetAudience: '',
      primaryUseCase: ''
    };
  }

  /**
   * Transform AI results to match your existing ScanResultsPanel format
   */
  transformToUnifiedFormat(aiResults, metadata) {
    const {
      source,
      sourceUrl,
      productName,
      description,
      domain
    } = metadata;

    // This matches the exact format your ScanResultsPanel expects
    return {
      // Main arrays that ScanResultsPanel uses
      extractedBenefits: aiResults.benefits || [],
      extractedFeatures: aiResults.features || [],
      
      // Website data object that ScanResultsPanel displays
      websiteData: {
        name: productName || this.extractProductName(aiResults.valueProposition),
        description: description || aiResults.valueProposition || '',
        valueProposition: aiResults.valueProposition || '',
        domain: domain || '',
        source: source, // 'website', 'transcript', etc.
        url: sourceUrl || '',
        targetAudience: aiResults.targetAudience || '',
        primaryUseCase: aiResults.primaryUseCase || ''
      }
    };
  }

  /**
   * Create fallback results if extraction fails
   */
  createFallbackResults(metadata) {
    const { source = 'unknown', sourceUrl = '', productName = '' } = metadata;
    
    return {
      extractedBenefits: [
        'Benefit extraction failed - please try again',
        'Content may need manual review',
        'Consider using different source material'
      ],
      extractedFeatures: [
        'Feature extraction unavailable'
      ],
      websiteData: {
        name: productName || 'Unknown Product',
        description: 'Benefit extraction failed for this content',
        valueProposition: 'Please try scanning again or use different content',
        domain: this.extractDomain(sourceUrl),
        source: source,
        url: sourceUrl,
        error: true
      }
    };
  }

  /**
   * Helper: Extract domain from URL
   */
  extractDomain(url) {
    if (!url) return '';
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url.split('/')[0] || '';
    }
  }

  /**
   * Helper: Extract product name from value proposition
   */
  extractProductName(valueProposition) {
    if (!valueProposition) return '';
    
    // Try to extract the first few words as product name
    const words = valueProposition.split(' ').slice(0, 3);
    return words.join(' ');
  }
}

export const unifiedBenefitExtractor = new UnifiedBenefitExtractor();

// Convenience methods for different sources
export const extractBenefitsFromWebsite = (websiteData, metadata = {}) => {
  return unifiedBenefitExtractor.extractBenefitsFromText(websiteData, {
    ...metadata,
    source: 'website'
  });
};

export const extractBenefitsFromTranscript = (transcript, metadata = {}) => {
  return unifiedBenefitExtractor.extractBenefitsFromText(transcript, {
    ...metadata,
    source: 'transcript'
  });
};

export const extractBenefitsFromText = (text, metadata = {}) => {
  return unifiedBenefitExtractor.extractBenefitsFromText(text, {
    ...metadata,
    source: 'manual'
  });
};