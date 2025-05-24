// src/services/emailGenerator/htmlExtractor.js
import { extractDomain } from './utils';

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
 * Check if an element is likely part of navigation, footer, or other non-product sections
 * 
 * @param {Element} element - DOM element to check
 * @returns {boolean} - Whether the element should be excluded
 */
const isNonProductElement = (element) => {
  // Check if element or any parent has classes or IDs suggesting it's not product content
  let current = element;
  while (current) {
    // Check classes
    if (current.className && typeof current.className === 'string') {
      const classNames = current.className.toLowerCase();
      if (classNames.match(/\b(footer|header|nav|menu|sidebar|legal|copyright|terms)\b/)) {
        return true;
      }
    }
    
    // Check ID
    if (current.id && typeof current.id === 'string') {
      const id = current.id.toLowerCase();
      if (id.match(/\b(footer|header|nav|menu|sidebar|legal|copyright|terms)\b/)) {
        return true;
      }
    }
    
    // Move to parent
    current = current.parentElement;
  }
  
  return false;
};

/**
 * Extract data from HTML content
 * 
 * @param {string} html - HTML content
 * @param {string} url - Original URL
 * @returns {Object} - Extracted data
 */
export const extractDataFromHTML = (html, url) => {
  // Create a temporary DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Extract page title
  const title = doc.querySelector('title')?.textContent || '';
  
  // Extract meta description
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  
  // Extract main content (prioritize main content areas)
  const contentSelectors = [
    // Product-specific selectors first
    '.product-description',
    '.product-details',
    '.product-info',
    '.product-content',
    '.sales-page',
    '.sales-letter',
    '.offer-details',
    // Then more general content areas
    'main', 
    'article', 
    '.content', 
    '#content', 
    '.main-content', 
    '#main-content',
    'body' // Fallback to body if nothing else matches
  ];
  
  let mainContentElement = null;
  for (const selector of contentSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      mainContentElement = element;
      break;
    }
  }
  
  // If no content element found, use body
  if (!mainContentElement) {
    mainContentElement = doc.querySelector('body');
  }
  
  // Before getting text, try to remove common non-product elements
  const nonProductSelectors = [
    'footer', 
    'header', 
    'nav', 
    '.navigation', 
    '#navigation',
    '.menu', 
    '#menu',
    '.footer', 
    '#footer',
    '.header', 
    '#header',
    '.legal', 
    '#legal',
    '.terms', 
    '#terms',
    '.privacy', 
    '#privacy',
    '.cookie', 
    '#cookie'
  ];
  
  // Remove non-product elements from the content
  if (mainContentElement) {
    nonProductSelectors.forEach(selector => {
      const elements = mainContentElement.querySelectorAll(selector);
      elements.forEach(el => {
        try {
          el.remove();
        } catch (e) {
          // Ignore errors if element can't be removed
        }
      });
    });
  }
  
  // Get the text content
  const mainContent = mainContentElement ? mainContentElement.textContent : '';
  
  // Extract headings as potential benefits/features, filtering out non-product terms
  const headings = [];
  const headingElements = doc.querySelectorAll('h1, h2, h3');
  headingElements.forEach(el => {
    const text = el.textContent.trim();
    
    // Skip if heading is empty, too short, too long, or contains excluded terms
    if (!text || text.length < 5 || text.length > 100) return;
    if (containsExcludedTerm(text)) return;
    if (isNonProductElement(el)) return;
    
    headings.push(text);
  });
  
  // Extract bullet points (potential benefits/features), filtering out non-product terms
  const bullets = [];
  const listItems = doc.querySelectorAll('li');
  listItems.forEach(el => {
    const text = el.textContent.trim();
    
    // Skip if bullet is empty, too short, too long, or contains excluded terms
    if (!text || text.length < 5 || text.length > 200) return;
    if (containsExcludedTerm(text)) return;
    if (isNonProductElement(el)) return;
    
    bullets.push(text);
  });
  
  // Extract potential testimonials, filtering out non-product terms
  const testimonials = [];
  const quoteElements = doc.querySelectorAll('blockquote, .testimonial, .review, [class*="testimonial"], [class*="review"]');
  quoteElements.forEach(el => {
    const text = el.textContent.trim();
    
    // Skip if testimonial is empty, too short, or contains excluded terms
    if (!text || text.length < 20) return;
    if (containsExcludedTerm(text)) return;
    if (isNonProductElement(el)) return;
    
    // Try to extract author
    let author = '';
    const authorElement = el.querySelector('.author, .testimonial-author, .name, cite');
    if (authorElement) {
      author = authorElement.textContent.trim();
    }
    
    testimonials.push({
      quote: text,
      author
    });
  });
  
  // Extract pricing information
  const priceElements = doc.querySelectorAll('.price, #price, [class*="price"], [itemprop="price"]');
  let price = '';
  if (priceElements.length > 0) {
    price = priceElements[0].textContent.trim();
  } else {
    // Try to find price using regex
    const priceMatch = mainContent.match(/\$\d+(\.\d{2})?/);
    if (priceMatch) {
      price = priceMatch[0];
    }
  }
  
  // Extract product name
  let productName = title
    .replace(/[-|:].+$/, '') // Remove text after dash or colon
    .trim();
  
  // Look for more specific product name
  const productElements = doc.querySelectorAll('[itemprop="name"], .product-title, .product-name, #product-name');
  if (productElements.length > 0) {
    productName = productElements[0].textContent.trim();
  }
  
  // Return extracted data
  return {
    title,
    url,
    description: metaDescription,
    productName,
    price,
    content: mainContent,
    headings,
    bullets,
    testimonials,
    domain: extractDomain(url)
  };
};