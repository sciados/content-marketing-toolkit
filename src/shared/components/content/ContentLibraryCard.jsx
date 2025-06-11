// src/components/ContentLibrary/ContentLibraryCard.jsx
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export const ContentLibraryCard = ({
  item,
  onToggleFavorite,
  onUseItem,
  onDeleteItem
}) => {
  if (!item) return null;

  const getItemIcon = (type) => {
    switch (type) {
      case 'video_transcript':
        return '🎥';
      case 'scanned_page':
        return '🌐';
      case 'generated_asset':
        return '📄';
      default:
        return '📁';
    }
  };

  const getItemTypeLabel = (type) => {
    switch (type) {
      case 'video_transcript':
        return 'Video Transcript';
      case 'scanned_page':
        return 'Scanned Page';
      case 'generated_asset':
        return 'Generated Asset';
      default:
        return 'Content';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {getItemIcon(item.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {item.title || 'Untitled Content'}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge colorScheme="blue" variant="outline">
                {getItemTypeLabel(item.type)}
              </Badge>
              {item.is_favorited && (
                <Badge colorScheme="green" variant="subtle">
                  ⭐ Favorite
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onToggleFavorite?.(item.id, item.type, item.is_favorited)}
          className={`p-1 rounded transition-colors ${
            item.is_favorited 
              ? 'text-yellow-500 hover:text-yellow-600' 
              : 'text-gray-400 hover:text-yellow-500'
          }`}
          title={item.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg className="w-5 h-5" fill={item.is_favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {item.description || 'No description available'}
        </p>
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-500 mb-4 space-y-1">
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{formatDate(item.created_at)}</span>
        </div>
        {item.usage_count !== undefined && (
          <div className="flex justify-between">
            <span>Used:</span>
            <span>{item.usage_count} times</span>
          </div>
        )}
        {item.word_count && (
          <div className="flex justify-between">
            <span>Words:</span>
            <span>{item.word_count.toLocaleString()}</span>
          </div>
        )}
        {item.cost_saved && (
          <div className="flex justify-between">
            <span>Cost Saved:</span>
            <span className="text-green-600">${item.cost_saved.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onUseItem?.(item)}
          className="flex-1"
        >
          Use Content
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Copy content to clipboard
            const textToCopy = item.content || item.transcript || item.title;
            navigator.clipboard.writeText(textToCopy).then(() => {
              // You could show a toast here
              console.log('Content copied to clipboard');
            });
          }}
        >
          Copy
        </Button>
        
        {onDeleteItem && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteItem(item.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
};
