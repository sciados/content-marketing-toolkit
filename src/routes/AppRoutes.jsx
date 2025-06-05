// src/routes/AppRoutes.jsx - UPDATED with proper Content Library routing
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { preloadEmailComponents } from '../utils/emailPreloaderUtils';
import { trackLazyLoading, useRenderTime } from '../utils/performanceUtils';
import { ErrorBoundary } from '../components/Common';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Layout components (keep these as regular imports since they're used on every page)
import MainLayout from '../components/Layout/MainLayout';
import AuthLayout from '../components/Layout/AuthLayout';
import { AdminLayout } from '../components/Layout/AdminLayout';
import Loader from '../components/Common/Loader';

const ALLOWED_ORIGIN =
  import.meta.env.DEV
    ? 'https://content-marketing-toolkit-8w8d.vercel.app'
    : '*';

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function GET() {
  return Response.json({ ok: true }, {
    headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
  });
}

// Admin Pages
const AdminUsers = lazy(() => {
  const tracker = trackLazyLoading('AdminUsers');
  return import('../pages/Admin/AdminUsers').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const AdminDashboard = lazy(() => {
  const tracker = trackLazyLoading('AdminDashboard');
  return import('../pages/Admin/AdminDashboard').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const AdminAnalytics = lazy(() => {
  const tracker = trackLazyLoading('AdminAnalytics');
  return import('../pages/Admin/AdminAnalytics').then(module => {
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

// Super Admin Panel
const SuperAdminPanel = lazy(() => {
  const tracker = trackLazyLoading('SuperAdminPanel');
  return import('../components/SuperAdminPanel').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// Main App Pages
const Welcome = lazy(() => {
  const tracker = trackLazyLoading('Welcome');
  return import('../pages/Welcome').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const Login = lazy(() => {
  const tracker = trackLazyLoading('Login');
  return import('../components/Auth/Login').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const Register = lazy(() => {
  const tracker = trackLazyLoading('Register');
  return import('../components/Auth/Register').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const ResetPassword = lazy(() => {
  const tracker = trackLazyLoading('ResetPassword');
  return import('../components/Auth/ResetPassword').then(module => {
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

// Tool Pages
const SalesPageEmailGenerator = lazy(() => {
  const tracker = trackLazyLoading('SalesPageEmailGenerator');
  return import('../pages/SalesPageEmailGenerator').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// UPDATED: Content Library now uses Campaign System
const ContentLibrary = lazy(() => {
  const tracker = trackLazyLoading('ContentLibrary');
  return import('../pages/ContentLibrary').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// Campaign Management Pages
const CampaignList = lazy(() => {
  const tracker = trackLazyLoading('CampaignList');
  return import('../pages/CampaignList').catch(() => {
    return { 
      default: () => (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Campaign Manager</h2>
          <p className="text-lg text-gray-600 mb-6">Manage your content campaigns</p>
          <a 
            href="/campaigns/create" 
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create New Campaign
          </a>
        </div>
      )
    };
  }).then(module => {
    if (tracker) tracker();
    return module;
  });
});

const CampaignDetail = lazy(() => {
  const tracker = trackLazyLoading('CampaignDetail');
  return import('../pages/CampaignDetail').catch(() => {
    return { 
      default: () => (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Campaign Details</h2>
          <p className="text-lg text-gray-600">View campaign performance and content</p>
        </div>
      )
    };
  }).then(module => {
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

// Analytics page
const Analytics = lazy(() => {
  const tracker = trackLazyLoading('Analytics');
  return import('../pages/Analytics').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// Future tool pages
const AIWritingAssistant = lazy(() => {
  const tracker = trackLazyLoading('AIWritingAssistant');
  return import('../pages/Tools/AIWritingAssistant').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const CompetitorAnalysis = lazy(() => {
  const tracker = trackLazyLoading('CompetitorAnalysis');
  return import('../pages/Tools/CompetitorAnalysis').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// Legacy pages
const BlogPostCreator = lazy(() => {
  const tracker = trackLazyLoading('BlogPostCreator');
  return import('../pages/BlogPostCreator').catch(() => {
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

// Enhanced loading component
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

// Enhanced route wrapper
const LazyRoute = ({ 
  children, 
  pageName, 
  preloadOnHover = false, 
  preloadFunction = null 
}) => (
  <ErrorBoundary>
    <Suspense 
      fallback={<PageLoader pageName={pageName} />}
      onMouseEnter={preloadOnHover && preloadFunction ? preloadFunction : undefined}
    >
      {children}
    </Suspense>
  </ErrorBoundary>
);

const AppRoutes = () => {
  // Track overall routing performance
  useRenderTime('AppRoutes', isDevelopment);

  return (
    <ErrorBoundary>
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
        
        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route 
            path="/admin" 
            element={
              <LazyRoute pageName="Admin Dashboard">
                <AdminDashboard />
              </LazyRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <LazyRoute pageName="Admin Users">
                <AdminUsers />
              </LazyRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <LazyRoute pageName="Admin Analytics">
                <AdminAnalytics />
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
        </Route>
        
        {/* Protected Routes - Main Application */}
        <Route element={<MainLayout />}>
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
          
          {/* UPDATED: Content Library Route - Now uses Campaign System */}
          <Route 
            path="/content-library" 
            element={
              <LazyRoute pageName="Content Library">
                <ContentLibrary />
              </LazyRoute>
            } 
          />
          
          {/* Campaign Routes */}
          <Route 
            path="/campaigns" 
            element={
              <LazyRoute pageName="Campaign List">
                <CampaignList />
              </LazyRoute>
            } 
          />
          
          <Route 
            path="/campaigns/create" 
            element={
              <LazyRoute pageName="Create Campaign">
                <div className="max-w-4xl mx-auto p-8 text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Campaign</h2>
                  <p className="text-lg text-gray-600">Campaign creation coming soon!</p>
                </div>
              </LazyRoute>
            } 
          />
          
          <Route 
            path="/campaigns/:campaignId" 
            element={
              <LazyRoute pageName="Campaign Details">
                <CampaignDetail />
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
          
          {/* Core Tool Routes */}
          <Route 
            path="/tools/video2promo" 
            element={
              <LazyRoute pageName="Video2Promo">
                <Video2Promo />
              </LazyRoute>
            } 
          />
          
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
          
          {/* Future Tool Routes */}
          <Route 
            path="/tools/ai-writer" 
            element={
              <LazyRoute pageName="AI Writing Assistant">
                <AIWritingAssistant />
              </LazyRoute>
            } 
          />
          
          <Route 
            path="/tools/competitor-analysis" 
            element={
              <LazyRoute pageName="Competitor Analysis">
                <CompetitorAnalysis />
              </LazyRoute>
            } 
          />
          
          <Route 
            path="/tools/seo-generator" 
            element={
              <LazyRoute pageName="SEO Generator">
                <div className="max-w-4xl mx-auto p-8 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">SEO Content Generator</h2>
                  <p className="text-lg text-gray-600">Coming soon!</p>
                </div>
              </LazyRoute>
            } 
          />
          
          <Route 
            path="/tools/social-scheduler" 
            element={
              <LazyRoute pageName="Social Scheduler">
                <div className="max-w-4xl mx-auto p-8 text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Social Media Scheduler</h2>
                  <p className="text-lg text-gray-600">Coming soon!</p>
                </div>
              </LazyRoute>
            } 
          />
          
          {/* Legacy Email Series Routes */}
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
          
          {/* Legacy Tool Routes */}
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
        
        {/* Subscription Route - Outside MainLayout for full page experience */}
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
    </ErrorBoundary>
  );
};

export default AppRoutes;