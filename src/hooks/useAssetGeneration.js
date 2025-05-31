// src/hooks/useAssetGeneration.js - UPDATED for Backend Integration
import { useState, useCallback } from 'react';
import { useUsageTracking } from './useUsageTracking';

// Backend API URL - Using your existing environment variable
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function useAssetGeneration() {
  const [generatedAssets, setGeneratedAssets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const { trackAITokenUsage } = useUsageTracking();

  /**
   * Get auth headers for API calls
   */
  const getAuthHeaders = () => {
    const token = localStorage.getItem('supabase.auth.token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  /**
   * Generate assets using backend API
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

      const response = await fetch(`${API_BASE}/api/video2promo/generate-assets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          transcript,
          benefits,
          benefitIndices,
          assetTypes,
          generateVariants,
          project
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

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

  /**
   * Generate email series (legacy method - now uses backend)
   */
  const generateEmailSeries = useCallback(async (params) => {
    return generateAssets({
      ...params,
      assetTypes: ['email_series']
    });
  }, [generateAssets]);

  /**
   * Generate blog post (legacy method - now uses backend)
   */
  const generateBlogPost = useCallback(async (params) => {
    return generateAssets({
      ...params,
      assetTypes: ['blog_post']
    });
  }, [generateAssets]);

  /**
   * Generate newsletter (legacy method - now uses backend)
   */
  const generateNewsletter = useCallback(async (params) => {
    return generateAssets({
      ...params,
      assetTypes: ['newsletter']
    });
  }, [generateAssets]);

  /**
   * Generate multiple assets (updated to use backend)
   */
  const generateMultipleAssets = useCallback(async (benefits, assetTypes, params = {}) => {
    const { transcript, project } = params;
    
    if (!transcript) {
      throw new Error('Transcript is required for asset generation');
    }

    // Create benefit indices (select all benefits)
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

  /**
   * Get asset by ID
   */
  const getAssetById = useCallback((assetId) => {
    return generatedAssets.find(asset => asset.id === assetId);
  }, [generatedAssets]);

  /**
   * Get assets by type
   */
  const getAssetsByType = useCallback((assetType) => {
    return generatedAssets.filter(asset => asset.type === assetType);
  }, [generatedAssets]);

  /**
   * Export asset to different formats
   */
  const exportAsset = useCallback((asset, format = 'json') => {
    try {
      switch (format) {
        case 'json':
          return JSON.stringify(asset, null, 2);
        
        case 'text':
          if (asset.type === 'email_series') {
            return asset.content.map(email => 
              `Subject: ${email.subject}\n\n${email.content}`
            ).join('\n\n---\n\n');
          } else if (asset.type === 'blog_post') {
            return `${asset.content.title}\n\n${asset.content.body}`;
          } else if (asset.type === 'newsletter') {
            return `${asset.content.headline}\n\n${asset.content.body}`;
          }
          return asset.content;
        
        case 'markdown':
          if (asset.type === 'email_series') {
            return asset.content.map(email => 
              `## ${email.subject}\n\n${email.content}`
            ).join('\n\n---\n\n');
          } else if (asset.type === 'blog_post') {
            return `# ${asset.content.title}\n\n${asset.content.body}`;
          } else if (asset.type === 'newsletter') {
            return `## ${asset.content.headline}\n\n${asset.content.body}`;
          }
          return asset.content;
        
        default:
          return JSON.stringify(asset, null, 2);
      }
    } catch (error) {
      console.error('Export error:', error);
      return JSON.stringify(asset, null, 2);
    }
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
    estimateTokens,
    getAssetById,
    getAssetsByType,
    exportAsset
  };
}