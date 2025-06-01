// src/services/emailGenerator/simulatedDataGenerator.js
import { extractDomain } from './utils';

/**
 * Generate simulated data when real scraping fails
 * 
 * @param {string} url - Sales page URL
 * @param {string} keywords - Keywords to focus on
 * @param {string} industry - Industry for context
 * @returns {Object} - Simulated data
 */
export const generateSimulatedData = (url, keywords = '', industry = 'general') => {
  console.log(`Generating simulated data for ${url} with keywords: ${keywords}, industry: ${industry}`);
  
  // Extract domain for personalization
  const domain = extractDomain(url);
  
  // Parse keywords into an array
  const keywordArray = keywords.split(',').map(k => k.trim()).filter(Boolean);
  
  // Generate benefits based on domain, keywords, and industry
  let benefits = generateBenefitsFromKeywords(domain, keywordArray, industry);
  
  // Generate features based on domain, keywords, and industry
  const features = generateFeaturesFromKeywords(domain, keywordArray, industry);
  
  // Generate value proposition
  let valueProposition = '';
  if (industry === 'health') {
    valueProposition = `Transform your health and wellness with ${domain}'s innovative approach`;
  } else if (industry === 'finance') {
    valueProposition = `Secure your financial future with ${domain}'s proven strategies`;
  } else if (industry === 'technology') {
    valueProposition = `Revolutionize your workflow with ${domain}'s cutting-edge technology`;
  } else if (industry === 'ecommerce') {
    valueProposition = `Discover premium products that enhance your lifestyle at ${domain}`;
  } else if (industry === 'education') {
    valueProposition = `Unlock your full potential with ${domain}'s expert-led courses`;
  } else {
    valueProposition = `Experience exceptional results with ${domain}'s innovative solutions`;
  }
  
  // Generate website data
  const websiteData = {
    name: domain.charAt(0).toUpperCase() + domain.slice(1),
    domain,
    description: `${domain} offers premium solutions for ${industry === 'general' ? 'customers' : industry} needs.`,
    valueProposition,
    benefits: benefits.slice(0, 7), // Limit to 7 benefits
    features: features.slice(0, 7), // Limit to 7 features
    testimonials: [
      {
        quote: `${domain} transformed my approach to ${industry}. I'm seeing incredible results!`,
        author: 'John D.'
      },
      {
        quote: `I can't believe I waited so long to try ${domain}. It's been a game-changer.`,
        author: 'Sarah M.'
      }
    ],
    url
  };
  
  return {
    benefits: benefits.length > 0 ? benefits : ["Benefit 1", "Benefit 2", "Benefit 3"],
    features,
    websiteData
  };
};

/**
 * Generate benefits from keywords
 * 
 * @param {string} domain - Website domain
 * @param {Array} keywords - Keywords array
 * @param {string} industry - Industry
 * @returns {Array} - Generated benefits
 */
export const generateBenefitsFromKeywords = (domain, keywords, industry) => {
  let benefits = [];
  
  // Default benefits for any page
  const defaultBenefits = [
    `Increased productivity by up to 40% with ${domain}'s streamlined solution`,
    `Save time and effort with ${domain}'s intuitive user interface`,
    `Reduce operational costs by implementing ${domain}'s efficient systems`,
    `Gain competitive advantage with ${domain}'s cutting-edge technology`
  ];
  
  if (keywords.length > 0) {
    // Generate benefits that incorporate keywords
    keywords.forEach(keyword => {
      benefits.push(
        `Experience remarkable results with ${domain}'s ${keyword}-focused solutions`,
        `Transform your approach to ${keyword} with ${domain}'s innovative platform`
      );
    });
    
    // Add industry-specific benefits based on keywords
    if (industry === 'health' || keywords.some(k => /health|wellness|fitness|diet/.test(k))) {
      benefits.push(
        `Achieve optimal health outcomes with ${domain}'s scientifically proven methods`,
        `Join thousands who have improved their wellness with ${domain}'s system`,
        `Experience lasting results, not just quick fixes, with ${domain}'s approach`
      );
    } else if (industry === 'finance' || keywords.some(k => /finance|money|invest|wealth/.test(k))) {
      benefits.push(
        `Secure your financial future with ${domain}'s tested strategies`,
        `Build long-term wealth with ${domain}'s proven investment approach`,
        `Achieve financial independence following ${domain}'s step-by-step system`
      );
    } else if (industry === 'technology' || keywords.some(k => /tech|software|digital|app/.test(k))) {
      benefits.push(
        `Streamline your digital workflows with ${domain}'s integrated platform`,
        `Eliminate technical barriers with ${domain}'s user-friendly interface`,
        `Future-proof your operations with ${domain}'s scalable technology`
      );
    } else if (industry === 'marketing' || keywords.some(k => /business|marketing|sales|leads/.test(k))) {
      benefits.push(
        `Increase conversion rates by up to 30% with ${domain}'s marketing tools`,
        `Generate more qualified leads using ${domain}'s proven methods`,
        `Scale your business efficiently with ${domain}'s growth framework`
      );
    } else if (industry === 'education' || keywords.some(k => /learn|course|education|training/.test(k))) {
      benefits.push(
        `Master new skills in record time with ${domain}'s accelerated learning approach`,
        `Apply practical knowledge immediately with ${domain}'s action-oriented courses`,
        `Gain recognized credentials that boost your career prospects`
      );
    }
  } else {
    // If no keywords provided, use benefits from the industry list
    if (industry === 'health') {
      benefits = [
        `Improve your overall wellness with ${domain}'s holistic approach`,
        `Achieve sustainable health results with scientifically-backed methods`,
        `Feel energized and revitalized with ${domain}'s proven system`,
        `Transform your health with personalized solutions tailored to your needs`,
        `Experience rapid improvements while building long-term health habits`
      ];
    } else if (industry === 'finance') {
      benefits = [
        `Secure your financial future with ${domain}'s comprehensive planning tools`,
        `Grow your wealth consistently using proven investment strategies`,
        `Reduce financial stress with automated money management solutions`,
        `Make smarter financial decisions with data-driven insights`,
        `Optimize your tax strategy to keep more of what you earn`
      ];
    } else if (industry === 'technology') {
      benefits = [
        `Streamline your workflow with ${domain}'s intuitive platform`,
        `Increase productivity by automating repetitive tasks`,
        `Stay ahead of the curve with cutting-edge technological solutions`,
        `Eliminate technical headaches with user-friendly interfaces`,
        `Scale your operations seamlessly as your needs grow`
      ];
    } else if (industry === 'ecommerce') {
      benefits = [
        `Discover premium products that enhance your lifestyle`,
        `Save money with exclusive member pricing and special offers`,
        `Enjoy convenient shopping with fast, reliable delivery options`,
        `Find exactly what you need with personalized recommendations`,
        `Shop with confidence thanks to secure transactions and quality guarantees`
      ];
    } else if (industry === 'education') {
      benefits = [
        `Master new skills faster with expert-designed learning paths`,
        `Advance your career with industry-recognized certifications`,
        `Learn at your own pace with flexible, on-demand courses`,
        `Apply practical knowledge through real-world projects and exercises`,
        `Join a community of learners for support and networking opportunities`
      ];
    } else {
      // General benefits
      benefits = [
        ...defaultBenefits,
        `Enhance customer satisfaction with ${domain}'s premium solutions`,
        `Get reliable support from ${domain}'s dedicated customer service team`,
        `Stay ahead of industry trends with ${domain}'s regular updates`
      ];
    }
  }
  
  // Ensure we have unique benefits by removing duplicates
  benefits = [...new Set(benefits)];
  
  return benefits;
};

/**
 * Generate features from keywords
 * 
 * @param {string} domain - Website domain
 * @param {Array} keywords - Keywords array
 * @param {string} industry - Industry
 * @returns {Array} - Generated features
 */
export const generateFeaturesFromKeywords = (domain, keywords, industry) => {
  let features = [];
  
  // Default features for any page
  const defaultFeatures = [
    `User-friendly dashboard with intuitive navigation`,
    `Comprehensive reporting and analytics tools`,
    `Cloud-based platform accessible from any device`,
    `Regular updates with new features and improvements`
  ];
  
  if (keywords.length > 0) {
    // Generate features that incorporate keywords
    keywords.forEach(keyword => {
      features.push(
        `Advanced ${keyword} management tools`,
        `Specialized ${keyword} tracking and analytics`
      );
    });
    
    // Add industry-specific features
    if (industry === 'health' || keywords.some(k => /health|wellness|fitness|diet/.test(k))) {
      features.push(
        `Personalized health assessment tools`,
        `Progress tracking and visualization`,
        `Customizable wellness programs`,
        `Expert-designed nutrition plans`
      );
    } else if (industry === 'finance' || keywords.some(k => /finance|money|invest|wealth/.test(k))) {
      features.push(
        `Real-time portfolio monitoring`,
        `Tax optimization algorithms`,
        `Automated expense categorization`,
        `Retirement planning calculators`
      );
    } else if (industry === 'technology' || keywords.some(k => /tech|software|digital|app/.test(k))) {
      features.push(
        `Seamless integration with popular tools`,
        `Advanced security protocols`,
        `Customizable workflows and automations`,
        `Mobile and desktop applications`
      );
    } else if (industry === 'ecommerce' || keywords.some(k => /shop|store|product|ecommerce/.test(k))) {
      features.push(
        `Secure payment processing`,
        `Customer review system`,
        `Personalized product recommendations`,
        `Order tracking and notifications`
      );
    } else if (industry === 'education' || keywords.some(k => /learn|course|education|training/.test(k))) {
      features.push(
        `Interactive learning modules`,
        `Progress assessments and quizzes`,
        `Downloadable resources and materials`,
        `Certificate generation upon completion`
      );
    }
  } else {
    // If no keywords provided, use features from the industry list
    if (industry === 'health') {
      features = [
        `Personalized health assessment tools`,
        `Progress tracking and visualization`,
        `Customizable wellness programs`,
        `Expert-designed nutrition plans`,
        `Video tutorials for proper technique`
      ];
    } else if (industry === 'finance') {
      features = [
        `Real-time portfolio monitoring`,
        `Tax optimization algorithms`,
        `Automated expense categorization`,
        `Retirement planning calculators`,
        `Bank-level security encryption`
      ];
    } else if (industry === 'technology') {
      features = [
        `Seamless integration with popular tools`,
        `Advanced security protocols`,
        `Customizable workflows and automations`,
        `Mobile and desktop applications`,
        `Regular software updates and improvements`
      ];
    } else if (industry === 'ecommerce') {
      features = [
        `Secure payment processing`,
        `Customer review system`,
        `Personalized product recommendations`,
        `Order tracking and notifications`,
        `Responsive customer support`
      ];
    } else if (industry === 'education') {
      features = [
        `Interactive learning modules`,
        `Progress assessments and quizzes`,
        `Downloadable resources and materials`,
        `Certificate generation upon completion`,
        `Community forums for student interaction`
      ];
    } else {
      // General features
      features = [
        ...defaultFeatures,
        `Dedicated customer support`,
        `Comprehensive documentation and tutorials`,
        `Customizable settings and preferences`
      ];
    }
  }
  
  // Ensure we have unique features by removing duplicates
  features = [...new Set(features)];
  
  return features;
};

/**
 * Generate benefits from content analysis
 * 
 * @param {string} content - Page content
 * @param {string} domain - Website domain
 * @param {string} industry - Industry
 * @returns {Array} - Generated benefits
 */
export const generateBenefitsFromContent = (content, domain, industry) => {
  // This is a placeholder. In a real implementation, this would use
  // NLP techniques to extract benefits from the content.
  return generateBenefitsFromKeywords(domain, [], industry);
};

/**
 * Generate features from content analysis
 * 
 * @param {string} content - Page content
 * @param {string} domain - Website domain
 * @param {string} industry - Industry
 * @returns {Array} - Generated features
 */
export const generateFeaturesFromContent = (content, domain, industry) => {
  // This is a placeholder. In a real implementation, this would use
  // NLP techniques to extract features from the content.
  return generateFeaturesFromKeywords(domain, [], industry);
};
