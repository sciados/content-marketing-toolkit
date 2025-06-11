// src/pages/tools/Video2PromoPage.jsx - MERGED VERSION
// Preserves all existing functionality + adds ToolLayout integration + new architecture

import React, { useState } from 'react';
import { Play, CheckCircle, AlertCircle, Clock, Target, Sparkles, ChevronLeft, ChevronRight, Zap, Video, Globe } from 'lucide-react';

// 🚀 ENHANCED: Use new merged hooks
import { useVideoProcessing } from '../../tools/video2promo/hooks/useVideoProcessing';
import { useContentProcessing } from '../../shared/hooks/useContentProcessing';
// 🚀 ENHANCED: Use your existing shared structure
import { useUsageTracking } from '../../shared/hooks/useUsageTracking';
import { useAuth } from '../../shared/hooks/useAuth';

// 🚀 ENHANCED: Use your existing validation utils
import { validateVideoUrl, getPlatformProcessingInfo, SUPPORTED_PLATFORMS } from '../../shared/utils/videoUrlValidation';

// 🚀 ENHANCED: Use your existing shared components
import ImprovedProgress from '../../tools/video2promo/components/ImprovedProgress';
import AuthenticationRequired from '../../tools/video2promo/components/AuthenticationRequired';
import { StatusBanner, ProcessingStatus, ErrorDisplay, UsageStats } from '../../tools/video2promo/components/StatusComponents';
import KeywordVideoExtraction from '../../tools/video2promo/components/KeywordVideoExtraction';

// 🆕 NEW: ToolLayout integration for multi-tool navigation
import { ToolLayout } from '../../layouts/ToolLayout';

// 🆕 NEW: Enhanced components (optional integration)
import { VideoUrlInput } from '../../tools/video2promo/components/VideoUrlInput';
import { CacheStatusIndicator } from '../../shared/components/analytics/CacheStatusIndicator';

// ✅ PRESERVED: Your StandardExtractionWizard component (unchanged functionality)
function StandardExtractionWizard({ onSubmit, loading }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    videoUrl: '',
    keywords: '',
    affiliateLink: '',
    tone: 'professional',
    targetAudience: '',
    campaignName: ''
  });

  // ✅ PRESERVED: Your URL validation state
  const [urlValidation, setUrlValidation] = useState({ isValid: false, error: null, platform: null });

  const steps = [
    { id: 1, title: 'Video Source', description: 'Add your video URL', icon: Video, color: 'bg-blue-500' },
    { id: 2, title: 'Keywords', description: 'Define your focus', icon: Target, color: 'bg-green-500' },
    { id: 3, title: 'Affiliate Link', description: 'Monetization setup', icon: Sparkles, color: 'bg-purple-500' },
    { id: 4, title: 'Content Style', description: 'Tone & audience', icon: CheckCircle, color: 'bg-orange-500' },
    { id: 5, title: 'Campaign Setup', description: 'Final details', icon: Zap, color: 'bg-red-500' }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Business-focused, authoritative' },
    { value: 'friendly', label: 'Friendly', description: 'Conversational, approachable' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic, exciting' },
    { value: 'educational', label: 'Educational', description: 'Informative, clear' },
    { value: 'persuasive', label: 'Persuasive', description: 'Sales-focused, compelling' }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // ✅ PRESERVED: Your URL validation logic
    if (field === 'videoUrl') {
      const validation = validateVideoUrl(value);
      setUrlValidation(validation);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ✅ PRESERVED: Your validation logic
  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.videoUrl.trim() && urlValidation.isValid;
      case 2: return true; // Keywords optional
      case 3: return true; // Affiliate link optional
      case 4: return formData.tone;
      case 5: return formData.campaignName.trim();
      default: return true;
    }
  };

  const handleSubmit = () => {
    // ✅ PRESERVED: Your existing submit logic with platform detection
    onSubmit(formData.videoUrl, {
      keywords: formData.keywords,
      affiliate_link: formData.affiliateLink,
      tone: formData.tone,
      target_audience: formData.targetAudience,
      campaign_name: formData.campaignName,
      platform: urlValidation.platform // Platform info preserved
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="mx-auto h-16 w-16 text-blue-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Your Video</h3>
              <p className="text-gray-600">Enter the URL from any supported video platform</p>
            </div>
            
            {/* 🆕 OPTIONAL: Enhanced VideoUrlInput (can be enabled later) */}
            {/* Set useEnhancedInput to true to enable enhanced input */}
            {(() => {
              const useEnhancedInput = false; // Set to true to enable enhanced input
              return useEnhancedInput && (
                <VideoUrlInput
                  value={formData.videoUrl}
                  onChange={(value) => updateFormData('videoUrl', value)}
                  validation={urlValidation}
                  onValidationChange={setUrlValidation}
                />
              );
            })()}
            
            {/* ✅ PRESERVED: Your existing URL input (default active) */}
            {(() => {
              const useStandardInput = true; // Default to your existing input
              return useStandardInput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video URL *</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => updateFormData('videoUrl', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      formData.videoUrl && !urlValidation.isValid 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  
                  {/* ✅ PRESERVED: Your validation feedback */}
                  {formData.videoUrl && !urlValidation.isValid && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {urlValidation.error}
                    </p>
                  )}
                  
                  {/* ✅ PRESERVED: Your platform detection display */}
                  {formData.videoUrl && urlValidation.isValid && (
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>✅ {urlValidation.platform} video detected</span>
                      {/* 🆕 NEW: Optional cache status indicator */}
                      <CacheStatusIndicator url={formData.videoUrl} className="ml-2" />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ✅ PRESERVED: Your platform-specific processing info */}
            {urlValidation.isValid && urlValidation.platform && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  📊 {urlValidation.platform} Processing Info:
                </h4>
                {(() => {
                  const info = getPlatformProcessingInfo(urlValidation.platform);
                  return (
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>• {info.description}</p>
                      <p>• Expected processing time: {info.avgTime}</p>
                      {info.notes.map((note, idx) => (
                        <p key={idx}>• {note}</p>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ✅ PRESERVED: Your supported platforms display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">🌍 Supported Platforms:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
                {SUPPORTED_PLATFORMS.map((platform) => (
                  <div key={platform.name} className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    {platform.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Marketing Keywords</h3>
              <p className="text-gray-600">Define the key topics you want to focus on</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (Optional)</label>
              <textarea
                value={formData.keywords}
                onChange={(e) => updateFormData('keywords', e.target.value)}
                placeholder="email marketing, lead generation, conversion optimization..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">Separate keywords with commas. Leave blank to extract all content.</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="mx-auto h-16 w-16 text-purple-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Affiliate Link</h3>
              <p className="text-gray-600">Monetize your content with affiliate links</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Affiliate Link (Optional)</label>
              <input
                type="url"
                value={formData.affiliateLink}
                onChange={(e) => updateFormData('affiliateLink', e.target.value)}
                placeholder="https://your-affiliate-link.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">This link will be integrated into your generated content</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Content Style</h3>
              <p className="text-gray-600">Define the tone and target audience</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Content Tone *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {toneOptions.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="tone"
                        value={option.value}
                        checked={formData.tone === option.value}
                        onChange={(e) => updateFormData('tone', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg transition-all ${
                        formData.tone === option.value 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience (Optional)</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => updateFormData('targetAudience', e.target.value)}
                  placeholder="Small business owners, marketing professionals..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Zap className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Campaign Setup</h3>
              <p className="text-gray-600">Final details before processing</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
              <input
                type="text"
                value={formData.campaignName}
                onChange={(e) => updateFormData('campaignName', e.target.value)}
                placeholder="Q1 Product Launch Campaign"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* ✅ PRESERVED: Your processing summary */}
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">📋 Ready to Process:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Video: {formData.videoUrl ? `✅ ${urlValidation.platform || 'Platform'} video added` : '❌ Missing'}</li>
                <li>• Keywords: {formData.keywords ? '✅ Added' : '⚪ Optional'}</li>
                <li>• Affiliate Link: {formData.affiliateLink ? '✅ Added' : '⚪ Optional'}</li>
                <li>• Tone: {formData.tone ? '✅ Selected' : '❌ Missing'}</li>
                <li>• Campaign: {formData.campaignName ? '✅ Named' : '❌ Missing'}</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ✅ PRESERVED: Your complete wizard UI (unchanged)
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center relative">
                {index < steps.length - 1 && (
                  <div className={`absolute top-6 left-full w-full h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} style={{ width: '100%', marginLeft: '2rem' }} />
                )}
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isActive 
                    ? `${step.color} text-white scale-110` 
                    : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-sm text-gray-500">Step {currentStep} of {steps.length}</div>

        {currentStep === steps.length ? (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className={`flex items-center space-x-2 px-8 py-3 rounded-lg transition-colors ${
              canProceed() && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              canProceed()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// 🚀 MAIN COMPONENT: Enhanced with ToolLayout wrapper
function Video2PromoPage() {
  const [extractionMode, setExtractionMode] = useState('standard');
  const [manualStep, setManualStep] = useState(null);
  
  const { user, session } = useAuth();
  
  // 🚀 ENHANCED: Use merged hooks with enhanced capabilities
  const { 
    currentStep, 
    loading, 
    error, 
    processingStage, 
    processVideo,
    reset,
    transcript,
    // cacheInfo,
    // platformInfo
  } = useVideoProcessing();
  
  const { 
    isGenerating: isGeneratingAssets, 
    error: assetError, 
    clearAssets,
    // costSavingsTotal,
    // performance
  } = useContentProcessing();
  
  const { 
    limits: usageData, 
    getRemainingLimits
  } = useUsageTracking();

  const remainingTokens = getRemainingLimits().daily_tokens;
  const effectiveStep = manualStep || currentStep;
  const userTier = user?.subscription_tier || 'free';

  const handleReset = () => {
    reset();
    clearAssets();
    setManualStep(null);
  };

  const handleVideoSubmit = async (videoUrl, formData) => {
    console.log('🚀 Processing video with wizard data:', videoUrl, formData);
    
    try {
      const result = await processVideo(videoUrl, {
        keywords: formData.keywords,
        affiliate_link: formData.affiliate_link,
        utm_params: formData.utm_params,
        tone: formData.tone,
        target_audience: formData.target_audience,
        campaign_name: formData.campaign_name,
        platform: formData.platform // Platform info preserved
      });
      
      console.log('✅ Video processing result:', result);
      
    } catch (error) {
      console.error('❌ Video processing failed:', error);
    }
  };

  // ✅ PRESERVED: Your complete Video2Promo content
  const renderVideo2PromoContent = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ✅ PRESERVED: Your header (modified for ToolLayout integration) */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Video2Promo Generator
                </h1>
                <p className="text-gray-600 text-lg">Transform videos from any platform into comprehensive marketing campaigns</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  <span className="font-medium">Multi-Platform Ready</span>
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
          
          {/* ✅ PRESERVED: Your mode selector */}
          <div className="mt-6 flex space-x-4">
            <button 
              onClick={() => setExtractionMode('standard')}
              className={`px-6 py-3 rounded-lg transition-all flex items-center font-medium ${
                extractionMode === 'standard' 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
              }`}
            >
              <Play className="h-4 w-4 mr-2" />
              Standard Extraction
              {extractionMode === 'standard' && (
                <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">Active</span>
              )}
            </button>
            
            <button 
              onClick={() => setExtractionMode('keyword')}
              className={`px-6 py-3 rounded-lg transition-all flex items-center font-medium ${
                extractionMode === 'keyword' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105' 
                  : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
              }`}
            >
              <Target className="h-4 w-4 mr-2" />
              <Sparkles className="h-4 w-4 mr-1" />
              AI Keyword Extraction
              {extractionMode === 'keyword' && (
                <span className="ml-2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">Active</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user || !session ? (
          <AuthenticationRequired />
        ) : (
          <>
            {extractionMode === 'standard' ? (
              <>
                <StatusBanner />
                
                {/* ✅ PRESERVED: Your wizard and processing logic */}
                {effectiveStep === 'input' ? (
                  <StandardExtractionWizard 
                    onSubmit={handleVideoSubmit}
                    loading={loading}
                  />
                ) : (
                  <>
                    <ImprovedProgress currentStep={effectiveStep} />
                    <ProcessingStatus processingStage={processingStage} isGeneratingAssets={isGeneratingAssets} />
                    <ErrorDisplay error={error} assetError={assetError} onReset={handleReset} />

                    {/* ✅ PRESERVED: Your result display components */}
                    <div className="space-y-8">
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

                      {/* Add your other result components here */}
                    </div>
                  </>
                )}

                <UsageStats userTier={userTier} usageData={usageData} remainingTokens={remainingTokens} />
              </>
            ) : (
              <>
                {/* ✅ PRESERVED: Your keyword extraction mode */}
                <KeywordVideoExtraction />
                
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setExtractionMode('standard')}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                  >
                    ← Switch to Standard Extraction
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  // 🆕 NEW: Tool configuration for ToolLayout
  const toolConfig = {
    id: 'video2promo',
    name: 'Video2Promo',
    description: 'Transform videos into marketing content',
    icon: 'Video',
    color: 'red',
    status: 'active'
  };

  // 🚀 RETURN: Wrapped in ToolLayout for multi-tool navigation
  return (
    <ToolLayout toolConfig={toolConfig}>
      {renderVideo2PromoContent()}
    </ToolLayout>
  );
}

export default Video2PromoPage;