// src/hooks/useAssetGeneration.js
import { useState, useCallback } from 'react';
import { assetGenerationService } from '../services/video2promo';
import { useUsageTracking } from './useUsageTracking';

export function useAssetGeneration() {
  const [generatedAssets, setGeneratedAssets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const { trackAITokenUsage } = useUsageTracking();

  /**
   * Generate email series
   */
  const generateEmailSeries = useCallback(async (params) => {
    setIsGenerating(true);
    setError(null);

    try {
      const asset = await assetGenerationService.generateEmailSeries(params);
      
      // Track token usage
      if (asset.total_tokens) {
        await trackAITokenUsage(asset.total_tokens);
      }

      setGeneratedAssets(prev => [...prev, asset]);
      return asset;
    } catch (err) {
      console.error('Error generating email series:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [trackAITokenUsage]);

  /**
   * Generate blog post
   */
  const generateBlogPost = useCallback(async (params) => {
    setIsGenerating(true);
    setError(null);

    try {
      const asset = await assetGenerationService.generateBlogPost(params);
      
      // Track token usage
      if (asset.total_tokens) {
        await trackAITokenUsage(asset.total_tokens);
      }

      setGeneratedAssets(prev => [...prev, asset]);
      return asset;
    } catch (err) {
      console.error('Error generating blog post:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [trackAITokenUsage]);

  /**
   * Generate newsletter blurb
   */
  const generateNewsletter = useCallback(async (params) => {
    setIsGenerating(true);
    setError(null);

    try {
      const asset = await assetGenerationService.generateNewsletter(params);
      
      // Track token usage
      if (asset.total_tokens) {
        await trackAITokenUsage(asset.total_tokens);
      }

      setGeneratedAssets(prev => [...prev, asset]);
      return asset;
    } catch (err) {
      console.error('Error generating newsletter:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [trackAITokenUsage]);

  /**
   * Generate multiple assets
   */
  const generateMultipleAssets = useCallback(async (benefits, assetTypes, params = {}) => {
    setIsGenerating(true);
    setError(null);

    try {
      const results = [];
      let totalTokens = 0;

      for (const benefit of benefits) {
        for (const assetType of assetTypes) {
          const assetParams = { ...params, benefit };

          let asset;
          switch (assetType) {
            case 'email_series':
              asset = await assetGenerationService.generateEmailSeries(assetParams);
              break;
            case 'blog_post':
              asset = await assetGenerationService.generateBlogPost(assetParams);
              break;
            case 'newsletter':
              asset = await assetGenerationService.generateNewsletter(assetParams);
              break;
            default:
              console.warn(`Unknown asset type: ${assetType}`);
              continue;
          }

          if (asset) {
            results.push(asset);
            totalTokens += asset.total_tokens || 0;
          }
        }
      }

      // Track total token usage
      if (totalTokens > 0) {
        await trackAITokenUsage(totalTokens);
      }

      setGeneratedAssets(prev => [...prev, ...results]);
      return results;
    } catch (err) {
      console.error('Error generating multiple assets:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [trackAITokenUsage]);

  /**
   * Clear generated assets
   */
  const clearAssets = useCallback(() => {
    setGeneratedAssets([]);
    setError(null);
  }, []);

  /**
   * Remove specific asset
   */
  const removeAsset = useCallback((assetId) => {
    setGeneratedAssets(prev => prev.filter(asset => asset.id !== assetId));
  }, []);

  /**
   * Estimate tokens needed for generation
   */
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
    
    // Actions
    generateEmailSeries,
    generateBlogPost,
    generateNewsletter,
    generateMultipleAssets,
    clearAssets,
    removeAsset,
    
    // Utilities
    estimateTokens
  };
}