import React, { useState } from 'react';
import { Play, CheckCircle, AlertCircle, Clock } from 'lucide-react';

// REAL HOOKS - These will make the button work!
import { useVideo2Promo } from '../hooks/useVideo2Promo';
import { useAssetGeneration } from '../hooks/useAssetGeneration';
import { useUsageTracking } from '../hooks/useUsageTracking';
import useSupabase from '../hooks/useSupabase';

// Component imports
import ImprovedVideoUrlForm from '../components/Video2Promo/ImprovedVideoUrlForm';
import ImprovedProgress from '../components/Video2Promo/ImprovedProgress';
import AuthenticationRequired from '../components/Video2Promo/AuthenticationRequired';
import { StatusBanner, ProcessingStatus, ErrorDisplay, UsageStats } from '../components/Video2Promo/StatusComponents';

export default function Video2Promo() {
  const [manualStep, setManualStep] = useState(null);
  
  // REAL HOOKS - These connect to your Render API and Supabase
  const { user, session } = useSupabase();
  
  const { 
    currentStep, 
    loading, 
    error, 
    processingStage, 
    processVideo,           // ← This is the REAL function that calls Render API
    reset,
    transcript,
    extractedBenefits,
    generatedAssets,
    canRetry,
    retryExtraction,
    debug
  } = useVideo2Promo();
  
  const { 
    isGenerating: isGeneratingAssets, 
    error: assetError, 
    clearAssets 
  } = useAssetGeneration();
  
  const { 
    limits: usageData, 
    getRemainingLimits
  } = useUsageTracking();

  // Calculate remaining tokens from your usage tracking
  const remainingTokens = getRemainingLimits().daily_tokens;
  const effectiveStep = manualStep || currentStep;
  const userTier = user?.subscription_tier || 'free';

  const handleReset = () => {
    reset();
    clearAssets();
    setManualStep(null);
  };

  const handleVideoSubmit = async (youtubeUrl, formData) => {
    console.log('🚀 Processing video with REAL hooks:', youtubeUrl, formData);
    
    try {
      // This calls your REAL processVideo function that:
      // 1. Validates the YouTube URL
      // 2. Checks usage limits via useUsageTracking
      // 3. Calls https://aiworkers.onrender.com/api/video2promo/extract-transcript
      // 4. Uses your enhanced_extractor_v3.py with Webshare rotating proxies
      // 5. Updates the UI state (currentStep, transcript, etc.)
      
      const result = await processVideo(youtubeUrl, {
        keywords: formData.keywords,
        affiliate_link: formData.affiliate_link,
        utm_params: formData.utm_params,
        tone: formData.tone
      });
      
      console.log('✅ Video processing result:', result);
      
    } catch (error) {
      console.error('❌ Video processing failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
                <Play className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Video2Promo Generator
                </h1>
                <p className="text-gray-600 text-lg">Transform YouTube videos into comprehensive marketing campaigns</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  <span className="font-medium">Render API v4.0</span>
                </div>
              </div>
              {user && (
                <div className="text-sm text-gray-600">
                  <div className="font-medium capitalize">{userTier} Plan</div>
                  <div className="text-xs">{remainingTokens?.toLocaleString() || 0} tokens left</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user || !session ? (
          <AuthenticationRequired />
        ) : (
          <>
            <StatusBanner />
            <ImprovedProgress currentStep={effectiveStep} />
            
            <ProcessingStatus 
              processingStage={processingStage}
              isGeneratingAssets={isGeneratingAssets}
            />
            
            <ErrorDisplay 
              error={error}
              assetError={assetError}
              onReset={handleReset}
            />

            {/* Step Content */}
            <div className="space-y-8">
              {effectiveStep === 'input' && (
                <ImprovedVideoUrlForm
                  onSubmit={handleVideoSubmit}  // ← This now calls the REAL function
                  loading={loading}
                  disabled={false}
                />
              )}

              {effectiveStep === 'transcript' && transcript && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Extracted Transcript</h3>
                  <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-700 leading-relaxed">{transcript}</p>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                      📊 {transcript.split(' ').length} words extracted
                    </div>
                    <button
                      onClick={() => setManualStep('input')}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      Process Another Video
                    </button>
                  </div>
                </div>
              )}

              {effectiveStep === 'benefits' && extractedBenefits && extractedBenefits.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Extracted Benefits</h3>
                  <div className="space-y-3">
                    {extractedBenefits.map((benefit, index) => (
                      <div key={index} className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-green-800">{benefit}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setManualStep('input')}
                    className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Process Another Video
                  </button>
                </div>
              )}

              {effectiveStep === 'assets_complete' && generatedAssets && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Generated Marketing Assets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generatedAssets.emails && (
                      <div className="bg-blue-50 p-6 rounded-xl">
                        <h4 className="font-semibold text-blue-800 mb-3">Email Sequences</h4>
                        <p className="text-blue-700">{generatedAssets.emails.length} emails generated</p>
                      </div>
                    )}
                    {generatedAssets.socialPosts && (
                      <div className="bg-purple-50 p-6 rounded-xl">
                        <h4 className="font-semibold text-purple-800 mb-3">Social Media Posts</h4>
                        <p className="text-purple-700">{generatedAssets.socialPosts.length} posts created</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setManualStep('input')}
                    className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Start New Video
                  </button>
                </div>
              )}

              {effectiveStep !== 'input' && effectiveStep !== 'transcript' && effectiveStep !== 'benefits' && effectiveStep !== 'assets_complete' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <div className="text-6xl mb-4">⚡</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing: {effectiveStep}</h3>
                  <p className="text-gray-600">Your video is being processed by our AI systems...</p>
                  <div className="mt-4 flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-blue-600">Working with Render API v4.0</span>
                  </div>
                  {debug && debug.processingStage && (
                    <div className="mt-3 text-sm text-gray-500">
                      {debug.processingStage}
                    </div>
                  )}
                </div>
              )}
            </div>

            <UsageStats 
              userTier={userTier}
              usageData={usageData}
              remainingTokens={remainingTokens}
            />
            
            {/* Debug Info for Development */}
            {debug && import.meta.env.MODE === 'production' && (
              <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Debug Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Backend Status</div>
                    <div className={`${debug.backendStatus === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                      {debug.backendStatus}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Proxy Status</div>
                    <div className={`${debug.proxyStatus === 'configured' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {debug.proxyStatus}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Retry Count</div>
                    <div className="text-gray-600">{debug.retryCount}/3</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Backend URL</div>
                    <div className="text-gray-600 text-xs">{debug.backendUrl}</div>
                  </div>
                </div>
                {canRetry && (
                  <button
                    onClick={() => retryExtraction(debug.videoUrl || '')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    🔄 Retry Extraction ({3 - debug.retryCount} attempts left)
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}