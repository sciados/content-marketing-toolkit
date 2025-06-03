// src/pages/Dashboard.jsx - UPDATED with usage analytics integration
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase/supabaseClient';
import { useProfile } from '../hooks/useProfile';
import { useUsageTracking } from '../hooks/useUsageTracking';
import { useContentLibrary } from '../hooks/useContentLibrary';
import { UsageMeter, SystemStatus } from '../components/Common';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { firstName, profileStats } = useProfile();
  const { 
    limits, 
    getUsagePercentages, 
    getRemainingLimits,
    isNearLimit,
    isAtLimit,
    wsConnected 
  } = useUsageTracking();
  const { 
    totalItems, 
    videoTranscriptCount, 
    generatedAssetCount,
    favoriteCount 
  } = useContentLibrary();
  
  console.log("Dashboard component rendering");
  
  // Tools offered by the application
  const tools = [
    {
      id: 'video2promo',
      name: 'Video2Promo',
      description: 'Extract YouTube video transcripts and generate marketing campaigns with AI assistance.',
      path: '/tools/video2promo',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      available: true,
      premium: false
    },
    {
      id: 'email-generator',
      name: 'Sales Email Generator',
      description: 'Create compelling sales email sequences from any product or landing page with AI assistance.',
      path: '/tools/email-generator',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      available: true,
      premium: false
    },
    {
      id: 'content-library',
      name: 'Content Library',
      description: 'Manage and organize all your generated content in one centralized location.',
      path: '/tools/content-library',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2h10a2 2 0 012 2v2M7 19h10a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
        </svg>
      ),
      available: true,
      premium: false
    },
    {
      id: 'analytics',
      name: 'Usage Analytics',
      description: 'Track your content creation patterns, usage statistics, and optimize your workflow.',
      path: '/analytics',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z" />
        </svg>
      ),
      available: true,
      premium: false
    },
    {
      id: 'blog-post-creator',
      name: 'Blog Post Creator',
      description: 'Generate comprehensive blog posts with SEO optimization and engaging content structure.',
      path: '/tools/blog-post-creator',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      available: false,
      comingSoon: true,
      premium: true
    },
    {
      id: 'newsletter-creator',
      name: 'Newsletter Creator',
      description: 'Create engaging newsletters with curated content and personalized sections.',
      path: '/tools/newsletter-creator',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      available: false,
      comingSoon: true,
      premium: true
    }
  ];

  // Check user auth status on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    
    getUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const usagePercentages = getUsagePercentages();
  const remainingLimits = getRemainingLimits();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Welcome to your content marketing toolkit.</p>
          </div>
          
          {/* Real-time connection status */}
          {user && (
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-gray-500">
                {wsConnected ? 'Live updates' : 'Offline mode'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* User welcome section with personalized greeting */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md mb-8">
        <div className="p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-semibold">
                  {firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold">
                  {loading ? (
                    <span className="animate-pulse bg-white/20 h-6 w-40 inline-block rounded"></span>
                  ) : (
                    `Welcome back, ${firstName}!`
                  )}
                </h2>
                <p className="text-indigo-100">What would you like to create today?</p>
                {profileStats && (
                  <p className="text-indigo-200 text-sm mt-1">
                    {profileStats.subscriptionTier === 'free' ? 'Free Plan' : 
                     profileStats.subscriptionTier === 'pro' ? 'Pro Plan' :
                     profileStats.subscriptionTier === 'gold' ? 'Gold Plan' : 
                     'Premium Plan'} • 
                    {limits.tier} tier
                  </p>
                )}
              </div>
            </div>
            
            {/* Usage overview in header */}
            {user && (
              <div className="hidden md:block">
                <div className="text-right">
                  <div className="text-sm text-indigo-200 mb-1">Today's Usage</div>
                  <UsageMeter variant="compact" showLabels={false} color="white" />
                  {(isNearLimit || isAtLimit) && (
                    <div className="text-xs text-yellow-200 mt-1">
                      {isAtLimit ? '⚠️ Limit reached' : '⚠️ Near limit'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced Stats for Authenticated Users */}
      {user && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Token Usage Stats */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Daily Tokens</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {remainingLimits.daily_tokens.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      of {limits.daily_token_limit.toLocaleString()} remaining
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    usagePercentages.daily_tokens > 80 ? 'text-red-600' : 
                    usagePercentages.daily_tokens > 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {(100 - usagePercentages.daily_tokens).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">available</div>
                </div>
              </div>
            </div>

            {/* Content Library Stats */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2h10a2 2 0 012 2v2M7 19h10a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Content Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
                  <p className="text-xs text-gray-400">
                    {favoriteCount} favorites • {videoTranscriptCount} videos
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <Link to="/tools/content-library" className="text-sm text-purple-600 hover:text-purple-500">
                  Manage Content →
                </Link>
              </div>
            </div>

            {/* Video Processing Stats */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Videos Today</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {limits.daily_video_limit - limits.daily_videos_processed}
                  </p>
                  <p className="text-xs text-gray-400">
                    of {limits.daily_video_limit} remaining
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <Link to="/tools/video2promo" className="text-sm text-green-600 hover:text-green-500">
                  Process Video →
                </Link>
              </div>
            </div>

            {/* Generated Content Stats */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Generated Assets</p>
                  <p className="text-2xl font-semibold text-gray-900">{generatedAssetCount}</p>
                  <p className="text-xs text-gray-400">
                    emails, posts, campaigns
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <Link to="/analytics" className="text-sm text-blue-600 hover:text-blue-500">
                  View Analytics →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Alert */}
      {user && (isNearLimit || isAtLimit) && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isAtLimit ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${isAtLimit ? 'text-red-400' : 'text-yellow-400'}`}>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${isAtLimit ? 'text-red-800' : 'text-yellow-800'}`}>
                {isAtLimit ? 'Usage Limit Reached' : 'Approaching Usage Limit'}
              </h3>
              <div className={`mt-2 text-sm ${isAtLimit ? 'text-red-700' : 'text-yellow-700'}`}>
                <p>
                  {isAtLimit 
                    ? 'You\'ve reached your daily token limit. Upgrade to continue using AI features.'
                    : `You've used ${usagePercentages.daily_tokens.toFixed(1)}% of your daily tokens. Consider upgrading for unlimited access.`
                  }
                </p>
              </div>
              <div className="mt-3">
                <Link 
                  to="/subscription" 
                  className={`text-sm font-medium ${
                    isAtLimit ? 'text-red-600 hover:text-red-500' : 'text-yellow-600 hover:text-yellow-500'
                  }`}
                >
                  Upgrade Plan →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tools section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Content Creation Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${!tool.available ? 'opacity-70' : ''}`}>
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  {tool.icon}
                  {tool.premium && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs rounded-full">
                      PRO
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  {tool.name}
                  {tool.comingSoon && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Coming Soon
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                {tool.available ? (
                  <Link 
                    to={tool.path} 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Launch Tool
                  </Link>
                ) : (
                  <button 
                    disabled 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-500 bg-white cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status for logged in users */}
      {user && (
        <div className="mb-8">
          <SystemStatus />
        </div>
      )}
      
      {/* CTA for non-authenticated users */}
      {!user && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign In to Access All Features</h3>
          <p className="text-gray-600 mb-4">
            Create an account to save your generated content, track analytics, and access premium features.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/auth/login" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              Sign In
            </Link>
            <Link 
              to="/auth/register" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;