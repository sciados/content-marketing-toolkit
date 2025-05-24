// src/services/emailGenerator/emailGenerator.js
import claudeAIService from '../ai/claudeAIService';

/**
 * Generate a series of promotional emails based on benefits
 * 
 * @param {Array} benefits - List of extracted benefits
 * @param {Object} options - Email generation options
 * @returns {Array} - Generated email series
 */
export const generateEmailSeries = (benefits, options) => {
  const { domain, affiliateLink, tone, industry = 'general' } = options;
  
  // Create an email for each benefit
  return benefits.map((benefit, index) => {
    // Create subject line based on benefit and tone
    const subject = generateSubjectLine(benefit, domain, tone, index + 1, benefits.length);
    
    // Create email body focused on this benefit
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
 * Generate a subject line for an email
 * 
 * @param {string} benefit - The main benefit to focus on
 * @param {string} domain - Domain name
 * @param {string} tone - Email tone
 * @param {number} emailNumber - Current email number in series
 * @param {number} totalEmails - Total emails in series
 * @returns {string} - Generated subject line
 */
const generateSubjectLine = (benefit, domain, tone, emailNumber, totalEmails) => {
  // Shorten benefit to 5-7 words for subject
  const shortBenefit = benefit.split(' ').slice(0, 6).join(' ');
  let subject = '';
  
  // Series indicator for multi-email series
  const seriesPrefix = totalEmails > 1 ? `[${emailNumber}/${totalEmails}] ` : '';
  
  // Generate subject based on tone
  if (tone === 'persuasive') {
    const templates = [
      `${seriesPrefix}Discover How ${domain} Helps You ${shortBenefit}...`,
      `${seriesPrefix}The Secret to ${shortBenefit} with ${domain}`,
      `${seriesPrefix}How ${domain} Delivers ${shortBenefit}`,
      `${seriesPrefix}Transform Your Results: ${shortBenefit}`
    ];
    subject = templates[Math.floor(Math.random() * templates.length)];
  } else if (tone === 'urgent') {
    const templates = [
      `${seriesPrefix}Don't Miss This: ${shortBenefit}`,
      `${seriesPrefix}LIMITED TIME: ${shortBenefit} with ${domain}`,
      `${seriesPrefix}Act Now to ${shortBenefit}`,
      `${seriesPrefix}Last Chance to ${shortBenefit}`
    ];
    subject = templates[Math.floor(Math.random() * templates.length)];
  } else if (tone === 'professional') {
    const templates = [
      `${seriesPrefix}${domain}: Professional Solution for ${shortBenefit}`,
      `${seriesPrefix}Introducing ${domain}'s Approach to ${shortBenefit}`,
      `${seriesPrefix}Professional Insights: ${shortBenefit}`,
      `${seriesPrefix}${domain}: Industry-Leading ${shortBenefit}`
    ];
    subject = templates[Math.floor(Math.random() * templates.length)];
  } else if (tone === 'friendly') {
    const templates = [
      `${seriesPrefix}Hey! Want to ${shortBenefit}?`,
      `${seriesPrefix}I thought you'd like this: ${shortBenefit}`,
      `${seriesPrefix}Check out how ${domain} helps you ${shortBenefit}`,
      `${seriesPrefix}This made me think of you: ${shortBenefit}`
    ];
    subject = templates[Math.floor(Math.random() * templates.length)];
  } else if (tone === 'educational') {
    const templates = [
      `${seriesPrefix}Learn How ${domain} Enables ${shortBenefit}`,
      `${seriesPrefix}The Science Behind ${shortBenefit}`,
      `${seriesPrefix}Understanding ${shortBenefit}: A ${domain} Guide`,
      `${seriesPrefix}${domain} Explains: The Path to ${shortBenefit}`
    ];
    subject = templates[Math.floor(Math.random() * templates.length)];
  } else {
    // Default/fallback subject
    subject = `${seriesPrefix}${domain}: ${shortBenefit}`;
  }
  
  return subject;
};

/**
 * Generate a single email body focused on a specific benefit
 * 
 * @param {string} benefit - The main benefit to focus on
 * @param {Object} options - Email generation options
 * @returns {string} - Generated email body
 */
const generateEmailBody = (benefit, options) => {
  const { domain, affiliateLink, tone, industry, emailNumber, totalEmails } = options;
  
  // Create intro based on tone
  let intro = '';
  if (tone === 'persuasive') {
    intro = `I wanted to reach out and share some exciting news about how ${domain} is helping people just like you.`;
  } else if (tone === 'urgent') {
    intro = `I need to get this important information to you right away about a game-changing opportunity with ${domain}.`;
  } else if (tone === 'professional') {
    intro = `I'm writing to introduce you to ${domain}'s professional solutions that are transforming results for our clients.`;
  } else if (tone === 'friendly') {
    intro = `Hey there! I hope you're having a great day! I just had to share something awesome about ${domain} that I think you'll love.`;
  } else if (tone === 'educational') {
    intro = `I'd like to share some valuable insights about how ${domain} is helping people achieve significant results through our innovative approach.`;
  }
  
  // Create series intro if this is part of a series
  let seriesIntro = '';
  if (totalEmails > 1) {
    seriesIntro = `This is email ${emailNumber} in a series of ${totalEmails} where I'm sharing the most valuable benefits of ${domain}.\n\n`;
  }
  
  // Create benefit highlight section with industry-specific language
  let benefitHighlight = '';
  if (industry === 'health') {
    benefitHighlight = `Today, I want to focus specifically on how ${domain} helps you: \n\n**${benefit}**\n\nThis is a game-changer for your health and wellness because it means you can finally overcome the obstacles that have been preventing you from achieving optimal wellbeing.`;
  } else if (industry === 'finance') {
    benefitHighlight = `Today, I want to focus specifically on how ${domain} helps you: \n\n**${benefit}**\n\nThis is a crucial advantage for your financial future because it addresses one of the key challenges that prevent most people from achieving true financial security.`;
  } else if (industry === 'technology') {
    benefitHighlight = `Today, I want to focus specifically on how ${domain} helps you: \n\n**${benefit}**\n\nThis technological breakthrough solves a critical pain point for users, significantly improving efficiency and results.`;
  } else if (industry === 'ecommerce') {
    benefitHighlight = `Today, I want to highlight one of our most popular benefits: \n\n**${benefit}**\n\nOur customers consistently tell us how this feature has transformed their experience and provided exceptional value.`;
  } else if (industry === 'education') {
    benefitHighlight = `Today, I want to focus specifically on how ${domain} helps you: \n\n**${benefit}**\n\nThis educational advantage has proven transformative for our students, addressing a critical gap in traditional learning approaches.`;
  } else {
    benefitHighlight = `Today, I want to focus specifically on how ${domain} helps you: \n\n**${benefit}**\n\nThis is a game-changer because it means you can finally overcome the challenges that have been holding you back.`;
  }
  
  // Create evidence section with industry-specific examples
  let evidence = '';
  if (industry === 'health') {
    evidence = `Many of our customers have reported significant improvements in their health outcomes after implementing ${domain}'s solution. For example, one client saw a 37% improvement in their overall wellness metrics within just 30 days.`;
  } else if (industry === 'finance') {
    evidence = `Our clients consistently report impressive financial results after implementing ${domain}'s strategies. One client was able to increase their investment returns by 28% while simultaneously reducing risk exposure.`;
  } else if (industry === 'technology') {
    evidence = `Our users have documented substantial efficiency gains after adopting ${domain}'s platform. One organization reduced their process time by 43% while improving accuracy by 27%.`;
  } else if (industry === 'ecommerce') {
    evidence = `Customer satisfaction scores for this feature are consistently above 95%, and our reviews frequently mention how it exceeds expectations compared to other options in the market.`;
  } else if (industry === 'education') {
    evidence = `Our students consistently achieve better outcomes, with 87% reporting that this specific aspect of our program was instrumental in their success. One learner was able to master complex concepts in half the expected time.`;
  } else {
    evidence = `Many of our customers have reported significant improvements after implementing ${domain}'s solution. For example, one client saw a 37% increase in results within just 30 days.`;
  }
  
  // Create benefit visualizations based on industry
  let benefitVisualizations = '';
  if (industry === 'health') {
    benefitVisualizations = `Imagine what this could mean for you:\n- Wake up feeling energized and ready for the day\n- Enjoy activities without limitations or discomfort\n- Receive compliments on your visible health improvements\n- Feel confident in your long-term wellbeing`;
  } else if (industry === 'finance') {
    benefitVisualizations = `Imagine what this could mean for you:\n- Feel confident about your financial future\n- Make investment decisions with clarity and peace of mind\n- Watch your wealth grow consistently over time\n- Achieve your financial goals ahead of schedule`;
  } else if (industry === 'technology') {
    benefitVisualizations = `Imagine what this could mean for you:\n- Complete tasks in a fraction of the time\n- Eliminate technical frustrations and bottlenecks\n- Stay ahead of competitors with cutting-edge capabilities\n- Scale your operations without proportional cost increases`;
  } else if (industry === 'ecommerce') {
    benefitVisualizations = `Imagine what this could mean for you:\n- Find exactly what you need without endless searching\n- Enjoy a premium shopping experience that respects your time\n- Discover products that perfectly match your preferences\n- Become the envy of friends with your exceptional finds`;
  } else if (industry === 'education') {
    benefitVisualizations = `Imagine what this could mean for you:\n- Master new skills that immediately enhance your career prospects\n- Learn complex concepts with surprising ease and clarity\n- Apply your knowledge to solve real-world problems\n- Gain recognition for your newly developed expertise`;
  } else {
    benefitVisualizations = `Imagine what this could mean for you:\n- Save valuable time and resources\n- Get better results with less effort\n- Stay ahead of your competition\n- Enjoy peace of mind knowing you've made the right choice`;
  }
  
  // Create call to action based on whether an affiliate link was provided
  let callToAction = '';
  if (affiliateLink) {
    if (tone === 'urgent') {
      callToAction = `This opportunity won't last forever. Click here to get started immediately: ${affiliateLink}\n\nDon't risk missing out - take action now while this is still available!`;
    } else if (tone === 'professional') {
      callToAction = `I invite you to explore how ${domain} can deliver these results for you. Visit our website to learn more and get started: ${affiliateLink}\n\nWe look forward to helping you achieve similar outcomes.`;
    } else if (tone === 'friendly') {
      callToAction = `I really think you'll love this! Check it out here when you get a chance: ${affiliateLink}\n\nLet me know what you think after you've had a look!`;
    } else if (tone === 'educational') {
      callToAction = `To learn more about this approach and see how it can work for you, visit our resource center: ${affiliateLink}\n\nWe've prepared comprehensive materials to guide you through the process.`;
    } else {
      callToAction = `Ready to experience these benefits yourself? Click here to get started: ${affiliateLink}\n\nDon't wait - take action now and start seeing results!`;
    }
  } else {
    if (tone === 'urgent') {
      callToAction = `This opportunity won't last forever. Visit ${domain} today to get started immediately.\n\nDon't risk missing out - take action now while this is still available!`;
    } else if (tone === 'professional') {
      callToAction = `I invite you to explore how ${domain} can deliver these results for you. Visit our website to learn more and begin implementing our solutions.\n\nWe look forward to helping you achieve similar outcomes.`;
    } else if (tone === 'friendly') {
      callToAction = `I really think you'll love this! Check out ${domain} when you get a chance.\n\nLet me know what you think after you've had a look!`;
    } else if (tone === 'educational') {
      callToAction = `To learn more about this approach and see how it can work for you, visit ${domain}'s resource center.\n\nWe've prepared comprehensive materials to guide you through the process.`;
    } else {
      callToAction = `Ready to experience these benefits yourself? Visit ${domain} today to get started.\n\nDon't wait - take action now and start seeing results!`;
    }
  }
  
  // Create next steps if this is part of a series
  let nextSteps = '';
  if (totalEmails > 1 && emailNumber < totalEmails) {
    nextSteps = `\nKeep an eye on your inbox for my next email, where I'll share another powerful benefit of ${domain} that you won't want to miss.`;
  }
  
  // Create closing based on tone
  let closing = '';
  if (tone === 'professional') {
    closing = 'Best regards,';
  } else if (tone === 'friendly') {
    closing = 'Talk soon,';
  } else if (tone === 'educational') {
    closing = 'To your success,';
  } else {
    closing = 'Best,';
  }
  
  // Assemble the complete email
  return `Dear Friend,

${intro}

${seriesIntro}${benefitHighlight}

${evidence}

${benefitVisualizations}

${callToAction}

${nextSteps}

${closing}
Your Name`;
};

/**
 * Generate an email series using AI
 * 
 * @param {Array} benefits - List of benefits
 * @param {Object} websiteData - Website metadata
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} - Generated email series
 */
export const generateAIEmailSeries = async (benefits, websiteData, options) => {
  const { domain, affiliateLink, tone, industry } = options;
  const emails = [];
  
  // Check if AI service is available
  try {
    const isAvailable = await claudeAIService.isAvailable();
    if (!isAvailable) {
      console.log('AI service unavailable, falling back to template generation');
      return generateEmailSeries(benefits, options);
    }
    
    // Generate each email individually
    for (let i = 0; i < benefits.length; i++) {
      const benefit = benefits[i];
      
      try {
        const result = await claudeAIService.generateFocusedEmail({
          focusItem: benefit,
          emailNumber: i + 1,
          totalEmails: benefits.length,
          websiteData: websiteData,
          websiteUrl: websiteData?.url || domain,
          keywords: '',
          tone,
          industry,
          includeCta: true,
          affiliateLink
        });
        
        emails.push({
          subject: result.subject,
          body: result.body,
          benefit,
          emailNumber: i + 1,
          totalEmails: benefits.length,
          generatedWithAI: true,
          domain
        });
      } catch (error) {
        console.error(`Error generating AI email for benefit "${benefit}":`, error);
        
        // Fallback to template generation for this email
        const fallbackEmail = generateEmailSeries([benefit], options)[0];
        emails.push({
          ...fallbackEmail,
          generatedWithAI: false
        });
      }
    }
    
    return emails;
  } catch (error) {
    console.error('Error checking AI service availability:', error);
    return generateEmailSeries(benefits, options);
  }
};