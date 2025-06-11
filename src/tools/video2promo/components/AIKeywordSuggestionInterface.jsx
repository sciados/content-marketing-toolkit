// Updated AIKeywordSuggestionInterface.jsx - Multi-Platform Support
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Brain, Target, Clock, CheckCircle, Lightbulb, Globe } from 'lucide-react';
import { useAuth } from '../shared/hooks/useAuth';
import { validateVideoUrl, SUPPORTED_PLATFORMS } from '../../utils/videoUrlValidation';

const AIKeywordSuggestionInterface = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [userIntent, setUserIntent] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordDetails, setKeywordDetails] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState(null);

  // 🆕 NEW: URL validation state
  const [urlValidation, setUrlValidation] = useState({ isValid: false, error: null, platform: null });

  const { session, user } = useAuth();

  useEffect(() => {
    console.log('🔍 Auth Debug:');
    console.log('Session:', session);
    console.log('User:', user);
    console.log('Access Token:', session?.access_token ? 'Present' : 'Missing');
  }, [session, user]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://aiworkers.onrender.com';

  // 🆕 NEW: Handle URL changes with validation
  const handleUrlChange = (value) => {
    setVideoUrl(value);
    const validation = validateVideoUrl(value);
    setUrlValidation(validation);
    setError(null); // Clear previous errors when URL changes
  };

  const intentOptions = [
    { value: '', label: 'Any content (let AI decide)', icon: '🤖' },
    { value: 'marketing', label: 'Marketing & Sales strategies', icon: '📈' },
    { value: 'tutorial', label: 'Tutorial & How-to steps', icon: '🎓' },
    { value: 'business', label: 'Business & Entrepreneurship', icon: '💼' },
    { value: 'technology', label: 'Technology & Tools', icon: '⚙️' },
    { value: 'education', label: 'Education & Training', icon: '📚' }
  ];

  const getAIKeywordSuggestions = async () => {
    if (!videoUrl) return;
    
    // 🆕 NEW: Validate URL before processing
    if (!urlValidation.isValid) {
      setError(urlValidation.error || 'Please enter a valid video URL from a supported platform');
      return;
    }
    
    if (!session || !user) {
      setError('Please log in to use AI keyword suggestions');
      console.error('❌ Missing session or user:', { session: !!session, user: !!user });
      return;
    }
    
    setIsAnalyzing(true);
    setShowSuggestions(false);
    setError(null);
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Add authorization header
      let authToken = null;
      
      if (session?.access_token) {
        authToken = session.access_token;
        console.log('✅ Found token in session.access_token');
      } else if (session?.token) {
        authToken = session.token;
        console.log('✅ Found token in session.token');
      } else if (session?.user?.access_token) {
        authToken = session.user.access_token;
        console.log('✅ Found token in session.user.access_token');
      } else if (user?.access_token) {
        authToken = user.access_token;
        console.log('✅ Found token in user.access_token');
      } else {
        console.error('❌ No auth token found in any location');
        setError('Authentication token not found. Please log out and log back in.');
        return;
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log('🔐 Using auth token');
      }

      console.log('🔐 Making authenticated request to:', `${API_BASE_URL}/api/video2promo/suggest-keywords`);

      // 🆕 NEW: Include platform information in request
      const requestBody = {
        videoUrl,
        userIntent: userIntent || null,
        platform: urlValidation.platform // Include detected platform
      };

      const response = await fetch(`${API_BASE_URL}/api/video2promo/suggest-keywords`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      console.log('📡 AI Keyword Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AI Keyword Response error:', errorText);
        
        if (response.status === 401) {
          throw new Error(`Authentication failed. Please log out and log back in.`);
        } else if (response.status === 500) {
          throw new Error(`Server error: AI keyword suggestion may not be available for ${urlValidation.platform} videos yet.`);
        } else if (response.status === 503) {
          throw new Error(`Service unavailable: AI keyword suggestions are temporarily unavailable.`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('✅ AI Keyword Response data:', data);
      
      if (data.success) {
        setSuggestedKeywords(data.data.suggested_keywords || []);
        setKeywordDetails({
          ...data.data,
          platform: urlValidation.platform // Add platform to keyword details
        });
        setShowSuggestions(true);
      } else {
        throw new Error(data.error || 'Keyword suggestion failed');
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      setError(`AI keyword analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleKeyword = (keyword) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const selectTopKeywords = () => {
    const topKeywords = suggestedKeywords.slice(0, 5);
    setSelectedKeywords(topKeywords);
  };

  const clearAllKeywords = () => {
    setSelectedKeywords([]);
  };

  const startTargetedExtraction = () => {
    console.log('Starting extraction with keywords:', selectedKeywords);
    console.log('Platform:', urlValidation.platform);
    
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({
        type: 'START_TARGETED_EXTRACTION',
        keywords: selectedKeywords,
        videoUrl: videoUrl,
        platform: urlValidation.platform // 🆕 NEW: Include platform info
      }, '*');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* 🚀 UPDATED: Multi-platform Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Sparkles className="h-8 w-8 text-purple-600 mr-3" />
          AI Keyword Suggestions
        </h1>
        <p className="text-gray-600">
          Let AI analyze videos from any platform and suggest the most relevant keywords for extraction
        </p>
        
        {/* Auth Status */}
        <div className="mt-3 text-sm">
          <span className="text-gray-500">Backend: </span>
          <span className="text-green-600 font-medium">{API_BASE_URL}</span>
          {user && (
            <>
              <span className="text-gray-500 ml-4">User: </span>
              <span className="text-blue-600 font-medium">{user.email}</span>
            </>
          )}
          {!session && (
            <span className="text-red-600 font-medium ml-4">⚠️ Not authenticated</span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">AI Analysis Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 UPDATED: Step 1 - Multi-platform Video URL + Intent */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="h-5 w-5 text-blue-600 mr-2" />
          Step 1: Video Analysis Setup
        </h2>
        
        {/* 🚀 UPDATED: Multi-platform Video URL */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              videoUrl && !urlValidation.isValid 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          
          {/* 🆕 NEW: Platform detection and validation feedback */}
          {videoUrl && !urlValidation.isValid && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {urlValidation.error}
            </p>
          )}
          
          {videoUrl && urlValidation.isValid && (
            <div className="mt-2 flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>✅ {urlValidation.platform} video detected</span>
            </div>
          )}

          {/* 🆕 NEW: Supported platforms display */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
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

        {/* User Intent - Same as before */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What are you looking for? (Optional - helps AI focus)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {intentOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setUserIntent(option.value)}
                className={`p-3 text-left border-2 rounded-lg transition-all ${
                  userIntent === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-2">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 🚀 UPDATED: Analyze Button with platform validation */}
        {!session ? (
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">Please log in to use AI keyword suggestions</p>
            <p className="text-yellow-600 text-sm mt-1">You need to be authenticated to access this feature</p>
          </div>
        ) : (
          <button
            onClick={getAIKeywordSuggestions}
            disabled={!videoUrl || !urlValidation.isValid || isAnalyzing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all"
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center">
                <Brain className="animate-pulse h-5 w-5 mr-3" />
                Analyzing {urlValidation.platform || ''} video with AI...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Sparkles className="h-5 w-5 mr-3" />
                🧠 Get AI Keyword Suggestions
              </div>
            )}
          </button>
        )}
      </div>

      {/* 🚀 UPDATED: Step 2 - AI Suggestions with platform info */}
      {showSuggestions && keywordDetails && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 text-green-600 mr-2" />
            Step 2: AI-Generated Keyword Suggestions
            {keywordDetails.platform && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {keywordDetails.platform}
              </span>
            )}
          </h2>

          {/* 🚀 UPDATED: Video Analysis Summary with platform info */}
          <div className="mb-6 p-4 bg-white rounded-lg border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Video Analysis:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Platform:</span>
                <p className="text-gray-600">{keywordDetails.platform || 'Unknown'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Title:</span>
                <p className="text-gray-600">{keywordDetails.video_metadata?.title || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <p className="text-gray-600">
                  {Math.floor((keywordDetails.video_metadata?.duration || 0) / 60)} minutes
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">AI Confidence:</span>
                <p className="text-gray-600">{(keywordDetails.confidence_score * 100).toFixed(1)}%</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Suggestions Found:</span>
                <p className="text-gray-600">{keywordDetails.total_suggestions} keywords</p>
              </div>
            </div>
          </div>

          {/* AI Extraction Focus */}
          {keywordDetails.extraction_focus && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 AI Recommendation:</h4>
              <p className="text-blue-800 text-sm">{keywordDetails.extraction_focus}</p>
            </div>
          )}

          {/* Keyword Selection - Same as before */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Select Keywords for Extraction:</h3>
              <div className="space-x-2">
                <button
                  onClick={selectTopKeywords}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  Select Top 5
                </button>
                <button
                  onClick={clearAllKeywords}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {keywordDetails.keyword_details?.map((kw, index) => (
                <div
                  key={index}
                  onClick={() => toggleKeyword(kw.keyword)}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedKeywords.includes(kw.keyword)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        {selectedKeywords.includes(kw.keyword) && (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        )}
                        <span className="font-medium text-gray-900">{kw.keyword}</span>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {kw.reason}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          kw.type === 'primary' ? 'bg-purple-100 text-purple-700' :
                          kw.type === 'secondary' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {kw.type}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(kw.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Keywords Summary */}
          {selectedKeywords.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">
                🎯 Selected Keywords ({selectedKeywords.length}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 🚀 UPDATED: Expected Performance with platform context */}
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">
              ⚡ Expected Performance for {keywordDetails.platform}:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-purple-800">Processing Time:</span>
                <div className="text-purple-700">
                  {selectedKeywords.length > 0 ? '2-4 minutes' : 'Select keywords first'}
                </div>
              </div>
              <div>
                <span className="font-medium text-purple-800">Relevance:</span>
                <div className="text-purple-700">
                  {selectedKeywords.length > 0 ? '90-95% relevant' : 'High relevance expected'}
                </div>
              </div>
              <div>
                <span className="font-medium text-purple-800">Content Focus:</span>
                <div className="text-purple-700">
                  {selectedKeywords.length > 0 ? 'Keyword-specific extraction' : 'Choose keywords to proceed'}
                </div>
              </div>
            </div>
          </div>

          {/* Start Extraction Button */}
          <button
            onClick={startTargetedExtraction}
            disabled={selectedKeywords.length === 0}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all"
          >
            {selectedKeywords.length === 0 ? (
              'Select keywords to start extraction'
            ) : (
              <div className="flex items-center justify-center">
                <Target className="h-5 w-5 mr-3" />
                🚀 Start Targeted Extraction ({selectedKeywords.length} keywords)
              </div>
            )}
          </button>
        </div>
      )}

      {/* Manual Keywords Option - Same as before */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Search className="h-5 w-5 text-gray-600 mr-2" />
          Alternative: Manual Keywords
        </h2>
        <p className="text-gray-600 mb-4">
          Prefer to enter your own keywords? You can skip AI suggestions and add manual keywords.
        </p>
        
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Enter keyword and press Enter"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                const keyword = e.target.value.trim();
                if (!selectedKeywords.includes(keyword)) {
                  setSelectedKeywords(prev => [...prev, keyword]);
                }
                e.target.value = '';
              }
            }}
          />
          <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
            Add Keyword
          </button>
        </div>

        {/* Quick keyword templates */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick add popular keywords:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'marketing strategy', 'lead generation', 'conversion optimization', 
              'sales funnel', 'customer retention', 'email marketing', 'social media',
              'content creation', 'SEO tips', 'business growth'
            ].map((template) => (
              <button
                key={template}
                onClick={() => {
                  if (!selectedKeywords.includes(template)) {
                    setSelectedKeywords(prev => [...prev, template]);
                  }
                }}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                + {template}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🚀 UPDATED: Benefits Section with multi-platform context */}
      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Why Use AI Keyword Suggestions?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start">
              <Brain className="h-5 w-5 text-purple-600 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Universal Platform Analysis</h4>
                <p className="text-sm text-gray-600">AI analyzes videos from YouTube, Vimeo, TikTok, and more to find the most relevant topics</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-blue-600 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Save Time</h4>
                <p className="text-sm text-gray-600">No need to watch the entire video to know what keywords to use, regardless of platform</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start">
              <Target className="h-5 w-5 text-green-600 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Better Results</h4>
                <p className="text-sm text-gray-600">Get 90-95% relevant content instead of sifting through everything</p>
              </div>
            </div>
            <div className="flex items-start">
              <Globe className="h-5 w-5 text-indigo-600 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Multi-Platform Support</h4>
                <p className="text-sm text-gray-600">Works with all major video platforms - one tool for all your content</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIKeywordSuggestionInterface;