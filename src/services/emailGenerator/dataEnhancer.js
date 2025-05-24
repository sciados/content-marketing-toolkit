// src/services/emailGenerator/dataEnhancer.js
import { generateBenefitsFromContent, generateFeaturesFromContent } from './simulatedDataGenerator';

/**
 * List of terms that should be excluded from extraction as they are not related to the product
 */
const EXCLUDED_TERMS = [
  'TERMS OF USE',
  'PRIVACY POLICY',
  'DISCLAIMER',
  'REFUNDS',
  'AFFILIATES',
  'CONTACT',
  'TERMS',
  'PRIVACY',
  'SHIPPING',
  'COPYRIGHT',
  'SITEMAP',
  'LOGIN',
  'REGISTER',
  'SIGN UP',
  'NEWSLETTER',
  'FAQ',
  'HELP',
  'SUPPORT',
  'REFERENCE',
  'FOOTER'
];

/**
 * Check if text contains any of the excluded terms
 * 
 * @param {string} text - Text to check
 * @returns {boolean} - Whether the text contains excluded terms
 */
const containsExcludedTerm = (text) => {
  if (!text) return false;
  
  const normalizedText = text.toUpperCase();
  return EXCLUDED_TERMS.some(term => 
    normalizedText.includes(term) || 
    // Also check for common patterns like "Terms | Privacy"
    normalizedText.match(new RegExp(`\\b${term}\\b`, 'i'))
  );
};

/**
 * Enhance extracted data with industry context and keywords
 * 
 * @param {Object} extractedData - Raw extracted data
 * @param {string} keywords - Keywords to focus on
 * @param {string} industry - Industry for context
 * @returns {Object} - Enhanced data
 */
export const enhanceExtractedData = (extractedData, keywords, industry) => {
  // Parse keywords into array
  const keywordArray = keywords.split(',').map(k => k.trim()).filter(Boolean);
  
  // Combine headings and bullets, and apply additional filtering for excluded terms
  const filteredHeadings = extractedData.headings.filter(heading => !containsExcludedTerm(heading));
  const filteredBullets = extractedData.bullets.filter(bullet => !containsExcludedTerm(bullet));
  
  const allPoints = [...filteredHeadings, ...filteredBullets];
  
  // Process to identify benefits vs features
  const benefits = [];
  const features = [];
  
  // Identify benefits (focuses on outcomes, results, transformations)
  const benefitPatterns = [
    /improve/i, /increase/i, /boost/i, /enhance/i, /better/i, 
    /transform/i, /gain/i, /achieve/i, /results/i, /benefit/i,
    /save/i, /reduce/i, /eliminate/i, /prevent/i, /avoid/i,
    /enjoy/i, /experience/i, /discover/i, /unlock/i, /maximize/i
  ];
  
  // Identify features (focuses on what it is/does)
  const featurePatterns = [
    /feature/i, /include/i, /contain/i, /consist/i, /made with/i,
    /built-in/i, /integrated/i, /function/i, /capability/i, /able to/i,
    /designed/i, /equipped/i, /powered/i, /supports/i, /works with/i
  ];
  
  // Process each point to categorize
  allPoints.forEach(point => {
    // Skip if the point contains excluded terms
    if (containsExcludedTerm(point)) return;
    
    const pointText = point.toLowerCase();
    
    // Check for benefit indicators
    const isBenefit = benefitPatterns.some(pattern => pattern.test(pointText));
    
    // Check for feature indicators
    const isFeature = featurePatterns.some(pattern => pattern.test(pointText));
    
    // Prioritize benefits over features if both match
    if (isBenefit || (!isFeature && pointText.length > 15)) {
      // If it's long enough and not clearly a feature, treat as benefit
      if (!benefits.includes(point)) {
        benefits.push(point);
      }
    } else if (isFeature) {
      if (!features.includes(point)) {
        features.push(point);
      }
    } else {
      // If unsure and contains keywords, treat as benefit
      if (keywordArray.length > 0 && keywordArray.some(keyword => 
        pointText.includes(keyword.toLowerCase())
      )) {
        if (!benefits.includes(point)) {
          benefits.push(point);
        }
      } else {
        // Default to feature
        if (!features.includes(point)) {
          features.push(point);
        }
      }
    }
  });
  
  // Extract a value proposition, ensuring it doesn't contain excluded terms
  let valueProposition = '';
  if (filteredHeadings.length > 0) {
    // Use first filtered heading as value proposition
    valueProposition = filteredHeadings[0];
  } else if (extractedData.description && !containsExcludedTerm(extractedData.description)) {
    // Fall back to meta description
    valueProposition = extractedData.description;
  }
  
  // If we don't have enough benefits, generate some based on the content
  if (benefits.length < 3) {
    const generatedBenefits = generateBenefitsFromContent(
      extractedData.content,
      extractedData.domain,
      industry
    );
    
    // Add generated benefits that aren't duplicates and don't contain excluded terms
    generatedBenefits
      .filter(benefit => !containsExcludedTerm(benefit))
      .forEach(benefit => {
        if (!benefits.includes(benefit)) {
          benefits.push(benefit);
        }
      });
  }
  
  // If we still don't have enough features, generate some
  if (features.length < 3) {
    const generatedFeatures = generateFeaturesFromContent(
      extractedData.content,
      extractedData.domain,
      industry
    );
    
    // Add generated features that aren't duplicates and don't contain excluded terms
    generatedFeatures
      .filter(feature => !containsExcludedTerm(feature))
      .forEach(feature => {
        if (!features.includes(feature)) {
          features.push(feature);
        }
      });
  }
  
  // Filter testimonials to remove any with excluded terms
  const filteredTestimonials = extractedData.testimonials.filter(
    testimonial => !containsExcludedTerm(testimonial.quote)
  );
  
  // Construct the enhanced data object
  const websiteData = {
    name: extractedData.productName,
    domain: extractedData.domain,
    description: extractedData.description,
    valueProposition,
    price: extractedData.price,
    benefits: benefits.slice(0, 10), // Limit to 10 benefits
    features: features.slice(0, 10), // Limit to 10 features
    testimonials: filteredTestimonials.slice(0, 5), // Limit to 5 testimonials
    url: extractedData.url
  };
  
  return {
    benefits: benefits.length > 0 ? benefits : ["No benefits found - generated fallback benefits will be used"],
    features,
    websiteData
  };
};