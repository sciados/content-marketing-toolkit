// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import SupabaseProvider from './context/SupabaseProvider';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import PerformanceMonitor from './components/PerformanceMonitor';
import { setupPerformanceMonitoring } from './utils/performanceUtils';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

console.log('🔧 App.jsx: Starting to load...');

// Emergency reset button
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
      localStorage.getItem('enablePerformanceMonitoring') === 'false';
    
    if (shouldMonitor) {
      setupPerformanceMonitoring({
        measurePageLoad: true,
        analyzeResources: true,
        measureWebVitals: false, // Set to true if you want Core Web Vitals
        logToConsole: true
      });
    }
  }, []);

  console.log('🔧 App.jsx: About to render SupabaseProvider');
  
  return (
    <>
      {/* Show emergency reset only in development */}
      {isDevelopment && <EmergencyReset />}
      
      {/* Performance monitoring component */}
      <PerformanceMonitor 
        enabled={isDevelopment || 
                localStorage.getItem('enablePerformanceMonitoring') === 'true'} 
      />
      
      <SupabaseProvider>
        <ThemeProvider>
          <ToastProvider>
            <Router>
              <AppRoutes />              
            </Router>
          </ToastProvider>
        </ThemeProvider>
      </SupabaseProvider>
    </>
  );
};

export default App;
