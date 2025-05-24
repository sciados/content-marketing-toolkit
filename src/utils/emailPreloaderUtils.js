// src/utils/emailPreloaderUtils.js
// Utility functions for preloading email generator components

/**
 * Preload email generator components for better UX
 * Call this when user hovers over navigation or when likely to need these components
 */
export const preloadEmailComponents = () => {
  // Preload the main email generator
  import('../components/EmailGenerator/EnhancedSalesEmailGenerator');
  
  // Preload other components after a short delay
  setTimeout(() => {
    import('../components/EmailGenerator/SupabaseEmailDisplay');
    import('../components/EmailGenerator/EmailSeriesPanel');
    import('../components/EmailGenerator/EmailAnalyticsPanel');
  }, 100);
};

/**
 * Preload specific email component
 * @param {string} componentName - Name of component to preload
 */
export const preloadEmailComponent = (componentName) => {
  const componentMap = {
    'EnhancedSalesEmailGenerator': () => import('../components/EmailGenerator/EnhancedSalesEmailGenerator'),
    'SupabaseEmailDisplay': () => import('../components/EmailGenerator/SupabaseEmailDisplay'),
    'EmailSeriesPanel': () => import('../components/EmailGenerator/EmailSeriesPanel'),
    'EmailAnalyticsPanel': () => import('../components/EmailGenerator/EmailAnalyticsPanel')
  };
  
  const preloader = componentMap[componentName];
  if (preloader) {
    preloader();
  } else {
    console.warn(`Unknown component for preloading: ${componentName}`);
  }
};

/**
 * Track lazy loading performance
 * @param {string} chunkName - Name of the chunk being loaded
 * @returns {Function} - Function to call when loading is complete
 */
export const trackLazyLoading = (chunkName) => {
  if (typeof window === 'undefined') return () => {};
  
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    console.log(`📦 Lazy loaded ${chunkName}: ${(endTime - startTime).toFixed(2)}ms`);
  };
};

/**
 * Check if component is likely already loaded
 * @param {string} componentName - Name of component to check
 * @returns {boolean} - Whether component appears to be loaded
 */
export const isComponentPreloaded = (componentName) => {
  // This is a simple heuristic - in a real app you might track this more precisely
  return document.querySelector(`[data-component="${componentName}"]`) !== null;
};