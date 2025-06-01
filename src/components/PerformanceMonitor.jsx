// src/components/PerformanceMonitor.jsx
import { useEffect } from 'react';

/**
 * Performance monitoring component for tracking load times and bundle sizes
 */
const PerformanceMonitor = ({ enabled = false }) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Monitor initial page load
    const measurePageLoad = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        if (navigation) {
          console.group('📊 Performance Metrics');
          console.log('🚀 Page Load Time:', `${Math.round(navigation.loadEventEnd - navigation.loadEventStart)}ms`);
          console.log('🎯 DOM Content Loaded:', `${Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)}ms`);
          console.log('📦 Total Load Time:', `${Math.round(navigation.loadEventEnd - navigation.fetchStart)}ms`);
          console.groupEnd();
        }
      }
    };

    // Monitor resource loading
    const monitorResources = () => {
      if ('performance' in window) {
        const resources = performance.getEntriesByType('resource');
        const jsResources = resources.filter(r => r.name.includes('.js'));
        const cssResources = resources.filter(r => r.name.includes('.css'));
        
        console.group('📋 Resource Loading');
        console.log('📄 JS Files Loaded:', jsResources.length);
        console.log('🎨 CSS Files Loaded:', cssResources.length);
        
        // Show largest JS files
        const largeJSFiles = jsResources
          .filter(r => r.transferSize > 50000) // > 50KB
          .sort((a, b) => b.transferSize - a.transferSize)
          .slice(0, 5);
          
        if (largeJSFiles.length > 0) {
          console.log('🔍 Large JS Files (>50KB):');
          largeJSFiles.forEach(file => {
            const size = (file.transferSize / 1024).toFixed(1);
            const name = file.name.split('/').pop();
            console.log(`  ${name}: ${size}KB`);
          });
        }
        console.groupEnd();
      }
    };

    // Monitor bundle chunks being loaded
    const monitorChunkLoading = () => {
      const originalImport = window.__vitePreload || window.import;
      let chunkCount = 0;
      
      if (originalImport) {
        window.__vitePreload = (...args) => {
          chunkCount++;
          console.log(`🧩 Loading chunk ${chunkCount}:`, args[0]);
          return originalImport.apply(this, args);
        };
      }
    };

    // Wait for page to fully load before measuring
    if (document.readyState === 'complete') {
      measurePageLoad();
      monitorResources();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          measurePageLoad();
          monitorResources();
        }, 100);
      });
    }

    monitorChunkLoading();

    // Clean up
    return () => {
      // Reset any modifications if needed
    };
  }, [enabled]);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
