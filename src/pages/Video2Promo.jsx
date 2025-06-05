import React, { useState } from 'react';
import { Play, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import VideoUrlForm from '../components/Video2Promo/VideoUrlForm';
import ImprovedProgress from '../components/Video2Promo/ImprovedProgress';
import AuthenticationRequired from '../components/Video2Promo/AuthenticationRequired';
import { StatusBanner, ProcessingStatus, ErrorDisplay, UsageStats } from '../components/Video2Promo/StatusComponents';

// Mock hooks for demonstration - only return what we use
const useVideo2Promo = () => ({
  currentStep: 'input',
  loading: false,
  error: null,
  processingStage: null,
  processVideo: () => {},
  reset: () => {}
});

const useAssetGeneration = () => ({
  isGenerating: false,
  error: null,
  clearAssets: () => {}
});

const useUsageTracking = () => ({
  usageData: { monthly_tokens_used: 1250 },
  remainingTokens: 8750
});

const useSupabase = () => ({
  user: { email: 'user@example.com', subscription_tier: 'pro' },
  session: { access_token: 'token' }
});

export default function Video2Promo() {
  const [manualStep, setManualStep] = useState(null);
  
  const { user, session } = useSupabase();
  const { currentStep, loading, error, processingStage, processVideo, reset } = useVideo2Promo();
  const { isGenerating: isGeneratingAssets, error: assetError, clearAssets } = useAssetGeneration();
  const { usageData, remainingTokens } = useUsageTracking();

  const effectiveStep = manualStep || currentStep;
  const userTier = user?.subscription_tier || 'free';

  const handleReset = () => {
    reset();
    clearAssets();
    setManualStep(null);
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
                  <span className="font-medium">Backend API v4.0</span>
                </div>
              </div>
              {user && (
                <div className="text-sm text-gray-600">
                  <div className="font-medium capitalize">{userTier} Plan</div>
                  <div className="text-xs">{remainingTokens.toLocaleString()} tokens left</div>
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
                <VideoUrlForm
                  onSubmit={processVideo}
                  loading={loading}
                  disabled={false}
                />
              )}

              {effectiveStep !== 'input' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Step: {effectiveStep}</h3>
                  <p className="text-gray-600">This step is being processed...</p>
                  <button
                    onClick={() => setManualStep('input')}
                    className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Back to Input
                  </button>
                </div>
              )}
            </div>

            <UsageStats 
              userTier={userTier}
              usageData={usageData}
              remainingTokens={remainingTokens}
            />
          </>
        )}
      </div>
    </div>
  );
}