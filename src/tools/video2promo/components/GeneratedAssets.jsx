// src/components/Video2Promo/GeneratedAssets.jsx - UPDATED for Backend Integration
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function GeneratedAssets({ 
  assets, 
  project, 
  onDownload, 
  onCopy, 
  onUseAsset,
  showToast 
}) {
  const [expandedAssets, setExpandedAssets] = useState(new Set());

  if (!assets || assets.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Generated Yet</h3>
        <p className="text-gray-600">Generate marketing assets to see them here.</p>
      </Card>
    );
  }

  const handleCopy = async (asset) => {
    try {
      let contentToCopy = '';
      
      // Format content based on asset type
      if (asset.type === 'email_series' && Array.isArray(asset.content)) {
        contentToCopy = asset.content.map((email, index) => 
          `Email ${index + 1}: ${email.title || email.subject}\n\n${email.content || email.body}`
        ).join('\n\n---\n\n');
      } else if (asset.type === 'blog_post' && asset.content?.title && asset.content?.body) {
        contentToCopy = `${asset.content.title}\n\n${asset.content.body}`;
      } else if (asset.type === 'newsletter' && asset.content?.headline && asset.content?.body) {
        contentToCopy = `${asset.content.headline}\n\n${asset.content.body}`;
      } else if (typeof asset.content === 'string') {
        contentToCopy = asset.content;
      } else {
        contentToCopy = JSON.stringify(asset.content, null, 2);
      }

      await navigator.clipboard.writeText(contentToCopy);
      
      if (showToast) {
        showToast('Content copied to clipboard!', 'success');
      } else if (onCopy) {
        onCopy('Content copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      const errorMsg = 'Failed to copy content';
      if (showToast) {
        showToast(errorMsg, 'error');
      } else if (onCopy) {
        onCopy(errorMsg);
      }
    }
  };

  const toggleExpanded = (assetId) => {
    const newExpanded = new Set(expandedAssets);
    if (newExpanded.has(assetId)) {
      newExpanded.delete(assetId);
    } else {
      newExpanded.add(assetId);
    }
    setExpandedAssets(newExpanded);
  };

  const formatAssetType = (type) => {
    const typeMap = {
      'email_series': 'Email Series',
      'blog_post': 'Blog Post', 
      'newsletter': 'Newsletter',
      'social_post': 'Social Media Post',
      'ad_copy': 'Ad Copy'
    };
    return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'email_series':
        return '📧';
      case 'blog_post':
        return '📝';
      case 'newsletter':
        return '📰';
      case 'social_post':
        return '📱';
      case 'ad_copy':
        return '📢';
      default:
        return '📄';
    }
  };

  const getAssetPreview = (asset) => {
    if (asset.type === 'email_series' && Array.isArray(asset.content)) {
      return {
        preview: `${asset.content.length} emails in series`,
        details: asset.content.map(email => email.title || email.subject || 'Untitled Email').join(', ')
      };
    } else if (asset.type === 'blog_post' && asset.content?.title) {
      return {
        preview: asset.content.title,
        details: `${asset.content.word_count || 'Unknown'} words • ${asset.content.estimated_read_time || 'Unknown read time'}`
      };
    } else if (asset.type === 'newsletter' && asset.content?.headline) {
      return {
        preview: asset.content.headline,
        details: `${asset.content.word_count || 'Unknown'} words`
      };
    } else if (typeof asset.content === 'string') {
      return {
        preview: asset.content.substring(0, 100) + (asset.content.length > 100 ? '...' : ''),
        details: `${asset.content.split(' ').length} words`
      };
    }
    
    return {
      preview: 'Generated content available',
      details: 'Click to expand and view'
    };
  };

  const renderAssetContent = (asset) => {
    const isExpanded = expandedAssets.has(asset.id);
    
    if (asset.type === 'email_series' && Array.isArray(asset.content)) {
      return (
        <div className="space-y-4">
          {asset.content.map((email, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-gray-900 mb-2">
                Email {index + 1}: {email.title || email.subject || `Email ${index + 1}`}
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {isExpanded ? (email.content || email.body) : 
                 `${(email.content || email.body || '').substring(0, 150)}...`}
              </div>
            </div>
          ))}
        </div>
      );
    } else if (asset.type === 'blog_post' && asset.content?.title && asset.content?.body) {
      return (
        <div>
          <div className="font-medium text-gray-900 mb-2">{asset.content.title}</div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {isExpanded ? asset.content.body : `${asset.content.body.substring(0, 200)}...`}
          </div>
        </div>
      );
    } else if (asset.type === 'newsletter' && asset.content?.headline && asset.content?.body) {
      return (
        <div>
          <div className="font-medium text-gray-900 mb-2">{asset.content.headline}</div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {isExpanded ? asset.content.body : `${asset.content.body.substring(0, 200)}...`}
          </div>
        </div>
      );
    } else if (typeof asset.content === 'string') {
      return (
        <div className="text-sm text-gray-700 whitespace-pre-wrap">
          {isExpanded ? asset.content : `${asset.content.substring(0, 200)}...`}
        </div>
      );
    }
    
    return (
      <div className="text-sm text-gray-500 italic">
        Content format not recognized. Raw data available for copy/download.
      </div>
    );
  };

  // Group assets by type for better organization
  const assetsByType = assets.reduce((acc, asset) => {
    const type = asset.type || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {});

  const totalTokens = assets.reduce((sum, asset) => sum + (asset.tokens_used || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Generated Marketing Assets
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">
            {assets.length} {assets.length === 1 ? 'Asset' : 'Assets'}
          </Badge>
          {totalTokens > 0 && (
            <Badge variant="secondary" size="sm">
              {totalTokens.toLocaleString()} tokens used
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(assetsByType).map(([type, typeAssets]) => (
          <div key={type} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getAssetIcon(type)}</span>
              <span className="font-medium text-gray-900">{formatAssetType(type)}</span>
            </div>
            <div className="text-sm text-gray-600">
              {typeAssets.length} generated • {typeAssets.reduce((sum, asset) => sum + (asset.tokens_used || 0), 0)} tokens
            </div>
          </div>
        ))}
      </div>

      {/* Assets List */}
      <div className="space-y-4">
        {assets.map((asset, index) => {
          const preview = getAssetPreview(asset);
          const isExpanded = expandedAssets.has(asset.id);
          
          return (
            <Card key={asset.id || index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0 text-2xl">
                    {getAssetIcon(asset.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {preview.preview}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" size="sm">
                        {formatAssetType(asset.type)}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        {asset.benefit}
                      </Badge>
                      {asset.tokens_used && (
                        <Badge variant="neutral" size="sm">
                          {asset.tokens_used} tokens
                        </Badge>
                      )}
                      {asset.variant && (
                        <Badge variant="purple" size="sm">
                          A/B Variant
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {preview.details}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpanded(asset.id)}
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(asset)}
                  >
                    Copy
                  </Button>
                  {onUseAsset && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onUseAsset(asset)}
                    >
                      Use
                    </Button>
                  )}
                  {onDownload && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(asset)}
                    >
                      Download
                    </Button>
                  )}
                </div>
              </div>

              {/* Content Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                  <span>Generated Content:</span>
                  {asset.model_used && (
                    <span className="text-xs text-gray-500">
                      Generated with {asset.model_used}
                    </span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {renderAssetContent(asset)}
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <div>
                  {asset.created_at && (
                    <span>Generated on {new Date(asset.created_at).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {asset.tokens_used && (
                    <span>{asset.tokens_used} tokens used</span>
                  )}
                  {asset.variant && asset.original_id && (
                    <span>Variant of original asset</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Project Info */}
      {project && (
        <div className="text-center py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Assets generated for: <strong>{project.videoData?.title || project.video_title || 'YouTube Video'}</strong>
          </p>
          {project.videoUrl && (
            <p className="text-xs text-gray-500 mt-1">
              Source: {project.videoUrl}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
