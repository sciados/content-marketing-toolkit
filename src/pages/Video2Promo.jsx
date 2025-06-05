import React, { useState } from 'react';
import { Play, Target, Link, Settings, Zap, CheckCircle, AlertCircle, Clock, Sparkles, X } from 'lucide-react';

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

// const useToast = () => ({
//  showToast: () => {}
// });

const useSupabase = () => ({
  user: { email: 'user@example.com', subscription_tier: 'pro' },
  session: { access_token: 'token' }
});

// Improved VideoUrlForm Component
const ImprovedVideoUrlForm = ({ onSubmit, loading, disabled }) => {
  const [formData, setFormData] = useState({
    youtube_url: 'https://youtube.com/watch?v=example',
    keywords: ['marketing', 'sales', 'conversion', 'leads'],
    affiliate_link: 'https://example.com/product',
    utm_params: {
      source: 'email, social, newsletter',
      medium: 'drip, campaign, promoter',
      campaign: 'video_promo_jan2025',
      content: 'email1, blog_post, newsletter'
    },
    tone: 'friendly'
  });

  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData.youtube_url, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Video URL Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4">
          <div className="flex items-center space-x-3 text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">YouTube Video URL</h3>
              <p className="text-sm text-purple-100">Enter the video you want to transform</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="relative">
            <input
              type="url"
              value={formData.youtube_url}
              onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
              className="w-full px-4 py-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg"
              placeholder="https://youtube.com/watch?v=..."
              disabled={loading || disabled}
            />
            <Play className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
            <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Video Requirements</p>
              <ul className="space-y-1 text-blue-600">
                <li>• Must have captions/subtitles enabled</li>
                <li>• English captions work best</li>
                <li>• Longer videos (5+ minutes) provide better results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Marketing Keywords</h3>
                <p className="text-sm text-blue-100">Focus the AI on your target market</p>
              </div>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Optional</span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add keyword..."
              disabled={loading || disabled}
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              Add
            </button>
          </div>
          
          {formData.keywords.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Current Keywords ({formData.keywords.length})</p>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-2 rounded-xl text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Keywords help the AI focus on your target market and improve content relevance. 
              You can paste multiple keywords separated by commas.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Settings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Affiliate Link */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3">
            <div className="flex items-center space-x-3 text-white">
              <Link className="h-4 w-4" />
              <h3 className="font-medium">Affiliate Link</h3>
            </div>
          </div>
          <div className="p-6">
            <input
              type="url"
              value={formData.affiliate_link}
              onChange={(e) => setFormData(prev => ({ ...prev, affiliate_link: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="https://example.com/product"
              disabled={loading || disabled}
            />
            <p className="text-sm text-gray-500 mt-2">Optional - Link to include in generated content</p>
          </div>
        </div>

        {/* Content Tone */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3">
            <div className="flex items-center space-x-3 text-white">
              <Zap className="h-4 w-4" />
              <h3 className="font-medium">Content Tone</h3>
            </div>
          </div>
          <div className="p-6">
            <select
              value={formData.tone}
              onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
              disabled={loading || disabled}
            >
              <option value="friendly">Friendly & Conversational</option>
              <option value="professional">Professional & Authoritative</option>
              <option value="casual">Casual & Approachable</option>
              <option value="formal">Formal & Corporate</option>
              <option value="enthusiastic">Enthusiastic & Energetic</option>
            </select>
          </div>
        </div>
      </div>

      {/* UTM Parameters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">UTM Parameters</h3>
                <p className="text-sm text-orange-100">Advanced tracking options</p>
              </div>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Optional</span>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <input
                type="text"
                value={formData.utm_params.source}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  utm_params: { ...prev.utm_params, source: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="email, social, newsletter"
                disabled={loading || disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medium</label>
              <input
                type="text"
                value={formData.utm_params.medium}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  utm_params: { ...prev.utm_params, medium: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="drip, campaign, promoter"
                disabled={loading || disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign</label>
              <input
                type="text"
                value={formData.utm_params.campaign}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  utm_params: { ...prev.utm_params, campaign: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="video_promo_jan2025"
                disabled={loading || disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <input
                type="text"
                value={formData.utm_params.content}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  utm_params: { ...prev.utm_params, content: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="email1, blog_post, newsletter"
                disabled={loading || disabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-1 shadow-lg">
        <button
          type="submit"
          disabled={loading || disabled || !formData.youtube_url}
          className="w-full bg-white text-gray-800 font-semibold py-4 px-6 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span>Analyzing Video...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span>Analyze Video & Extract Benefits</span>
              <Play className="h-5 w-5 text-blue-600" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Improved Progress Component
const ImprovedProgress = ({ currentStep, total = 7 }) => {
  const steps = [
    { id: 'input', name: 'Input', icon: Play },
    { id: 'transcript', name: 'Extract', icon: Target },
    { id: 'benefits', name: 'Benefits', icon: CheckCircle },
    { id: 'asset_generation', name: 'Generate', icon: Sparkles },
    { id: 'assets_complete', name: 'Assets', icon: Zap },
    { id: 'email_generation', name: 'Emails', icon: Link },
    { id: 'complete', name: 'Complete', icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Progress</h2>
        <span className="text-sm text-gray-500">
          Step {currentIndex + 1} of {total}
        </span>
      </div>
      
      <div className="relative">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                      ${isActive
                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110'
                        : isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`
                      mt-2 text-xs font-medium transition-colors
                      ${isActive
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                      }
                    `}
                  >
                    {step.name}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-2 transition-colors duration-300
                      ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Authentication Required Component
const AuthenticationRequired = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <span className="text-white text-3xl">🔐</span>
    </div>
    <h2 className="text-3xl font-bold text-gray-800 mb-4">
      Welcome to Video2Promo
    </h2>
    <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
      Please sign in to transform your YouTube videos into comprehensive marketing campaigns
    </p>
    <div className="flex gap-4 justify-center">
      <button
        onClick={() => window.location.href = '/login'}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold transition-all shadow-lg"
      >
        Sign In
      </button>
      <button
        onClick={() => window.location.href = '/register'}
        className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
      >
        Create Account
      </button>
    </div>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div className="p-4 bg-green-50 rounded-xl">
        <div className="text-green-600 font-semibold mb-2">✅ Free Tier</div>
        <p className="text-green-700">1 Video2Promo project per month</p>
      </div>
      <div className="p-4 bg-purple-50 rounded-xl">
        <div className="text-purple-600 font-semibold mb-2">🚀 Pro Tier</div>
        <p className="text-purple-700">15+ projects with advanced features</p>
      </div>
    </div>
  </div>
);

// Main Component
export default function ImprovedVideo2Promo() {
  const [manualStep, setManualStep] = useState(null);
  
  const { user, session } = useSupabase();
  const { currentStep, loading, error, processingStage, processVideo, reset } = useVideo2Promo();
  const { isGenerating: isGeneratingAssets, error: assetError, clearAssets } = useAssetGeneration();
  const { usageData, remainingTokens } = useUsageTracking();

  const effectiveStep = manualStep || currentStep;
  const userTier = user?.subscription_tier || 'free';

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
            {/* Enhanced Status Banner */}
            <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-800">Webshare Rotating Proxies Active</div>
                    <div className="text-sm text-green-600">95-100% Success Rate • Real-time Processing</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-700">AI Generation</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">Usage Tracking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <ImprovedProgress currentStep={effectiveStep} />

            {/* Processing Status */}
            {(processingStage || isGeneratingAssets) && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-800 text-lg">
                      {isGeneratingAssets ? 'Generating marketing assets...' : processingStage}
                    </div>
                    <div className="text-blue-600">Processing with AI backend • This may take 30-60 seconds</div>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Backend API
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {(error || assetError) && (
              <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-red-800 text-lg mb-2">Backend Processing Error</div>
                    <p className="text-red-700 mb-4">{error || assetError}</p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          reset();
                          clearAssets();
                          setManualStep(null);
                        }}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-colors font-medium"
                      >
                        🔄 Start Over
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Content */}
            <div className="space-y-8">
              {effectiveStep === 'input' && (
                <ImprovedVideoUrlForm
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

            {/* Usage Stats */}
            {usageData && (
              <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{userTier}</div>
                    <div className="text-sm text-gray-600">Current Plan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{usageData.monthly_tokens_used.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Tokens Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{remainingTokens.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Tokens Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">4.0</div>
                    <div className="text-sm text-gray-600">Backend Version</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}