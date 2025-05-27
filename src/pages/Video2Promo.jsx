// src/pages/Video2Promo.jsx - CLEAN VERSION

import React, { useState } from 'react';
import { VideoUrlForm } from '../components/Video2Promo/VideoUrlForm';
import { TranscriptDisplay } from '../components/Video2Promo/TranscriptDisplay';
import ScanResultsPanel from '../components/EmailGenerator/ScanResultsPanel';
import { KeywordManager } from '../components/Video2Promo/KeywordManager';
import { UTMBuilder } from '../components/Video2Promo/UTMBuilder';
import { AssetGenerator } from '../components/Video2Promo/AssetGenerator';
import { GeneratedAssets } from '../components/Video2Promo/GeneratedAssets';
import { DebugPanel } from '../components/Video2Promo/DebugPanel';
import { useVideo2Promo } from '../hooks/useVideo2Promo';

export default function Video2Promo() {
  // Manual step override state
  const [manualStep, setManualStep] = useState(null);

  // Get all state and functions from the hook
  const {
    currentStep,
    transcript,
    extractedBenefits,
    selectedBenefits,
    extractedFeatures,
    websiteData,
    keywords,
    utmParams,
    generatedAssets,
    loading,
    error,
    processingStage,
    processVideo,
    extractBenefits,
    toggleBenefit,
    updateKeywords,
    updateUTMParams,
    generateAssets,
    reset,
    hasBenefits,
    debug
  } = useVideo2Promo();

  // Use manual step override if set, otherwise use hook's currentStep
  const effectiveStep = manualStep || currentStep;

  // Helper functions for step navigation
  const handleBackToTranscript = () => {
    setManualStep('transcript');
  };

  const handleBackToBenefits = () => {
    setManualStep('benefits');
  };

  const handleGenerateAssets = () => {
    setManualStep('generation');
    generateAssets(['email_series']);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎥 Video2Promo Generator
          </h1>
          <p className="text-lg text-gray-600">
            Transform YouTube videos into complete marketing campaigns
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">
              Step {
                effectiveStep === 'input' ? 1 :
                effectiveStep === 'transcript' ? 2 :
                effectiveStep === 'benefits' ? 3 :
                effectiveStep === 'generation' ? 4 :
                effectiveStep === 'complete' ? 5 : 1
              } of 5
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${
                  effectiveStep === 'input' ? 20 :
                  effectiveStep === 'transcript' ? 40 :
                  effectiveStep === 'benefits' ? 60 :
                  effectiveStep === 'generation' ? 80 :
                  effectiveStep === 'complete' ? 100 : 20
                }%` 
              }}
            ></div>
          </div>
        </div>

        {/* Processing Status */}
        {processingStage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-800 font-medium">{processingStage}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Start Over
            </button>
          </div>
        )}

        {/* Step 1: Video URL Input */}
        {effectiveStep === 'input' && (
          <VideoUrlForm
            onSubmit={processVideo}
            loading={loading}
            error={error}
          />
        )}

        {/* Step 2: Transcript Display */}
        {effectiveStep === 'transcript' && (
          <TranscriptDisplay
            transcript={transcript}
            benefits={extractedBenefits}
            onExtractBenefits={extractBenefits}
            loading={loading}
            error={error}
            debug={debug}
          />
        )}

        {/* Step 3: Benefit Selection */}
        {effectiveStep === 'benefits' && (
          <ScanResultsPanel
            extractedBenefits={extractedBenefits}
            selectedBenefits={selectedBenefits}
            toggleBenefit={toggleBenefit}
            extractedFeatures={extractedFeatures}
            websiteData={websiteData}
            onBack={handleBackToTranscript}
            onGenerate={handleGenerateAssets}
            isGenerating={loading && effectiveStep === 'generation'}
          />
        )}

        {/* Step 4: Campaign Customization */}
        {hasBenefits && effectiveStep === 'generation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                🎯 Campaign Customization
              </h2>
              
              <KeywordManager
                keywords={keywords}
                onUpdateKeywords={updateKeywords}
                benefits={extractedBenefits}
              />

              <div className="mt-6">
                <UTMBuilder
                  utmParams={utmParams}
                  onUpdateUTM={updateUTMParams}
                />
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={handleBackToBenefits}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Back to Benefits
                </button>
                
                <button
                  onClick={() => generateAssets(['email_series'])}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Email Campaign'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Generated Assets */}
        {effectiveStep === 'complete' && Object.keys(generatedAssets).length > 0 && (
          <GeneratedAssets
            assets={generatedAssets}
            keywords={keywords}
            utmParams={utmParams}
          />
        )}

        {/* Debug Panel - Development only */}
        {(import.meta.env.DEV || error) && (
          <DebugPanel />
        )}

        {/* Reset Button */}
        {effectiveStep !== 'input' && (
          <div className="mt-8 text-center">
            <button
              onClick={reset}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              🔄 Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}