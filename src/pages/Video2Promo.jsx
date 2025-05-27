// src/pages/Video2Promo.jsx - Fixed MainLayout import

import React from 'react';
import { VideoUrlForm } from '../components/Video2Promo/VideoUrlForm';
import { TranscriptDisplay } from '../components/Video2Promo/TranscriptDisplay';
import { KeywordManager } from '../components/Video2Promo/KeywordManager';
import { UTMBuilder } from '../components/Video2Promo/UTMBuilder';
import { AssetGenerator } from '../components/Video2Promo/AssetGenerator';
import { GeneratedAssets } from '../components/Video2Promo/GeneratedAssets';
import { ToneSelector } from '../components/Video2Promo/ToneSelector';
import { DebugPanel } from '../components/Video2Promo/DebugPanel';
import MainLayout from '../components/Layout/MainLayout'; // Fixed: Default import
import { useVideo2Promo } from '../hooks/useVideo2Promo';

export default function Video2Promo() {
  const {
    currentStep,
    transcript,
    benefits,
    keywords,
    utmParams,
    generatedAssets,
    loading,
    error,
    processingStage,
    processVideo,
    extractBenefits,
    updateKeywords,
    updateUTMParams,
    generateAssets,
    reset,
    canProceedToNextStep,
    hasBenefits,
    debug
  } = useVideo2Promo();

  return (
    <MainLayout>
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
                  currentStep === 'input' ? 1 :
                  currentStep === 'transcript' ? 2 :
                  currentStep === 'benefits' ? 3 :
                  currentStep === 'generation' ? 4 :
                  currentStep === 'complete' ? 5 : 1
                } of 5
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${
                    currentStep === 'input' ? 20 :
                    currentStep === 'transcript' ? 40 :
                    currentStep === 'benefits' ? 60 :
                    currentStep === 'generation' ? 80 :
                    currentStep === 'complete' ? 100 : 20
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
          {currentStep === 'input' && (
            <VideoUrlForm
              onSubmit={processVideo}
              loading={loading}
              error={error}
            />
          )}

          {/* Step 2: Transcript Display & Benefit Extraction */}
          {(currentStep === 'transcript' || currentStep === 'benefits') && (
            <TranscriptDisplay
              transcript={transcript}
              benefits={benefits}
              onExtractBenefits={extractBenefits}
              loading={loading}
              error={error}
              debug={debug}
            />
          )}

          {/* Step 3: Keywords & UTM Setup */}
          {hasBenefits && (
            <div className="space-y-6">
              <KeywordManager
                keywords={keywords}
                onUpdateKeywords={updateKeywords}
                benefits={benefits}
              />

              <UTMBuilder
                utmParams={utmParams}
                onUpdateUTM={updateUTMParams}
              />

              <ToneSelector
                onToneChange={(tone) => console.log('Tone changed:', tone)}
              />
            </div>
          )}

          {/* Step 4: Asset Generation */}
          {hasBenefits && (
            <div className="space-y-6">
              <AssetGenerator
                onGenerate={generateAssets}
                loading={loading}
                canGenerate={canProceedToNextStep}
              />

              {Object.keys(generatedAssets).length > 0 && (
                <GeneratedAssets
                  assets={generatedAssets}
                  keywords={keywords}
                  utmParams={utmParams}
                />
              )}
            </div>
          )}

          {/* Debug Panel - Only show in development or when there are issues */}
          {(import.meta.env.DEV || error) && (
            <DebugPanel />
          )}

          {/* Reset Button */}
          {currentStep !== 'input' && (
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
    </MainLayout>
  );
}