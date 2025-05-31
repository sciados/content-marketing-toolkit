// src/pages/ContentLibrary.jsx - TEST 1: Hook only
import React from 'react';
import { useContentLibrary } from '../hooks/useContentLibrary';

export const ContentLibrary = () => {
  console.log('Testing useContentLibrary...');
  const libraryData = useContentLibrary();
  console.log('Hook data:', libraryData);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Content Library - Hook Test</h1>
      <p>Items: {libraryData.items?.length || 0}</p>
    </div>
  );
};