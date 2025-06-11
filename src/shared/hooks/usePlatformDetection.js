import { useState, useEffect, useCallback } from 'react';
import { validateVideoUrl, getPlatformProcessingInfo, SUPPORTED_PLATFORMS } from '../utils/videoUrlValidation';

export const usePlatformDetection = () => {
  const [platformInfo, setPlatformInfo] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);

  // Helper function that mimics the old detectPlatformFromUrl
  const detectPlatformFromUrl = useCallback((url) => {
    const validation = validateVideoUrl(url);
    
    if (!validation.isValid) {
      return null;
    }

    const platformInfo = getPlatformProcessingInfo(validation.platform);
    
    return {
      platform: validation.platform.toLowerCase(),
      name: validation.platform,
      supported: true,
      info: platformInfo,
      patterns: SUPPORTED_PLATFORMS.find(p => p.name === validation.platform)?.patterns || []
    };
  }, []);

  const detectPlatform = useCallback(async (url) => {
    if (!url || url.length < 10) {
      setPlatformInfo(null);
      setValidationResult(null);
      setError(null);
      return null;
    }

    setIsValidating(true);
    setError(null);

    try {
      const detected = detectPlatformFromUrl(url);
      const validation = validateVideoUrl(url);
      
      setPlatformInfo(detected);
      setValidationResult(validation);

      const result = {
        platform: detected,
        validation,
        serviceRouting: detected?.platform === 'youtube' ? 'railway' : 'render',
        isValid: validation.isValid,
        confidence: validation.isValid ? 1.0 : 0.0 // Set confidence based on validation
      };

      return result;
    } catch (err) {
      setError(err.message);
      setValidationResult({
        isValid: false,
        confidence: 0,
        issues: ['Platform detection failed: ' + err.message]
      });
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [detectPlatformFromUrl]);

  // Auto-detect with debouncing
  const [timeoutId, setTimeoutId] = useState(null);

  const debouncedDetection = useCallback((url, delay = 300) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      detectPlatform(url);
    }, delay);

    setTimeoutId(newTimeoutId);
  }, [detectPlatform, timeoutId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Helper function to get service routing info
  const getServiceInfo = useCallback((platform) => {
    if (!platform) return null;

    return {
      service: platform === 'youtube' ? 'railway' : 'render',
      description: platform === 'youtube' 
        ? 'Optimized Railway service for faster YouTube processing'
        : 'Reliable Render service with smart fallback capabilities',
      estimatedTime: platform === 'youtube' ? '30-90 seconds' : '60-180 seconds',
      features: platform === 'youtube' 
        ? ['Faster processing', 'Direct API access', 'Enhanced quality']
        : ['Universal compatibility', 'Robust fallback', 'Consistent reliability']
    };
  }, []);

  // Reset function
  const reset = useCallback(() => {
    setPlatformInfo(null);
    setValidationResult(null);
    setIsValidating(false);
    setError(null);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  return {
    // State
    platformInfo,
    validationResult,
    isValidating,
    error,
    
    // Actions
    detectPlatform,
    debouncedDetection,
    reset,
    
    // Computed properties
    isValid: validationResult?.isValid || false,
    confidence: validationResult?.isValid ? 1.0 : 0.0, // Fixed confidence calculation
    serviceRouting: platformInfo?.platform === 'youtube' ? 'railway' : 'render',
    serviceInfo: getServiceInfo(platformInfo?.platform),
    
    // Helper functions
    getServiceInfo
  };
};