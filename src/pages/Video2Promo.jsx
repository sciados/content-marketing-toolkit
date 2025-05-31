// src/pages/Video2Promo.jsx - UPDATED with Backend Integration and Asset Generation

import React, { useState } from 'react';
import { VideoUrlForm } from '../components/Video2Promo/VideoUrlForm';
import { TranscriptDisplay } from '../components/Video2Promo/TranscriptDisplay';
import { VideoEmailGenerator } from '../components/Video2Promo/VideoEmailGenerator';
import { AssetGenerator } from '../components/Video2Promo/AssetGenerator';
import { GeneratedAssets } from '../components/Video2Promo/GeneratedAssets';
import { DebugPanel } from '../components/Video2Promo/DebugPanel';
import { BackendStatusBanner } from '../components/Video2Promo/BackendStatusBanner';
import { useVideo2Promo } from '../hooks/useVideo2Promo';
import { useAssetGeneration } from '../hooks/useAssetGeneration';
import { useUsageTracking } from '../hooks/useUsageTracking';
import { useToast } from '../hooks/useToast';
import useSupabase from '../hooks/useSupabase';

export default function Video2Promo() {
  // Manual step override state
  const [manualStep, setManualStep] = useState(null);
  
  // Context hooks
  const { showToast } = useToast();
  const { user, session } = useSupabase();

  // Get all state and functions from the Video2Promo hook
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
    videoData,
    videoUrl
  } = useVideo2Promo();

  // Asset generation hook
  const {
    generatedAssets,
    isGenerating: isGeneratingAssets,
    error: assetError,
    generateAssets,
    clearAssets
  } = useAssetGeneration();

  // Usage tracking
  const { 
    usageData,
    remainingTokens
  } = useUsageTracking();

  // Use manual step override if set, otherwise use hook's currentStep
  const effectiveStep = manualStep || currentStep;

  // Helper functions for step navigation
  const handleBackToTranscript = () => {
    setManualStep('transcript');
  };

  const handleProceedToBenefits = () => {
    setManualStep('benefits');
  };

  const handleProceedToAssetGeneration = () => {
    if (selectedBenefits && selectedBenefits.some(Boolean)) {
      setManualStep('asset_generation');
    } else {
      showToast('Please select at least one benefit first', 'error');
    }
  };

  const handleProceedToEmailGeneration = () => {
    setManualStep('email_generation');
  };

  const handleAssetsGenerated = (result) => {
    showToast(`Successfully generated ${result.assetsGenerated} marketing assets!`, 'success');
    setManualStep('assets_complete');
  };

  const handleEmailsGenerated = (emails) => {
    setManualStep('complete');
    showToast(`Successfully generated ${emails.length} emails!`, 'success');
  };

  // Generate marketing assets using backend
  const handleGenerateAssets = async (params) => {
    try {
      if (!transcript || !extractedBenefits) {
        showToast('Please extract transcript and benefits first', 'error');
        return;
      }

      const result = await generateAssets({
        transcript,
        benefits: extractedBenefits,
        benefitIndices: params.benefitIndices || selectedBenefits.map((selected, i) => selected ? i : -1).filter(i => i !== -1),
        assetTypes: params.assetTypes,
        generateVariants: params.generateVariants,
        project: {
          videoUrl,
          videoData,
          extractedAt: new Date().toISOString()
        }
      });

      handleAssetsGenerated(result);
      return result;

    } catch (error) {
      console.error('Asset generation failed:', error);
      showToast(`Asset generation failed: ${error.message}`, 'error');
    }
  };

  // Get user tier for feature access
  const userTier = user?.subscription_tier || 'free';

  // Authentication check component
  const AuthenticationRequired = () => (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-blue-600 text-2xl">🔐</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Authentication Required
      </h2>
      <p className="text-gray-600 mb-6">
        Please log in to use the Video2Promo generator. This feature requires authentication to track usage and ensure secure processing.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => window.location.href = '/login'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Sign In
        </button>
        <button
          onClick={() => window.location.href = '/register'}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Create Account
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>✅ Free tier includes 1 Video2Promo project per month</p>
        <p>🚀 Pro tier includes 15+ projects with advanced features</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Backend Status Banner */}
        <BackendStatusBanner />

        {/* Header with Backend Integration Badge */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              🎥 Video2Promo Generator
            </h1>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Backend API v4.0
            </div>
          </div>
          <p className="text-lg text-gray-600">
            Transform YouTube videos into comprehensive marketing campaigns
          </p>
          <div className="mt-2 text-sm text-gray-500 flex items-center justify-center gap-4">
            <span>⚡ Webshare Rotating Proxies</span>
            <span>🤖 AI Asset Generation</span>
            <span>📊 Usage Tracking</span>
          </div>
        </div>

        {/* Authentication Check */}
        {!user || !session ? (
          <AuthenticationRequired />
        ) : (
          <>
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">
                  Step {
                    effectiveStep === 'input' ? 1 :
                    effectiveStep === 'transcript' ? 2 :
                    effectiveStep === 'benefits' ? 3 :
                    effectiveStep === 'asset_generation' ? 4 :
                    effectiveStep === 'assets_complete' ? 5 :
                    effectiveStep === 'email_generation' ? 6 :
                    effectiveStep === 'complete' ? 7 : 1
                  } of 7
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${
                      effectiveStep === 'input' ? 14 :
                      effectiveStep === 'transcript' ? 28 :
                      effectiveStep === 'benefits' ? 42 :
                      effectiveStep === 'asset_generation' ? 56 :
                      effectiveStep === 'assets_complete' ? 70 :
                      effectiveStep === 'email_generation' ? 85 :
                      effectiveStep === 'complete' ? 100 : 14
                    }%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Processing Status */}
            {(processingStage || isGeneratingAssets) && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800 font-medium">
                    {isGeneratingAssets ? 'Generating marketing assets...' : processingStage}
                  </span>
                  <div className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Backend API
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {(error || assetError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">⚠️</span>
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Backend Processing Error</p>
                    <p className="text-red-700">{error || assetError}</p>
                    <p className="text-xs text-red-600 mt-1">
                      This error occurred in the backend API. Check the debug panel below for more details.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      reset();
                      clearAssets();
                      setManualStep(null);
                    }}
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
                    <span className="font-medium">Webshare Rotating Proxies Active (95-100% Success Rate)</span>
                    <span className="ml-auto text-xs bg-green-100 px-2 py-1 rounded">
                      v4.0 Ready
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
                    <span className="font-medium">Transcript extracted via Webshare rotating proxies</span>
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
                  onProceed={handleProceedToBenefits}
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
                    📋 Select Benefits for Content Generation
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
                      <p className="text-xs">Please extract benefits from the transcript using the backend AI.</p>
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
                    onClick={handleProceedToAssetGeneration}
                    disabled={!selectedBenefits || selectedBenefits.filter(Boolean).length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Marketing Assets →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Asset Generation */}
            {effectiveStep === 'asset_generation' && transcript && extractedBenefits && (
              <div>
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-800 text-sm">
                    <span>🚀</span>
                    <span className="font-medium">Backend AI asset generation ready</span>
                    <span className="ml-auto text-xs bg-purple-100 px-2 py-1 rounded">
                      Claude/OpenAI
                    </span>
                  </div>
                </div>
                
                <AssetGenerator
                  project={{ 
                    benefits: extractedBenefits,
                    transcript,
                    videoUrl,
                    videoData 
                  }}
                  onGenerate={handleGenerateAssets}
                  loading={isGeneratingAssets}
                  selectedBenefits={selectedBenefits.map((selected, i) => selected ? i : -1).filter(i => i !== -1)}
                  userTier={userTier}
                  remainingTokens={remainingTokens}
                  transcript={transcript}
                  benefits={extractedBenefits}
                />
              </div>
            )}

            {/* Step 5: Generated Assets Display */}
            {effectiveStep === 'assets_complete' && generatedAssets.length > 0 && (
              <div>
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 text-sm">
                    <span>✅</span>
                    <span className="font-medium">{generatedAssets.length} marketing assets generated successfully</span>
                    <span className="ml-auto text-xs bg-green-100 px-2 py-1 rounded">
                      Backend Generated
                    </span>
                  </div>
                </div>

                <GeneratedAssets 
                  assets={generatedAssets}
                  onUseAsset={(asset) => console.log('Using asset:', asset)}
                />

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setManualStep('asset_generation')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    ← Generate More Assets
                  </button>
                  
                  <button
                    onClick={handleProceedToEmailGeneration}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Continue to Email Generation →
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Email Generation */}
            {effectiveStep === 'email_generation' && transcript && (
              <div>
                <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center gap-2 text-indigo-800 text-sm">
                    <span>📧</span>
                    <span className="font-medium">Email generation powered by backend AI</span>
                    <span className="ml-auto text-xs bg-indigo-100 px-2 py-1 rounded">
                      Final Step
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

            {/* Step 7: Completion */}
            {effectiveStep === 'complete' && (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 text-2xl">🎉</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Complete Marketing Campaign Generated!
                  </h2>
                  <p className="text-gray-600 mb-2">
                    Your video has been transformed into a comprehensive marketing campaign with assets and emails.
                  </p>
                  <div className="text-sm text-gray-500 bg-green-50 p-2 rounded">
                    🎯 {generatedAssets.length} Assets Created • 📧 Email Series Generated • 🤖 AI-Powered • 🔒 Secure
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={() => window.location.href = '/saved-emails'}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    📧 View Generated Emails
                  </button>
                  
                  <button
                    onClick={() => setManualStep('assets_complete')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    🎨 View Marketing Assets
                  </button>
                  
                  <button
                    onClick={() => {
                      reset();
                      clearAssets();
                      setManualStep(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    🎥 Process Another Video
                  </button>
                </div>

                {/* Success Stats */}
                {debug && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-800">User Tier</div>
                      <div className="text-gray-600 capitalize">{userTier}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-800">Benefits Found</div>
                      <div className="text-gray-600">{extractedBenefits?.length || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-800">Assets Generated</div>
                      <div className="text-gray-600">{generatedAssets.length}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-800">Tokens Used</div>
                      <div className="text-gray-600">{usageData?.monthly_tokens_used || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-800">Backend</div>
                      <div className="text-gray-600 text-xs">v4.0 API</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reset Button */}
            {effectiveStep !== 'input' && effectiveStep !== 'complete' && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    reset();
                    clearAssets();
                    setManualStep(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  🔄 Start Over
                </button>
              </div>
            )}

            {/* Content Library Integration */}
            {transcript && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900">Save to Content Library</h3>
                    <p className="text-sm text-blue-700">This transcript will be saved for future reuse</p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/content-library'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    📚 View Library
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Debug Panel - Always visible in development, or when there's an error */}
        <div className="mt-8">
          <DebugPanel 
            isVisible={import.meta.env.DEV || !!error || !!assetError}
            additionalInfo={{
              assetsGenerated: generatedAssets.length,
              isGeneratingAssets,
              assetError,
              userTier,
              remainingTokens
            }}
          />
        </div>

        {/* Development Info Footer */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
            <div className="font-semibold mb-2">🔧 Development Info:</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Current Step:</strong> {effectiveStep}<br/>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}<br/>
                <strong>Generating Assets:</strong> {isGeneratingAssets ? 'Yes' : 'No'}<br/>
                <strong>Has Error:</strong> {error || assetError ? 'Yes' : 'No'}<br/>
                <strong>User:</strong> {user?.email || 'Not logged in'}
              </div>
              <div>
                <strong>Backend URL:</strong> {import.meta.env.VITE_API_BASE_URL}<br/>
                <strong>User Tier:</strong> {userTier}<br/>
                <strong>Assets Count:</strong> {generatedAssets.length}<br/>
                <strong>Remaining Tokens:</strong> {remainingTokens}<br/>
                <strong>Session:</strong> {session ? 'Active' : 'None'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}