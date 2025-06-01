/* eslint-disable no-unused-vars */
// src/utils/performanceUtils.js
import { useEffect } from 'react';

/**
 * Hook for measuring component render times
 * @param {string} componentName - Name of the component being measured
 * @param {boolean} enabled - Whether to enable performance tracking
 */
export const useRenderTime = (componentName, enabled = false) => {
  useEffect(() => {
    if (!enabled) return;
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`⚡ ${componentName} render time: ${(endTime - startTime).toFixed(2)}ms`);
    };
  });
};

/**
 * Utility function to track lazy loading performance
 * @param {string} chunkName - Name of the chunk being loaded
 * @returns {Function|undefined} - Function to call when loading is complete, or undefined
 */
export const trackLazyLoading = (chunkName) => {
  if (typeof window === 'undefined') return;
  
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    console.log(`📦 Lazy loaded ${chunkName}: ${(endTime - startTime).toFixed(2)}ms`);
  };
};

/**
 * Measure and log navigation timing metrics
 */
export const measurePagePerformance = () => {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const navigation = performance.getEntriesByType('navigation')[0];
  
  if (navigation) {
    const metrics = {
      pageLoadTime: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
      totalLoadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      dnsLookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
      tcpConnection: Math.round(navigation.connectEnd - navigation.connectStart),
      serverResponse: Math.round(navigation.responseEnd - navigation.requestStart)
    };

    console.group('📊 Detailed Performance Metrics');
    console.log('🚀 Page Load Time:', `${metrics.pageLoadTime}ms`);
    console.log('🎯 DOM Content Loaded:', `${metrics.domContentLoaded}ms`);
    console.log('📦 Total Load Time:', `${metrics.totalLoadTime}ms`);
    console.log('🔍 DNS Lookup:', `${metrics.dnsLookup}ms`);
    console.log('🔗 TCP Connection:', `${metrics.tcpConnection}ms`);
    console.log('📡 Server Response:', `${metrics.serverResponse}ms`);
    console.groupEnd();

    return metrics;
  }
};

/**
 * Analyze and log resource loading performance
 */
export const analyzeResourcePerformance = () => {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const resources = performance.getEntriesByType('resource');
  const jsResources = resources.filter(r => r.name.includes('.js'));
  const cssResources = resources.filter(r => r.name.includes('.css'));
  const imageResources = resources.filter(r => /\.(png|jpe?g|gif|svg|webp)$/i.test(r.name));

  // Analyze JS files
  const largeJSFiles = jsResources
    .filter(r => r.transferSize > 50000) // > 50KB
    .sort((a, b) => b.transferSize - a.transferSize)
    .slice(0, 10)
    .map(file => ({
      name: file.name.split('/').pop(),
      size: (file.transferSize / 1024).toFixed(1),
      loadTime: Math.round(file.duration)
    }));

  console.group('📋 Resource Analysis');
  console.log('📄 JS Files:', jsResources.length);
  console.log('🎨 CSS Files:', cssResources.length);
  console.log('🖼️ Images:', imageResources.length);
  
  if (largeJSFiles.length > 0) {
    console.log('🔍 Large JS Files (>50KB):');
    console.table(largeJSFiles);
  }
  
  // Calculate total bundle size
  const totalJSSize = jsResources.reduce((total, file) => total + (file.transferSize || 0), 0);
  console.log('📊 Total JS Bundle Size:', `${(totalJSSize / 1024).toFixed(1)}KB`);
  
  console.groupEnd();

  return {
    jsCount: jsResources.length,
    cssCount: cssResources.length,
    imageCount: imageResources.length,
    totalJSSize: totalJSSize,
    largeFiles: largeJSFiles
  };
};

/**
 * Monitor Core Web Vitals
 */
export const measureCoreWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  const observeLCP = () => {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('🎯 LCP (Largest Contentful Paint):', `${Math.round(lastEntry.startTime)}ms`);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });    
    } catch (e) {
      console.log('LCP measurement not supported');
    }
  };

  // First Input Delay (FID) - can only be measured with real user interaction
  const observeFID = () => {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('⚡ FID (First Input Delay):', `${Math.round(entry.processingStart - entry.startTime)}ms`);
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.log('FID measurement not supported');
    }
  };

  // Cumulative Layout Shift (CLS)
  const observeCLS = () => {
    try {
      let clsScore = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        console.log('📐 CLS (Cumulative Layout Shift):', clsScore.toFixed(4));
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.log('CLS measurement not supported');
    }
  };

  observeLCP();
  observeFID();
  observeCLS();
};

/**
 * Setup comprehensive performance monitoring
 * @param {Object} options - Configuration options
 */
export const setupPerformanceMonitoring = (options = {}) => {
  const {
    measurePageLoad = true,
    analyzeResources = true,
    measureWebVitals = false,
    logToConsole = true
  } = options;

  if (!logToConsole) return;

  // Wait for page to load
  if (document.readyState === 'complete') {
    if (measurePageLoad) measurePagePerformance();
    if (analyzeResources) analyzeResourcePerformance();
    if (measureWebVitals) measureCoreWebVitals();
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (measurePageLoad) measurePagePerformance();
        if (analyzeResources) analyzeResourcePerformance();
        if (measureWebVitals) measureCoreWebVitals();
      }, 100);
    });
  }
};
