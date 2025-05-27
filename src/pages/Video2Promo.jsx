// src/pages/Video2Promo.jsx - UPDATED v2.0 with Email Generator Integration

import React, { useState } from 'react';
import { VideoUrlForm } from '../components/Video2Promo/VideoUrlForm';
import { TranscriptDisplay } from '../components/Video2Promo/TranscriptDisplay';
import { VideoEmailGenerator } from '../components/Video2Promo/VideoEmailGenerator';
import { DebugPanel } from '../components/Video2Promo/DebugPanel';
import { useVideo2Promo } from '../hooks/useVideo2Promo';
import { useToast } from '../hooks/useToast';
import useSupabase from '../hooks/useSupabase';

export default function Video2Promo() {
  // Manual step override state
  const [manualStep, setManualStep] = useState(null);
  
  // Context hooks
  const { showToast } = useToast();
  const { user } = useSupabase();

  // Get all state and functions from the hook
  const {
    currentStep,
    transcript,
    extractedBenefits,
    selectedBenefits,
    loading,
    error,
    processingStage,
    processVideo,
    extractBenefits,
    toggleBenefit,
    reset,
    debug,
    videoData // Assuming this exists in your hook for video metadata
  } = useVideo2Promo();

  // Use manual step override if set, otherwise use hook's currentStep
  const effectiveStep = manualStep || currentStep;

  // Helper functions for step navigation
  const handleBackToTranscript = () => {
    setManualStep('transcript');
  };

  const handleProceedToEmailGeneration = () => {
    setManualStep('email_generation');
  };

  const handleEmailsGenerated = (emails) => {
    setManualStep('complete');
    showToast(`Successfully generated ${emails.length} emails!`, 'success');
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
            Transform YouTube videos into high-converting email campaigns
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
                effectiveStep === 'email_generation' ? 4 :
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
                  effectiveStep === 'email_generation' ? 80 :
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                📋 Select Benefits for Email Generation
              </h2>
              <span className="text-sm text-gray-500">
                {selectedBenefits ? selectedBenefits.filter(Boolean).length : 0} of {extractedBenefits?.length || 0} selected
              </span>
            </div>

            {/* Benefits List */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {extractedBenefits?.map((benefit, index) => (
                <div
                  key={index}
                  className={`
                    p-3 border rounded-lg cursor-pointer transition-all
                    ${selectedBenefits?.[index] 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                    }
                  `}
                  onClick={() => toggleBenefit(index)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedBenefits?.[index] || false}
                      onChange={() => toggleBenefit(index)}
                      className="mt-1 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{benefit}</p>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  No benefits extracted yet. Please extract benefits from the transcript first.
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBackToTranscript}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                ← Back to Transcript
              </button>
              
              <button
                onClick={handleProceedToEmailGeneration}
                disabled={!selectedBenefits || selectedBenefits.filter(Boolean).length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Emails →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Email Generation (NEW v2.0) */}
        {effectiveStep === 'email_generation' && transcript && (
          <VideoEmailGenerator
            transcript={transcript}
            videoData={videoData || { 
              title: 'YouTube Video',
              url: 'Unknown',
              channelName: 'YouTube Channel'
            }}
            user={user}
            showToast={showToast}
            onEmailsGenerated={handleEmailsGenerated}
          />
        )}

        {/* Step 4 Alternative: Legacy Campaign Customization (for other content types) - REMOVED */}
        {/* This legacy section has been replaced by the new VideoEmailGenerator workflow */}

        {/* Step 5: Completion */}
        {effectiveStep === 'complete' && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Email Campaign Generated Successfully!
              </h2>
              <p className="text-gray-600">
                Your video has been transformed into a high-converting email series.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => window.location.href = '/saved-emails'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                📧 View Generated Emails
              </button>
              
              <button
                onClick={reset}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                🎥 Process Another Video
              </button>
            </div>
          </div>
        )}

        {/* Debug Panel - Development only */}
        {(import.meta.env.DEV || error) && (
          <div className="mt-8">
            <DebugPanel />
          </div>
        )}

        {/* Reset Button */}
        {effectiveStep !== 'input' && effectiveStep !== 'complete' && (
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