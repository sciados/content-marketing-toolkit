// src/routes/AppRoutes.jsx - UPDATED with Content Library and Admin Integration
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { preloadEmailComponents } from '../utils/emailPreloaderUtils';
import { trackLazyLoading, useRenderTime } from '../utils/performanceUtils';

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
  return import('../pages/Admin/AdminDashboard').catch(() => {
    // Fallback component for non-existent admin pages
    return { 
      default: () => (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
          <p className="text-gray-600">System analytics and management coming soon!</p>
        </div>
      )
    };
  }).then(module => {
    if (tracker) tracker();
    return module;
  });
});

const AdminAnalytics = lazy(() => {
  const tracker = trackLazyLoading('AdminAnalytics');
  return import('../pages/Admin/AdminAnalytics').catch(() => {
    // Fallback component for non-existent admin pages
    return { 
      default: () => (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Analytics</h2>
          <p className="text-gray-600">Advanced system analytics dashboard coming soon!</p>
        </div>
      )
    };
  }).then(module => {
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

// NEW: Content Library
const ContentLibrary = lazy(() => {
  const tracker = trackLazyLoading('ContentLibrary');
  return import('../pages/ContentLibrary').catch(() => {
    // Fallback component until Content Library is implemented
    return { 
      default: () => (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Content Library</h2>
          <p className="text-lg text-gray-600 mb-6">
            Your personal library of extracted YouTube transcripts, scanned sales pages, and generated content.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Coming Soon!</h3>
            <p className="text-blue-700">
              The Content Library will allow you to save, organize, and reuse all your extracted content. 
              Features include search, favorites, tags, and seamless integration with Video2Promo and Email Generator.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">🎥 Video Transcripts</h4>
              <p className="text-sm text-gray-600">Save and reuse YouTube video transcripts</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">🌐 Scanned Pages</h4>
              <p className="text-sm text-gray-600">Store analyzed sales page data</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">📄 Generated Assets</h4>
              <p className="text-sm text-gray-600">Access your marketing materials</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">🔍 Smart Search</h4>
              <p className="text-sm text-gray-600">Find content by keywords or tags</p>
            </div>
          </div>
        </div>
      )
    };
  }).then(module => {
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

// Future tool pages - with better fallbacks
const AIWritingAssistant = lazy(() => {
  const tracker = trackLazyLoading('AIWritingAssistant');
  return import('../pages/Tools/AIWritingAssistant').catch(() => {
    return { 
      default: () => (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <div className="text-6xl mb-4">✍️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Writing Assistant</h2>
          <p className="text-lg text-gray-600 mb-6">
            Generate blog posts, articles, social media content, and marketing copy with advanced AI.
          </p>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">Coming Soon!</h3>
            <p className="text-indigo-700">
              The AI Writing Assistant will help you create high-quality content for any purpose.
            </p>
          </div>
        </div>
      )
    };
  }).then(module => {
    if (tracker) tracker();
    return module;
  });
});

const CompetitorAnalysis = lazy(() => {
  const tracker = trackLazyLoading('CompetitorAnalysis');
  return import('../pages/Tools/CompetitorAnalysis').catch(() => {
    return { 
      default: () => (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Competitor Analysis</h2>
          <p className="text-lg text-gray-600 mb-6">
            Analyze competitor websites, SEO strategies, and market positioning.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Coming Soon!</h3>
            <p className="text-purple-700">
              Comprehensive competitor research and market intelligence tools.
            </p>
          </div>
        </div>
      )
    };
  }).then(module => {
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
      
      {/* Admin Routes - Using AdminLayout */}
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
        
        {/* NEW: Content Library Route */}
        <Route 
          path="/content-library" 
          element={
            <LazyRoute pageName="Content Library">
              <ContentLibrary />
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
  );
};

export default AppRoutes;