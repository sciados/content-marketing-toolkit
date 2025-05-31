// src/pages/ContentLibrary.jsx - NO HOOK IMPORT TEST
import React from 'react';

console.log('ContentLibrary component loading without hook import...');

export const ContentLibrary = () => {
  console.log('Component rendering without any hook');
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900">No Hook Test</h1>
      <p>This component loads without importing the hook.</p>
      <p>If you see this, the issue is in useContentLibrary.js</p>
    </div>
  );
};