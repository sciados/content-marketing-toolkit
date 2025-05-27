// src/hooks/useVideo2Promo.js - FIXED VERSION

import { useState, useCallback } from 'react';
import useSupabase from './useSupabase';
import { useUsageTracking } from './useUsageTracking';
import { transcriptService } from '../services/video2promo/transcriptService';
import { nlpService } from '../services/video2promo/nlpService'; // USE YOUR EXISTING NLP SERVICE

export const useVideo2Promo = () => {
  const { user } = useSupabase();
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

  // Extract benefits using your existing nlpService with bridge function
  const extractBenefits = useCallback(async (transcriptData = null) => {
    try {
      const transcript = transcriptData || state.transcript;
      
      if (!transcript || transcript.length === 0) {
        throw new Error('No transcript data available for benefit extraction');
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: 'Analyzing transcript for benefits...'
      }));

      // 🔍 DEBUG: Log the transcript data
      console.log('🔍 DEBUG - Raw transcript data:', transcript);
      console.log('🔍 DEBUG - Transcript type:', typeof transcript);
      console.log('🔍 DEBUG - Is array:', Array.isArray(transcript));
      console.log('🔍 DEBUG - Length:', transcript?.length);
      
      if (Array.isArray(transcript) && transcript.length > 0) {
        console.log('🔍 DEBUG - First segment:', transcript[0]);
        console.log('🔍 DEBUG - Sample text:', transcript.slice(0, 3).map(t => t.text || t));
      }

      console.log('🎥 Extracting benefits from transcript using nlpService bridge...');

      // 🔍 DEBUG: Log the extraction call
      console.log('🔍 DEBUG - Calling nlpService.convertTranscriptToEmailFormat with:', {
        transcriptLength: transcript.length,
        videoId: state.videoUrl.split('v=')[1]?.substring(0, 8),
        userTier: user?.subscription_tier || 'free'
      });

      // Use your existing nlpService with the bridge function
      const extractionResults = await nlpService.convertTranscriptToEmailFormat(
        transcript, 
        {
          title: `Video ${state.videoUrl.split('v=')[1]?.substring(0, 8) || 'Content'}`,
          url: state.videoUrl,
          channelName: 'YouTube Video',
          description: 'Marketing content extracted from YouTube video'
        },
        {
          keywords: state.keywords.join(', '),
          industry: 'general',
          userTier: user?.subscription_tier || 'free',
          user: user
        }
      );

      // 🔍 DEBUG: Log the extraction results
      console.log('🔍 DEBUG - Extraction results:', extractionResults);
      console.log('🔍 DEBUG - Success:', extractionResults.success);
      console.log('🔍 DEBUG - Benefits found:', extractionResults.benefits?.length);
      console.log('🔍 DEBUG - Features found:', extractionResults.features?.length);
      console.log('🔍 DEBUG - Website data:', extractionResults.websiteData);

      if (!extractionResults.success) {
        throw new Error(`Benefit extraction failed: ${extractionResults.error}`);
      }

      // Update state with the extracted data
      setState(prev => ({
        ...prev,
        extractedBenefits: extractionResults.benefits || [],
        extractedFeatures: extractionResults.features || [],
        websiteData: extractionResults.websiteData,
        selectedBenefits: new Array(extractionResults.benefits?.length || 0).fill(true), // All selected by default
        currentStep: 'benefits',
        loading: false,
        processingStage: ''
      }));

      return {
        success: true,
        extractedBenefits: extractionResults.benefits || [],
        extractedFeatures: extractionResults.features || [],
        websiteData: extractionResults.websiteData
      };

    } catch (error) {
      console.error('❌ Benefit extraction failed:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        processingStage: '',
        // Set fallback benefits so user can see what went wrong
        extractedBenefits: [
          {
            id: 'error_1',
            title: 'Benefit Extraction Failed',
            description: `Error: ${error.message}. Please try again or check if the video contains clear product benefits.`,
            category: 'error',
            strength: 'low',
            source: 'error'
          }
        ],
        selectedBenefits: [false]
      }));
      
      return {
        success: false,
        error: error.message,
        extractedBenefits: [],
        extractedFeatures: [],
        websiteData: null
      };
    }
  }, [state.transcript, state.videoUrl, state.keywords, user]);

  // Process video URL and extract transcript
  const processVideo = useCallback(async (videoUrl) => {
    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: 'Validating video URL...',
        videoUrl
      }));

      if (!videoUrl || !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
        throw new Error('Please provide a valid YouTube URL');
      }

      const canProceed = await checkUsageLimit('video2promo_projects');
      if (!canProceed.allowed) {
        throw new Error(`Usage limit reached: ${canProceed.message}`);
      }

      setState(prev => ({
        ...prev,
        processingStage: 'Extracting video transcript...'
      }));

      const transcriptResult = await transcriptService.getTranscript(videoUrl);
      
      if (!transcriptResult.success) {
        throw new Error('Failed to extract transcript: ' + (transcriptResult.error || 'Unknown error'));
      }

      console.log('✅ Transcript extracted successfully:', transcriptResult);

      setState(prev => ({
        ...prev,
        transcript: transcriptResult.transcript,
        currentStep: 'transcript',
        processingStage: 'Transcript extracted successfully',
        loading: false
      }));

      return {
        success: true,
        transcript: transcriptResult.transcript
      };

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
  }, [checkUsageLimit]);

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

  // Generate marketing assets (placeholder for now)
  const generateAssets = useCallback(async (assetTypes = ['email_series']) => {
    try {
      const selectedCount = state.selectedBenefits.filter(Boolean).length;
      if (selectedCount === 0) {
        throw new Error('Please select at least one benefit to generate emails');
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: `Generating ${assetTypes.join(', ')}...`,
        currentStep: 'generation'
      }));

      // Create assets based on requested types
      const assets = {};
      
      for (const assetType of assetTypes) {
        if (assetType === 'email_series') {
          assets.email_series = {
            emails: state.extractedBenefits
              .filter((benefit, index) => state.selectedBenefits[index])
              .map((benefit, index) => ({
                subject: `Discover: ${benefit}`,
                body: `Here's how this amazing benefit can transform your results: ${benefit}`,
                benefit: benefit,
                number: index + 1
              }))
          };
        } else if (assetType === 'blog_post') {
          assets.blog_post = {
            title: `Amazing Benefits You Need to Know`,
            content: state.extractedBenefits
              .filter((benefit, index) => state.selectedBenefits[index])
              .map(benefit => `• ${benefit}`)
              .join('\n')
          };
        } else if (assetType === 'social_media') {
          assets.social_media = {
            posts: state.extractedBenefits
              .filter((benefit, index) => state.selectedBenefits[index])
              .map(benefit => `🔥 ${benefit} #marketing #success`)
          };
        }
      }

      await updateUsage('video2promo_projects', 1);

      setState(prev => ({
        ...prev,
        generatedAssets: assets,
        currentStep: 'complete',
        loading: false,
        processingStage: ''
      }));

      return {
        success: true,
        assets
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
  }, [state.selectedBenefits, state.extractedBenefits, updateUsage]);

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
    extractBenefits,
    toggleBenefit, // NEW: Same as email generator
    updateKeywords,  
    updateUTMParams,
    generateAssets,
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
      userTier: user?.subscription_tier || 'free'
    }
  };
};

export default useVideo2Promo;