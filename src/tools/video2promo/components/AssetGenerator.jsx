// src/components/Video2Promo/AssetGenerator.jsx - UPDATED for Backend Integration
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useAssetGeneration } from '../../shared/hooks/useAssetGeneration';

const ASSET_TYPES = [
  {
    id: 'email_series',
    name: 'Email Series',
    description: '3-5 email drip sequence for each benefit',
    estimatedTokens: 800,
    icon: '📧'
  },
  {
    id: 'blog_post',
    name: 'Blog Post',
    description: '500-800 word SEO-optimized article',
    estimatedTokens: 1200,
    icon: '📝'
  },
  {
    id: 'newsletter',
    name: 'Newsletter Blurb',
    description: '150-250 word newsletter section',
    estimatedTokens: 400,
    icon: '📰'
  }
];

export const AssetGenerator = ({ 
  project, 
  onGenerate, 
  loading = false,
  selectedBenefits = [],
  userTier = 'free',
  remainingTokens = 0,
  transcript = '',
  benefits = []
}) => {
  const [selectedAssetTypes, setSelectedAssetTypes] = useState(['email_series']);
  const [generateVariants, setGenerateVariants] = useState(false);
  
  // Use the asset generation hook
  const {
    generateAssets,
    isGenerating,
    error: generationError,
    estimateTokens
  } = useAssetGeneration();

  if (!project || !project.benefits) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Data</h3>
          <p className="text-gray-600">Please extract a video transcript first to generate marketing assets.</p>
        </div>
      </Card>
    );
  }

  const toggleAssetType = (assetType) => {
    if (selectedAssetTypes.includes(assetType)) {
      setSelectedAssetTypes(selectedAssetTypes.filter(t => t !== assetType));
    } else {
      setSelectedAssetTypes([...selectedAssetTypes, assetType]);
    }
  };

  const getSelectedBenefitIndices = () => {
    return selectedBenefits
      .map((selected, index) => selected ? index : -1)
      .filter(index => index !== -1);
  };

  const selectedBenefitCount = getSelectedBenefitIndices().length;
  const estimatedTokens = estimateTokens(
    Array(selectedBenefitCount).fill(null), 
    selectedAssetTypes, 
    generateVariants
  );
  
  const canGenerate = remainingTokens >= estimatedTokens && 
                      selectedAssetTypes.length > 0 && 
                      selectedBenefitCount > 0 &&
                      transcript &&
                      benefits.length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    try {
      const benefitIndices = getSelectedBenefitIndices();
      
      console.log('🎯 Starting asset generation:', {
        benefitIndices,
        selectedAssetTypes,
        generateVariants,
        transcript: transcript.length,
        benefits: benefits.length
      });

      const result = await generateAssets({
        transcript,
        benefits,
        benefitIndices,
        assetTypes: selectedAssetTypes,
        generateVariants: generateVariants && (userTier === 'pro' || userTier === 'gold'),
        project
      });

      // Call parent callback if provided
      if (onGenerate) {
        onGenerate(result);
      }

      console.log('✅ Asset generation completed:', result);

    } catch (error) {
      console.error('❌ Asset generation failed:', error);
    }
  };

  const currentlyGenerating = isGenerating || loading;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Generate Marketing Assets
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {selectedBenefitCount} benefit{selectedBenefitCount !== 1 ? 's' : ''} selected
          </span>
        </div>
      </div>

      {selectedBenefitCount === 0 && (
        <Alert variant="warning" className="mb-4">
          Please select at least one benefit from the transcript analysis above to generate marketing assets.
        </Alert>
      )}

      {generationError && (
        <Alert variant="error" className="mb-4">
          {generationError}
        </Alert>
      )}

      {/* Asset Type Selection */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-700">Select Content Types:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ASSET_TYPES.map((assetType) => (
            <div
              key={assetType.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedAssetTypes.includes(assetType.id)
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => toggleAssetType(assetType.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{assetType.icon}</span>
                    <h5 className="font-medium text-gray-900">{assetType.name}</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{assetType.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      ~{assetType.estimatedTokens.toLocaleString()} tokens
                    </p>
                    <p className="text-xs text-gray-500">
                      × {selectedBenefitCount} benefit{selectedBenefitCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedAssetTypes.includes(assetType.id)}
                  onChange={() => toggleAssetType(assetType.id)}
                  className="form-checkbox h-4 w-4 text-primary-600 mt-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro/Gold Features */}
      {(userTier === 'pro' || userTier === 'gold') && (
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={generateVariants}
              onChange={(e) => setGenerateVariants(e.target.checked)}
              className="form-checkbox h-4 w-4 text-indigo-600"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Generate A/B Variants
              </span>
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                {userTier.toUpperCase()}
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Create multiple versions for A/B testing (+50% tokens)
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Token Usage Info */}
      <div className="bg-neutral-50 rounded-lg p-4 mb-6 border">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Selected benefits:</span>
            <span className="font-medium text-gray-900">{selectedBenefitCount}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Content types:</span>
            <span className="font-medium text-gray-900">{selectedAssetTypes.length}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Estimated tokens needed:</span>
            <span className="font-medium text-gray-900">{estimatedTokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t pt-2">
            <span className="text-gray-600">Remaining tokens:</span>
            <span className={`font-medium ${remainingTokens >= estimatedTokens ? 'text-green-600' : 'text-red-600'}`}>
              {remainingTokens.toLocaleString()}
            </span>
          </div>
          {generateVariants && (
            <div className="text-xs text-indigo-600 bg-indigo-50 rounded px-2 py-1">
              Includes A/B variants (+50% tokens)
            </div>
          )}
        </div>
      </div>

      {/* Progress or Generate Button */}
      {currentlyGenerating ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3 py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span className="text-gray-600">Generating marketing assets...</span>
          </div>
          <div className="text-sm text-center text-gray-500">
            This may take 30-60 seconds depending on the number of assets selected.
          </div>
        </div>
      ) : (
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full"
          size="lg"
        >
          <span className="flex items-center justify-center space-x-2">
            <span>🚀</span>
            <span>Generate Marketing Content</span>
          </span>
        </Button>
      )}

      {/* Error/Warning Messages */}
      {!canGenerate && selectedBenefitCount > 0 && !currentlyGenerating && (
        <Alert variant="error" className="mt-4">
          {remainingTokens < estimatedTokens 
            ? `Insufficient tokens. Need ${estimatedTokens.toLocaleString()}, have ${remainingTokens.toLocaleString()}.`
            : selectedAssetTypes.length === 0
            ? 'Please select at least one content type.'
            : !transcript || benefits.length === 0
            ? 'Missing transcript or benefits data.'
            : 'Unable to generate content.'
          }
        </Alert>
      )}

      {/* Success Tips */}
      {canGenerate && !currentlyGenerating && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex">
            <span className="text-green-400 text-lg mr-2">💡</span>
            <div className="text-sm text-green-700">
              <p className="font-medium mb-1">Ready to generate!</p>
              <p>
                You'll get {selectedBenefitCount} × {selectedAssetTypes.length} = {selectedBenefitCount * selectedAssetTypes.length} unique marketing assets
                {generateVariants ? ' (plus A/B variants)' : ''}.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
