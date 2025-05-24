// src/components/EmailGenerator/LazyEmailGeneratorComponents.jsx
import React, { Suspense, lazy } from 'react';
import Loader from '../Common/Loader';

// Lazy load the heavy email generator components
const EnhancedSalesEmailGenerator = lazy(() => import('./EnhancedSalesEmailGenerator'));
const SupabaseEmailDisplay = lazy(() => import('./SupabaseEmailDisplay'));
const EmailSeriesPanel = lazy(() => import('./EmailSeriesPanel'));
const EmailAnalyticsPanel = lazy(() => import('./EmailAnalyticsPanel'));

// Component loader for email generator components
const ComponentLoader = ({ children, fallback }) => (
  <Suspense 
    fallback={
      fallback || (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '2rem',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Loader />
          <p>Loading component...</p>
        </div>
      )
    }
  >
    {children}
  </Suspense>
);

// Lazy-loaded component wrappers
export const LazyEnhancedSalesEmailGenerator = (props) => (
  <ComponentLoader>
    <EnhancedSalesEmailGenerator {...props} />
  </ComponentLoader>
);

export const LazySupabaseEmailDisplay = (props) => (
  <ComponentLoader>
    <SupabaseEmailDisplay {...props} />
  </ComponentLoader>
);

export const LazyEmailSeriesPanel = (props) => (
  <ComponentLoader>
    <EmailSeriesPanel {...props} />
  </ComponentLoader>
);

export const LazyEmailAnalyticsPanel = (props) => (
  <ComponentLoader>
    <EmailAnalyticsPanel {...props} />
  </ComponentLoader>
);