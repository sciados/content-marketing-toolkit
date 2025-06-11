import React, { useState, useEffect } from 'react';
import { Play, Link, Settings, Zap } from 'lucide-react';
import { PlatformDetector } from '../../../shared/components/processing/PlatformDetector';
import { CacheStatusIndicator } from '../../../shared/components/analytics/CacheStatusIndicator';
import { usePlatformDetection } from '../../../shared/hooks/usePlatformDetection';
import { useGlobalCache } from '../../../shared/hooks/useGlobalCache';

export const VideoUrlInput = ({ 
  value, 
  onChange, 
  onOptionsChange 
}) => {
  const [url, setUrl] = useState(value || '');
  const [options, setOptions] = useState({
    quality: 'standard',
    includeKeywords: false,
    speakerSeparation: false,
    exportFormat: 'text',
    cacheEnabled: true
  });

  const { 
    platformInfo, 
    validationResult, 
    // isValidating,
    detectPlatform,
    serviceRouting 
  } = usePlatformDetection();

  const {
    cacheStatus,
    checkCache,
    savings,
    globalStats
  } = useGlobalCache();

  useEffect(() => {
    if (url) {
      detectPlatform(url);
      if (options.cacheEnabled) {
        checkCache(url, options);
      }
    }
  }, [url, options, detectPlatform, checkCache]);

  useEffect(() => {
    onChange?.(url, {
      platform: platformInfo,
      validation: validationResult,
      serviceRouting,
      cacheStatus,
      savings
    });
  }, [url, platformInfo, validationResult, serviceRouting, cacheStatus, savings, onChange]);

  useEffect(() => {
    onOptionsChange?.(options);
  }, [options, onOptionsChange]);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* URL Input Section */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Link className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Video URL</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-2">
              Paste your video URL
            </label>
            <input
              id="video-url"
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-2">
              Supports YouTube, Vimeo, TikTok, Twitch, and Dailymotion
            </p>
          </div>

          {/* Platform Detection */}
          {url && (
            <PlatformDetector
              url={url}
              // eslint-disable-next-line no-unused-vars
              onDetection={(info) => {
                // Platform detection handled by useEffect above
              }}
              showCapabilities={true}
              showRouting={true}
            />
          )}

          {/* Cache Status */}
          {url && validationResult?.isValid && (
            <CacheStatusIndicator
              cacheStatus={cacheStatus}
              savings={savings}
              globalStats={globalStats}
              showAnimation={true}
              showGlobalImpact={true}
            />
          )}
        </div>
      </div>

      {/* Processing Options */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Processing Options</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quality Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transcription Quality
            </label>
            <select
              value={options.quality}
              onChange={(e) => handleOptionChange('quality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="fast">Fast (Basic accuracy)</option>
              <option value="standard">Standard (Good accuracy)</option>
              <option value="high">High (Best accuracy)</option>
              <option value="premium">Premium (Maximum accuracy + features)</option>
            </select>
            <p className="text-xs text-gray-600 mt-1">
              Higher quality takes longer but provides better results
            </p>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              value={options.exportFormat}
              onChange={(e) => handleOptionChange('exportFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="text">Plain Text</option>
              <option value="markdown">Markdown</option>
              <option value="srt">SRT Subtitles</option>
              <option value="vtt">VTT Captions</option>
              <option value="docx">Word Document</option>
            </select>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={options.includeKeywords}
                onChange={(e) => handleOptionChange('includeKeywords', e.target.checked)}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Extract Keywords</span>
            </label>
            <p className="text-xs text-gray-600 ml-7">
              Automatically identify key topics and phrases
            </p>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={options.speakerSeparation}
                onChange={(e) => handleOptionChange('speakerSeparation', e.target.checked)}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Speaker Separation</span>
            </label>
            <p className="text-xs text-gray-600 ml-7">
              Identify different speakers in the video
            </p>
          </div>

          {/* Cache Setting */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={options.cacheEnabled}
                onChange={(e) => handleOptionChange('cacheEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enable Global Cache</span>
            </label>
            <p className="text-xs text-gray-600 ml-7">
              Check for existing transcriptions to save time and cost
            </p>
          </div>
        </div>
      </div>

      {/* Service Routing Information */}
      {platformInfo && validationResult?.isValid && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Processing Service: {serviceRouting === 'railway' ? 'Railway (Optimized)' : 'Render (Standard)'}
            </span>
          </div>
          <p className="text-sm text-blue-700">
            {serviceRouting === 'railway' 
              ? 'This video will be processed using our optimized Railway service for faster results.'
              : 'This video will be processed using our reliable Render service with smart fallback.'
            }
          </p>
          <div className="mt-2 text-xs text-blue-600">
            Estimated processing time: {serviceRouting === 'railway' ? '30-90 seconds' : '60-180 seconds'}
          </div>
        </div>
      )}

      {/* Cost Estimation */}
      {validationResult?.isValid && cacheStatus !== 'hit' && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Estimated Cost</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                ${((options.quality === 'fast' ? 0.03 : 
                   options.quality === 'standard' ? 0.05 : 
                   options.quality === 'high' ? 0.08 : 0.12) * 
                   (serviceRouting === 'railway' ? 0.8 : 1.0)).toFixed(3)}
              </div>
              <div className="text-xs text-gray-600">Processing</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {options.quality === 'fast' ? '30-60s' : 
                 options.quality === 'standard' ? '45-90s' : 
                 options.quality === 'high' ? '60-120s' : '90-180s'}
              </div>
              <div className="text-xs text-gray-600">Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {options.quality === 'premium' ? '95%' : 
                 options.quality === 'high' ? '90%' : 
                 options.quality === 'standard' ? '85%' : '80%'}
              </div>
              <div className="text-xs text-gray-600">Accuracy</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUrlInput;