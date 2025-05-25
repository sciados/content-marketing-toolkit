// src/components/Layout/MainLayout.jsx - Refactored to use separate Sidebar
import React, { useContext } from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import SupabaseContext from '../../context/SupabaseContext';
import useSupabase from '../../hooks/useSupabase';
import Sidebar from './Sidebar';
import AdSidebar from './AdSidebar';

const MainLayout = () => {
  const { user, loading } = useContext(SupabaseContext);
  const { logout } = useSupabase();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
      window.location.href = '/auth/login';
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to welcome page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <NavLink to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-accent-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="font-bold text-xl text-gray-900">Content Marketing</span>
              </NavLink>
            </div>

            {/* Header Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-6">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-brand-600' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                All Tools
              </NavLink>
              <NavLink 
                to="/tools/email-generator" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-brand-600' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                Top Tools
              </NavLink>
              <NavLink 
                to="/tools/email-series" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-brand-600' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                New Features
              </NavLink>
              <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Help
              </a>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.email || 'User'}</p>
                    <p className="text-xs text-gray-500">Free Account</p>
                  </div>
                  <div className="py-1">
                    <NavLink 
                      to="/profile" 
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Profile
                    </NavLink>
                    <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Settings
                    </a>
                    <hr className="my-1" />
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Below Fixed Header */}
      <div className="flex pt-16">
        {/* Use the separate Sidebar component */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Right Ad Sidebar - Dynamic ads from database */}
        <AdSidebar />
      </div>
    </div>
  );
};

export default MainLayout;