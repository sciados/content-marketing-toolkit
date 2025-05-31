// src/components/Video2Promo/GeneratedAssets.jsx
import React from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import { Badge } from '../Common/Badge';

export function GeneratedAssets({ assets, project, onDownload, onCopy }) {
  if (!assets || assets.length === 0) {
    return null;
  }

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      if (onCopy) onCopy('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      if (onCopy) onCopy('Failed to copy content');
    }
  };

  const formatAssetType = (type) => {
    const typeMap = {
      'email_series': 'Email Series',
      'blog_post': 'Blog Post', 
      'newsletter': 'Newsletter'
    };
    return typeMap[type] || type;
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'email_series':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'blog_post':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'newsletter':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Generated Marketing Assets
        </h2>
        <Badge variant="success" size="sm">
          {assets.length} {assets.length === 1 ? 'Asset' : 'Assets'} Generated
        </Badge>
      </div>

      <div className="space-y-4">
        {assets.map((asset, index) => (
          <Card key={asset.id || index} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg text-blue-600">
                  {getAssetIcon(asset.asset_type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {asset.title || `${formatAssetType(asset.asset_type)} for ${asset.benefit_title}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" size="sm">
                      {formatAssetType(asset.asset_type)}
                    </Badge>
                    {asset.tokens_used && (
                      <Badge variant="secondary" size="sm">
                        {asset.tokens_used} tokens
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(asset.content)}
                >
                  Copy
                </Button>
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

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Generated Content:
              </div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {asset.content}
              </div>
            </div>

            {asset.created_at && (
              <div className="mt-4 text-xs text-gray-500">
                Generated on {new Date(asset.created_at).toLocaleString()}
              </div>
            )}
          </Card>
        ))}
      </div>

      {project && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">
            Assets generated for: <strong>{project.video_title}</strong>
          </p>
        </div>
      )}
    </div>
  );
}