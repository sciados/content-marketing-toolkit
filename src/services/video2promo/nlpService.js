// src/services/video2promo/nlpService.js
import claudeAIService from '../ai/claudeAIService.js';

class NLPService {
  async extractBenefits(transcript, keywords = []) {
    const prompt = this.buildBenefitExtractionPrompt(transcript, keywords);
    
    const response = await claudeAIService.generateContent(prompt, {
      maxTokens: 1000,
      temperature: 0.3
    });

    return this.parseBenefits(response.content);
  }

  buildBenefitExtractionPrompt(transcript, keywords) {
    return `
Analyze this video transcript and extract 5-7 core benefits or value propositions.
Focus on concrete benefits that would appeal to potential customers.

Keywords to emphasize: ${keywords.join(', ')}

Transcript:
${transcript}

Return JSON format:
{
  "benefits": [
    {
      "title": "Benefit Title",
      "description": "2-3 sentence description",
      "supporting_text": "relevant quote from transcript",
      "confidence": 0.0-1.0
    }
  ]
}
`;
  }

  parseBenefits(response) {
    try {
      const parsed = JSON.parse(response);
      return parsed.benefits || [];
    } catch (error) {
      console.error('Failed to parse benefits:', error);
      return [];
    }
  }
}

export const nlpService = new NLPService();