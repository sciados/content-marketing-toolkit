// src/components/Video2Promo/GeneratedAssets.jsx
import React from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import { Badge } from '../Common/Badge';

export function GeneratedAssets({ 
  assets = [], 
  onExport, 
  onCopy, 
  onSave,
  loading = false 
}) {
  if (!assets || assets.length === 0) {
    return (
      <Card className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Assets Generated Yet
        </h3>
        <p className="text-gray-600">
          Generate marketing assets from your video benefits to see them here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Generated Assets ({assets.length})
        </h3>
        <Badge variant="success">Ready</Badge>
      </div>

      {assets.map((asset, index) => (
        <Card key={asset.id || index}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">{asset.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="primary" size="sm">
                  {asset.asset_type?.replace('_', ' ').toUpperCase()}
                </Badge>
                {asset.tokens_used && (
                  <Badge variant="secondary" size="sm">
                    {asset.tokens_used} tokens
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy && onCopy(asset)}
                disabled={loading}
              >
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport && onExport(asset)}
                disabled={loading}
              >
                Export
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSave && onSave(asset)}
                disabled={loading}
              >
                Save
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            {asset.asset_type === 'email_series' && asset.content?.emails && (
              <div className="space-y-4">
                {asset.content.emails.map((email, emailIndex) => (
                  <div key={emailIndex} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="font-medium text-gray-900 mb-2">
                      Email {email.sequence || emailIndex + 1}: {email.subject}
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">
                      {email.body}
                    </div>
                    {email.send_delay && (
                      <div className="text-xs text-gray-500 mt-2">
                        Send after: {email.send_delay} days
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {asset.asset_type === 'blog_post' && asset.content && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">
                  {asset.content.title}
                </h5>
                {asset.content.meta_description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {asset.content.meta_description}
                  </p>
                )}
                <div className="text-gray-700 text-sm whitespace-pre-wrap">
                  {asset.content.content}
                </div>
                {asset.content.word_count && (
                  <div className="text-xs text-gray-500 mt-2">
                    Word count: {asset.content.word_count}
                  </div>
                )}
              </div>
            )}

            {asset.asset_type === 'newsletter' && asset.content && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">
                  {asset.content.headline}
                </h5>
                <div className="text-gray-700 text-sm whitespace-pre-wrap">
                  {asset.content.body}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}