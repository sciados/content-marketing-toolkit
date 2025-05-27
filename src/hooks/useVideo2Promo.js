// src/hooks/useVideo2Promo.js - UPDATED to use unified system

import { useState, useCallback } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useUsageTracking } from './useUsageTracking';
import { transcriptService } from '../services/video2promo/transcriptService';
import { extractBenefitsFromTranscript } from '../services/common/unifiedBenefitExtractor';

export const useVideo2Promo = () => {
  const { user } = useSupabaseAuth();
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

  // Extract benefits using the unified system
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

      console.log('🎥 Extracting benefits from transcript using unified system...');

      // Use the unified benefit extractor (same as website scanner)
      const extractionResults = await extractBenefitsFromTranscript(transcript, {
        sourceUrl: state.videoUrl,
        keywords: state.keywords.join(', '),
        industry: 'general',
        userTier: user?.subscription_tier || 'free',
        productName: `Video ${state.videoUrl.split('v=')[1]?.substring(0, 8) || 'Content'}`,
        description: 'Marketing content extracted from YouTube video'
      });

      // The results are already in the exact format your ScanResultsPanel expects!
      setState(prev => ({
        ...prev,
        extractedBenefits: extractionResults.extractedBenefits,
        extractedFeatures: extractionResults.extractedFeatures,
        websiteData: extractionResults.websiteData,
        selectedBenefits: new Array(extractionResults.extractedBenefits.length).fill(false),
        currentStep: 'benefits',
        loading: false,
        processingStage: ''
      }));

      return {
        success: true,
        extractedBenefits: extractionResults.extractedBenefits,
        extractedFeatures: extractionResults.extractedFeatures,
        websiteData: extractionResults.websiteData
      };

    } catch (error) {
      console.error('❌ Benefit extraction failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        processingStage: '',
        extractedBenefits: [
          'Benefit extraction failed - please try again',
          'Video may not have clear marketing content',
          'Consider trying a different video'
        ],
        extractedFeatures: ['No features extracted'],
        websiteData: {
          name: 'Video Analysis Failed',
          description: error.message,
          source: 'transcript',
          url: state.videoUrl
        },
        selectedBenefits: [false, false, false]
      }));
      
      return {
        success: false,
        error: error.message
      };
    }
  }, [state.transcript, state.videoUrl, state.keywords, user?.subscription_tier]);

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
        processingStage: 'Transcript extracted successfully'
      }));

      // Automatically proceed to benefit extraction
      setTimeout(() => {
        extractBenefits(transcriptResult.transcript);
      }, 1000);

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
  }, [checkUsageLimit, extractBenefits]);

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