// src/routes/AppRoutes.jsx - Updated with Analytics Page
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { preloadEmailComponents } from '../utils/emailPreloaderUtils';
import { trackLazyLoading, useRenderTime } from '../utils/performanceUtils';
// import { Video2Promo } from '../pages/Video2Promo';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Layout components (keep these as regular imports since they're used on every page)
import MainLayout from '../components/Layout/MainLayout';
import AuthLayout from '../components/Layout/AuthLayout';
import Loader from '../components/Common/Loader';

const AdminUsers = lazy(() => {
  const tracker = trackLazyLoading('AdminUsers');
  return import('../pages/Admin/AdminUsers').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const FixSuperAdmin = lazy(() => {
  const tracker = trackLazyLoading('FixSuperAdmin');
  return import('../pages/Admin/FixSuperAdmin').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// Lazy load page components for better code splitting
const Welcome = lazy(() => {
  const tracker = trackLazyLoading('Welcome');
  return import('../pages/Welcome').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const Login = lazy(() => {
  const tracker = trackLazyLoading('Login');
  return import('../pages/Auth/Login').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const Register = lazy(() => {
  const tracker = trackLazyLoading('Register');
  return import('../pages/Auth/Register').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const ResetPassword = lazy(() => {
  const tracker = trackLazyLoading('ResetPassword');
  return import('../pages/Auth/ResetPassword').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const Dashboard = lazy(() => {
  const tracker = trackLazyLoading('Dashboard');
  return import('../pages/Dashboard').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const Profile = lazy(() => {
  const tracker = trackLazyLoading('Profile');
  return import('../pages/Profile').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const SalesPageEmailGenerator = lazy(() => {
  const tracker = trackLazyLoading('SalesPageEmailGenerator');
  return import('../pages/SalesPageEmailGenerator').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const Video2Promo = lazy(() => {
  const tracker = trackLazyLoading('Video2Promo');
  return import('../pages/Video2Promo').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const EmailSeriesListPage = lazy(() => {
  const tracker = trackLazyLoading('EmailSeriesListPage');
  return import('../pages/EmailSeriesListPage').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const EmailSeriesDetailPage = lazy(() => {
  const tracker = trackLazyLoading('EmailSeriesDetailPage');
  return import('../pages/EmailSeriesDetailPage').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// NEW: Analytics page
const Analytics = lazy(() => {
  const tracker = trackLazyLoading('Analytics');
  return import('../pages/Analytics').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// Future pages - already lazy loaded for when you implement them
const BlogPostCreator = lazy(() => {
  const tracker = trackLazyLoading('BlogPostCreator');
  return import('../pages/BlogPostCreator').catch(() => {
    // Fallback component for non-existent pages
    return { 
      default: () => (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Blog Post Creator</h2>
          <p>This feature is coming soon!</p>
        </div>
      )
    };
  }).then(module => {
    if (tracker) tracker();
    return module;
  });
});

const NewsletterCreator = lazy(() => {
  const tracker = trackLazyLoading('NewsletterCreator');
  return import('../pages/NewsletterCreator').catch(() => {
    // Fallback component for non-existent pages
    return { 
      default: () => (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Newsletter Creator</h2>
          <p>This feature is coming soon!</p>
        </div>
      )
    };
  }).then(module => {
    if (tracker) tracker();
    return module;
  });
});

const Subscription = lazy(() => {
  const tracker = trackLazyLoading('Subscription');
  return import('../pages/Subscription').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const AdminAds = lazy(() => {
  const tracker = trackLazyLoading('AdminAds');
  return import('../pages/Admin/AdminAds').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// Enhanced loading component with preloading hints
const PageLoader = ({ pageName }) => {
  useRenderTime('PageLoader', isDevelopment);
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <Loader />
      <p>Loading {pageName || 'page'}...</p>
      {isDevelopment && (
        <small style={{ color: '#666', fontSize: '0.8rem' }}>
          Bundle: {pageName || 'Unknown'}
        </small>
      )}
    </div>
  );
};

// Enhanced route wrapper with preloading
const LazyRoute = ({ 
  children, 
  pageName, 
  preloadOnHover = false, 
  preloadFunction = null 
}) => (
  <Suspense 
    fallback={<PageLoader pageName={pageName} />}
    onMouseEnter={preloadOnHover && preloadFunction ? preloadFunction : undefined}
  >
    {children}
  </Suspense>
);

const AppRoutes = () => {
  // Track overall routing performance
  useRenderTime('AppRoutes', isDevelopment);

  return (
    <Routes>
      {/* Welcome Page - Root Route for Unauthenticated Users */}
      <Route 
        path="/" 
        element={
          <LazyRoute pageName="Welcome">
            <Welcome />
          </LazyRoute>
        } 
      />
      
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/login" 
          element={
            <LazyRoute pageName="Login">
              <Login />
            </LazyRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <LazyRoute pageName="Register">
              <Register />
            </LazyRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <LazyRoute pageName="Reset Password">
              <ResetPassword />
            </LazyRoute>
          } 
        />
      </Route>
      
      {/* Protected Routes - Main Application */}
      <Route element={<MainLayout />}>
        <Route 
          path="/admin/users" 
          element={
            <LazyRoute pageName="Admin Users">
              <AdminUsers />
            </LazyRoute>
          } 
        />

        <Route 
          path="/admin/fix-status" 
          element={
            <LazyRoute pageName="Fix Status">
              <FixSuperAdmin />
            </LazyRoute>
          } 
        />
        
        <Route 
          path="/admin/ads" 
          element={
            <LazyRoute pageName="Admin Ads">
              <AdminAds />
            </LazyRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <LazyRoute pageName="Dashboard">
              <Dashboard />
            </LazyRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <LazyRoute pageName="Profile">
              <Profile />
            </LazyRoute>
          } 
        />
        
        {/* Analytics Route */}
        <Route 
          path="/analytics" 
          element={
            <LazyRoute pageName="Analytics">
              <Analytics />
            </LazyRoute>
          } 
        />
        
        {/* Email Generator Routes */}
        <Route 
          path="/tools/email-generator" 
          element={
            <LazyRoute 
              pageName="Email Generator"
              preloadOnHover={true}
              preloadFunction={preloadEmailComponents}
            >
              <SalesPageEmailGenerator />
            </LazyRoute>
          } 
        />

        {/* FIXED: Video2Promo Routes */}
        <Route 
          path="/tools/video2promo" 
          element={
            <LazyRoute pageName="Video2Promo">
              <Video2Promo />
            </LazyRoute>
          } 
        />
        
        {/* Email Series Routes */}
        <Route 
          path="/email-series" 
          element={
            <LazyRoute pageName="Email Series List">
              <EmailSeriesListPage />
            </LazyRoute>
          } 
        />
        <Route 
          path="/email-series/:seriesId" 
          element={
            <LazyRoute pageName="Email Series Detail">
              <EmailSeriesDetailPage />
            </LazyRoute>
          } 
        />
        <Route 
          path="/tools/email-series" 
          element={
            <LazyRoute pageName="Email Series List">
              <EmailSeriesListPage />
            </LazyRoute>
          } 
        />
        <Route 
          path="/tools/email-series/:seriesId" 
          element={
            <LazyRoute pageName="Email Series Detail">
              <EmailSeriesDetailPage />
            </LazyRoute>
          } 
        />
        
        {/* Future Features */}
        <Route 
          path="/blog-creator" 
          element={
            <LazyRoute pageName="Blog Post Creator">
              <BlogPostCreator />
            </LazyRoute>
          } 
        />
        
        <Route 
          path="/newsletter-creator" 
          element={
            <LazyRoute pageName="Newsletter Creator">
              <NewsletterCreator />
            </LazyRoute>
          } 
        />
      </Route>
      
      {/* Alternative Video2Promo Route Names - OUTSIDE MainLayout */}
      <Route 
        path="/video-to-email" 
        element={<Navigate to="/tools/video2promo" replace />}
      />
      <Route 
        path="/tools/video-to-email" 
        element={<Navigate to="/tools/video2promo" replace />}
      />
      <Route 
        path="/video2promo" 
        element={<Navigate to="/tools/video2promo" replace />}
      />
      

      <Route 
        path="/subscription" 
        element={
          <LazyRoute pageName="Subscription">
            <Subscription />
          </LazyRoute>
        } 
      />
      
      {/* Fallback for undefined routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;