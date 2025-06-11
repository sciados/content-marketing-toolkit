// src/components/Layout/Sidebar.jsx - FIXED: Added error handling for data dependencies
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import { 
  isSuperAdmin, 
  getTierDisplayName, 
  getTierColor,
  // formatUsagePercentage 
} from '../shared/utils/tierUtils';
import { useUsageTracking } from '../shared/hooks/useUsageTracking';

const Sidebar = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // FIXED: Add error handling for usage tracking
  let usage = null;
  let limits = null;
  
  try {
    const usageData = useUsageTracking();
    usage = usageData?.usage;
    limits = usageData?.limits;
  } catch (error) {
    console.warn('Usage tracking hook error:', error);
    // Fallback to safe defaults
    usage = { videos_today: 0, monthly_tokens_used: 0 };
    limits = { monthly_tokens: 10000 };
  }

  // Use tierUtils instead of hardcoded ID check with safe fallbacks
  const isAdmin = user ? isSuperAdmin(user?.subscription_tier) : false;
  const tierDisplay = user ? getTierDisplayName(user?.subscription_tier) : 'Free';
  const tierColor = user ? getTierColor(user?.subscription_tier) : 'gray';

  // FIXED: Campaign navigation items - pointing to working routes
  const campaignItems = [
    { 
      name: 'Campaign Manager', 
      path: '/content-library', 
      icon: 'library', 
      description: 'Organize content by campaigns',
      isNew: true,
      feature: 'New campaign-based organization'
    },
    { 
      name: 'All Campaigns', 
      path: '/campaigns', 
      icon: 'folder', 
      description: 'View all campaign projects',
      feature: 'Track campaign performance'
    },
  ];

  // Enhanced navigation items with Content Library and better organization
  const coreToolsItems = [
    { name: 'Video2Promo', path: '/tools/video2promo', icon: 'video', description: 'YouTube to campaigns' },
    { name: 'Email Generator', path: '/tools/email-generator', icon: 'mail', description: 'AI sales emails' },
    { name: 'Email Series', path: '/tools/email-series', icon: 'collection', description: 'Manage campaigns' },
  ];

  // FIXED: Content Library route updated to use new campaign system
  const contentItems = [
    { name: 'Analytics', path: '/analytics', icon: 'chart', description: 'Usage & performance' },
  ];

  const comingSoonItems = [
    { name: 'AI Writing Assistant', path: '/tools/ai-writer', icon: 'document', disabled: true, description: 'Blog posts & articles' },
    { name: 'Competitor Analysis', path: '/tools/competitor-analysis', icon: 'search', disabled: true, description: 'Market research' },
    { name: 'SEO Generator', path: '/tools/seo-generator', icon: 'trending', disabled: true, description: 'Keyword optimization' },
    { name: 'Social Scheduler', path: '/tools/social-scheduler', icon: 'calendar', disabled: true, description: 'Multi-platform posting' },
  ];

  const accountItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'home', description: 'Overview & stats' },
    { name: 'Profile', path: '/profile', icon: 'user', description: 'Account settings' },
    { name: 'Subscription', path: '/subscription', icon: 'creditCard', description: 'Billing & plans' },
  ];

  // SuperAdmin items using tierUtils with safe fallback
  const adminItems = isAdmin 
    ? [
        { name: 'Admin Panel', path: '/admin', icon: 'shield', description: 'Super Admin Dashboard', isAdmin: true },
        { name: 'User Management', path: '/admin/users', icon: 'users', description: 'Manage users', isAdmin: true },
        { name: 'System Analytics', path: '/admin/analytics', icon: 'settings', description: 'Platform stats', isAdmin: true },
      ]
    : [];

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavSection = ({ title, items, variant = 'default' }) => (
    <div className="mb-6">
      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 ${
        variant === 'admin' ? 'text-red-400' : 
        variant === 'campaign' ? 'text-blue-400' :
        'text-gray-400'
      }`}>
        {variant === 'admin' && '🛡️ '}
        {variant === 'campaign' && '🚀 '}
        {title}
      </h3>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `${
                isActive 
                  ? variant === 'admin' 
                    ? 'bg-red-50 text-red-600 border-r-2 border-red-600' 
                    : variant === 'campaign'
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'bg-brand-50 text-brand-600 border-r-2 border-brand-600'
                  : variant === 'admin'
                  ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                  : variant === 'campaign'
                  ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              } ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : ''
              } group flex items-start px-3 py-2 text-sm font-medium rounded-l-md transition-colors`
            }
            onClick={(e) => {
              if (item.disabled) {
                e.preventDefault();
              } else {
                setIsMobileMenuOpen(false);
              }
            }}
          >
            <div className="flex items-center flex-1">
              <IconComponent name={item.icon} className="mr-3 flex-shrink-0 h-5 w-5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="truncate">{item.name}</span>
                  {item.isNew && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      New
                    </span>
                  )}
                  {item.disabled && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                      Soon
                    </span>
                  )}
                  {item.isAdmin && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                      ADMIN
                    </span>
                  )}
                </div>
                {item.description && (
                  <div className={`text-xs mt-0.5 truncate ${
                    variant === 'admin' ? 'text-red-500' : 
                    variant === 'campaign' ? 'text-blue-500' :
                    'text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile menu button - only visible on small screens */}
      <button 
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-indigo-600 text-white p-3 rounded-full shadow-lg" 
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative top-16 lg:top-0 left-0 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        h-[calc(100vh-4rem)] lg:h-auto lg:min-h-[calc(100vh-4rem)]
        overflow-y-auto lg:overflow-visible
      `}>
        <div className="p-4">
          {/* SuperAdmin Banner */}
          {isAdmin && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700 mb-2">
                <span className="text-lg mr-2">🛡️</span>
                <span className="font-bold text-sm">SUPER ADMIN</span>
              </div>
              <p className="text-xs text-red-600">
                You have unlimited access and administrative privileges.
              </p>
            </div>
          )}

          {/* FIXED: Campaign Section - Updated navigation */}
          <NavSection title="Content Campaigns" items={campaignItems} variant="campaign" />

          {/* Core Tools Section */}
          <NavSection title="Core Tools" items={coreToolsItems} />

          {/* Content & Analytics Section */}
          <NavSection title="Analytics" items={contentItems} />

          {/* Account Section */}
          <NavSection title="Account" items={accountItems} />

          {/* Admin Section (if applicable) - Enhanced */}
          {adminItems.length > 0 && (
            <NavSection title="Super Administration" items={adminItems} variant="admin" />
          )}

          {/* Coming Soon Section */}
          <NavSection title="Coming Soon" items={comingSoonItems} />

          {/* Resources Section */}
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Resources
            </h3>
            <nav className="space-y-1">
              <a 
                href="https://docs.example.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              >
                <svg className="mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentation
              </a>
              <a 
                href="mailto:support@example.com"
                className="text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              >
                <svg className="mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Support
              </a>
            </nav>
          </div>

          {/* FIXED: Campaign Hub Feature Card - Updated to point to working Campaign Manager */}
          <div className="mt-8 mx-2 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">🚀</span>
              <h4 className="font-bold">Campaign Manager</h4>
              <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                New
              </span>
            </div>
            <p className="text-sm opacity-90 mb-3">
              Organize your content by marketing campaigns for better project management.
            </p>
            <div className="text-xs opacity-75 mb-3 space-y-1">
              <div>✓ Campaign-based organization</div>
              <div>✓ Source tracking & attribution</div>
              <div>✓ Content performance analytics</div>
              <div>✓ Project management workflow</div>
            </div>
            <NavLink 
              to="/content-library"
              className="block w-full bg-white text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Open Campaign Manager
            </NavLink>
          </div>

          {/* Enhanced Upgrade Card or Admin Status Card */}
          {isAdmin ? (
            <div className="mt-4 mx-2 p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg text-white">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">🛡️</span>
                <h4 className="font-bold">Super Admin</h4>
              </div>
              <p className="text-sm opacity-90 mb-3">
                Platform administration with unlimited access to all features.
              </p>
              <div className="text-xs opacity-75 mb-3 space-y-1">
                <div>✓ Unlimited tokens & usage</div>
                <div>✓ User management access</div>
                <div>✓ System analytics</div>
                <div>✓ All premium features</div>
              </div>
              <NavLink 
                to="/admin"
                className="block w-full bg-white text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Panel
              </NavLink>
            </div>
          ) : (
            <div className="mt-4 mx-2 p-4 bg-gradient-to-br from-brand-500 to-accent-600 rounded-lg text-white">
              <div className="flex items-center mb-2">
                <h4 className="font-semibold">Upgrade to Pro</h4>
                <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                  Popular
                </span>
              </div>
              <p className="text-sm opacity-90 mb-3">
                Unlock advanced features, A/B variants, and unlimited content library.
              </p>
              <div className="text-xs opacity-75 mb-3 space-y-1">
                <div>✓ 100K tokens/month</div>
                <div>✓ A/B variant generation</div>
                <div>✓ Advanced analytics</div>
                <div>✓ Priority support</div>
              </div>
              <NavLink 
                to="/subscription"
                className="block w-full bg-white text-brand-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Upgrade Now
              </NavLink>
            </div>
          )}

          {/* FIXED: Enhanced Quick Stats Card with error handling */}
          {user && (
            <div className="mt-4 mx-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm">Quick Stats</h4>
                <div className={`
                  inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${tierColor === 'red' 
                    ? 'bg-red-100 text-red-800' 
                    : tierColor === 'yellow'
                    ? 'bg-yellow-100 text-yellow-800'
                    : tierColor === 'purple'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                  }
                `}>
                  {tierDisplay}
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Videos Processed:</span>
                  <span className="font-medium">{usage?.videos_today || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Tokens:</span>
                  <span className="font-medium">
                    {isAdmin 
                      ? 'Unlimited' 
                      : `${usage?.monthly_tokens_used || 0}/${limits?.monthly_tokens || 10000}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Campaigns:</span>
                  <span className="font-medium text-blue-600">Campaign Manager</span>
                </div>
              </div>
              {isAdmin && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs text-red-600 font-bold">
                    🛡️ Admin: Unlimited Access
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </aside>
    </>
  );
};

// Enhanced Icon component with campaign icons
const IconComponent = ({ name, className }) => {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {name === 'home' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
      {name === 'mail' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
      {name === 'video' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />}
      {name === 'collection' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2h10a2 2 0 012 2v2M7 19h10a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />}
      {name === 'library' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />}
      {name === 'chart' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z" />}
      {name === 'document' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
      {name === 'search' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />}
      {name === 'trending' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />}
      {name === 'calendar' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
      {name === 'user' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
      {name === 'creditCard' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />}
      {name === 'settings' && (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      )}
      {name === 'users' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
      {name === 'shield' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
      {/* Campaign icons */}
      {name === 'folder' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />}
    </svg>
  );
};

export default Sidebar;