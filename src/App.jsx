// src/App.jsx - FINAL VERSION without PerformanceMonitor
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import SupabaseProvider from './shared/context/SupabaseProvider';
import { ToastProvider } from './shared/context/ToastContext';
import { ThemeProvider } from './shared/context/ThemeContext';
import { WebSocketProvider } from './shared/context/WebSocketProvider';
import { ErrorBoundary } from './shared/components/ui';
import AppRoutes from './routes/AppRoutes';
import { setupPerformanceMonitoring } from './shared/utils/performanceUtils';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

console.log('🔧 App.jsx: Starting to load...');

// Emergency reset button for development
const EmergencyReset = () => (
  <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
    <button 
      onClick={() => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      }}
      style={{ 
        background: 'red', 
        color: 'white', 
        padding: '5px 10px', 
        borderRadius: '4px',
        cursor: 'pointer',
        border: 'none',
        fontSize: '12px'
      }}
    >
      Reset Auth
    </button>
  </div>
);

const App = () => {
  // Setup performance monitoring on app load
  useEffect(() => {
    // Only enable performance monitoring in development or when explicitly enabled
    const shouldMonitor = isDevelopment || 
      localStorage.getItem('enablePerformanceMonitoring') === 'true';
    
    if (shouldMonitor) {
      setupPerformanceMonitoring({
        measurePageLoad: true,
        analyzeResources: true,
        measureWebVitals: false, // Set to true if you want Core Web Vitals
        logToConsole: true
      });
    }
  }, []);

  console.log('🔧 App.jsx: About to render with all providers');
  
  return (
    <ErrorBoundary>
      {/* Show emergency reset only in development */}
      {isDevelopment && <EmergencyReset />}
      
      <SupabaseProvider>
        <ThemeProvider>
          <ToastProvider>
            <WebSocketProvider>
              <Router>
                <AppRoutes />              
              </Router>
            </WebSocketProvider>
          </ToastProvider>
        </ThemeProvider>
      </SupabaseProvider>
    </ErrorBoundary>
  );
};

export default App;