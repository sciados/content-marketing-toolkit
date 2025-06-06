import React, { useState } from 'react';
import { Search, Clock, Target, Zap } from 'lucide-react';

const KeywordVideoExtraction = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [keywords, setKeywords] = useState(['']);
  const [extractionMode, setExtractionMode] = useState('targeted');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const addKeyword = () => {
    setKeywords([...keywords, '']);
  };

  const updateKeyword = (index, value) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleExtraction = async () => {
    setIsProcessing(true);
    
    const payload = {
      videoUrl,
      keywords: keywords.filter(k => k.trim()),
      extractionMode,
      targetDuration: extractionMode === 'targeted' ? 'auto' : 'full'
    };

    try {
      const response = await fetch('/api/video2promo/extract-targeted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Extraction failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎯 Smart Video Extraction
        </h1>
        <p className="text-gray-600">
          Extract only the most relevant content using AI-powered keyword targeting
        </p>
      </div>

      {/* Video URL Input */}
      <div className="mb-6">
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

      {/* Extraction Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Extraction Mode
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Targeted Mode */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              extractionMode === 'targeted' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setExtractionMode('targeted')}
          >
            <div className="flex items-center mb-2">
              <Target className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-semibold text-gray-900">Targeted</span>
            </div>
            <p className="text-sm text-gray-600">
              Extract only segments matching your keywords
            </p>
            <div className="mt-2 text-xs text-green-600 font-medium">
              ⚡ 70% faster • 🎯 Highly relevant
            </div>
          </div>

          {/* Smart Mode */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              extractionMode === 'smart' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setExtractionMode('smart')}
          >
            <div className="flex items-center mb-2">
              <Zap className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-semibold text-gray-900">Smart</span>
            </div>
            <p className="text-sm text-gray-600">
              AI automatically finds the most valuable content
            </p>
            <div className="mt-2 text-xs text-purple-600 font-medium">
              🧠 AI-powered • ⚡ 50% faster
            </div>
          </div>

          {/* Full Mode */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              extractionMode === 'full' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setExtractionMode('full')}
          >
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <span className="font-semibold text-gray-900">Complete</span>
            </div>
            <p className="text-sm text-gray-600">
              Full video transcription (traditional method)
            </p>
            <div className="mt-2 text-xs text-orange-600 font-medium">
              📝 Complete • 🐌 Standard speed
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Input (show only for targeted mode) */}
      {extractionMode === 'targeted' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Target Keywords
            <span className="text-xs text-gray-500 ml-2">
              (AI will find segments matching these topics)
            </span>
          </label>
          
          <div className="space-y-3">
            {keywords.map((keyword, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => updateKeyword(index, e.target.value)}
                  placeholder={`Keyword ${index + 1} (e.g., "email marketing strategies")`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {keywords.length > 1 && (
                  <button
                    onClick={() => removeKeyword(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addKeyword}
            className="mt-3 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
          >
            + Add Keyword
          </button>

          {/* Keyword Examples */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Example keywords:</p>
            <div className="flex flex-wrap gap-2">
              {['email marketing', 'lead generation', 'conversion optimization', 'sales funnel', 'customer retention'].map((example) => (
                <button
                  key={example}
                  onClick={() => setKeywords([...keywords.filter(k => k), example])}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Processing Button */}
      <div className="mb-6">
        <button
          onClick={handleExtraction}
          disabled={!videoUrl || isProcessing || (extractionMode === 'targeted' && !keywords.some(k => k.trim()))}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              {extractionMode === 'targeted' ? 'Finding relevant segments...' : 'Processing video...'}
            </div>
          ) : (
            `🚀 Start ${extractionMode === 'targeted' ? 'Targeted' : extractionMode === 'smart' ? 'Smart' : 'Complete'} Extraction`
          )}
        </button>
      </div>

      {/* Expected Performance */}
      {extractionMode && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Expected Performance:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-green-800">Processing Time:</span>
              <div className="text-green-700">
                {extractionMode === 'targeted' ? '1-3 minutes' : 
                 extractionMode === 'smart' ? '2-5 minutes' : 
                 '5-15 minutes'}
              </div>
            </div>
            <div>
              <span className="font-medium text-green-800">Relevance:</span>
              <div className="text-green-700">
                {extractionMode === 'targeted' ? '95% relevant' : 
                 extractionMode === 'smart' ? '85% relevant' : 
                 '100% complete'}
              </div>
            </div>
            <div>
              <span className="font-medium text-green-800">Content Focus:</span>
              <div className="text-green-700">
                {extractionMode === 'targeted' ? 'Keyword-specific' : 
                 extractionMode === 'smart' ? 'AI-curated highlights' : 
                 'Full transcript'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">🎯 Extraction Results</h3>
          
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.processingTime}s</div>
              <div className="text-xs text-gray-600">Processing Time</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.segmentsFound}</div>
              <div className="text-xs text-gray-600">Relevant Segments</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{results.relevanceScore}%</div>
              <div className="text-xs text-gray-600">Relevance Score</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{results.wordCount}</div>
              <div className="text-xs text-gray-600">Words Extracted</div>
            </div>
          </div>

          {/* Transcript Preview */}
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Targeted Transcript:</h4>
            <div className="text-sm text-gray-700 max-h-64 overflow-y-auto">
              {results.transcript}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordVideoExtraction;