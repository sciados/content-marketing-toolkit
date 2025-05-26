// src/services/video2promo/assetGenerationService.js
import claudeAIService from '../ai/claudeAIService.js';

class AssetGenerationService {
  async generateEmailSeries(benefit, keywords, affiliateLink, tone = 'friendly') {
    const prompt = this.buildEmailSeriesPrompt(benefit, keywords, affiliateLink, tone);
    
    const response = await claudeAIService.generateContent(prompt, {
      maxTokens: 2000,
      temperature: 0.7
    });

    return this.parseEmailSeries(response.content);
  }

  async generateBlogPost(benefit, keywords, affiliateLink, tone = 'educational') {
    const prompt = this.buildBlogPostPrompt(benefit, keywords, affiliateLink, tone);
    
    const response = await claudeAIService.generateContent(prompt, {
      maxTokens: 3000,
      temperature: 0.6
    });

    return this.parseBlogPost(response.content);
  }

  buildEmailSeriesPrompt(benefit, keywords, affiliateLink, tone) {
    const toneInstructions = {
      urgent: "Use urgency and scarcity. Create FOMO.",
      friendly: "Conversational and helpful. Build trust.",
      educational: "Focus on teaching and value-first approach.",
      professional: "Formal but engaging. Authority-building."
    };

    return `
Create a 3-email drip sequence focusing on this benefit: "${benefit.title}"

Benefit Details:
${benefit.description}

Supporting Evidence:
${benefit.supporting_text}

Keywords to incorporate: ${keywords.join(', ')}
Tone: ${tone} - ${toneInstructions[tone]}
Affiliate Link: ${affiliateLink}

Requirements for each email:
- Subject line under 60 characters
- Body 150-200 words
- Clear CTA with the affiliate link
- Unique angle for each email

Return JSON:
{
  "emails": [
    {
      "sequence": 1,
      "subject": "Subject Line",
      "body": "Email content with {{AFFILIATE_LINK}} placeholder",
      "cta": "Button text",
      "send_delay": 0
    }
  ]
}
`;
  }

  buildBlogPostPrompt(benefit, keywords, affiliateLink, tone) {
    return `
Write a 500-800 word SEO-optimized blog post about: "${benefit.title}"

Benefit Context:
${benefit.description}

Keywords: ${keywords.join(', ')}
Tone: ${tone}

Structure:
1. Compelling title (H1)
2. Meta description (150 chars)
3. Introduction hook
4. 3-4 subheadings with content
5. Social proof section
6. Conclusion with CTA to ${affiliateLink}

Return JSON:
{
  "title": "SEO Title",
  "meta_description": "Meta description",
  "content": "Full blog post HTML",
  "word_count": 650
}
`;
  }
}

export const assetGenerationService = new AssetGenerationService();