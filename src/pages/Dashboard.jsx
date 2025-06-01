// src/pages/Dashboard.jsx - With Personalized Greeting
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase/supabaseClient';
import { useProfile } from '../hooks/useProfile';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { firstName, profileStats } = useProfile();
  
  console.log("Dashboard component rendering");
  
  // Tools offered by the application
  const tools = [
    {
      id: 'email-generator',
      name: 'Sales Email Generator',
      description: 'Create compelling sales email sequences from any product or landing page with AI assistance.',
      path: '/tools/email-generator',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      available: true
    },
    {
      id: 'analytics',
      name: 'Email Analytics',
      description: 'Track your email performance, view insights, and analyze your content creation patterns.',
      path: '/analytics',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z" />
        </svg>
      ),
      available: true
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
      comingSoon: true
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
      comingSoon: true
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to your content marketing toolkit.</p>
      </div>
      
      {/* User welcome section with personalized greeting */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md mb-8">
        <div className="p-6 text-white">
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
                  {profileStats.emailsSaved || 0}/{profileStats.emailQuota || 0} emails used
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats for Authenticated Users */}
      {user && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Emails Created</p>
                  <p className="text-2xl font-semibold text-gray-900">{profileStats?.emailsSaved || 0}</p>
                </div>
              </div>
              <div className="mt-2">
                <Link to="/analytics" className="text-sm text-indigo-600 hover:text-indigo-500">
                  View Analytics →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2h10a2 2 0 012 2v2M7 19h10a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Email Series</p>
                  <p className="text-2xl font-semibold text-gray-900">{profileStats?.seriesCount || 0}</p>
                </div>
              </div>
              <div className="mt-2">
                <Link to="/tools/email-series" className="text-sm text-green-600 hover:text-green-500">
                  Manage Series →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Plan Status</p>
                  <p className="text-2xl font-semibold text-gray-900 capitalize">
                    {profileStats?.subscriptionTier || 'Free'}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <Link to="/subscription" className="text-sm text-purple-600 hover:text-purple-500">
                  Manage Plan →
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
                <div className="mb-4">{tool.icon}</div>
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
      
      {/* CTA for non-authenticated users */}
      {!user && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign In to Access All Features</h3>
          <p className="text-gray-600 mb-4">
            Create an account to save your generated emails, track analytics, and access premium features.
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
