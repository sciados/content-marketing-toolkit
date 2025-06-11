// src/components/ContentLibrary/ContentLibraryFilters.jsx
import React from 'react';
import Badge from '../ui/Badge';

export const ContentLibraryFilters = ({ 
  filters, 
  onChange,
  className = "" 
}) => {
  const contentTypes = [
    { id: 'all', label: 'All Content', icon: '📁' },
    { id: 'video_transcript', label: 'Video Transcripts', icon: '🎥' },
    { id: 'scanned_page', label: 'Scanned Pages', icon: '🌐' },
    { id: 'generated_asset', label: 'Generated Assets', icon: '📄' }
  ];

  const sortOptions = [
    { id: 'created_desc', label: 'Newest First' },
    { id: 'created_asc', label: 'Oldest First' },
    { id: 'usage_desc', label: 'Most Used' },
    { id: 'usage_asc', label: 'Least Used' },
    { id: 'name_asc', label: 'A to Z' },
    { id: 'name_desc', label: 'Z to A' }
  ];

  const updateFilter = (key, value) => {
    onChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Content Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Type
        </label>
        <div className="flex flex-wrap gap-2">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => updateFilter('type', type.id)}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.type === type.id
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Favorites Filter */}
        <div className="flex items-center">
          <input
            id="favorites-filter"
            type="checkbox"
            checked={filters.favorited || false}
            onChange={(e) => updateFilter('favorited', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="favorites-filter" className="ml-2 text-sm text-gray-700">
            ⭐ Favorites Only
          </label>
        </div>

        {/* Sort By */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            value={filters.sortBy || 'created_desc'}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Filter (if you implement tags) */}
        {filters.tags && filters.tags.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Tags:</span>
            <div className="flex flex-wrap gap-1">
              {filters.tags.map((tag, index) => (
                <Badge
                  key={index}
                  colorScheme="gray"
                  variant="subtle"
                  className="cursor-pointer"
                  onClick={() => {
                    const newTags = filters.tags.filter((_, i) => i !== index);
                    updateFilter('tags', newTags);
                  }}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {(filters.type !== 'all' || filters.favorited || filters.tags?.length > 0) && (
          <button
            onClick={() => onChange({ type: 'all', favorited: false, tags: [], sortBy: 'created_desc' })}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {(filters.type !== 'all' || filters.favorited) && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Active filters:</span>
          {filters.type !== 'all' && (
            <Badge colorScheme="blue" variant="outline">
              {contentTypes.find(t => t.id === filters.type)?.label}
            </Badge>
          )}
          {filters.favorited && (
            <Badge colorScheme="green" variant="outline">
              Favorites
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
