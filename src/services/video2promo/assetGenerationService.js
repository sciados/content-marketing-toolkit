// src/services/video2promo/assetGenerationService.js
import claudeAIService from '../ai/claudeAIService.js';

class AssetGenerationService {
  constructor() {
    this.enableLogging = import.meta.env.VITE_ENABLE_API_LOGGING === 'true';
  }

  /**
   * Generate email series for a specific benefit
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} - Generated email series
   */
  async generateEmailSeries(params) {
    const {
      benefit,
      keywords = [],
      affiliateLink = '',
      tone = 'friendly',
      userTier = 'free',
      generateVariants = false
    } = params;

    try {
      if (this.enableLogging) {
        console.log('📧 Generating email series for benefit:', benefit.title);
      }

      // Build the prompt for email series generation
      const prompt = this.buildEmailSeriesPrompt(benefit, keywords, affiliateLink, tone, generateVariants);
      const systemPrompt = "You are an expert email marketing copywriter. Create engaging email sequences that convert readers into customers.";
      
      // Get model config for the user's tier
      const modelConfig = claudeAIService.getModelForTier(userTier);
      
      try {
        const response = await claudeAIService.makeClaudeRequest({
          userMessage: prompt,
          systemPrompt: systemPrompt,
          model: modelConfig.model,
          maxTokens: Math.min(2000, modelConfig.maxTokens),
          affiliateLink: affiliateLink
        });
        
        const content = response.body || response.subject || 'Generated email series content';
        const tokenEstimate = this.estimateTokens(prompt + content);
        
        return {
          type: 'email_series',
          content: content,
          benefit_title: benefit.title,
          total_tokens: tokenEstimate,
          model_used: modelConfig.model
        };
        
      } catch (claudeError) {
        if (this.enableLogging) {
          console.warn('Claude AI request failed for email series:', claudeError.message);
        }
        
        // Return mock email series
        return this.getMockEmailSeries(benefit, affiliateLink);
      }

    } catch (error) {
      console.error('Error generating email series:', error);
      return this.getMockEmailSeries(benefit, affiliateLink);
    }
  }

  /**
   * Generate blog post for a specific benefit
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} - Generated blog post
   */
  async generateBlogPost(params) {
    const {
      benefit,
      keywords = [],
      affiliateLink = '',
      tone = 'professional',
      userTier = 'free'
    } = params;

    try {
      if (this.enableLogging) {
        console.log('📝 Generating blog post for benefit:', benefit.title);
      }

      const prompt = this.buildBlogPostPrompt(benefit, keywords, affiliateLink, tone);
      const systemPrompt = "You are an expert content writer who creates SEO-optimized blog posts that engage readers and drive conversions.";
      
      const modelConfig = claudeAIService.getModelForTier(userTier);
      
      try {
        const response = await claudeAIService.makeClaudeRequest({
          userMessage: prompt,
          systemPrompt: systemPrompt,
          model: modelConfig.model,
          maxTokens: Math.min(1500, modelConfig.maxTokens),
          affiliateLink: affiliateLink
        });
        
        const content = response.body || response.subject || 'Generated blog post content';
        const tokenEstimate = this.estimateTokens(prompt + content);
        
        return {
          type: 'blog_post',
          content: content,
          benefit_title: benefit.title,
          total_tokens: tokenEstimate,
          model_used: modelConfig.model
        };
        
      } catch (claudeError) {
        if (this.enableLogging) {
          console.warn('Claude AI request failed for blog post:', claudeError.message);
        }
        
        return this.getMockBlogPost(benefit, affiliateLink);
      }

    } catch (error) {
      console.error('Error generating blog post:', error);
      return this.getMockBlogPost(benefit, affiliateLink);
    }
  }

  /**
   * Generate newsletter content for a specific benefit
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} - Generated newsletter
   */
  async generateNewsletter(params) {
    const {
      benefit,
      keywords = [],
      affiliateLink = '',
      tone = 'friendly',
      userTier = 'free'
    } = params;

    try {
      if (this.enableLogging) {
        console.log('📰 Generating newsletter for benefit:', benefit.title);
      }

      const prompt = this.buildNewsletterPrompt(benefit, keywords, affiliateLink, tone);
      const systemPrompt = "You are an expert newsletter writer who creates engaging content that builds relationships with subscribers.";
      
      const modelConfig = claudeAIService.getModelForTier(userTier);
      
      try {
        const response = await claudeAIService.makeClaudeRequest({
          userMessage: prompt,
          systemPrompt: systemPrompt,
          model: modelConfig.model,
          maxTokens: Math.min(1200, modelConfig.maxTokens),
          affiliateLink: affiliateLink
        });
        
        const content = response.body || response.subject || 'Generated newsletter content';
        const tokenEstimate = this.estimateTokens(prompt + content);
        
        return {
          type: 'newsletter',
          content: content,
          benefit_title: benefit.title,
          total_tokens: tokenEstimate,
          model_used: modelConfig.model
        };
        
      } catch (claudeError) {
        if (this.enableLogging) {
          console.warn('Claude AI request failed for newsletter:', claudeError.message);
        }
        
        return this.getMockNewsletter(benefit, affiliateLink);
      }

    } catch (error) {
      console.error('Error generating newsletter:', error);
      return this.getMockNewsletter(benefit, affiliateLink);
    }
  }

  /**
   * Build prompt for email series generation
   */
  buildEmailSeriesPrompt(benefit, keywords, affiliateLink, tone, generateVariants) {
    const keywordText = keywords.length > 0 ? keywords.join(', ') : '';
    
    return `Create a 3-email sequence focused on this benefit: "${benefit.title}"

Benefit Description: ${benefit.description}
Supporting Evidence: "${benefit.supporting_text}"
Keywords: ${keywordText}
Tone: ${tone}
${affiliateLink ? `Affiliate Link: ${affiliateLink}` : ''}

Create 3 emails in sequence:

EMAIL 1 - Problem/Awareness
- Subject line that grabs attention 
- Identify the problem this benefit solves
- Create curiosity about the solution
- Keep it under 200 words

EMAIL 2 - Solution/Benefits  
- Subject line that builds on email 1
- Explain how the solution works
- Highlight the specific benefit: "${benefit.title}"
- Include social proof or testimonials
- Keep it under 250 words

EMAIL 3 - Call to Action
- Subject line that creates urgency
- Summarize the key benefits
- Strong call to action${affiliateLink ? ` with the affiliate link` : ''}
- Create urgency or scarcity
- Keep it under 200 words

Format each email clearly with:
Subject: [subject line]
Body: [email content]

${generateVariants ? 'Also create 2 alternative subject lines for each email.' : ''}`;
  }

  /**
   * Build prompt for blog post generation
   */
  buildBlogPostPrompt(benefit, keywords, affiliateLink, tone) {
    const keywordText = keywords.length > 0 ? keywords.join(', ') : '';
    
    return `Write a 500-600 word SEO-optimized blog post about: "${benefit.title}"

Benefit Description: ${benefit.description}
Supporting Evidence: "${benefit.supporting_text}"
Keywords to include: ${keywordText}
Tone: ${tone}

Structure the blog post with:
1. Compelling headline (H1)
2. Introduction that hooks the reader
3. 3-4 main sections with subheadings (H2)
4. Practical tips or actionable advice
5. Conclusion with call to action${affiliateLink ? ` including the affiliate link` : ''}

Make it engaging, informative, and optimized for search engines. Include the benefit "${benefit.title}" naturally throughout the content.`;
  }

  /**
   * Build prompt for newsletter generation
   */
  buildNewsletterPrompt(benefit, keywords, affiliateLink, tone) {
    const keywordText = keywords.length > 0 ? keywords.join(', ') : '';
    
    return `Create a newsletter section focused on: "${benefit.title}"

Benefit Description: ${benefit.description}
Supporting Evidence: "${benefit.supporting_text}"
Keywords: ${keywordText}
Tone: ${tone}

Create a newsletter section (150-250 words) that includes:
1. Catchy section heading
2. Brief introduction to the topic
3. Key points about "${benefit.title}"
4. Practical tip or insight
5. Soft call to action${affiliateLink ? ` with the affiliate link` : ''}

Keep it conversational and valuable for newsletter subscribers.`;
  }

  /**
   * Mock email series for development/testing
   */
  getMockEmailSeries(benefit, affiliateLink = '') {
    const linkText = affiliateLink ? `<a href="${affiliateLink}">Learn More</a>` : '[Learn More]';
    
    return {
      type: 'email_series',
      content: `EMAIL 1 - Problem/Awareness
Subject: Are you tired of wasting time on repetitive tasks?

Hi there,

Do you ever feel like you're spending too much time on boring, repetitive work? You're not alone. Most professionals waste 40-60% of their day on tasks that could be automated or streamlined.

What if there was a better way?

Tomorrow, I'll show you how successful people are reclaiming their time and boosting their productivity.

Talk soon,
[Your Name]

---

EMAIL 2 - Solution/Benefits
Subject: The secret to getting 40-60% of your time back

Hi again,

Yesterday I mentioned how much time we waste on repetitive tasks. Today, I want to share something that could change everything for you.

${benefit.description}

"${benefit.supporting_text}"

This isn't just theory - thousands of professionals are already using this approach to transform how they work.

Want to see how it works? ${linkText}

Best regards,
[Your Name]

---

EMAIL 3 - Call to Action  
Subject: Last chance - don't let this opportunity slip away

Hi,

Over the past two days, we've talked about:
- The time you're losing to repetitive tasks
- How ${benefit.title.toLowerCase()} can solve this problem
- Real results from people just like you

Here's the thing - this opportunity won't last forever. The special pricing and bonuses are only available for a limited time.

Don't miss out on your chance to ${benefit.title.toLowerCase()}.

${linkText}

To your success,
[Your Name]`,
      benefit_title: benefit.title,
      total_tokens: 800,
      model_used: 'mock'
    };
  }

  /**
   * Mock blog post for development/testing
   */
  getMockBlogPost(benefit, affiliateLink = '') {
    const linkText = affiliateLink ? `<a href="${affiliateLink}">discover the solution</a>` : 'discover the solution';
    
    return {
      type: 'blog_post',
      content: `# ${benefit.title}: The Ultimate Guide to Transforming Your Productivity

## Introduction

In today's fast-paced world, finding ways to ${benefit.title.toLowerCase()} has become more crucial than ever. ${benefit.description}

## The Problem Most People Face

"${benefit.supporting_text}" - This common struggle affects millions of professionals worldwide. The good news? There's a proven solution.

## How to ${benefit.title}

### Step 1: Identify Your Biggest Time Wasters
Start by tracking where your time actually goes. Most people are surprised to discover how much time they spend on non-essential tasks.

### Step 2: Implement Smart Solutions
The key is finding tools and strategies that work for your specific situation. This is where many people struggle - they try generic solutions instead of targeted approaches.

### Step 3: Measure Your Results
Track your progress and adjust your approach based on what's working. Successful people constantly refine their methods.

## Real Results from Real People

Thousands of professionals have already discovered how to ${benefit.title.toLowerCase()}. The results speak for themselves - most see improvements within the first week.

## Conclusion

${benefit.title} isn't just a nice-to-have - it's essential for anyone who wants to succeed in today's competitive environment. Ready to ${linkText}?

Take action today and join the thousands who have already transformed their productivity.`,
      benefit_title: benefit.title,
      total_tokens: 600,
      model_used: 'mock'
    };
  }

  /**
   * Mock newsletter for development/testing
   */
  getMockNewsletter(benefit, affiliateLink = '') {
    const linkText = affiliateLink ? `<a href="${affiliateLink}">Check it out</a>` : 'Check it out';
    
    return {
      type: 'newsletter',
      content: `## 🚀 This Week's Productivity Tip: ${benefit.title}

Hey there!

This week, I want to share something that could completely change how you approach your work. It's all about ${benefit.title.toLowerCase()}.

**Here's what caught my attention:**
"${benefit.supporting_text}"

${benefit.description}

**Quick Tip:** Start small. Pick one repetitive task you do daily and look for ways to streamline it. You'll be amazed at the compound effect of these small improvements.

Thousands of professionals are already seeing 40-60% time savings with this approach. ${linkText} to see how you can join them.

Stay productive!
[Your Name]`,
      benefit_title: benefit.title,
      total_tokens: 400,
      model_used: 'mock'
    };
  }

  /**
   * Estimate tokens for cost calculation
   */
  estimateTokens(text) {
    if (!text) return 0;
    // Rough estimation: ~3.5 characters per token
    return Math.ceil(text.length / 3.5);
  }
}

export const assetGenerationService = new AssetGenerationService();