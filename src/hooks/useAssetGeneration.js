// src/hooks/useAssetGeneration.js - UPDATED VERSION
import { useState, useCallback } from 'react';
import { videoApi } from '../services/api';
import { useUsageTracking } from './useUsageTracking';

export function useAssetGeneration() {
  const [generatedAssets, setGeneratedAssets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const { trackAITokenUsage } = useUsageTracking();

  /**
   * Generate assets using centralized API service
   */
  const generateAssets = useCallback(async (params) => {
    setIsGenerating(true);
    setError(null);

    try {
      const {
        transcript,
        benefits,
        benefitIndices,
        assetTypes,
        generateVariants = false,
        project
      } = params;

      if (!transcript || !benefits || !benefitIndices) {
        throw new Error('Missing required parameters for asset generation');
      }

      console.log('🎯 Generating assets with params:', {
        transcript: transcript.length,
        benefits: benefits.length,
        benefitIndices,
        assetTypes,
        generateVariants
      });

      // Use centralized API service
      const result = await videoApi.generateAssets({
        transcript,
        benefits,
        benefitIndices,
        assetTypes,
        generateVariants,
        project
      });

      if (!result.success) {
        throw new Error(result.error || 'Asset generation failed');
      }

      // Update state with generated assets
      setGeneratedAssets(result.assets || []);

      // Track token usage (already tracked on backend, but update local state)
      if (result.total_tokens) {
        await trackAITokenUsage(result.total_tokens);
      }

      console.log('✅ Asset generation successful:', {
        assetsGenerated: result.assets_generated,
        totalTokens: result.total_tokens
      });

      return {
        assets: result.assets,
        totalTokens: result.total_tokens,
        assetsGenerated: result.assets_generated,
        message: result.message
      };

    } catch (err) {
      console.error('❌ Asset generation error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [trackAITokenUsage]);

  // Rest of the methods remain the same...
  const generateEmailSeries = useCallback(async (params) => {
    return generateAssets({
      ...params,
      assetTypes: ['email_series']
    });
  }, [generateAssets]);

  const generateBlogPost = useCallback(async (params) => {
    return generateAssets({
      ...params,
      assetTypes: ['blog_post']
    });
  }, [generateAssets]);

  const generateNewsletter = useCallback(async (params) => {
    return generateAssets({
      ...params,
      assetTypes: ['newsletter']
    });
  }, [generateAssets]);

  const generateMultipleAssets = useCallback(async (benefits, assetTypes, params = {}) => {
    const { transcript, project } = params;
    
    if (!transcript) {
      throw new Error('Transcript is required for asset generation');
    }

    const benefitIndices = benefits.map((_, index) => index);

    return generateAssets({
      transcript,
      benefits,
      benefitIndices,
      assetTypes,
      generateVariants: params.generateVariants || false,
      project
    });
  }, [generateAssets]);

  const clearAssets = useCallback(() => {
    setGeneratedAssets([]);
    setError(null);
  }, []);

  const removeAsset = useCallback((assetId) => {
    setGeneratedAssets(prev => prev.filter(asset => asset.id !== assetId));
  }, []);

  const estimateTokens = useCallback((benefits, assetTypes, generateVariants = false) => {
    const tokenEstimates = {
      email_series: 800,
      blog_post: 1200,
      newsletter: 400
    };

    let total = 0;
    benefits.forEach(() => {
      assetTypes.forEach(type => {
        total += tokenEstimates[type] || 500;
      });
    });

    return generateVariants ? Math.floor(total * 1.5) : total;
  }, []);

  return {
    // State
    generatedAssets,
    isGenerating,
    error,
    
    // Main actions
    generateAssets,
    generateMultipleAssets,
    clearAssets,
    removeAsset,
    
    // Legacy methods (for backward compatibility)
    generateEmailSeries,
    generateBlogPost,
    generateNewsletter,
    
    // Utilities
    estimateTokens
  };
}