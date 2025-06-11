// src/components/Layout/Header.jsx - FIXED: Removed campaigns slice error
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import { useProfile } from '../../shared/hooks/useProfile';
import { UsageMeter } from '../ui';
import { 
  getTierDisplayName, 
  getTierColor, 
  isSuperAdmin
} from '../../utils/tierUtils';

const Header = () => {
  const { user, logout } = useAuth();
  const { firstName } = useProfile();
  
  const handleLogout = async () => {
    try {
      await logout();
      // The logout function already handles the redirect
    } catch (error) {
      console.error('Error logging out:', error);
      // Force redirect even if there's an error
      window.location.href = '/auth/login';
    }
  };

  // Use tierUtils instead of hardcoded ID check
  const isAdmin = isSuperAdmin(user?.subscription_tier);
  const tierDisplay = getTierDisplayName(user?.subscription_tier);
  const tierColor = getTierColor(user?.subscription_tier);

  // Tier badge component
  const TierBadge = () => (
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
      {tierDisplay}
      {isAdmin && <span className="ml-1 text-xs opacity-75">(Admin)</span>}
    </div>
  );

  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-indigo-600 font-bold text-xl">
          Content Marketing Toolkit
        </Link>
        
        <div className="flex items-center">
          {user ? (
            // User is logged in - show authenticated menu with first name
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 mx-3">
                Dashboard
              </Link>
              
              {/* FIXED: Campaign Hub Link - Simplified dropdown without data dependencies */}
              <div className="relative group mx-3">
                <button className="text-gray-600 hover:text-indigo-600 flex items-center">
                  Campaigns
                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    New
                  </span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link 
                      to="/content-library" 
                      className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
                    >
                      <span className="mr-3 text-lg">📚</span>
                      <div>
                        <div className="font-medium">Campaign Manager</div>
                        <div className="text-xs text-gray-500">View and organize your campaigns</div>
                      </div>
                    </Link>
                    <Link 
                      to="/campaigns" 
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
                    >
                      <span className="mr-3">📋</span>
                      <div>
                        <div className="font-medium">All Campaigns</div>
                        <div className="text-xs text-gray-500">Browse all your campaigns</div>
                      </div>
                    </Link>
                    <div className="border-t border-gray-100 my-2"></div>
                    <div className="px-3 py-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quick Actions</div>
                      <div className="space-y-1">
                        <Link 
                          to="/tools/email-generator"
                          className="flex items-center text-sm text-gray-600 hover:text-indigo-600"
                        >
                          <span className="mr-2">📧</span>
                          <span>Generate Emails</span>
                        </Link>
                        <Link 
                          to="/tools/video2promo"
                          className="flex items-center text-sm text-gray-600 hover:text-indigo-600"
                        >
                          <span className="mr-2">🎥</span>
                          <span>Video to Content</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tools Dropdown */}
              <div className="relative group mx-3">
                <button className="text-gray-600 hover:text-indigo-600 flex items-center">
                  Tools
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link 
                      to="/tools/video2promo" 
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
                    >
                      <span className="mr-3">🎥</span>
                      <div>
                        <div className="font-medium">Video2Promo</div>
                        <div className="text-xs text-gray-500">YouTube to marketing campaigns</div>
                      </div>
                    </Link>
                    <Link 
                      to="/tools/email-generator" 
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
                    >
                      <span className="mr-3">📧</span>
                      <div>
                        <div className="font-medium">Email Generator</div>
                        <div className="text-xs text-gray-500">AI sales email creation</div>
                      </div>
                    </Link>
                    <Link 
                      to="/tools/email-series" 
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
                    >
                      <span className="mr-3">📝</span>
                      <div>
                        <div className="font-medium">Email Series</div>
                        <div className="text-xs text-gray-500">Manage email campaigns</div>
                      </div>
                    </Link>
                    <div className="border-t border-gray-100 my-2"></div>
                    <div className="px-3 py-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Coming Soon</div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="mr-3">✍️</span>
                          <span>AI Writing Assistant</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="mr-3">🔍</span>
                          <span>Competitor Analysis</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="mr-3">📊</span>
                          <span>SEO Content Generator</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FIXED: Content Library - Updated route to use new campaign system */}
              <Link to="/content-library" className="text-gray-600 hover:text-indigo-600 mx-3 flex items-center">
                <span className="mr-1">📚</span>
                Content Library
              </Link>
              
              <Link to="/analytics" className="text-gray-600 hover:text-indigo-600 mx-3">
                Analytics
              </Link>

              {/* Usage Meter with SuperAdmin support */}
              <div className="hidden lg:flex items-center mx-3 px-3 py-1 bg-gray-50 rounded-lg">
                <UsageMeter variant="compact" showLabels={true} />
                {isAdmin && (
                  <div className="ml-2 text-xs text-red-600 font-bold">
                    UNLIMITED
                  </div>
                )}
              </div>

              {/* Tier Badge */}
              <div className="hidden md:flex items-center mx-3">
                <TierBadge />
              </div>

              {/* Profile Dropdown */}
              <div className="relative group mx-3">
                <button className="text-gray-600 hover:text-indigo-600 flex items-center">
                  Account
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900 flex items-center justify-between">
                        <span>Hi, {firstName}!</span>
                        <TierBadge />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {user.email}
                      </div>
                      {isAdmin && (
                        <div className="text-xs text-red-600 font-bold mt-1 flex items-center">
                          🛡️ Super Administrator
                        </div>
                      )}
                    </div>

                    {/* Usage Meter in dropdown for mobile */}
                    <div className="lg:hidden px-3 py-2 border-b border-gray-100">
                      <div className="text-xs font-medium text-gray-500 mb-2">Usage</div>
                      <UsageMeter variant="compact" showLabels={true} />
                      {isAdmin && (
                        <div className="text-xs text-red-600 font-bold mt-1">
                          Unlimited Access
                        </div>
                      )}
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link 
                      to="/subscription" 
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Usage & Billing
                    </Link>
                    
                    {/* Admin Section - Enhanced */}
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-100 my-2"></div>
                        <div className="px-3 py-1">
                          <div className="text-xs font-medium text-red-600 uppercase tracking-wide flex items-center">
                            🛡️ Super Admin
                          </div>
                        </div>
                        <Link 
                          to="/admin" 
                          className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z" />
                          </svg>
                          Admin Panel
                        </Link>
                        <Link 
                          to="/admin/users" 
                          className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          User Management
                        </Link>
                        <Link 
                          to="/admin/analytics" 
                          className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z" />
                          </svg>
                          System Analytics
                        </Link>
                      </>
                    )}
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // User is NOT logged in - show auth links
            <>
              <Link to="/login" className="text-gray-600 hover:text-indigo-600 mx-3">
                Login
              </Link>
              <Link to="/register" className="text-indigo-600 font-medium ml-4 px-4 py-2 bg-indigo-100 rounded hover:bg-indigo-200">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;