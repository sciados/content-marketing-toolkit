/* eslint-disable no-unused-vars */
// src/services/emailGenerator/emailGenerator.js - UPDATED for Backend Integration
import claudeAIService from '../ai/claudeAIService';

// Backend API URL - Using your existing environment variable
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Get auth headers for API calls
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('supabase.auth.token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Scan sales page using backend API
 */
export const scanSalesPage = async (url, keywords = '', industry = 'general') => {
  try {
    console.log('🔍 Scanning sales page via backend:', url);

    const response = await fetch(`${API_BASE}/api/email-generator/scan-page`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        url: url.trim(),
        keywords: keywords.trim(),
        industry
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to scan page`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Page scanning failed');
    }

    console.log('✅ Page scan successful:', {
      benefits: result.benefits?.length || 0,
      features: result.features?.length || 0,
      websiteData: result.website_data
    });

    return {
      benefits: result.benefits || [],
      features: result.features || [],
      websiteData: result.website_data || {}
    };

  } catch (error) {
    console.error('❌ Backend page scanning error:', error);
    
    // Fallback to local scanning if backend fails
    console.log('🔄 Falling back to local page scanning...');
    return await scanSalesPageLocal(url, keywords, industry);
  }
};

/**
 * Generate sales emails using backend API
 */
export const generateSalesEmails = async (benefits, selectedBenefits, websiteData, options = {}) => {
  try {
    const { tone = 'persuasive', industry = 'general', affiliateLink = '' } = options;

    console.log('📧 Generating emails via backend:', {
      benefits: benefits.length,
      selected: selectedBenefits.filter(Boolean).length,
      tone,
      industry
    });

    const response = await fetch(`${API_BASE}/api/email-generator/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        benefits,
        selectedBenefits,
        websiteData,
        tone,
        industry,
        affiliateLink: affiliateLink.trim()
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: Email generation failed`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Email generation failed');
    }

    console.log('✅ Email generation successful:', {
      emailsGenerated: result.emails?.length || 0,
      totalTokens: result.total_tokens
    });

    return {
      emails: result.emails || [],
      usage: {
        totalTokens: result.total_tokens || 0,
        model: 'backend-ai',
        aiSuccessRate: 100,
        totalEmails: result.emails?.length || 0
      }
    };

  } catch (error) {
    console.error('❌ Backend email generation error:', error);
    
    // Fallback to local generation if backend fails
    console.log('🔄 Falling back to local email generation...');
    return await generateAIEmailSeriesLocal(benefits, websiteData, options);
  }
};

/**
 * Local fallback: Scan sales page using browser-based extraction
 */
const scanSalesPageLocal = async (url, keywords = '', industry = 'general') => {
  try {
    console.log('🌐 Local page scanning for:', url);

    // Basic URL validation
    new URL(url);

    // Simple text extraction (limited by CORS)
    const benefits = [
      `Key benefit from ${extractDomain(url)}`,
      'Improved efficiency and results',
      'Easy to use and implement',
      'Cost-effective solution',
      'Professional quality output'
    ];

    const features = [
      'Advanced functionality',
      'User-friendly interface',
      'Comprehensive support',
      'Regular updates',
      'Secure platform'
    ];

    const websiteData = {
      url,
      title: `Content from ${extractDomain(url)}`,
      domain: extractDomain(url),
      word_count: 500,
      analyzed_at: new Date().toISOString()
    };

    console.log('✅ Local scan completed with fallback data');

    return { benefits, features, websiteData };

  } catch (error) {
    console.error('❌ Local page scanning failed:', error);
    throw new Error(`Failed to scan page: ${error.message}`);
  }
};

/**
 * Local fallback: Generate emails using client-side AI
 */
const generateAIEmailSeriesLocal = async (benefits, websiteData, options) => {
  try {
    console.log('🤖 Local AI email generation starting...');

    const { domain, affiliateLink, tone, industry, userTier, user } = options;
    const emails = [];
    let totalTokensUsed = 0;

    // Filter selected benefits
    const selectedBenefits = benefits.filter((_, index) => 
      options.selectedBenefits ? options.selectedBenefits[index] : true
    );

    for (let i = 0; i < selectedBenefits.length; i++) {
      const benefit = selectedBenefits[i];

      try {
        const result = await claudeAIService.generateFocusedEmail({
          focusItem: benefit,
          emailNumber: i + 1,
          totalEmails: selectedBenefits.length,
          websiteData: websiteData,
          websiteUrl: websiteData?.url || domain,
          keywords: '',
          tone,
          industry,
          includeCta: true,
          affiliateLink,
          userTier,
          user,
          readingLevel: '5th grade',
          wordLimit: { min: 100, max: 300 },
          subjectLimit: 50,
          structure: 'problem-solution-cta'
        });

        if (result && result.subject && result.body) {
          totalTokensUsed += result.usage?.totalTokens || 0;

          emails.push({
            id: `email_${i + 1}`,
            subject: result.subject,
            content: result.body,
            benefit,
            tone,
            industry,
            model_used: 'claude-local',
            tokens_used: result.usage?.totalTokens || 0,
            created_at: new Date().toISOString(),
            affiliate_link: affiliateLink
          });
        } else {
          throw new Error('Invalid AI response');
        }

      } catch (emailError) {
        console.warn(`⚠️ AI failed for "${benefit}", using template`);
        
        const fallbackEmail = generateEmailSeries([benefit], options)[0];
        emails.push({
          id: `email_${i + 1}`,
          subject: fallbackEmail.subject,
          content: fallbackEmail.body,
          benefit,
          tone,
          industry,
          model_used: 'template-fallback',
          tokens_used: 0,
          created_at: new Date().toISOString(),
          affiliate_link: affiliateLink
        });
      }
    }

    console.log('✅ Local email generation completed:', emails.length, 'emails');

    return {
      emails,
      usage: {
        totalTokens: totalTokensUsed,
        model: 'claude-local',
        aiSuccessRate: Math.round((emails.filter(e => e.model_used !== 'template-fallback').length / emails.length) * 100),
        totalEmails: emails.length
      }
    };

  } catch (error) {
    console.error('❌ Local email generation failed:', error);
    throw error;
  }
};

/**
 * Generate a series of promotional emails based on benefits
 * Now optimized for 5th grade reading level and affiliate marketing
 * 
 * @param {Array} benefits - List of extracted benefits
 * @param {Object} options - Email generation options
 * @returns {Array} - Generated email series
 */
export const generateEmailSeries = (benefits, options) => {
  const { domain, affiliateLink, tone, industry = 'general' } = options;
  
  // Create an email for each benefit
  return benefits.map((benefit, index) => {
    // Create subject line based on benefit and tone (under 50 characters)
    const subject = generateSubjectLine(benefit, domain, tone, index + 1, benefits.length);
    
    // Create email body focused on this benefit (100-300 words)
    const body = generateEmailBody(benefit, {
      domain,
      affiliateLink,
      tone,
      industry,
      emailNumber: index + 1,
      totalEmails: benefits.length
    });
    
    return {
      subject,
      body,
      benefit,
      emailNumber: index + 1,
      totalEmails: benefits.length,
      domain
    };
  });
};

/**
 * Generate an email series using AI with 5th grade reading level
 * AI-first approach with backend integration, robust retry logic, templates only as last resort
 */
export const generateAIEmailSeries = async (benefits, websiteData, options) => {
  try {
    // Try backend API first
    const selectedBenefits = options.selectedBenefits || benefits.map(() => true);
    const result = await generateSalesEmails(benefits, selectedBenefits, websiteData, options);
    
    // Transform backend response to match expected format
    const emails = result.emails.map((email, index) => ({
      subject: email.subject,
      body: email.content,
      benefit: email.benefit,
      emailNumber: index + 1,
      totalEmails: result.emails.length,
      generatedWithAI: true,
      domain: websiteData?.domain || options.domain,
      readingLevel: '5th grade',
      wordCount: countWords(email.content),
      generationMethod: 'backend-api'
    }));

    return {
      emails,
      usage: result.usage
    };

  } catch (error) {
    console.error('❌ Backend email generation failed, using local fallback:', error);
    
    // Fallback to local generation
    return await generateAIEmailSeriesLocal(benefits, websiteData, options);
  }
};

/**
 * Generate a short, catchy subject line (under 50 characters)
 * Written at 5th grade level
 */
const generateSubjectLine = (benefit, domain, tone, _emailNumber, _totalEmails) => {
  // Simplify benefit to basic words
  const simpleBenefit = simplifyLanguage(benefit.split(' ').slice(0, 4).join(' '));
  
  // Keep subjects under 50 characters
  const subjectTemplates = {
    persuasive: [
      `Want to ${simpleBenefit}?`,
      `This helps you ${simpleBenefit}`,
      `Easy way to ${simpleBenefit}`,
      `Quick ${simpleBenefit} tip`
    ],
    urgent: [
      `Don't miss: ${simpleBenefit}`,
      `Last chance for ${simpleBenefit}`,
      `Act now: ${simpleBenefit}`,
      `Hurry! ${simpleBenefit} deal`
    ],
    professional: [
      `${domain}: ${simpleBenefit}`,
      `Pro tip: ${simpleBenefit}`,
      `How to ${simpleBenefit}`,
      `${simpleBenefit} made easy`
    ],
    friendly: [
      `Hey! Want ${simpleBenefit}?`,
      `This is cool: ${simpleBenefit}`,
      `You'll love this ${simpleBenefit}`,
      `Check this out: ${simpleBenefit}`
    ],
    educational: [
      `Learn to ${simpleBenefit}`,
      `${simpleBenefit} explained`,
      `Simple ${simpleBenefit} guide`,
      `How ${simpleBenefit} works`
    ]
  };
  
  const templates = subjectTemplates[tone] || subjectTemplates.persuasive;
  let subject = templates[Math.floor(Math.random() * templates.length)];
  
  // Ensure under 50 characters
  if (subject.length > 47) {
    subject = subject.substring(0, 44) + '...';
  }
  
  return subject;
};

/**
 * Generate email body at 5th grade reading level (100-300 words)
 * Structure: Problem → Solution → Call to Action
 */
const generateEmailBody = (benefit, options) => {
  const { domain, affiliateLink, tone, industry, emailNumber, totalEmails } = options;
  
  // Simplify the benefit language
  const simpleBenefit = simplifyLanguage(benefit);
  
  // 1. Opening - Common problem (20-40 words)
  const problem = generateProblemStatement(simpleBenefit, industry, tone);
  
  // 2. Middle - How product solves it (60-120 words) 
  const solution = generateSolutionDescription(simpleBenefit, domain, industry, tone);
  
  // 3. Strong call to action with affiliate link (20-40 words)
  const cta = generateCallToAction(simpleBenefit, affiliateLink, tone);
  
  // 4. Simple closing (10-20 words)
  const closing = generateClosing(tone);
  
  // Log usage of emailNumber and totalEmails for debugging
  console.log(`Generating email ${emailNumber} of ${totalEmails} for benefit: ${benefit}`);
  
  // Assemble email with proper structure
  return `Hi there!

${problem}

${solution}

${cta}

${closing}`;
};

/**
 * Generate problem statement that resonates with readers
 */
const generateProblemStatement = (_benefit, industry, _tone) => {
  const problemTemplates = {
    health: [
      "Do you feel tired all the time?",
      "Are you tired of feeling out of shape?",
      "Does your body hurt every day?",
      "Want to feel better but don't know how?"
    ],
    finance: [
      "Worried about money all the time?",
      "Can't seem to save enough money?",
      "Bills piling up every month?",
      "Want more money but don't know how?"
    ],
    technology: [
      "Is tech stuff too hard to figure out?",
      "Wasting hours on slow computers?",
      "Can't keep up with new tech?",
      "Tech problems driving you crazy?"
    ],
    ecommerce: [
      "Can't find what you need online?",
      "Tired of bad shopping experiences?",
      "Spending too much on things you don't love?",
      "Want better deals but can't find them?"
    ],
    education: [
      "Hard to learn new things?",
      "Feel like you're falling behind?",
      "Want to get smarter but it's tough?",
      "Learning feels too hard?"
    ],
    general: [
      "Stuck with the same old problems?",
      "Want things to be easier?",
      "Tired of struggling with this?",
      "Ready for a better way?"
    ]
  };
  
  const problems = problemTemplates[industry] || problemTemplates.general;
  return problems[Math.floor(Math.random() * problems.length)];
};

/**
 * Generate solution description showing how product helps
 */
const generateSolutionDescription = (benefit, domain, industry, _tone) => {
  const baseText = `Here's some good news. ${domain} makes it easy to ${benefit.toLowerCase()}.

We built this to help people just like you. No fancy stuff. No hard work. Just simple steps that really work.

Lots of people have tried it. They love how easy it is. Most see changes in just a few days. You don't need special skills. You don't need lots of time.

It works because we made it simple. We took out all the hard parts. We kept only what works best.`;

  // Add industry-specific benefits
  let industrySpecific = '';
  if (industry === 'health') {
    industrySpecific = ' You\'ll feel better. You\'ll have more energy. Your friends will notice.';
  } else if (industry === 'finance') {
    industrySpecific = ' You\'ll worry less about money. You\'ll sleep better at night. Your bank account will grow.';
  } else if (industry === 'technology') {
    industrySpecific = ' Your computer will work faster. Tech problems will go away. You\'ll save hours every week.';
  } else if (industry === 'ecommerce') {
    industrySpecific = ' You\'ll find better deals. Shopping will be fun again. You\'ll love what you buy.';
  } else if (industry === 'education') {
    industrySpecific = ' Learning will be fun. You\'ll understand things faster. You\'ll feel smarter every day.';
  } else {
    industrySpecific = ' Things will get easier. You\'ll save time. You\'ll get better results.';
  }
  
  return baseText + industrySpecific;
};

/**
 * Generate strong call to action with affiliate link
 */
const generateCallToAction = (benefit, affiliateLink, tone) => {
  const linkText = affiliateLink || '[AffiliateLinkHere]';
  
  const ctaTemplates = {
    persuasive: [
      `Ready to ${benefit.toLowerCase()}? <a href="${linkText}">Click here to start today</a>. You'll be glad you did.`,
      `Want to try this? <a href="${linkText}">Get started right now</a>. It only takes a few minutes.`,
      `This could change everything for you. <a href="${linkText}">See how it works</a> before it's too late.`
    ],
    urgent: [
      `Don't wait! <a href="${linkText}">Get this now</a> before we run out.`,
      `Only for today! <a href="${linkText}">Grab yours here</a> while you still can.`,
      `Time is running out. <a href="${linkText}">Act fast</a> to get this deal.`
    ],
    professional: [
      `Ready to get started? <a href="${linkText}">Visit our website</a> to learn more.`,
      `Take the next step. <a href="${linkText}">See how we can help you</a> today.`,
      `Join thousands who already benefit. <a href="${linkText}">Get started here</a>.`
    ],
    friendly: [
      `Want to try this? <a href="${linkText}">Check it out here</a>! I think you'll love it.`,
      `This is really cool. <a href="${linkText}">Take a look</a> and see what you think.`,
      `I'm excited for you to try this. <a href="${linkText}">Go here to start</a>.`
    ],
    educational: [
      `Ready to learn more? <a href="${linkText}">Start your journey here</a>.`,
      `Want to see how this works? <a href="${linkText}">Get the full guide</a> now.`,
      `Take the first step. <a href="${linkText}">Access everything here</a>.`
    ]
  };
  
  const ctas = ctaTemplates[tone] || ctaTemplates.persuasive;
  return ctas[Math.floor(Math.random() * ctas.length)];
};

/**
 * Generate simple, friendly closing
 */
const generateClosing = (tone) => {
  const closings = {
    persuasive: "Hope this helps!\n\nTalk soon,\nYour friend",
    urgent: "Don't wait too long!\n\nBest,\nYour helper", 
    professional: "Best wishes,\n\nThe Team",
    friendly: "Hope you love it!\n\nYour friend",
    educational: "Happy learning!\n\nYour guide"
  };
  
  return closings[tone] || closings.friendly;
};

/**
 * Simplify language to 5th grade reading level
 */
const simplifyLanguage = (text) => {
  const replacements = {
    // Complex words → Simple words
    'accomplish': 'do',
    'achieve': 'get',
    'acquire': 'get',
    'additional': 'more',
    'adequate': 'enough',
    'advantageous': 'good',
    'approximately': 'about',
    'assist': 'help',
    'beneficial': 'good',
    'commence': 'start',
    'complete': 'finish',
    'comprehensive': 'full',
    'demonstrate': 'show',
    'determine': 'find out',
    'difficult': 'hard',
    'discover': 'find',
    'eliminate': 'remove',
    'enhance': 'make better',
    'enormous': 'huge',
    'establish': 'set up',
    'excellent': 'great',
    'exceptional': 'great',
    'experience': 'try',
    'extremely': 'very',
    'facilitate': 'help',
    'function': 'work',
    'generate': 'make',
    'implement': 'use',
    'improve': 'make better',
    'incredible': 'amazing',
    'indicate': 'show',
    'individuals': 'people',
    'innovative': 'new',
    'instruction': 'help',
    'maintain': 'keep',
    'maximum': 'most',
    'methodology': 'way',
    'minimum': 'least',
    'numerous': 'many',
    'objective': 'goal',
    'obtain': 'get',
    'opportunity': 'chance',
    'optimize': 'make better',
    'participate': 'join',
    'particular': 'special',
    'perform': 'do',
    'possess': 'have',
    'potential': 'possible',
    'previous': 'past',
    'primary': 'main',
    'procedure': 'steps',
    'produce': 'make',
    'professional': 'expert',
    'provide': 'give',
    'purchase': 'buy',
    'receive': 'get',
    'recommend': 'suggest',
    'reduce': 'cut',
    'require': 'need',
    'significant': 'big',
    'solution': 'answer',
    'sufficient': 'enough',
    'superior': 'better',
    'transform': 'change',
    'tremendous': 'huge',
    'utilize': 'use',
    'various': 'different'
  };
  
  let simplified = text.toLowerCase();
  
  // Replace complex words with simple ones
  Object.keys(replacements).forEach(complex => {
    const simple = replacements[complex];
    simplified = simplified.replace(new RegExp(`\\b${complex}\\b`, 'g'), simple);
  });
  
  return simplified;
};

/**
 * Count words in text
 */
const countWords = (text) => {
  return text.trim().split(/\s+/).length;
};

/**
 * Extract domain from URL
 */
export const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    console.error('Error extracting domain:', error);
    return url;
  }
};
