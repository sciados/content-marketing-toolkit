import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Brain, Target, Clock, CheckCircle, Lightbulb } from 'lucide-react';
import useSupabase from '../../hooks/useSupabase'; // Add authentication hook

const AIKeywordSuggestionInterface = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [userIntent, setUserIntent] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordDetails, setKeywordDetails] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState(null);

  // 🔧 FIXED: Add authentication
  const { session, user } = useSupabase();

  useEffect(() => {
    console.log('🔍 Auth Debug:');
    console.log('Session:', session);
    console.log('User:', user);
    console.log('Access Token:', session?.access_token ? 'Present' : 'Missing');
    console.log('Session Keys:', session ? Object.keys(session) : 'No session');
  }, [session, user]);

  // 🔧 FIXED: Use correct backend URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://aiworkers.onrender.com';

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
    
    // 🔧 FIXED: Check authentication first
    if (!session || !user) {
      setError('Please log in to use AI keyword suggestions');
      return;
    }
    
    setIsAnalyzing(true);
    setShowSuggestions(false);
    setError(null);
    
    try {
      // 🔧 FIXED: Add authentication headers
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Add authorization header if available
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      console.log('🔐 Making authenticated request to AI keyword endpoint');
      console.log('🔐 User:', user?.email);

      // 🔧 FIXED: Call correct backend URL with authentication
      const response = await fetch(`${API_BASE_URL}/api/video2promo/suggest-keywords`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          videoUrl,
          userIntent: userIntent || null
        })
      });
      
      console.log('📡 AI Keyword Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AI Keyword Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ AI Keyword Response data:', data);
      
      if (data.success) {
        setSuggestedKeywords(data.data.suggested_keywords || []);
        setKeywordDetails(data.data);
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
    // This would trigger the targeted extraction with selected keywords
    console.log('Starting extraction with keywords:', selectedKeywords);
    // You could emit an event or call a parent function here
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({
        type: 'START_TARGETED_EXTRACTION',
        keywords: selectedKeywords,
        videoUrl: videoUrl
      }, '*');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Sparkles className="h-8 w-8 text-purple-600 mr-3" />
          AI Keyword Suggestions
        </h1>
        <p className="text-gray-600">
          Let AI analyze your video and suggest the most relevant keywords for extraction
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

      {/* Step 1: Video URL + Intent */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 text-blue-600 mr-2" />
          Step 1: Video Analysis Setup
        </h2>
        
        {/* Video URL */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Video URL
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* User Intent */}
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

        {/* Analyze Button */}
        {!session ? (
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">Please log in to use AI keyword suggestions</p>
            <p className="text-yellow-600 text-sm mt-1">You need to be authenticated to access this feature</p>
          </div>
        ) : (
          <button
            onClick={getAIKeywordSuggestions}
            disabled={!videoUrl || isAnalyzing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all"
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center">
                <Brain className="animate-pulse h-5 w-5 mr-3" />
                Analyzing video with AI...
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

      {/* Step 2: AI Suggestions */}
      {showSuggestions && keywordDetails && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 text-green-600 mr-2" />
            Step 2: AI-Generated Keyword Suggestions
          </h2>

          {/* Video Analysis Summary */}
          <div className="mb-6 p-4 bg-white rounded-lg border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Video Analysis:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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

          {/* Keyword Selection */}
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

          {/* Expected Performance */}
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">⚡ Expected Performance:</h4>
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

      {/* Manual Keywords Option */}
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

      {/* Benefits Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Why Use AI Keyword Suggestions?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start">
              <Brain className="h-5 w-5 text-purple-600 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Intelligent Analysis</h4>
                <p className="text-sm text-gray-600">AI analyzes video title, description, and content to find the most relevant topics</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-blue-600 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Save Time</h4>
                <p className="text-sm text-gray-600">No need to watch the entire video to know what keywords to use</p>
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
              <Sparkles className="h-5 w-5 text-yellow-600 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Discover Hidden Gems</h4>
                <p className="text-sm text-gray-600">AI finds relevant topics you might have missed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIKeywordSuggestionInterface;