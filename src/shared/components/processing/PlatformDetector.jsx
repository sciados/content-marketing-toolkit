import React, { useState, useEffect } from 'react';
import { Monitor, CheckCircle, AlertCircle, Globe, Zap } from 'lucide-react';
import { validateVideoUrl, getPlatformProcessingInfo, SUPPORTED_PLATFORMS } from '../../../shared/utils/videoUrlValidation';

export const PlatformDetector = ({ 
  url, 
  onDetection, 
  // onChange, 
  showCapabilities = true,
  showRouting = true 
}) => {
  const [platformInfo, setPlatformInfo] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Helper function to detect platform from URL using your existing validation
  const detectPlatformFromUrl = (url) => {
    const validation = validateVideoUrl(url);
    
    if (!validation.isValid) {
      return null;
    }

    const platformProcessingInfo = getPlatformProcessingInfo(validation.platform);
    const supportedPlatform = SUPPORTED_PLATFORMS.find(p => p.name === validation.platform);
    
    return {
      platform: validation.platform.toLowerCase(),
      name: validation.platform,
      supported: true,
      processingInfo: platformProcessingInfo,
      patterns: supportedPlatform?.patterns || [],
      features: [
        'High-quality transcription',
        'Multi-language support', 
        'Fast processing',
        'Accurate timestamps'
      ],
      limitations: validation.platform === 'TikTok' ? 
        ['Short video optimized', 'May have background music'] :
        validation.platform === 'Twitch' ?
        ['VOD processing only', 'Gaming audio challenges'] :
        []
    };
  };

  // Create PLATFORM_REGISTRY from your existing data
  const PLATFORM_REGISTRY = SUPPORTED_PLATFORMS.reduce((acc, platform) => {
    const platformKey = platform.name.toLowerCase();
    const processingInfo = getPlatformProcessingInfo(platform.name);
    
    acc[platformKey] = {
      name: platform.name,
      patterns: platform.patterns,
      examples: platform.examples,
      processingInfo,
      features: [
        'High-quality transcription',
        'Multi-language support', 
        'Fast processing',
        'Accurate timestamps'
      ],
      limitations: platform.name === 'TikTok' ? 
        ['Short video optimized', 'May have background music'] :
        platform.name === 'Twitch' ?
        ['VOD processing only', 'Gaming audio challenges'] :
        []
    };
    
    return acc;
  }, {});

  useEffect(() => {
    if (!url || url.length < 10) {
      setPlatformInfo(null);
      setValidationResult(null);
      onDetection?.(null);
      return;
    }

    setIsValidating(true);
    
    // Debounced platform detection
    const timeoutId = setTimeout(async () => {
      try {
        const detected = detectPlatformFromUrl(url);
        const validation = validateVideoUrl(url);
        
        setPlatformInfo(detected);
        setValidationResult({
          ...validation,
          confidence: validation.isValid ? 1.0 : 0.0,
          issues: validation.isValid ? [] : [validation.error]
        });
        
        onDetection?.({
          platform: detected,
          validation: {
            ...validation,
            confidence: validation.isValid ? 1.0 : 0.0
          },
          serviceRouting: detected?.platform === 'youtube' ? 'railway' : 'render'
        });
      } catch (error) {
        console.error('Platform detection error:', error);
        setValidationResult({
          isValid: false,
          confidence: 0,
          issues: ['Platform detection failed']
        });
      } finally {
        setIsValidating(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [url, onDetection]);

  if (!url) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
        <div className="text-center">
          <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Paste Video URL
          </h3>
          <p className="text-gray-600">
            Supports {SUPPORTED_PLATFORMS.map(p => p.name).join(', ')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real-time Detection Status */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center space-x-3">
          {isValidating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm text-gray-600">Detecting platform...</span>
            </>
          ) : validationResult?.isValid ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800 font-medium">
                {platformInfo?.platform ? `${platformInfo.platform.toUpperCase()} detected` : 'Valid URL'}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-800">
                {validationResult?.issues?.[0] || 'Invalid URL format'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Platform Information */}
      {platformInfo && validationResult?.isValid && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {platformInfo.platform.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                {platformInfo.platform.charAt(0).toUpperCase() + platformInfo.platform.slice(1)}
              </h4>
              <p className="text-sm text-gray-600">
                Confidence: {Math.round((validationResult.confidence || 1.0) * 100)}%
              </p>
            </div>
          </div>

          {/* Service Routing Information */}
          {showRouting && (
            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Processing Service: {platformInfo.platform === 'youtube' ? 'Railway (Optimized)' : 'Render (Standard)'}
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                {platformInfo.platform === 'youtube' 
                  ? 'YouTube videos use our optimized Railway service for faster processing'
                  : 'Other platforms use our reliable Render service with smart fallback'
                }
              </p>
            </div>
          )}

          {/* Platform Capabilities */}
          {showCapabilities && platformInfo.platform && PLATFORM_REGISTRY[platformInfo.platform] && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900">Platform Capabilities:</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {PLATFORM_REGISTRY[platformInfo.platform].features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              {PLATFORM_REGISTRY[platformInfo.platform].limitations?.length > 0 && (
                <div className="mt-2">
                  <h6 className="text-xs font-medium text-gray-700 mb-1">Limitations:</h6>
                  <div className="space-y-1">
                    {PLATFORM_REGISTRY[platformInfo.platform].limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        <span className="text-xs text-gray-600">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Validation Issues */}
      {validationResult && !validationResult.isValid && validationResult.issues && (
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <h5 className="text-sm font-medium text-red-800 mb-2">Issues detected:</h5>
          <ul className="space-y-1">
            {validationResult.issues.map((issue, index) => (
              <li key={index} className="text-sm text-red-700 flex items-center space-x-2">
                <AlertCircle className="h-3 w-3" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlatformDetector;