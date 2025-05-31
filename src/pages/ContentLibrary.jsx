// src/pages/ContentLibrary.jsx
import React from 'react';
import { ContentLibraryGrid } from '../components/ContentLibrary/ContentLibraryGrid';
import { ContentLibraryFilters } from '../components/ContentLibrary/ContentLibraryFilters';
import { ContentLibrarySearch } from '../components/ContentLibrary/ContentLibrarySearch';
import { useContentLibrary } from '../hooks/useContentLibrary';

export const ContentLibrary = () => {
  const {
    items,
    loading,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    toggleFavorite,
    useContentItem,
    deleteItem
  } = useContentLibrary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
        <p className="text-gray-600 mt-2">
          Your collection of extracted transcripts, scanned pages, and reusable content
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <ContentLibrarySearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search transcripts, pages, benefits..."
        />
        
        <ContentLibraryFilters
          filters={filters}
          onChange={setFilters}
        />
      </div>

      {/* Content Grid */}
      <ContentLibraryGrid
        items={items}
        loading={loading}
        onToggleFavorite={toggleFavorite}
        onUseItem={useContentItem}
        onDeleteItem={deleteItem}
      />
    </div>
  );
};