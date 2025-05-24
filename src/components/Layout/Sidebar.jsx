// src/components/Layout/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useSupabase from '../../hooks/useSupabase';

const Sidebar = () => {
  const { user } = useSupabase();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Base navigation items
  const baseNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Email Generator', path: '/tools/email-generator', icon: 'mail' },
    { name: 'Email Series', path: '/tools/email-series', icon: 'mail' },
    { name: 'Blog Post Creator', path: '/tools/blog-post-creator', icon: 'document', disabled: true },
    { name: 'Newsletter Creator', path: '/tools/newsletter-creator', icon: 'newspaper', disabled: true },
    { name: 'Profile', path: '/profile', icon: 'user' },
  ];

  // Add admin items if user is superuser
  const navItems = user?.id === 'e7eb009a-d165-4ab0-972f-dda205a03a85' 
    ? [...baseNavItems, 
        { name: 'Ad Management', path: '/admin/ads', icon: 'settings' },
        { name: 'User Management', path: '/admin/users', icon: 'users' }
      ]
    : baseNavItems;

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Category
          </h3>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  } ${
                    item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`
                }
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                  } else {
                    setIsMobileMenuOpen(false);
                  }
                }}
              >
                <IconComponent name={item.icon} className="mr-3 flex-shrink-0 h-5 w-5" />
                {item.name}
                {item.disabled && (
                  <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                    Soon
                  </span>
                )}
                {(item.path === '/admin/ads' || item.path === '/admin/users') && (
                  <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Admin
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Resources Section */}
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Resources
            </h3>
            <nav className="space-y-1">
              <a href="#" className="text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                <svg className="mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentation
              </a>
              <a href="#" className="text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                <svg className="mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Support
              </a>
            </nav>
          </div>

          {/* Upgrade Card */}
          <div className="mt-8 mx-2 p-4 bg-gradient-to-br from-brand-500 to-accent-600 rounded-lg text-white">
            <h4 className="font-semibold mb-2">Upgrade to Pro</h4>
            <p className="text-sm opacity-90 mb-3">Unlock all features and get unlimited access to our tools.</p>
            <button className="w-full bg-white text-brand-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
              Upgrade Now
            </button>
          </div>
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

// Icon component
const IconComponent = ({ name, className }) => {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {name === 'home' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
      {name === 'mail' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
      {name === 'document' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
      {name === 'newspaper' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />}
      {name === 'user' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
      {name === 'settings' && (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      )}
      {name === 'users' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
    </svg>
  );
};

export default Sidebar;