// src/services/common/unifiedBenefitExtractor.js - MODULAR SYSTEM

// import { claudeAIService } from '../ai/claudeAIService.js';

/**
 * Unified Benefit Extraction System
 * Works with any text source: websites, transcripts, PDFs, manual input
 */

class UnifiedBenefitExtractor {
  constructor() {
    this.enableLogging = import.meta.env.VITE_ENABLE_API_LOGGING === 'true' || true; // Force enable for debugging
  }

  async extractBenefitsFromText(textContent, metadata = {}) {
    try {
      const {
        source = 'unknown',
        sourceUrl = '',
        keywords = '',
        industry = 'general',
        userTier = 'free',
        productName = '',
        description = ''
      } = metadata;

      // 🔍 DEBUG: Log input data
      console.log('🔍 UNIFIED EXTRACTOR DEBUG:', {
        source,
        textContentType: typeof textContent,
        isArray: Array.isArray(textContent),
        length: textContent?.length,
        userTier,
        keywords
      });

      if (Array.isArray(textContent)) {
        console.log('🔍 Sample transcript segments:', textContent.slice(0, 3));
      }

      // Prepare text for analysis
      const cleanedText = this.prepareTextForAnalysis(textContent, source);
      
      console.log('🔍 Cleaned text preview:', cleanedText.substring(0, 300) + '...');
      console.log('🔍 Cleaned text length:', cleanedText.length);
      
      if (!cleanedText || cleanedText.length < 100) {
        throw new Error(`Insufficient content for benefit extraction. Need at least 100 characters, got ${cleanedText?.length || 0}`);
      }

      // Extract benefits using AI
      console.log('🔍 Calling AI analysis...');
      const aiResults = await this.analyzeWithAI(cleanedText, {
        source,
        keywords,
        industry,
        userTier,
        productName,
        description
      });

      console.log('🔍 AI Results:', aiResults);

      // Transform AI results to match your existing format
      const extractedData = this.transformToUnifiedFormat(aiResults, {
        source,
        sourceUrl,
        productName,
        description,
        domain: this.extractDomain(sourceUrl)
      });

      console.log('🔍 Final extracted data:', extractedData);

      return extractedData;

    } catch (error) {
      console.error('❌ Unified benefit extraction failed:', error);
      console.error('❌ Error stack:', error.stack);
      return this.createFallbackResults(metadata);
    }
  }

  prepareTextForAnalysis(textContent, source) {
    if (!textContent) {
      console.warn('⚠️ No text content provided');
      return '';
    }

    let cleanedText = textContent;

    // Handle different input formats based on source type
    if (Array.isArray(textContent)) {
      console.log(`🔍 Processing ${source} array format with ${textContent.length} segments`);
      
      cleanedText = textContent
        .map(segment => {
          if (typeof segment === 'object' && segment.text) {
            return segment.text;
          }
          return typeof segment === 'string' ? segment : '';
        })
        .filter(text => text && text.trim().length > 0)
        .join(' ');
        
      console.log('🔍 Joined text from array:', cleanedText.substring(0, 200) + '...');
    } else if (typeof textContent === 'object') {
      console.log(`🔍 Processing ${source} object format`);
      
      const parts = [];
      if (textContent.content) parts.push(textContent.content);
      if (textContent.headings) parts.push(...textContent.headings);
      if (textContent.bullets) parts.push(...textContent.bullets);
      cleanedText = parts.join(' ');
    } else {
      console.log(`🔍 Processing ${source} as plain text`);
    }

    // Clean up the text
    cleanedText = cleanedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?$%-]/g, '') // Remove special characters but keep punctuation and $
      .trim();

    // Truncate if too long (keep within AI token limits)
    const maxLength = source === 'transcript' ? 8000 : 6000;
    if (cleanedText.length > maxLength) {
      cleanedText = cleanedText.substring(0, maxLength) + '...';
      console.log(`🔍 Truncated ${source} content to ${maxLength} chars`);
    }

    console.log('🔍 Final cleaned text length:', cleanedText.length);
    return cleanedText;
  }

  async analyzeWithAI(textContent, options = {}) {
    const {
      source = 'unknown',
      keywords = '',
      industry = 'general',
      userTier = 'free',
      productName = '',
      description = ''
    } = options;

    console.log('🔍 Building AI prompt for analysis...');
    const prompt = this.buildAnalysisPrompt(textContent, {
      source,
      keywords,
      industry,
      productName,
      description
    });

    console.log('🔍 Prompt preview:', prompt.substring(0, 500) + '...');
    console.log('🔍 Calling Claude with tier:', userTier);

    // Import Claude service
    const { claudeAIService } = await import('../ai/claudeAIService.js');
    
    const response = await claudeAIService.generateContent(prompt, {
      tier: userTier,
      temperature: 0.3,
      maxTokens: 2000
    });

    console.log('🔍 Claude response:', response);

    if (!response.success) {
      throw new Error('AI analysis failed: ' + (response.error || 'Unknown error'));
    }

    console.log('🔍 Parsing AI response...');
    const parsed = this.parseAIResponse(response.content);
    console.log('🔍 Parsed results:', parsed);
    
    return parsed;
  }

  // Make sure parseAIResponse is robust
  parseAIResponse(responseContent) {
    try {
      console.log('🔍 Raw AI response:', responseContent.substring(0, 500) + '...');
      
      // Try to extract JSON from response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        console.log('🔍 Found JSON in response');
        const parsed = JSON.parse(jsonMatch[0]);
        
        console.log('🔍 Parsed JSON:', parsed);
        
        return {
          benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
          features: Array.isArray(parsed.features) ? parsed.features : [],
          valueProposition: parsed.valueProposition || '',
          targetAudience: parsed.targetAudience || '',
          primaryUseCase: parsed.primaryUseCase || ''
        };
      }

      console.log('🔍 No JSON found, parsing unstructured response');
      return this.parseUnstructuredResponse(responseContent);

    } catch (error) {
      console.error('🔍 AI response parsing failed:', error);
      return this.parseUnstructuredResponse(responseContent);
    }
  }

  // Rest of your methods...
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