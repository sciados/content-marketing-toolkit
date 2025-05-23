// src/components/Layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useSupabase from '../../hooks/useSupabase';

const Header = () => {
  const { user, logout } = useSupabase();
  
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

  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-indigo-600 font-bold text-xl">
          Content Marketing Toolkit
        </Link>
        
        <div className="flex items-center">
          {user ? (
            // User is logged in - show authenticated menu
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 mx-3">
                Dashboard
              </Link>
              <Link to="/tools/email-generator" className="text-gray-600 hover:text-indigo-600 mx-3">
                Email Generator
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-indigo-600 mx-3">
                My Profile
              </Link>
              <Link to="/subscription" className="text-gray-600 hover:text-indigo-600 mx-3">
                Subscription
              </Link>
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                Sign Out
              </button>
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