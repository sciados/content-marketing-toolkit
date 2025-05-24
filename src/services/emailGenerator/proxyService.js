// src/services/emailGenerator/proxyService.js
import axios from 'axios';
import { extractDataFromHTML } from './htmlExtractor';
import { enhanceExtractedData } from './dataEnhancer';
import { extractDomain } from './utils';

/**
 * Fallback method that uses the original CORS proxy approach
 * 
 * @param {string} url - Sales page URL
 * @param {string} keywords - Keywords to focus on
 * @param {string} industry - Industry for context
 * @returns {Promise<Object>} - Extracted data
 */
export const fetchWithMultiProxy = async (url, keywords = '', industry = 'general') => {
  // Multi-proxy strategy: Try multiple CORS proxies in order, prioritizing ones that worked better
  const proxyList = [
    'https://api.allorigins.win/raw?url=',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://corsproxy.io/?',
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors.eu.org/',
    // Your custom Firebase proxy - try last since it's having issues
    import.meta.env.VITE_CORS_PROXY_URL || 'https://us-central1-email-generator-pro-c1985.cloudfunctions.net/corsProxy?url=',
  ];
  
  // Try each proxy in sequence
  let pageContent = null;
  let successfulProxy = null;
  
  for (const proxy of proxyList) {
    try {
      console.log(`Trying proxy: ${proxy}`);
      const requestUrl = `${proxy}${encodeURIComponent(url)}`;
      
      // Attempt to fetch the page content with minimal headers to avoid CORS issues
      const response = await axios.get(requestUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml'
        },
        timeout: 20000 // 20 second timeout - increased from 15 seconds
      });
      
      // Check if we got actual HTML content
      if (response.data && typeof response.data === 'string' && response.data.includes('<html')) {
        pageContent = response.data;
        successfulProxy = proxy;
        console.log(`Successfully fetched page content using proxy: ${proxy}`);
        break;
      } else {
        console.log(`Received non-HTML response from proxy: ${proxy}`);
      }
    } catch (proxyError) {
      console.warn(`Proxy ${proxy} failed:`, proxyError.message);
      // Continue to the next proxy
    }
  }
  
  if (pageContent) {
    console.log(`Successfully scanned page using ${successfulProxy}`);
    
    // Extract data from the page
    const extractedData = extractDataFromHTML(pageContent, url);
    
    // Enhance the extracted data with industry context and keywords
    return enhanceExtractedData(extractedData, keywords, industry);
  } else {
    // All proxies failed, throw error to trigger simulated data fallback
    throw new Error('All proxies failed');
  }
};

/**
 * Fetch content through a single proxy
 * 
 * @param {string} url - URL to fetch
 * @param {string} proxyUrl - Proxy URL to use
 * @returns {Promise<string>} - HTML content
 */
export const fetchWithProxy = async (url, proxyUrl) => {
  const requestUrl = `${proxyUrl}${encodeURIComponent(url)}`;
  const response = await axios.get(requestUrl, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml'
    },
    timeout: 20000
  });
  
  if (response.data && typeof response.data === 'string' && response.data.includes('<html')) {
    return response.data;
  }
  
  throw new Error('Invalid HTML response from proxy');
};