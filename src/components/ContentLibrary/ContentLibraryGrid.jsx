// src/components/ContentLibrary/ContentLibraryGrid.jsx
import React from 'react';
import { ContentLibraryCard } from './ContentLibraryCard';

export const ContentLibraryGrid = ({
  items,
  loading,
  onToggleFavorite,
  onUseItem,
  onDeleteItem
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
        <p className="text-gray-600 mb-6">
          Start by extracting YouTube transcripts or scanning sales pages
        </p>
        <div className="space-x-4">
          <a 
            href="/tools/video2promo" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Extract Video Transcript
          </a>
          <a 
            href="/tools/email-generator" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Scan Sales Page
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <ContentLibraryCard
          key={item.id}
          item={item}
          onToggleFavorite={onToggleFavorite}
          onUseItem={onUseItem}
          onDeleteItem={onDeleteItem}
        />
      ))}
    </div>
  );
};
