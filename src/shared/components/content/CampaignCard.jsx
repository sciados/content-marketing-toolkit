// src/components/ContentLibrary/CampaignCard.jsx - Individual Campaign Card
import React from 'react';

/**
 * Individual campaign card showing campaign info and content counts
 */
const CampaignCard = ({ campaign, onClick, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIndustryIcon = (industry) => {
    switch (industry) {
      case 'technology':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'healthcare':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'finance':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'education':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
    }
  };

  const totalContent = (campaign.email_series_count || 0) + 
                     (campaign.social_content_count || 0) + 
                     (campaign.blog_content_count || 0) + 
                     (campaign.video_assets_count || 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Campaign Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: campaign.color || '#4f46e5' }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {campaign.name}
              </h3>
              {campaign.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {campaign.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Status Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </span>
        </div>

        {/* Campaign Metadata */}
        <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center">
            {getIndustryIcon(campaign.industry)}
            <span className="ml-1 capitalize">{campaign.industry || 'General'}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(campaign.created_at)}</span>
          </div>
        </div>

        {/* Tags */}
        {campaign.tags && campaign.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {campaign.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
            {campaign.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                +{campaign.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content Summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Content Pieces</div>
            <div className="font-medium text-gray-900">{totalContent}</div>
          </div>
          <div>
            <div className="text-gray-500">Input Sources</div>
            <div className="font-medium text-gray-900">{campaign.total_input_sources || 0}</div>
          </div>
        </div>

        {/* Content Type Breakdown */}
        {totalContent > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {campaign.email_series_count > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                📧 {campaign.email_series_count} Email{campaign.email_series_count !== 1 ? ' Series' : ' Series'}
              </span>
            )}
            {campaign.social_content_count > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700">
                📱 {campaign.social_content_count} Social
              </span>
            )}
            {campaign.blog_content_count > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                📝 {campaign.blog_content_count} Blog
              </span>
            )}
            {campaign.video_assets_count > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700">
                🎥 {campaign.video_assets_count} Video
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 flex justify-between items-center">
        <button
          onClick={onClick}
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          View Details →
        </button>

        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${campaign.name}"? This cannot be undone.`)) {
                onDelete();
              }
            }}
            className="text-red-600 hover:text-red-900 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;