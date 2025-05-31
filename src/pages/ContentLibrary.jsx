// src/pages/ContentLibrary.jsx - MINIMAL TEST VERSION
import React from 'react';

export const ContentLibrary = () => {
  console.log('ContentLibrary component is rendering!');
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Content Library - Test</h1>
      <p className="text-gray-600 mt-2">
        If you see this, the basic routing works! The error was in component imports.
      </p>
      
      <div className="mt-6 p-4 bg-green-100 rounded-lg">
        <p className="text-green-800">✅ ContentLibrary component loaded successfully</p>
      </div>
    </div>
  );
};