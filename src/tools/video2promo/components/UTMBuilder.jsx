// src/components/Video2Promo/UTMBuilder.jsx
import React from 'react';
import { Input } from '../ui/Input';

export const UTMBuilder = ({ 
  params = {}, 
  onChange, 
  disabled = false,
  baseUrl = '' 
}) => {
  const handleParamChange = (key, value) => {
    const updated = { ...params, [key]: value };
    onChange(updated);
  };

  const buildTrackingUrl = () => {
    if (!baseUrl) return '';
    
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim()) {
        urlParams.append(key, value.trim());
      }
    });
    
    return urlParams.toString() ? `${baseUrl}?${urlParams.toString()}` : baseUrl;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="form-label">UTM Parameters</label>
        <span className="text-sm text-neutral-500">Optional - For tracking</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Source"
          placeholder="email, social, newsletter"
          value={params.utm_source || ''}
          onChange={(e) => handleParamChange('utm_source', e.target.value)}
          disabled={disabled}
          hint="Where traffic comes from"
        />
        
        <Input
          label="Medium"
          placeholder="drip, campaign, promotion"
          value={params.utm_medium || ''}
          onChange={(e) => handleParamChange('utm_medium', e.target.value)}
          disabled={disabled}
          hint="Marketing medium type"
        />
        
        <Input
          label="Campaign"
          placeholder="video_promo_jan2025"
          value={params.utm_campaign || ''}
          onChange={(e) => handleParamChange('utm_campaign', e.target.value)}
          disabled={disabled}
          hint="Specific campaign name"
        />
        
        <Input
          label="Content"
          placeholder="email1, blog_post, newsletter"
          value={params.utm_content || ''}
          onChange={(e) => handleParamChange('utm_content', e.target.value)}
          disabled={disabled}
          hint="Content variation"
        />
      </div>

      {baseUrl && (
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <label className="text-sm font-medium text-neutral-700 block mb-1">
            Preview Tracking URL:
          </label>
          <div className="text-sm text-neutral-600 break-all font-mono">
            {buildTrackingUrl()}
          </div>
        </div>
      )}
    </div>
  );
};
