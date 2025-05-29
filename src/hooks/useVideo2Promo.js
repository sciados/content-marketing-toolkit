// src/hooks/useVideo2Promo.js - UPDATED FOR PYTHON BACKEND

import { useState, useCallback } from 'react';
import useSupabase from './useSupabase';
import { useUsageTracking } from './useUsageTracking';

// Enhanced API_BASE with fallback and debugging
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://aiworkers.onrender.com';

// Debug environment variables on load
console.log('🔍 Environment Debug:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_BASE: API_BASE,
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD
});

export const useVideo2Promo = () => {
  const { user, session } = useSupabase();
  const { checkUsageLimit, updateUsage } = useUsageTracking();
  
  const [state, setState] = useState({
    currentStep: 'input',
    videoUrl: '',
    transcript: null,
    // These match your email generator format exactly
    extractedBenefits: [],
    selectedBenefits: [],
    extractedFeatures: [],
    websiteData: null,
    // Video2Promo specific
    keywords: [],
    utmParams: {},
    generatedAssets: {},
    loading: false,
    error: null,
    processingStage: ''
  });

  // Enhanced extractTranscript function with detailed debugging
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
        processingStage: 'Extracting video transcript...'
      }));

      console.log('🎥 === TRANSCRIPT EXTRACTION DEBUG ===');
      console.log('🔍 Input videoUrl:', videoUrl);
      console.log('🔍 videoUrl type:', typeof videoUrl);
      console.log('🔍 videoUrl length:', videoUrl?.length);
      console.log('🔍 Method:', method);
      console.log('🔍 API_BASE (current):', API_BASE);
      console.log('🔍 VITE_API_BASE_URL (direct):', import.meta.env.VITE_API_BASE_URL);
      console.log('🔍 All env vars:', import.meta.env);
      console.log('🔍 Session token exists:', !!session?.access_token);
      console.log('🔍 Session token preview:', session?.access_token?.substring(0, 20) + '...');
      
      // Validate API_BASE
      if (!API_BASE || API_BASE === 'undefined') {
        throw new Error('Backend API URL not configured. Please check VITE_API_BASE_URL environment variable.');
      }
      
      // Clean and validate the URL
      const cleanUrl = videoUrl.trim();
      console.log('🔍 Cleaned URL:', cleanUrl);
      
      // Create request body
      const requestBody = {
        videoUrl: cleanUrl,
        method: method
      };
      
      console.log('🔍 Request body:', JSON.stringify(requestBody, null, 2));
      
      // Create headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      };
      
      console.log('🔍 Request headers:', {
        'Content-Type': headers['Content-Type'],
        'Authorization': `Bearer ${session.access_token.substring(0, 20)}...`
      });
      
      // Make the API call
      const apiUrl = `${API_BASE}/api/video2promo/extract-transcript`;
      console.log('🔍 Full API URL:', apiUrl);
      
      console.log('📤 Making API request...');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      console.log('📥 API Response received:');
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

      // Get response text first
      const responseText = await response.text();
      console.log('🔍 Raw response text:', responseText);
      
      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('🔍 Parsed response data:', responseData);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        console.error('❌ Response was:', responseText);
        throw new Error(`Invalid response format: ${responseText}`);
      }

      if (!response.ok) {
        console.error('❌ Backend error response:', responseData);
        
        // Handle specific authentication errors
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your subscription tier.');
        } else {
          throw new Error(responseData.error || `Backend error: ${response.status} - ${responseText}`);
        }
      }

      console.log('✅ Transcript extraction successful:', responseData);
      
      setState(prev => ({
        ...prev,
        transcript: responseData.transcript,
        currentStep: 'transcript',
        processingStage: 'Transcript extracted successfully',
        loading: false
      }));

      return {
        success: true,
        transcript: responseData.transcript,
        extractionMethod: responseData.extractionMethod,
        wordCount: responseData.wordCount
      };
    } catch (error) {
      console.error('❌ === TRANSCRIPT EXTRACTION ERROR ===');
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ === END DEBUG ===');
      
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

  // Analyze transcript using Python backend
  const analyzeTranscript = useCallback(async (transcript, keywords = [], tone = 'professional') => {
    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: 'Analyzing transcript for benefits...'
      }));

      console.log('🔍 Analyzing transcript with Python backend...');
      
      // Validate API_BASE before making request
      if (!API_BASE || API_BASE === 'undefined') {
        throw new Error('Backend API URL not configured for analysis');
      }
      
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
      console.log('✅ Analysis completed:', data);
      
      // Transform backend response to match your frontend format
      const benefits = data.analysis.key_benefits || [];
      const features = data.analysis.features || [];
      
      setState(prev => ({
        ...prev,
        extractedBenefits: benefits,
        extractedFeatures: features,
        selectedBenefits: new Array(benefits.length).fill(true), // All selected by default
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
        processingStage: '',
        // Set fallback benefits so user can see what went wrong
        extractedBenefits: [
          `Analysis failed: ${error.message}`,
          'Please try again with a different video',
          'Ensure the video has clear audio and content'
        ],
        selectedBenefits: [false, false, false]
      }));
      
      return {
        success: false,
        error: error.message
      };
    }
  }, [session]);

  // Extract benefits (bridge function for compatibility)
  const extractBenefits = useCallback(async (transcriptData = null) => {
    const transcript = transcriptData || state.transcript;
    
    if (!transcript || transcript.length === 0) {
      throw new Error('No transcript data available for benefit extraction');
    }

    return await analyzeTranscript(transcript, state.keywords, 'professional');
  }, [state.transcript, state.keywords, analyzeTranscript]);

  // Generate assets using Python backend
  const generateAssets = useCallback(async (assetTypes = ['email_series'], tone = 'professional') => {
    try {
      const selectedCount = state.selectedBenefits.filter(Boolean).length;
      if (selectedCount === 0) {
        throw new Error('Please select at least one benefit to generate content');
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: `Generating ${assetTypes.join(', ')}...`,
        currentStep: 'generation'
      }));

      // Validate API_BASE before making request
      if (!API_BASE || API_BASE === 'undefined') {
        throw new Error('Backend API URL not configured for asset generation');
      }

      // Create analysis object from current state
      const analysis = {
        key_benefits: state.extractedBenefits.filter((_, index) => state.selectedBenefits[index]),
        features: state.extractedFeatures,
        main_value_proposition: state.websiteData?.description || 'Video content marketing',
        target_audience: state.websiteData?.targetAudience || 'General audience'
      };

      console.log('🚀 Generating assets with Python backend...');
      
      const response = await fetch(`${API_BASE}/api/video2promo/generate-assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ 
          analysis, 
          assetTypes, 
          tone, 
          utmParams: state.utmParams 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate assets');
      }

      const data = await response.json();
      console.log('✅ Assets generated successfully:', data);

      await updateUsage('video2promo_projects', 1);

      setState(prev => ({
        ...prev,
        generatedAssets: data.assets,
        currentStep: 'complete',
        loading: false,
        processingStage: ''
      }));

      return {
        success: true,
        assets: data.assets
      };
    } catch (error) {
      console.error('❌ Asset generation failed:', error);
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
  }, [state.selectedBenefits, state.extractedBenefits, state.extractedFeatures, state.websiteData, state.utmParams, session, updateUsage]);

  // Process video URL (updated to use backend) - FIXED VERSION with better error handling
  const processVideo = useCallback(async (videoUrl, additionalData = {}) => {
    try {
      console.log('🎥 processVideo called with:', { videoUrl, additionalData });
      
      // Add this validation - make sure videoUrl is a string
      if (!videoUrl || typeof videoUrl !== 'string') {
        console.error('❌ Invalid videoUrl:', videoUrl);
        throw new Error('Please provide a valid YouTube URL');
      }

      // Validate URL format
      if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
        console.error('❌ Invalid YouTube URL format:', videoUrl);
        throw new Error('Please provide a valid YouTube URL');
      }

      // Validate API_BASE
      if (!API_BASE || API_BASE === 'undefined') {
        throw new Error('Backend API URL not configured. Please check environment variables.');
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: 'Checking usage limits...',
        videoUrl: videoUrl.trim(), // Store cleaned URL
        // Store additional form data
        keywords: additionalData.keywords || [],
        utmParams: additionalData.utm_params || {}
      }));

      // Check usage limits with better error handling
      console.log('🔍 Checking usage limit for video2promo_projects...');
      const canProceed = await checkUsageLimit('video2promo_projects');
      console.log('🔍 Usage limit check result:', canProceed);
      
      if (!canProceed || typeof canProceed !== 'object') {
        console.error('❌ Invalid usage limit response:', canProceed);
        throw new Error('Unable to verify usage limits. Please try again.');
      }
      
      if (!canProceed.allowed) {
        const message = canProceed.message || 
          `Video2Promo limit reached. Current: ${canProceed.current_usage || 0}, Limit: ${canProceed.limit_value || 0}`;
        console.error('❌ Usage limit exceeded:', message);
        throw new Error(message);
      }

      console.log('✅ Usage check passed, proceeding with transcript extraction...');

      setState(prev => ({
        ...prev,
        processingStage: 'Extracting video transcript...'
      }));

      // Extract transcript using backend
      const transcriptResult = await extractTranscript(videoUrl.trim());
      
      if (!transcriptResult.success) {
        throw new Error('Failed to extract transcript: ' + transcriptResult.error);
      }

      console.log('✅ Video processing completed successfully');
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
  }, [checkUsageLimit, extractTranscript]);

  // Process complete video workflow
  const processCompleteVideo = useCallback(async (videoUrl, keywords = [], tone = 'professional', assetTypes = ['email_series']) => {
    try {
      // Update keywords in state
      setState(prev => ({ ...prev, keywords }));
      
      // Step 1: Extract transcript
      const transcriptResult = await processVideo(videoUrl);
      if (!transcriptResult.success) {
        throw new Error(transcriptResult.error);
      }
      
      // Step 2: Analyze transcript
      const analysisResult = await analyzeTranscript(transcriptResult.transcript, keywords, tone);
      if (!analysisResult.success) {
        throw new Error(analysisResult.error);
      }
      
      // Step 3: Generate assets
      const assetsResult = await generateAssets(assetTypes, tone);
      if (!assetsResult.success) {
        throw new Error(assetsResult.error);
      }
      
      return {
        success: true,
        transcript: transcriptResult.transcript,
        analysis: analysisResult.analysis,
        assets: assetsResult.assets
      };
    } catch (error) {
      console.error('❌ Complete video processing failed:', error);
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
  }, [processVideo, analyzeTranscript, generateAssets]);

  // Toggle benefit selection (same as email generator)
  const toggleBenefit = useCallback((index) => {
    setState(prev => ({
      ...prev,
      selectedBenefits: prev.selectedBenefits.map((selected, i) => 
        i === index ? !selected : selected
      )
    }));
  }, []);

  // Update keywords
  const updateKeywords = useCallback((keywords) => {
    setState(prev => ({
      ...prev,
      keywords: Array.isArray(keywords) ? keywords : [keywords]
    }));
  }, []);

  // Update UTM parameters
  const updateUTMParams = useCallback((utmParams) => {
    setState(prev => ({
      ...prev,
      utmParams
    }));
  }, []);

  // Reset to start over
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
      processingStage: ''
    });
  }, []);

  return {
    // State (matches your email generator format)
    ...state,
    
    // Actions
    processVideo,
    extractTranscript,        // NEW: Direct transcript extraction
    analyzeTranscript,        // NEW: Direct transcript analysis
    extractBenefits,          // UPDATED: Bridge function for compatibility
    toggleBenefit,            // Same as email generator
    updateKeywords,  
    updateUTMParams,
    generateAssets,           // UPDATED: Uses backend
    processCompleteVideo,     // NEW: Complete workflow
    reset,
    
    // Computed values
    canProceedToNextStep: !state.loading && !state.error,
    hasTranscript: state.transcript && state.transcript.length > 0,
    hasBenefits: state.extractedBenefits && state.extractedBenefits.length > 0,
    isProcessing: state.loading,
    
    // Debug info
    debug: {
      transcriptLength: state.transcript?.length || 0,
      benefitsCount: state.extractedBenefits?.length || 0,
      selectedCount: state.selectedBenefits?.filter(Boolean).length || 0,
      processingStage: state.processingStage,
      userTier: user?.subscription_tier || 'free',
      backendUrl: API_BASE
    }
  };
};

export default useVideo2Promo;