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
            <div className="bg-gray-200 rounded-lg h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
        <p className="text-gray-600 mb-6">
          Start by extracting YouTube transcripts or scanning sales pages
        </p>
        <div className="space-x-4">
          <a href="/video2promo" className="btn-primary">
            Extract Video Transcript
          </a>
          <a href="/email-generator" className="btn-secondary">
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