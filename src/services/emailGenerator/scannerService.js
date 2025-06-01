// src/services/emailGenerator/scannerService.js
import { fetchWithProxy, fetchWithMultiProxy } from './proxyService';
import { extractDataFromHTML } from './htmlExtractor';
import { enhanceExtractedData } from './dataEnhancer';
import { generateSimulatedData } from './simulatedDataGenerator';
import { extractDomain } from './utils';
import { cacheService } from './cacheService';
import axios from 'axios';

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
  'FOOTER'
];

/**
 * Reliable public CORS proxies that can be used as fallbacks
 */
const PUBLIC_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors.eu.org/',
  'https://cors-anywhere.herokuapp.com/'
];

/**
 * Filter out items containing excluded terms
 * 
 * @param {Array} items - Array of strings to filter
 * @returns {Array} - Filtered array without excluded terms
 */
const filterExcludedTerms = (items) => {
  if (!Array.isArray(items)) return [];
  
  return items.filter(item => {
    if (!item || typeof item !== 'string') return false;
    const upperItem = item.toUpperCase();
    return !EXCLUDED_TERMS.some(term => 
      upperItem.includes(term) || upperItem.match(new RegExp(`\\b${term}\\b`, 'i'))
    );
  });
};

/**
 * Try to fetch a URL using multiple CORS proxies
 * 
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} - The fetched HTML content
 */
const fetchWithPublicProxies = async (url) => {
  // Try each proxy in sequence
  for (const proxy of PUBLIC_PROXIES) {
    try {
      console.log(`Trying proxy: ${proxy}`);
      const html = await fetchWithProxy(url, proxy);
      if (html && html.includes('<html')) {
        console.log(`Successfully fetched with proxy: ${proxy}`);
        return html;
      }
    } catch (error) {
      console.warn(`Proxy ${proxy} failed:`, error.message);
    }
  }
  
  throw new Error('All public proxies failed');
};

/**
 * Scan a sales page to extract benefits, features, and other metadata
 * 
 * @param {string} url - Sales page URL
 * @param {string} keywords - Keywords to focus on
 * @param {string} industry - Industry for context
 * @param {Object} options - Additional options
 * @param {boolean} options.skipCache - Whether to skip the cache lookup (default: false)
 * @param {number} options.cacheTimeInHours - How long the cache is valid (default: 24 hours)
 * @returns {Promise<Object>} - Extracted data
 */
export const scanSalesPage = async (url, keywords = '', industry = 'general', options = {}) => {
  const { skipCache = false, cacheTimeInHours = 24 } = options;
  
  try {
    // First, check if we have a valid cached version (unless skipCache is true)
    if (!skipCache) {
      const cachedData = await cacheService.getFromCache(url, cacheTimeInHours);
      if (cachedData) {
        console.log('Using cached data for URL:', url);
        
        // Filter cached data to remove any excluded terms
        if (cachedData.headings) {
          cachedData.headings = filterExcludedTerms(cachedData.headings);
        }
        if (cachedData.bullets) {
          cachedData.bullets = filterExcludedTerms(cachedData.bullets);
        }
        
        // Enhance the cached data with the current keywords and industry
        // This allows for customization even with cached scrape data
        return enhanceExtractedData(cachedData, keywords, industry);
      }
    }
    
    console.log(`Scanning page: ${url} using HTTP scrape endpoint`);
    
    // Define the scrape endpoint URL - use environment variable or default public proxy
    const scrapeEndpointUrl = import.meta.env.VITE_SCRAPE_ENDPOINT || 'https://corsproxy.io/?';
    
    // Method 1: Try the HTTP endpoint if it's a full service endpoint
    if (scrapeEndpointUrl.includes('function') || scrapeEndpointUrl.includes('endpoint')) {
      try {
        const response = await axios.post(scrapeEndpointUrl, 
          { 
            url,
            skipCache // Pass through the skipCache option to the scrape endpoint
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 60000 // 60 second timeout
          }
        );
        
        if (response.data) {
          console.log('Successfully scraped using HTTP endpoint');
          
          // Filter headings and bullets to remove excluded terms
          const filteredHeadings = filterExcludedTerms(response.data.headings || []);
          const filteredBullets = filterExcludedTerms(response.data.bullets || []);
          
          // Transform the scraped data to the format your app expects
          const extractedData = {
            title: response.data.title || '',
            url,
            description: response.data.description || '',
            productName: response.data.productName || '',
            price: response.data.price || '',
            content: response.data.pageContent || '',
            headings: filteredHeadings,
            bullets: filteredBullets,
            testimonials: response.data.testimonials || [],
            domain: extractDomain(url)
          };
          
          // Save the extracted data to cache
          await cacheService.saveToCache(url, extractedData);
          
          // Enhance the extracted data with industry context and keywords
          return enhanceExtractedData(extractedData, keywords, industry);
        } else {
          throw new Error('No data returned from scraper');
        }
      } catch (error) {
        console.error(`HTTP scrape endpoint error: ${error.message}`);
        throw error; // Re-throw to try next method
      }
    } 
    
    // Method 2: Try direct fetching with public CORS proxies
    try {
      console.log('Attempting to use public CORS proxies');
      const html = await fetchWithPublicProxies(url);
      
      if (html) {
        console.log('Successfully fetched page content using public proxies');
        
        // Extract data from the page
        const extractedData = extractDataFromHTML(html, url);
        
        // Save the extracted data to cache
        await cacheService.saveToCache(url, extractedData);
        
        // Enhance the extracted data with industry context and keywords
        return enhanceExtractedData(extractedData, keywords, industry);
      }
    } catch (proxyError) {
      console.error('Public proxy method failed:', proxyError);
    }
    
    // Method 3: Try the simple-proxy endpoint
    try {
      console.log('Attempting to use simple-proxy endpoint');
      const simpleProxyUrl = import.meta.env.VITE_SIMPLE_PROXY_URL || PUBLIC_PROXIES[0];
      
      // If it's a full service endpoint, use GET request
      if (simpleProxyUrl.includes('function') || simpleProxyUrl.includes('endpoint')) {
        const response = await axios.get(`${simpleProxyUrl}?url=${encodeURIComponent(url)}`, {
          timeout: 45000 // 45 second timeout
        });
        
        if (response.data && typeof response.data === 'string' && response.data.includes('<html')) {
          console.log('Successfully fetched page content using simple-proxy');
          
          // Extract data from the page
          const extractedData = extractDataFromHTML(response.data, url);
          
          // Save the extracted data to cache
          await cacheService.saveToCache(url, extractedData);
          
          // Enhance the extracted data with industry context and keywords
          return enhanceExtractedData(extractedData, keywords, industry);
        }
      } else {
        // If it's just a CORS proxy, append the URL
        const response = await axios.get(`${simpleProxyUrl}${encodeURIComponent(url)}`, {
          timeout: 45000 // 45 second timeout
        });
        
        if (response.data && typeof response.data === 'string' && response.data.includes('<html')) {
          console.log('Successfully fetched page content using simple-proxy');
          
          // Extract data from the page
          const extractedData = extractDataFromHTML(response.data, url);
          
          // Save the extracted data to cache
          await cacheService.saveToCache(url, extractedData);
          
          // Enhance the extracted data with industry context and keywords
          return enhanceExtractedData(extractedData, keywords, industry);
        }
      }
    } catch (simpleProxyError) {
      console.error('Simple-proxy method failed:', simpleProxyError);
    }
    
    // Method 4: Try the original multi-proxy method as final fallback
    try {
      console.log('Attempting to fall back to multi-proxy method');
      let extractedData = await fetchWithMultiProxy(url, keywords, industry);
      
      // Apply filtering to the extracted data
      if (extractedData && !extractedData._isSimulated) {
        if (extractedData.headings) {
          extractedData.headings = filterExcludedTerms(extractedData.headings);
        }
        if (extractedData.bullets) {
          extractedData.bullets = filterExcludedTerms(extractedData.bullets);
        }
        
        // Only cache successful scrapes
        await cacheService.saveToCache(url, extractedData);
      }
      
      return extractedData;
    } catch (proxyError) {
      console.error('All proxy methods failed:', proxyError);
    }
    
    // If all scraping methods fail, fall back to simulated data
    console.log('Falling back to simulated data generation');
    return generateSimulatedData(url, keywords, industry);
  } catch (error) {
    console.error('Unexpected error in scanSalesPage:', error);
    return generateSimulatedData(url, keywords, industry);
  }
};

// Make sure to include this default export for backward compatibility
export default { scanSalesPage };
