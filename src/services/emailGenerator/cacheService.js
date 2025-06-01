// src/services/emailGenerator/cacheService.js
import { supabase } from '../supabase/supabaseClient';

/**
 * Service for caching web scraping results using Supabase
 */
export const cacheService = {
  /**
   * Check if a URL has a valid cache entry
   * 
   * @param {string} url - The URL to check
   * @param {number} cacheTimeInHours - How long the cache is valid (default: 24 hours)
   * @returns {Promise<Object|null>} - Cached data or null if not found/expired
   */
  getFromCache: async (url, cacheTimeInHours = 24) => {
    try {
      // Generate a safe ID from the URL
      const safeId = btoa(url);
      
      // Query Supabase for cached data
      const { data: cacheEntry, error } = await supabase
        .from('scrape_cache')
        .select('*')
        .eq('id', safeId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No data found - not an error for our purposes
          return null;
        }
        throw error;
      }
      
      if (cacheEntry) {
        // Check if the cache is still valid (not expired)
        const now = new Date();
        const cacheTime = cacheEntry.created_at ? new Date(cacheEntry.created_at) : new Date(0);
        const cacheAgeInHours = (now - cacheTime) / (1000 * 60 * 60);
        
        // If cache is fresh, return it
        if (cacheAgeInHours < cacheTimeInHours) {
          console.log(`Using cached scrape data for ${url}, age: ${cacheAgeInHours.toFixed(2)} hours`);
          return cacheEntry.data;
        } else {
          console.log(`Cache expired for ${url}, age: ${cacheAgeInHours.toFixed(2)} hours`);
          return null;
        }
      }
      
      // No valid cache found
      return null;
    } catch (error) {
      console.error('Error accessing cache:', error);
      return null; // On error, just return null to proceed with regular scraping
    }
  },
  
  /**
   * Save data to the cache
   * 
   * @param {string} url - The URL associated with the data
   * @param {Object} data - The data to cache
   * @returns {Promise<void>}
   */
  saveToCache: async (url, data) => {
    try {
      // Generate a safe ID from the URL
      const safeId = btoa(url);
      
      // Save to Supabase
      const { error } = await supabase
        .from('scrape_cache')
        .upsert({ 
          id: safeId,
          url: url,
          data: data,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (error) throw error;
      
      console.log(`Cached scrape data for ${url}`);
    } catch (error) {
      console.error('Error saving to cache:', error);
      // Continue execution even if caching fails
    }
  },
  
  /**
   * Purge expired cache entries
   * 
   * @param {number} maxAgeInHours - Maximum age of cache entries to keep
   * @returns {Promise<number>} - Number of entries removed
   */
  cleanExpiredCache: async (maxAgeInHours = 168) => { // Default 7 days
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - maxAgeInHours);
      const cutoffISOString = cutoffDate.toISOString();
      
      // Delete expired cache entries
      const { data, error } = await supabase
        .from('scrape_cache')
        .delete()
        .lt('created_at', cutoffISOString)
        .select('count');
      
      if (error) throw error;
      
      const removedCount = data?.length || 0;
      console.log(`Removed ${removedCount} expired cache entries`);
      return removedCount;
    } catch (error) {
      console.error('Error cleaning cache:', error);
      return 0;
    }
  }
};

// Make sure to include this default export for backward compatibility
export default cacheService;
