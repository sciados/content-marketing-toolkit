// src/pages/Dashboard.jsx - EMERGENCY SAFE VERSION (no loops, no warnings)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  
  console.log("Dashboard component rendering - SAFE VERSION");
  
  // Simple useEffect with proper dependencies
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Simulate loading
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading:', error);
        setLoading(false);
      }
    };
    
    initializeUser();
  }, []); // Empty dependency array prevents loops

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
      
      {/* Simple welcome section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md mb-8">
        <div className="p-6 text-white">
          <h2 className="text-xl font-bold">Welcome back!</h2>
          <p className="text-indigo-100">What would you like to create today?</p>
        </div>
      </div>
      
      {/* Simple stats */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Daily Tokens</h3>
            <p className="text-2xl font-semibold text-gray-900">500</p>
            <p className="text-xs text-gray-400">Available today</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Content Items</h3>
            <p className="text-2xl font-semibold text-gray-900">12</p>
            <p className="text-xs text-gray-400">In your library</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Videos Processed</h3>
            <p className="text-2xl font-semibold text-gray-900">5</p>
            <p className="text-xs text-gray-400">This month</p>
          </div>
        </div>
      </div>
      
      {/* Tools section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Content Creation Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </div>
      
      {/* Simple status */}
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Loaded Successfully</h3>
        <p className="text-gray-600">
          This is a safe version of the dashboard without any render loops.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;