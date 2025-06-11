// src/components/Layout/AdminLayout.jsx
import React, { useState } from 'react';
import { useAuth } from '../shared/hooks/useAuth';

const ADMIN_NAV_ITEMS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    path: '/admin',
    description: 'System overview and metrics'
  },
  {
    id: 'users',
    name: 'Users',
    icon: '👥',
    path: '/admin/users',
    description: 'User management and tiers'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: '📈',
    path: '/admin/analytics',
    description: 'Usage analytics and insights'
  },
  {
    id: 'system',
    name: 'System',
    icon: '⚙️',
    path: '/admin/settings',
    description: 'System configuration'
  }
];

const QUICK_STATS = [
  {
    label: 'Total Users',
    value: '1,234',
    change: '+12%',
    trend: 'up',
    icon: '👥'
  },
  {
    label: 'Active Today',
    value: '89',
    change: '+5%',
    trend: 'up',
    icon: '🔥'
  },
  {
    label: 'Revenue (MRR)',
    value: '$4,567',
    change: '+18%',
    trend: 'up',
    icon: '💰'
  },
  {
    label: 'System Health',
    value: '99.9%',
    change: '0%',
    trend: 'stable',
    icon: '💚'
  }
];

export const AdminLayout = ({ 
  children,
  currentPage = 'dashboard',
  title = 'Admin Dashboard',
  subtitle = '',
  className = ''
}) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentNavItem = ADMIN_NAV_ITEMS.find(item => item.id === currentPage);

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {ADMIN_NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.path}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                currentPage === item.id
                  ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className={`text-xs ${currentPage === item.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {item.description}
                </div>
              </div>
            </a>
          ))}
        </nav>

        {/* Quick Stats in Sidebar */}
        <div className="px-4 py-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Quick Stats
          </h3>
          <div className="space-y-3">
            {QUICK_STATS.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{stat.icon}</span>
                  <span className="text-xs text-gray-600">{stat.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{stat.value}</div>
                  <div className={`text-xs ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.email || 'Admin User'}
              </div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
            <button
              onClick={logout}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Page Title */}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a6 6 0 111 0z" />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* View Site */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Site
              </a>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {/* Breadcrumb */}
          {currentNavItem && (
            <nav className="flex mb-6" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a href="/admin" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600">
                    <span className="mr-1">🏠</span>
                    Admin
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      {currentNavItem.name}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          )}

          {/* Main Content */}
          {children}
        </main>
      </div>
    </div>
  );
};
