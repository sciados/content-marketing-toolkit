// src/layouts/AdminLayout.jsx - React Router Layout Component
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

const AdminLayout = () => {
  const { user } = useAuth();

  // Check if user has admin access
  const hasAdminAccess = user?.subscription_tier === 'superAdmin' || user?.subscription_tier === 'admin';

  // If no admin access, redirect or show error
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Super Admin or Admin access required to view this area.
          </p>
          <p className="text-sm text-gray-500">
            Current tier: {user?.subscription_tier || 'unknown'}
          </p>
          <div className="mt-6">
            <a 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // For admin users, render the admin content
  return (
    <div className="min-h-screen bg-gray-50">
      {/* This is the key: Outlet renders the nested route components */}
      <Outlet />
    </div>
  );
};

export default AdminLayout;