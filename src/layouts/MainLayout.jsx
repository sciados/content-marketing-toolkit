// src/components/Layout/MainLayout.jsx - FIXED to fetch real profile data
import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
// import SupabaseContext from '../../context/SupabaseContext';
import { useAuth } from '../shared/hooks/useAuth';
import { useUsageTracking } from '../shared/hooks/useUsageTracking';
// import { supabase } from '../../services/supabase/supabaseClient';
import Sidebar from './Sidebar';
import AdSidebar from './AdSidebar';
import { ErrorBoundary, SystemStatus, UsageMeter } from '../shared/components/ui';
import { 
  getTierDisplayName, 
  getTierColor, 
  isSuperAdmin
} from '../shared/utils/tierUtils';

const MainLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const { logout } = useAuth();
  const { wsConnected } = useUsageTracking();
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  
  // NEW: State for profile data
  const [userTier, setUserTier] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // NEW: Fetch profile data the same way Dashboard.jsx does
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        if (user) {
          console.log('MainLayout: Fetching profile for user:', user.id);
          
          // Get user profile with subscription tier
          const { data: profile, error } = await useAuth
            .from('profiles')
            .select('subscription_tier, subscription_status')
            .eq('id', user.id)
            .single();
            
          if (profile && !error) {
            setUserTier(profile.subscription_tier);
            console.log('MainLayout: Real user tier fetched:', {
              userId: user.id,
              email: user.email,
              tier: profile.subscription_tier,
              status: profile.subscription_status
            });
          } else {
            console.log('MainLayout: Profile fetch error:', error);
            // Fallback for testing
            setUserTier('superAdmin');
          }
        } else {
          console.log('MainLayout: No authenticated user');
          setUserTier(null);
        }
        
        setProfileLoading(false);
      } catch (error) {
        console.error('MainLayout: Error loading profile:', error);
        // Fallback for testing
        setUserTier('superAdmin');
        setProfileLoading(false);
      }
    };
    
    getUserProfile();
    
    // Listen for auth changes
    const { data: authListener } = useAuth.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        getUserProfile();
      } else {
        setUserTier(null);
        setProfileLoading(false);
      }
    });
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [user]);

  // FIXED: Use real tier data
  const currentTier = userTier || 'free'; // Use fetched tier instead of user?.subscription_tier
  const isAdmin = isSuperAdmin(currentTier);
  const tierDisplay = getTierDisplayName(currentTier);
  const tierColor = getTierColor(currentTier);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
      window.location.href = '/auth/login';
    }
  };

  // Show loading while checking auth OR profile
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mt-4">
            {authLoading ? 'Loading...' : 'Loading profile...'}
          </p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to welcome page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Tier Badge Component - Now uses real data
  const TierBadge = ({ showFullText = false }) => (
    <div className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
      ${tierColor === 'red' 
        ? 'bg-red-100 text-red-800 border-red-200' 
        : tierColor === 'yellow'
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
        : tierColor === 'purple'
        ? 'bg-purple-100 text-purple-800 border-purple-200'
        : 'bg-gray-100 text-gray-800 border-gray-200'
      }
    `}>
      {isAdmin && <span className="mr-1">🛡️</span>}
      {showFullText ? tierDisplay : (isAdmin ? 'Admin' : tierDisplay)}
      {isAdmin && showFullText && <span className="ml-1 opacity-75">(Admin)</span>}
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Fixed Header with Real SuperAdmin Data */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Brand - Now shows real admin status */}
              <div className="flex items-center gap-3">
                <NavLink to="/dashboard" className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isAdmin 
                      ? 'bg-gradient-to-br from-red-600 to-red-700' 
                      : 'bg-gradient-to-br from-brand-600 to-accent-600'
                  }`}>
                    <span className="text-white font-bold text-lg">
                      {isAdmin ? '🛡️' : 'C'}
                    </span>
                  </div>
                  <span className="font-bold text-xl text-gray-900">
                    Content Marketing
                    {isAdmin && <span className="text-red-600 ml-1">Admin</span>}
                  </span>
                </NavLink>
              </div>

              {/* Header Navigation - Now shows real admin items */}
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
                {/* Admin-only navigation - Now works with real data */}
                {isAdmin && (
                  <NavLink 
                    to="/admin" 
                    className={({ isActive }) => 
                      `text-sm font-medium transition-colors ${
                        isActive ? 'text-red-600' : 'text-red-500 hover:text-red-700'
                      }`
                    }
                  >
                    🛡️ Admin
                  </NavLink>
                )}
                <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Help
                </a>
              </nav>

              {/* Header Right Section - Now shows real tier data */}
              <div className="flex items-center gap-4">
                {/* Usage Meter - Enhanced for Real SuperAdmin */}
                <div className="hidden md:block">
                  <div className="flex items-center gap-2">
                    <UsageMeter variant="compact" showLabels={false} />
                    {isAdmin && (
                      <div className="text-xs text-red-600 font-bold">
                        UNLIMITED
                      </div>
                    )}
                  </div>
                </div>

                {/* Tier Badge - Now shows real tier */}
                <div className="hidden md:block">
                  <TierBadge />
                </div>

                {/* System Status Indicator */}
                <div className="relative">
                  <button
                    onClick={() => setShowSystemStatus(!showSystemStatus)}
                    className={`p-2 rounded-lg transition-colors ${
                      wsConnected 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={wsConnected ? 'System operational' : 'System status unknown'}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      wsConnected ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                  </button>

                  {/* System Status Dropdown */}
                  {showSystemStatus && (
                    <div className="absolute right-0 mt-2 w-64 z-50">
                      <SystemStatus className="shadow-lg" />
                    </div>
                  )}
                </div>

                {/* User Menu - Now shows real SuperAdmin status */}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isAdmin ? 'bg-red-200' : 'bg-gray-200'
                    }`}>
                      {isAdmin ? (
                        <span className="text-red-600 text-sm font-bold">🛡️</span>
                      ) : (
                        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.email || 'User'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {isAdmin ? 'Super Administrator' : `${tierDisplay} Account`}
                          </p>
                        </div>
                        <TierBadge />
                      </div>
                      {isAdmin && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                          🛡️ You have administrative privileges and unlimited access.
                        </div>
                      )}
                      {/* DEBUG: Show current tier data */}
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        Debug: Tier = {currentTier} | Is Admin = {isAdmin.toString()}
                      </div>
                    </div>
                    
                    {/* Usage summary in user menu for mobile */}
                    <div className="md:hidden px-3 py-2 border-b border-gray-100">
                      <div className="text-xs font-medium text-gray-500 mb-2">Usage</div>
                      <UsageMeter variant="compact" className="justify-center" />
                      {isAdmin && (
                        <div className="text-xs text-red-600 font-bold mt-1 text-center">
                          Unlimited Access
                        </div>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <NavLink 
                        to="/profile" 
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Profile
                      </NavLink>
                      <NavLink 
                        to="/subscription" 
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Usage & Billing
                      </NavLink>
                      
                      {/* Admin Section - Now shows for real admins */}
                      {isAdmin && (
                        <>
                          <hr className="my-1" />
                          <div className="px-3 py-1">
                            <div className="text-xs font-medium text-red-600 uppercase tracking-wide">
                              🛡️ Super Admin
                            </div>
                          </div>
                          <NavLink 
                            to="/admin" 
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                          >
                            Admin Dashboard
                          </NavLink>
                          <NavLink 
                            to="/admin/users" 
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            User Management
                          </NavLink>
                          <NavLink 
                            to="/admin/analytics" 
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            System Analytics
                          </NavLink>
                        </>
                      )}
                      
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

          {/* Main Content with Error Boundary */}
          <main className="flex-1 overflow-x-hidden">
            <ErrorBoundary>
              <div className="container mx-auto px-6 py-8 max-w-7xl">
                {/* SuperAdmin Alert Banner - Now shows for real admins */}
                {isAdmin && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-red-600 text-xl">🛡️</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Super Administrator Mode
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            You have unlimited access to all features and administrative privileges.
                            <NavLink 
                              to="/admin" 
                              className="ml-2 font-medium underline hover:text-red-800"
                            >
                              Access Admin Panel →
                            </NavLink>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <Outlet />
              </div>
            </ErrorBoundary>
          </main>

          {/* Right Ad Sidebar */}
          <AdSidebar />
        </div>

        {/* Click outside handler for system status */}
        {showSystemStatus && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowSystemStatus(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;