// src/components/Video2Promo/VideoUrlForm.jsx
import React, { useState } from 'react';
import { Input } from '../Common/Input';
import Button from '../Common/Button';
import { KeywordManager } from './KeywordManager';
import { UTMBuilder } from './UTMBuilder';
import { ToneSelector } from './ToneSelector';
import { Alert } from '../Common/Alert';

export function VideoUrlForm({ onSubmit, loading, disabled }) {
  const [formData, setFormData] = useState({
    youtube_url: '',
    keywords: [],
    affiliate_link: '',
    utm_params: {},
    tone: 'friendly'
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate YouTube URL
    if (!formData.youtube_url) {
      newErrors.youtube_url = 'YouTube URL is required';
    } else {
      const ytRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
      if (!ytRegex.test(formData.youtube_url)) {
        newErrors.youtube_url = 'Please enter a valid YouTube URL';
      }
    }

    // Validate affiliate link if provided
    if (formData.affiliate_link) {
      try {
        new URL(formData.affiliate_link);
      } catch {
        newErrors.affiliate_link = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('🔍 DEBUG - formData:', formData);
      console.log('🔍 DEBUG - youtube_url value:', formData.youtube_url);
      
      // Pass the correct URL property - it's youtube_url, not url/videoUrl/youtubeUrl
      const videoUrl = formData.youtube_url;
      console.log('🔍 DEBUG - extracted URL:', videoUrl);
      
      // Also pass the additional form data for backend processing
      onSubmit(videoUrl, {
        keywords: formData.keywords,
        affiliate_link: formData.affiliate_link,
        utm_params: formData.utm_params,
        tone: formData.tone
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="YouTube Video URL"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={formData.youtube_url}
          onChange={(e) => handleInputChange('youtube_url', e.target.value)}
          error={errors.youtube_url}
          required
          disabled={loading || disabled}
        />
        <p className="mt-1 text-xs text-gray-500">
          Make sure the video has captions/subtitles enabled
        </p>
      </div>

      <KeywordManager
        keywords={formData.keywords}
        onChange={(keywords) => handleInputChange('keywords', keywords)}
        disabled={loading || disabled}
      />

      <div>
        <Input
          label="Affiliate Link"
          type="url"
          placeholder="https://example.com/product"
          value={formData.affiliate_link}
          onChange={(e) => handleInputChange('affiliate_link', e.target.value)}
          error={errors.affiliate_link}
          disabled={loading || disabled}
          hint="Optional - Link to include in generated content"
        />
      </div>

      <UTMBuilder
        params={formData.utm_params}
        onChange={(utm_params) => handleInputChange('utm_params', utm_params)}
        disabled={loading || disabled}
        baseUrl={formData.affiliate_link}
      />

      <ToneSelector
        value={formData.tone}
        onChange={(tone) => handleInputChange('tone', tone)}
        disabled={loading || disabled}
      />

      {/* Service availability warning */}
      <Alert variant="info" className="mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Video Requirements
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Video must have captions/subtitles enabled</li>
                <li>English captions work best for benefit extraction</li>
                <li>Longer videos (5+ minutes) provide better results</li>
              </ul>
            </div>
          </div>
        </div>
      </Alert>

      <Button
        type="submit"
        loading={loading}
        disabled={disabled || !formData.youtube_url}
        className="w-full"
        size="lg"
      >
        {loading ? 'Analyzing Video...' : 'Analyze Video & Extract Benefits'}
      </Button>

      <div className="text-xs text-gray-500 text-center">
        This will analyze the video transcript and extract key marketing benefits
      </div>
    </form>
  );
}