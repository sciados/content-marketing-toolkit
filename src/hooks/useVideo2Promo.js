// src/hooks/useVideo2Promo.js - FIXED IMPORT

import { useState, useCallback } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
// mport { useProfile } from './useProfile';
import { useUsageTracking } from './useUsageTracking';
import { transcriptService } from '../services/video2promo/transcriptService';
import { nlpService } from '../services/video2promo/nlpService';
import { assetGenerationService } from '../services/video2promo/assetGenerationService';
// import { supabase } from '../services/supabase/supabaseClient';

export const useVideo2Promo = () => {
  const { user } = useSupabaseAuth();
  const { checkUsageLimit, updateUsage } = useUsageTracking();
  
  const [state, setState] = useState({
    currentStep: 'input', // input, processing, transcript, benefits, generation, complete
    videoUrl: '',
    transcript: null,
    benefits: [],
    keywords: [],
    utmParams: {},
    generatedAssets: {},
    loading: false,
    error: null,
    processingStage: ''
  });

  // Step 2: Extract benefits from transcript
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

      console.log('Starting benefit extraction with transcript:', transcript.length, 'segments');

      // Extract benefits using NLP service
      const benefitsResult = await nlpService.extractBenefits(transcript, {
        userTier: user?.subscription_tier || 'free',
        industry: 'general',
        audience: 'potential customers'
      });

      console.log('Benefits extraction result:', benefitsResult);

      if (!benefitsResult.success) {
        throw new Error('Failed to extract benefits: ' + (benefitsResult.error || 'Unknown error'));
      }

      if (!benefitsResult.benefits || benefitsResult.benefits.length === 0) {
        throw new Error('No benefits found in video content. Please try with a different video that discusses specific features or advantages.');
      }

      setState(prev => ({
        ...prev,
        benefits: benefitsResult.benefits,
        currentStep: 'benefits',
        loading: false,
        processingStage: ''
      }));

      return {
        success: true,
        benefits: benefitsResult.benefits
      };

    } catch (error) {
      console.error('Benefit extraction failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        processingStage: '',
        // Show fallback benefits with error message
        benefits: [{
          id: 'error_1',
          title: 'Benefit Extraction Failed',
          description: `Error: ${error.message}. Please try again or use a video with clearer content about specific benefits or features.`,
          category: 'error',
          strength: 'low',
          source: 'error'
        }]
      }));
      
      return {
        success: false,
        error: error.message
      };
    }
  }, [state.transcript, user?.subscription_tier]);

  // Step 1: Process video URL and extract transcript
  const processVideo = useCallback(async (videoUrl) => {
    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: 'Validating video URL...',
        videoUrl
      }));

      // Validate URL
      if (!videoUrl || !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
        throw new Error('Please provide a valid YouTube URL');
      }

      // Check usage limits
      const canProceed = await checkUsageLimit('video2promo_projects');
      if (!canProceed.allowed) {
        throw new Error(`Usage limit reached: ${canProceed.message}`);
      }

      setState(prev => ({
        ...prev,
        processingStage: 'Extracting video transcript...'
      }));

      // Extract transcript
      const transcriptResult = await transcriptService.getTranscript(videoUrl);
      
      if (!transcriptResult.success) {
        throw new Error('Failed to extract transcript: ' + (transcriptResult.error || 'Unknown error'));
      }

      console.log('Transcript extracted successfully:', transcriptResult);

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
      console.error('Video processing failed:', error);
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

  // Step 3: Update keywords and UTM parameters
  const updateKeywords = useCallback((keywords) => {
    setState(prev => ({
      ...prev,
      keywords
    }));
  }, []);

  const updateUTMParams = useCallback((utmParams) => {
    setState(prev => ({
      ...prev,
      utmParams
    }));
  }, []);

  // Step 4: Generate marketing assets
  const generateAssets = useCallback(async (assetTypes = ['email_series']) => {
    try {
      if (!state.benefits || state.benefits.length === 0) {
        throw new Error('No benefits available for asset generation');
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        processingStage: 'Generating marketing assets...',
        currentStep: 'generation'
      }));

      // Check token usage for generation
      const estimatedTokens = assetTypes.length * 1500; // Estimate tokens per asset
      const canGenerate = await checkUsageLimit('tokens', estimatedTokens);
      if (!canGenerate.allowed) {
        throw new Error(`Insufficient tokens: ${canGenerate.message}`);
      }

      const generationData = {
        benefits: state.benefits,
        keywords: state.keywords,
        utmParams: state.utmParams,
        videoUrl: state.videoUrl,
        transcript: state.transcript
      };

      const assets = {};

      for (const assetType of assetTypes) {
        setState(prev => ({
          ...prev,
          processingStage: `Generating ${assetType.replace('_', ' ')}...`
        }));

        const result = await assetGenerationService.generateAsset(
          assetType,
          generationData,
          {
            userTier: user?.subscription_tier || 'free',
            includeUTM: state.utmParams && Object.keys(state.utmParams).length > 0
          }
        );

        if (result.success) {
          assets[assetType] = result.content;
          
          // Update usage tracking
          await updateUsage('tokens', result.tokensUsed || 0);
        } else {
          console.error(`Failed to generate ${assetType}:`, result.error);
          assets[assetType] = {
            error: result.error,
            fallback: true
          };
        }
      }

      // Update project usage
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
      console.error('Asset generation failed:', error);
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
  }, [
    state.benefits, 
    state.keywords, 
    state.utmParams, 
    state.videoUrl, 
    state.transcript, 
    user?.subscription_tier, 
    checkUsageLimit, 
    updateUsage
  ]);

  // Reset to start over
  const reset = useCallback(() => {
    setState({
      currentStep: 'input',
      videoUrl: '',
      transcript: null,
      benefits: [],
      keywords: [],
      utmParams: {},
      generatedAssets: {},
      loading: false,
      error: null,
      processingStage: ''
    });
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    processVideo,
    extractBenefits,
    updateKeywords,  
    updateUTMParams,
    generateAssets,
    reset,
    
    // Computed values
    canProceedToNextStep: !state.loading && !state.error,
    hasTranscript: state.transcript && state.transcript.length > 0,
    hasBenefits: state.benefits && state.benefits.length > 0 && !state.benefits[0]?.category === 'error',
    isProcessing: state.loading,
    
    // Debug info
    debug: {
      transcriptLength: state.transcript?.length || 0,
      benefitsCount: state.benefits?.length || 0,
      processingStage: state.processingStage,
      userTier: user?.subscription_tier || 'free'
    }
  };
};

export default useVideo2Promo;