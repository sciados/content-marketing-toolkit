// src/components/Layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  
  // Determine if sidebar is present (when user is logged in)
  const hasSidebar = !!user;
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4 relative z-10 mt-auto">
      <div className={`container mx-auto px-4 ${hasSidebar ? 'ml-64' : ''}`}>
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-2 sm:mb-0">
            &copy; {currentYear} AI Email Generator | <a href="https://anthropic.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">Powered by Claude AI</a>
          </p>
          <div className="flex space-x-4">
            <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</Link>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</Link>
            <Link to="/contact" className="text-sm text-gray-500 hover:text-gray-700">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
