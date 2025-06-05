// src/pages/Dashboard.jsx - CLEAN VERSION - Removed Super Admin messages
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase/supabaseClient';
import { getTierDisplayName, isSuperAdmin } from '../utils/tierUtils';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState(null);
  
  console.log("Dashboard component rendering - CLEAN VERSION");
  
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
            // Fallback to free tier if profile fetch fails
            setUserTier('free');
          }
        } else {
          console.log('No authenticated user found');
          // For testing without auth, use free tier
          setUserTier('free');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to free tier on error
        setUserTier('free');
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
  const currentTier = userTier || 'free'; // Fallback to free tier
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
      
      {/* Clean welcome section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md mb-8">
        <div className="p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-semibold">
                  👤
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold">Welcome back!</h2>
                <p className="text-indigo-100">
                  What would you like to create today?
                </p>
                <p className="text-sm mt-1 text-indigo-200">
                  {tierDisplay} Plan
                  {user && (
                    <span className="block text-xs opacity-75 mt-1">
                      {user.email}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Usage display */}
            <div className="hidden md:block">
              <div className="text-right">
                <div className="text-sm mb-1 text-indigo-200">
                  Today's Usage
                </div>
                <div className="text-white">
                  {isAdmin ? 'Unlimited' : '500 tokens available'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      
      {/* Tools section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Content Creation Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Video2Promo Tool */}
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
          
          {/* Email Generator Tool */}
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
          
          {/* Content Library Tool */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2h10a2 2 0 012 2v2M7 19h10a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Manager</h3>
              <p className="text-gray-600 text-sm mb-4">Organize and manage all your content by marketing campaigns.</p>
              <Link 
                to="/content-library" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
                Launch Tool
              </Link>
            </div>
          </div>

          {/* Admin Tool - Only shown for SuperAdmin but WITHOUT banners */}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Panel</h3>
                <p className="text-gray-600 text-sm mb-4">Platform administration and user management.</p>
                <Link 
                  to="/admin" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
                >
                  Access Panel
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Simple status without admin messages */}
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Dashboard Ready
        </h3>
        <p className="text-gray-600">
          All systems operational. Ready to create amazing content!
          {user && (
            <span className="block text-sm text-gray-500 mt-1">
              Logged in as: {user.email}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;