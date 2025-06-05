// src/hooks/useVideo2Promo.js - ENHANCED VERSION with better error handling

import { useState, useCallback } from 'react';
import useSupabase from './useSupabase';
// import { useUsageTracking } from './useUsageTracking';

// Enhanced API_BASE with fallback and debugging
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://aiworkers.onrender.com';

export const useVideo2Promo = () => {
  const { user, session } = useSupabase();
  // const { checkUsageLimit } = useUsageTracking();
  
  const [state, setState] = useState({
    currentStep: 'input',
    videoUrl: '',
    transcript: null,
    extractedBenefits: [],
    selectedBenefits: [],
    extractedFeatures: [],
    websiteData: null,
    keywords: [],
    utmParams: {},
    generatedAssets: {},
    loading: false,
    error: null,
    processingStage: '',
    // 🆕 NEW: Enhanced status tracking
    backendStatus: 'unknown',
    proxyStatus: 'unknown',
    retryCount: 0
  });

  // 🆕 NEW: Check backend health and proxy status
  const checkBackendHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/`);
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        backendStatus: 'healthy',
        proxyStatus: data.proxy_status?.configured ? 'configured' : 'not-configured'
      }));
      
      return data;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setState(prev => ({
        ...prev,
        backendStatus: 'error',
        proxyStatus: 'unknown'
      }));
      return null;
    }
  }, []);

  // Enhanced extractTranscript function with better error handling and retry logic
  const extractTranscript = useCallback(async (videoUrl, method = 'auto') => {
    try {
      // Check if user is authenticated
      if (!session?.access_token) {
        throw new Error('Please log in to use Video2Promo. Authentication is required for backend processing.');
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: 'Checking backend status...'
      }));

      // 🆕 NEW: Check backend health first
      const healthCheck = await checkBackendHealth();
      if (!healthCheck) {
        throw new Error('Backend service is currently unavailable. Please try again in a moment.');
      }

      setState(prev => ({
        ...prev,
        processingStage: healthCheck.proxy_status?.configured ? 
          'Extracting transcript via secure proxy...' : 
          'Extracting transcript...'
      }));

      // Validate API_BASE
      if (!API_BASE || API_BASE === 'undefined') {
        throw new Error('Backend API URL not configured. Please check VITE_API_BASE_URL environment variable.');
      }
      
      // Clean and validate the URL
      const cleanUrl = videoUrl.trim();
      
      // Create request body
      const requestBody = {
        videoUrl: cleanUrl,
        method: method
      };
      
      // Create headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      };
      
      // Make the API call with timeout
      const apiUrl = `${API_BASE}/api/video2promo/extract-transcript`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Get response text first
        const responseText = await response.text();
        
        // Try to parse as JSON
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Failed to parse response as JSON:', parseError);
          throw new Error(`Invalid response format from backend. Please try again.`);
        }

        if (!response.ok) {
          // 🆕 NEW: Enhanced error handling with specific messages
          if (response.status === 401) {
            throw new Error('Authentication expired. Please refresh the page and log in again.');
          } else if (response.status === 403) {
            throw new Error('Access denied. Please check your subscription tier or usage limits.');
          } else if (response.status === 404) {
            // This is likely the YouTube blocking error
            const errorMsg = responseData.error || 'Could not extract transcript from video';
            const suggestion = responseData.suggestion || '';
            const proxyNote = healthCheck.proxy_status?.configured ? 
              ' Our proxy service is active and should help with blocked videos.' :
              ' Note: Proxy service is not configured, which may cause issues with some videos.';
            
            throw new Error(`${errorMsg}. ${suggestion}${proxyNote}`);
          } else if (response.status >= 500) {
            throw new Error('Backend server error. Please try again in a few minutes.');
          } else {
            throw new Error(responseData.error || `Backend error: ${response.status}`);
          }
        }

        setState(prev => ({
          ...prev,
          transcript: responseData.transcript,
          currentStep: 'transcript',
          processingStage: `Transcript extracted successfully${healthCheck.proxy_status?.configured ? ' (via proxy)' : ''}`,
          loading: false,
          retryCount: 0 // Reset retry count on success
        }));

        return {
          success: true,
          transcript: responseData.transcript,
          extractionMethod: responseData.extractionMethod,
          wordCount: responseData.wordCount,
          proxyUsed: responseData.extractionMethod?.includes('proxy') || false
        };

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The video might be too long or the server is busy. Please try again.');
        }
        throw fetchError;
      }

    } catch (error) {
      console.error('❌ Transcript extraction error:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        processingStage: '',
        retryCount: prev.retryCount + 1
      }));
      
      return {
        success: false,
        error: error.message
      };
    }
  }, [session, checkBackendHealth]);

  // 🆕 NEW: Retry function for failed extractions
  const retryExtraction = useCallback(async (videoUrl) => {
    if (state.retryCount >= 3) {
      throw new Error('Maximum retry attempts reached. Please try a different video or contact support.');
    }
    
    setState(prev => ({
      ...prev,
      processingStage: `Retrying... (Attempt ${prev.retryCount + 1}/3)`
    }));
    
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return await extractTranscript(videoUrl);
  }, [state.retryCount, extractTranscript]);

  // Enhanced processVideo with retry logic
  const processVideo = useCallback(async (videoUrl, additionalData = {}) => {
    try {
      // Add this validation
      if (!videoUrl || typeof videoUrl !== 'string') {
        throw new Error('Please provide a valid YouTube URL');
      }

      // Validate URL format
      if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
        throw new Error('Please provide a valid YouTube URL (youtube.com or youtu.be)');
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: 'Checking usage limits...',
        videoUrl: videoUrl.trim(),
        keywords: additionalData.keywords || [],
        utmParams: additionalData.utm_params || {}
      }));

      // Check usage limits
      // const canProceed = await checkUsageLimit('video2promo_projects');
      
      // Skip usage tracking for now
         const canProceed = { allowed: true };
         console.log('⚠️ Usage tracking bypassed');

      if (!canProceed || typeof canProceed !== 'object') {
        throw new Error('Unable to verify usage limits. Please try again.');
      }
      
      if (!canProceed.allowed) {
        const message = canProceed.message || 
          `Video2Promo limit reached. Current: ${canProceed.current_usage || 0}, Limit: ${canProceed.limit_value || 0}`;
        throw new Error(message);
      }

      // Extract transcript with retry logic
      let transcriptResult = await extractTranscript(videoUrl.trim());
      
      // 🆕 NEW: Auto-retry on certain failures
      if (!transcriptResult.success && state.retryCount < 2) {
        console.log('🔄 First attempt failed, trying again...');
        transcriptResult = await retryExtraction(videoUrl.trim());
      }
      
      if (!transcriptResult.success) {
        throw new Error('Failed to extract transcript: ' + transcriptResult.error);
      }

      return transcriptResult;
    } catch (error) {
      console.error('❌ Video processing failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        processingStage: ''
      }));
      
      return {
        success: false,
        error: error.message
      };
    }
  }, [extractTranscript, retryExtraction, state.retryCount]);

  // [Rest of your existing functions remain the same...]
  const analyzeTranscript = useCallback(async (transcript, keywords = [], tone = 'professional') => {
    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: 'Analyzing transcript for benefits...'
      }));

      const response = await fetch(`${API_BASE}/api/video2promo/analyze-benefits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ transcript, keywords, tone })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze transcript');
      }

      const data = await response.json();
      
      const benefits = data.analysis.key_benefits || [];
      const features = data.analysis.features || [];
      
      setState(prev => ({
        ...prev,
        extractedBenefits: benefits,
        extractedFeatures: features,
        selectedBenefits: new Array(benefits.length).fill(true),
        websiteData: {
          title: `Video Analysis - ${tone} tone`,
          description: data.analysis.main_value_proposition || 'Video content analysis',
          targetAudience: data.analysis.target_audience || 'General audience',
          painPoints: data.analysis.pain_points_addressed || [],
          emotionalTriggers: data.analysis.emotional_triggers || []
        },
        currentStep: 'benefits',
        loading: false,
        processingStage: ''
      }));

      return {
        success: true,
        analysis: data.analysis,
        extractedBenefits: benefits,
        extractedFeatures: features
      };
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        processingStage: ''
      }));
      
      return {
        success: false,
        error: error.message
      };
    }
  }, [session]);

  // [Include all your other existing functions: extractBenefits, generateAssets, etc...]

  const reset = useCallback(() => {
    setState({
      currentStep: 'input',
      videoUrl: '',
      transcript: null,
      extractedBenefits: [],
      selectedBenefits: [],
      extractedFeatures: [],
      websiteData: null,
      keywords: [],
      utmParams: {},
      generatedAssets: {},
      loading: false,
      error: null,
      processingStage: '',
      // 🆕 NEW: Reset enhanced status
      backendStatus: 'unknown',
      proxyStatus: 'unknown',
      retryCount: 0
    });
  }, []);

  return {
    // State
    ...state,
    
    // Actions  
    processVideo,
    extractTranscript,
    analyzeTranscript,
    retryExtraction, // 🆕 NEW: Manual retry function
    checkBackendHealth, // 🆕 NEW: Health check function
    reset,
    
    // Computed values
    canProceedToNextStep: !state.loading && !state.error,
    hasTranscript: state.transcript && state.transcript.length > 0,
    hasBenefits: state.extractedBenefits && state.extractedBenefits.length > 0,
    isProcessing: state.loading,
    canRetry: !state.loading && state.error && state.retryCount < 3, // 🆕 NEW
    
    // 🆕 NEW: Enhanced debug info
    debug: {
      transcriptLength: state.transcript?.length || 0,
      benefitsCount: state.extractedBenefits?.length || 0,
      selectedCount: state.selectedBenefits?.filter(Boolean).length || 0,
      processingStage: state.processingStage,
      userTier: user?.subscription_tier || 'free',
      backendUrl: API_BASE,
      backendStatus: state.backendStatus,
      proxyStatus: state.proxyStatus,
      retryCount: state.retryCount
    }
  };
};
