// src/pages/ContentLibrary.jsx - DEFAULT EXPORT TEST
import React from 'react';

const ContentLibrary = () => {
  console.log('ContentLibrary with default export rendering...');
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Default Export Test</h1>
      <p>This uses export default instead of export const</p>
    </div>
  );
};

export default ContentLibrary;