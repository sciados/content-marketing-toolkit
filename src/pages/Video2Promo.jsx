// src/pages/Video2Promo.jsx - UPDATED v3.0 with Python Backend Integration

import React, { useState } from 'react';
import { VideoUrlForm } from '../components/Video2Promo/VideoUrlForm';
import { TranscriptDisplay } from '../components/Video2Promo/TranscriptDisplay';
import { VideoEmailGenerator } from '../components/Video2Promo/VideoEmailGenerator';
import { DebugPanel } from '../components/Video2Promo/DebugPanel';
import { BackendStatusBanner } from '../components/Video2Promo/BackendStatusBanner';
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
    videoData, // Assuming this exists in your hook for video metadata
    videoUrl   // Current video URL being processed
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
        {/* Backend Status Banner - NEW */}
        <BackendStatusBanner />

        {/* Header with Python Backend Badge - UPDATED */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              🎥 Video2Promo Generator
            </h1>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Python Backend v3.0
            </div>
          </div>
          <p className="text-lg text-gray-600">
            Transform YouTube videos into high-converting email campaigns
          </p>
          <div className="mt-2 text-sm text-gray-500 flex items-center justify-center gap-4">
            <span>⚡ No CORS Issues</span>
            <span>🔒 Secure Backend Processing</span>
            <span>🚀 Multi-AI Support</span>
          </div>
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
              <div className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Python Backend
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              <div className="flex-1">
                <p className="text-red-800 font-medium">Backend Processing Error</p>
                <p className="text-red-700">{error}</p>
                <p className="text-xs text-red-600 mt-1">
                  This error occurred in the Python backend. Check the debug panel below for more details.
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={reset}
                className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
              >
                🔄 Start Over
              </button>
              <button
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
              >
                🧪 View Debug Panel
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Video URL Input */}
        {effectiveStep === 'input' && (
          <div>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 text-sm">
                <span>✅</span>
                <span className="font-medium">Ready for Python Backend Processing</span>
                <span className="ml-auto text-xs bg-green-100 px-2 py-1 rounded">
                  yt-dlp + Claude/OpenAI
                </span>
              </div>
            </div>
            <VideoUrlForm
              onSubmit={processVideo}
              loading={loading}
              error={error}
            />
          </div>
        )}

        {/* Step 2: Transcript Display */}
        {effectiveStep === 'transcript' && (
          <div>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 text-sm">
                <span>🎯</span>
                <span className="font-medium">Transcript extracted via Python backend</span>
                {debug?.transcriptLength && (
                  <span className="ml-auto text-xs bg-blue-100 px-2 py-1 rounded">
                    {debug.transcriptLength} characters
                  </span>
                )}
              </div>
            </div>
            <TranscriptDisplay
              transcript={transcript}
              benefits={extractedBenefits}
              onExtractBenefits={extractBenefits}
              loading={loading}
              error={error}
              debug={debug}
            />
          </div>
        )}

        {/* Step 3: Benefit Selection */}
        {effectiveStep === 'benefits' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                📋 Select Benefits for Email Generation
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {selectedBenefits ? selectedBenefits.filter(Boolean).length : 0} of {extractedBenefits?.length || 0} selected
                </span>
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  AI Analyzed
                </div>
              </div>
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
                  <div className="mb-2">⚠️</div>
                  <p>No benefits extracted yet.</p>
                  <p className="text-xs">Please extract benefits from the transcript using the Python backend.</p>
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

        {/* Step 4: Email Generation (Python Backend Powered) */}
        {effectiveStep === 'email_generation' && transcript && (
          <div>
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 text-purple-800 text-sm">
                <span>🚀</span>
                <span className="font-medium">Email generation powered by Python backend</span>
                <span className="ml-auto text-xs bg-purple-100 px-2 py-1 rounded">
                  Claude/OpenAI
                </span>
              </div>
            </div>
            <VideoEmailGenerator
              transcript={transcript}
              videoData={videoData || { 
                title: 'YouTube Video',
                url: videoUrl || 'Unknown',
                channelName: 'YouTube Channel'
              }}
              user={user}
              showToast={showToast}
              onEmailsGenerated={handleEmailsGenerated}
            />
          </div>
        )}

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
              <p className="text-gray-600 mb-2">
                Your video has been transformed into a high-converting email series.
              </p>
              <div className="text-sm text-gray-500 bg-green-50 p-2 rounded">
                ⚡ Processed by Python Backend • 🤖 AI-Powered Content • 🔒 Secure & Fast
              </div>
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

            {/* Success Stats */}
            {debug && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-semibold text-gray-800">User Tier</div>
                  <div className="text-gray-600 capitalize">{debug.userTier}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-semibold text-gray-800">Benefits Found</div>
                  <div className="text-gray-600">{debug.benefitsCount}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-semibold text-gray-800">Selected</div>
                  <div className="text-gray-600">{debug.selectedCount}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-semibold text-gray-800">Backend URL</div>
                  <div className="text-gray-600 text-xs">{debug.backendUrl?.split('//')[1]}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Debug Panel - Always visible in development, or when there's an error */}
        <div className="mt-8">
          <DebugPanel isVisible={import.meta.env.DEV || !!error} />
        </div>

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

        {/* Development Info Footer */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
            <div className="font-semibold mb-2">🔧 Development Info:</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Current Step:</strong> {effectiveStep}<br/>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}<br/>
                <strong>Has Error:</strong> {error ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Backend URL:</strong> {import.meta.env.VITE_API_BASE_URL}<br/>
                <strong>User Tier:</strong> {debug?.userTier || 'Unknown'}<br/>
                <strong>Benefits Count:</strong> {debug?.benefitsCount || 0}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}