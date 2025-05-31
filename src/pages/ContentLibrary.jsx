// src/pages/ContentLibrary.jsx - IMPORT ONLY TEST
import React from 'react';

console.log('About to import useContentLibrary...');

// Test the import without using the hook
import { useContentLibrary } from '../hooks/useContentLibrary';

console.log('Import successful, hook type:', typeof useContentLibrary);

export const ContentLibrary = () => {
  console.log('Component rendering, hook available:', typeof useContentLibrary);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Import Test</h1>
      <p>Hook imported successfully: {typeof useContentLibrary === 'function' ? 'Yes' : 'No'}</p>
      <p>Hook type: {typeof useContentLibrary}</p>
    </div>
  );
};