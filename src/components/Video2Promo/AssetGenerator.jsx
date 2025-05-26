// src/components/Video2Promo/AssetGenerator.jsx
import React, { useState } from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import { Alert } from '../Common/Alert';

const ASSET_TYPES = [
  {
    id: 'email_series',
    name: 'Email Series',
    description: '3-5 email drip sequence for each benefit',
    estimatedTokens: 800
  },
  {
    id: 'blog_post',
    name: 'Blog Post',
    description: '500-800 word SEO-optimized article',
    estimatedTokens: 1200
  },
  {
    id: 'newsletter',
    name: 'Newsletter Blurb',
    description: '150-250 word newsletter section',
    estimatedTokens: 400
  }
];

export const AssetGenerator = ({ 
  project, 
  onGenerate, 
  loading = false,
  selectedBenefits = [],
  userTier = 'free',
  remainingTokens = 0
}) => {
  const [selectedAssetTypes, setSelectedAssetTypes] = useState(['email_series']);
  const [generateVariants, setGenerateVariants] = useState(false);

  if (!project || !project.benefits) {
    return null;
  }

  const toggleAssetType = (assetType) => {
    if (selectedAssetTypes.includes(assetType)) {
      setSelectedAssetTypes(selectedAssetTypes.filter(t => t !== assetType));
    } else {
      setSelectedAssetTypes([...selectedAssetTypes, assetType]);
    }
  };

  const calculateTokenEstimate = () => {
    const benefitCount = selectedBenefits.length || 1;
    const assetTokens = selectedAssetTypes.reduce((total, typeId) => {
      const assetType = ASSET_TYPES.find(t => t.id === typeId);
      return total + (assetType?.estimatedTokens || 0);
    }, 0);
    
    const baseTokens = benefitCount * assetTokens;
    return generateVariants ? Math.floor(baseTokens * 1.5) : baseTokens;
  };

  const estimatedTokens = calculateTokenEstimate();
  const canGenerate = remainingTokens >= estimatedTokens && 
                      selectedAssetTypes.length > 0 && 
                      selectedBenefits.length > 0;

  const handleGenerate = () => {
    if (canGenerate && onGenerate) {
      onGenerate({
        benefitIndices: selectedBenefits,
        assetTypes: selectedAssetTypes,
        generateVariants: generateVariants && (userTier === 'pro' || userTier === 'gold')
      });
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Generate Marketing Assets
      </h3>

      {selectedBenefits.length === 0 && (
        <Alert variant="warning" className="mb-4">
          Please select at least one benefit from the transcript analysis above.
        </Alert>
      )}

      {/* Asset Type Selection */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-700">Select Content Types:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ASSET_TYPES.map((assetType) => (
            <div
              key={assetType.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedAssetTypes.includes(assetType.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleAssetType(assetType.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">{assetType.name}</h5>
                  <p className="text-sm text-gray-600 mt-1">{assetType.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    ~{assetType.estimatedTokens} tokens
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedAssetTypes.includes(assetType.id)}
                  onChange={() => toggleAssetType(assetType.id)}
                  className="form-checkbox h-4 w-4 text-primary-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro/Gold Features */}
      {(userTier === 'pro' || userTier === 'gold') && (
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={generateVariants}
              onChange={(e) => setGenerateVariants(e.target.checked)}
              className="form-checkbox h-4 w-4 text-primary-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Generate A/B Variants
            </span>
            <span className="text-xs text-primary-600">(Pro/Gold)</span>
          </label>
          <p className="text-sm text-gray-500 mt-1 ml-6">
            Create multiple versions for A/B testing (+50% tokens)
          </p>
        </div>
      )}

      {/* Token Usage Info */}
      <div className="bg-neutral-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Estimated tokens needed:</span>
          <span className="font-medium text-gray-900">{estimatedTokens.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-600">Remaining tokens:</span>
          <span className={`font-medium ${remainingTokens >= estimatedTokens ? 'text-green-600' : 'text-red-600'}`}>
            {remainingTokens.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        loading={loading}
        disabled={!canGenerate}
        className="w-full"
        size="lg"
      >
        {loading ? 'Generating Assets...' : 'Generate Marketing Content'}
      </Button>

      {!canGenerate && selectedBenefits.length > 0 && (
        <Alert variant="error" className="mt-4">
          {remainingTokens < estimatedTokens 
            ? `Insufficient tokens. Need ${estimatedTokens.toLocaleString()}, have ${remainingTokens.toLocaleString()}.`
            : 'Please select at least one content type.'
          }
        </Alert>
      )}
    </Card>
  );
};