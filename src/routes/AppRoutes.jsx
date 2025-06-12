// src/routes/AppRoutes.jsx - ENHANCED with Complete New Structure Integration
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { preloadEmailComponents } from '../shared/utils/emailPreloaderUtils';
import { trackLazyLoading, useRenderTime } from '../shared/utils/performanceUtils';
import { ErrorBoundary } from '../shared/components/ui';
// import AIMonitoringDashboard from '../components/AIMonitoringDashboard';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Layout components (keep these as regular imports since they're used on every page)
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import Loader from '../shared/components/ui/Loader';

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
};

// 🚀 ENHANCED: Use SuperAdminPanel as main admin dashboard
const AdminDashboard = lazy(() => {
  const tracker = trackLazyLoading('AdminDashboard');
  return import('../pages/admin/SuperAdminPanel').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// 🚀 UPDATED: Admin Pages with correct paths
const AdminUsers = lazy(() => {
  const tracker = trackLazyLoading('AdminUsers');
  return import('../pages/admin/AdminUsers').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const AdminAnalytics = lazy(() => {
  const tracker = trackLazyLoading('AdminAnalytics');
  return import('../pages/admin/AdminAnalytics').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const FixSuperAdmin = lazy(() => {
  const tracker = trackLazyLoading('FixSuperAdmin');
  return import('../pages/admin/FixSuperAdmin').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// 🚀 UPDATED: Admin Ads with correct case-sensitive path
const AdminAds = lazy(() => {
  const tracker = trackLazyLoading('AdminAds');
  return import('../pages/admin/AdminAds').then(module => {
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

// 🚀 UPDATED: Auth components with shared structure
const Login = lazy(() => {
  const tracker = trackLazyLoading('Login');
  return import('../pages/auth/Login').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const Register = lazy(() => {
  const tracker = trackLazyLoading('Register');
  return import('../pages/auth/Register').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const ResetPassword = lazy(() => {
  const tracker = trackLazyLoading('ResetPassword');
  return import('../pages/auth/ResetPassword').then(module => {
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

// 🚀 ENHANCED: Video2Promo with complete multi-tool architecture
const Video2PromoPage = lazy(() => {
  const tracker = trackLazyLoading('Video2PromoEnhanced');
  return import('../pages/tools/Video2PromoPage').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// 🆕 NEW: Future tools (ready for implementation)
const Document2PromoPage = lazy(() => {
  const tracker = trackLazyLoading('Document2Promo');
  return import('../pages/tools/Document2PromoPage').catch(() => {
    return {
      default: () => (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Document2Promo</h2>
          <p className="text-lg text-gray-600 mb-4">Extract insights from PDFs and documents</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">Coming Soon! This tool will extract marketing content from:</p>
            <ul className="text-blue-700 text-sm mt-2 space-y-1">
              <li>• PDF documents and whitepapers</li>
              <li>• Word documents and presentations</li>
              <li>• Text files and markdown</li>
            </ul>
          </div>
        </div>
      )
    };
  }).then(module => {
    if (tracker) tracker();
    return module;
  });
});

const Webpage2PromoPage = lazy(() => {
  const tracker = trackLazyLoading('Webpage2Promo');
  return import('../pages/tools/Webpage2PromoPage').catch(() => {
    return {
      default: () => (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <div className="text-6xl mb-4">🌐</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Webpage2Promo</h2>
          <p className="text-lg text-gray-600 mb-4">Advanced webpage and salespage analysis</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">Coming Soon! Enhanced features include:</p>
            <ul className="text-green-700 text-sm mt-2 space-y-1">
              <li>• AI-powered salespage analysis</li>
              <li>• Competitor page intelligence</li>
              <li>• Conversion optimization insights</li>
            </ul>
          </div>
        </div>
      )
    };
  }).then(module => {
    if (tracker) tracker();
    return module;
  });
});

const Email2PromoPage = lazy(() => {
  const tracker = trackLazyLoading('Email2Promo');
  return import('../pages/tools/Email2PromoPage').catch(() => {
    return {
      default: () => (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Email2Promo</h2>
          <p className="text-lg text-gray-600 mb-4">Extract content from emails and newsletters</p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800">Coming Soon! Extract content from:</p>
            <ul className="text-purple-700 text-sm mt-2 space-y-1">
              <li>• Marketing emails and newsletters</li>
              <li>• Email sequences and campaigns</li>
              <li>• Customer correspondence</li>
            </ul>
          </div>
        </div>
      )
    };
  }).then(module => {
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
  return import('../pages/tools/AIWritingAssistant').then(module => {
    if (tracker) tracker();
    return module;
  });
});

const CompetitorAnalysis = lazy(() => {
  const tracker = trackLazyLoading('CompetitorAnalysis');
  return import('../pages/tools/CompetitorAnalysis').then(module => {
    if (tracker) tracker();
    return module;
  });
});

// Legacy pages
const BlogPostCreator = lazy(() => {
  const tracker = trackLazyLoading('BlogPostCreator');
  return import('../pages/tools/BlogPostCreator').catch(() => {
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
  return import('../pages/tools/NewsletterCreator').catch(() => {
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
              <LazyRoute pageName="Super Admin Panel">
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
          
          <Route 
            path="/analytics" 
            element={
              <LazyRoute pageName="Analytics">
                <Analytics />
              </LazyRoute>
            } 
          />
          
          {/* 🚀 ENHANCED: Complete Multi-Tool Architecture */}
          
          {/* Video2Promo - Active */}
          <Route 
            path="/tools/video2promo" 
            element={
              <LazyRoute pageName="Video2Promo Enhanced">
                <Video2PromoPage />
              </LazyRoute>
            } 
          />
          
          {/* 🆕 NEW: Document2Promo Tool */}
          <Route 
            path="/tools/document2promo" 
            element={
              <LazyRoute pageName="Document2Promo">
                <Document2PromoPage />
              </LazyRoute>
            } 
          />
          
          {/* 🆕 NEW: Webpage2Promo Tool */}
          <Route 
            path="/tools/webpage2promo" 
            element={
              <LazyRoute pageName="Webpage2Promo">
                <Webpage2PromoPage />
              </LazyRoute>
            } 
          />
          
          {/* 🆕 NEW: Email2Promo Tool */}
          <Route 
            path="/tools/email2promo" 
            element={
              <LazyRoute pageName="Email2Promo">
                <Email2PromoPage />
              </LazyRoute>
            } 
          />
          
          {/* Existing Email Generator */}
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
        
        {/* 🚀 ENHANCED: All Video2Promo aliases redirect to the enhanced version */}
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