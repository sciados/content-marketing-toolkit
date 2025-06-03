// src/pages/Dashboard.jsx - TEST VERSION: Adding useProfile
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase/supabaseClient';
import { useUsageTracking } from '../hooks/useUsageTracking';
import { useProfile } from '../hooks/useProfile';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  console.log("🔍 Dashboard component rendering");
  
  // TEST: Add useUsageTracking hook
  console.log("🔍 About to call useUsageTracking...");
  const usageTrackingResult = useUsageTracking();
  console.log("🔍 useUsageTracking result:", usageTrackingResult);

  // TEST: Add useProfile hook
  console.log("🔍 About to call useProfile...");
  const profileResult = useProfile();
  console.log("🔍 useProfile result:", profileResult);
  
  // Check user auth status on mount
  useEffect(() => {
    console.log("🔍 Dashboard useEffect running");
    const getUser = async () => {
      try {
        console.log("🔍 Getting user session...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("🔍 Session:", session ? 'exists' : 'null');
        setUser(session?.user || null);
        setLoading(false);
        console.log("🔍 User set, loading set to false");
      } catch (error) {
        console.error("🚨 Error in getUser:", error);
        setLoading(false);
      }
    };
    
    getUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔍 Auth state changed:", event);
      setUser(session?.user || null);
    });
    
    return () => {
      console.log("🔍 Cleaning up auth listener");
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  console.log("🔍 About to render Dashboard UI");

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
      
      {/* Simple user info */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md mb-8">
        <div className="p-6 text-white">
          <h2 className="text-xl font-bold">
            Welcome back, {user?.email || 'User'}!
          </h2>
          <p className="text-indigo-100">What would you like to create today?</p>
        </div>
      </div>
      
      {/* Simple tools grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Content Creation Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
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
        </div>
      </div>
      
      {/* Simple CTA for non-authenticated users */}
      {!user && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign In to Access All Features</h3>
          <p className="text-gray-600 mb-4">
            Create an account to save your generated content and access premium features.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/auth/login" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign In
            </Link>
            <Link 
              to="/auth/register" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50"
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