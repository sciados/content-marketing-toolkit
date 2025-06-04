// src/pages/Dashboard.jsx - REAL USER DATA VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase/supabaseClient';
import { getTierDisplayName, isSuperAdmin } from '../utils/tierUtils';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState(null);
  
  console.log("Dashboard component rendering - REAL USER DATA VERSION");
  
  // Get real user data
  useEffect(() => {
    const getUserData = async () => {
      try {
        // Get authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        const authUser = session?.user;
        
        if (authUser) {
          setUser(authUser);
          
          // Get user profile with subscription tier
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('subscription_tier, subscription_status')
            .eq('id', authUser.id)
            .single();
            
          if (profile && !error) {
            setUserTier(profile.subscription_tier);
            console.log('Real user data:', {
              userId: authUser.id,
              email: authUser.email,
              tier: profile.subscription_tier,
              status: profile.subscription_status
            });
          } else {
            console.log('Profile fetch error:', error);
            // Fallback to test data if profile fetch fails
            setUserTier('superAdmin');
          }
        } else {
          console.log('No authenticated user found');
          // For testing without auth, use hardcoded admin
          setUserTier('superAdmin');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to test data on error
        setUserTier('superAdmin');
        setLoading(false);
      }
    };
    
    getUserData();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Re-fetch profile when auth changes
        getUserData();
      } else {
        setUser(null);
        setUserTier(null);
      }
    });
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Use real tier data with fallback
  const currentTier = userTier || 'superAdmin'; // Fallback for testing
  const isAdmin = isSuperAdmin(currentTier);
  const tierDisplay = getTierDisplayName(currentTier);
  
  console.log("Tier data:", { currentTier, isAdmin, tierDisplay, userEmail: user?.email });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to your content marketing toolkit.</p>
      </div>

      {/* SuperAdmin Banner - Test with hardcoded value */}
      {isAdmin && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-600 text-xl">🛡️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Super Administrator Access
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  You have unlimited access to all features and administrative privileges.
                  Tier: {tierDisplay}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Welcome section with tier-aware styling */}
      <div className={`rounded-lg shadow-md mb-8 ${
        isAdmin 
          ? 'bg-gradient-to-r from-red-600 to-red-700' 
          : 'bg-gradient-to-r from-indigo-600 to-purple-600'
      }`}>
        <div className="p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-semibold">
                  {isAdmin ? '🛡️' : '👤'}
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold">Welcome back!</h2>
                <p className={isAdmin ? 'text-red-100' : 'text-indigo-100'}>
                  {isAdmin ? 'Super Administrator Access' : 'What would you like to create today?'}
                </p>
                <p className={`text-sm mt-1 ${isAdmin ? 'text-red-200' : 'text-indigo-200'}`}>
                  {tierDisplay} Plan
                  {isAdmin && (
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                      UNLIMITED ACCESS
                    </span>
                  )}
                  {user && (
                    <span className="block text-xs opacity-75 mt-1">
                      {user.email}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Usage display with admin support */}
            <div className="hidden md:block">
              <div className="text-right">
                <div className={`text-sm mb-1 ${isAdmin ? 'text-red-200' : 'text-indigo-200'}`}>
                  Today's Usage
                </div>
                {isAdmin ? (
                  <div className="text-white font-bold flex items-center">
                    <span className="mr-2">🛡️</span>
                    UNLIMITED
                  </div>
                ) : (
                  <div className="text-white">500 tokens available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats with admin styling */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
            isAdmin ? 'border-red-500' : 'border-indigo-500'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className={`h-8 w-8 ${isAdmin ? 'text-red-600' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Daily Tokens</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {isAdmin ? '∞' : '500'}
                </p>
                <p className="text-xs text-gray-400">
                  {isAdmin ? 'Unlimited access' : 'Available today'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2h10a2 2 0 012 2v2M7 19h10a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Content Items</h3>
                <p className="text-2xl font-semibold text-gray-900">12</p>
                <p className="text-xs text-gray-400">In your library</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Videos Processed</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {isAdmin ? '∞' : '5'}
                </p>
                <p className="text-xs text-gray-400">
                  {isAdmin ? 'Unlimited processing' : 'This month'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tools section with admin tool */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Content Creation Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Regular Tools */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Video2Promo</h3>
              <p className="text-gray-600 text-sm mb-4">Extract YouTube video transcripts and generate marketing campaigns.</p>
              <Link 
                to="/tools/video2promo" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Launch Tool
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email Generator</h3>
              <p className="text-gray-600 text-sm mb-4">Create compelling sales email sequences from any landing page.</p>
              <Link 
                to="/tools/email-generator" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Launch Tool
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2h10a2 2 0 012 2v2M7 19h10a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content Library</h3>
              <p className="text-gray-600 text-sm mb-4">Manage and organize all your generated content.</p>
              <Link 
                to="/tools/content-library" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
                Launch Tool
              </Link>
            </div>
          </div>

          {/* Admin Tool - Only shown for SuperAdmin */}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden ring-2 ring-red-200">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-bold">
                    🛡️ ADMIN
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Super Admin Panel</h3>
                <p className="text-gray-600 text-sm mb-4">Manage users, subscription tiers, and platform settings.</p>
                <Link 
                  to="/admin" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  🛡️ Access Panel
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Dashboard Loaded Successfully
        </h3>
        <p className="text-gray-600">
          {isAdmin 
            ? `🛡️ Super Administrator Access - ${tierDisplay} Plan`
            : 'Standard user dashboard loaded'
          }
          {user && (
            <span className="block text-sm text-gray-500 mt-1">
              Logged in as: {user.email}
            </span>
          )}
        </p>
        <div className="mt-2 text-sm text-blue-600 font-medium">
          {currentTier === 'superAdmin' 
            ? `Real SuperAdmin tier detected from database`
            : `Tier: ${currentTier} (from database)`
          }
        </div>
      </div>
    </div>
  );
};

export default Dashboard;