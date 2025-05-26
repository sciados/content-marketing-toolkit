// Add this debug component to test your Video2Promo setup
// src/components/Video2Promo/DebugPanel.jsx

import React, { useState } from 'react';
import { transcriptService } from '../../services/video2promo/transcriptService';
import { nlpService } from '../../services/video2promo/nlpService';
// import { assetGenerationService } from '../../services/video2promo/assetGenerationService';

export function DebugPanel() {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results = {};

    try {
      // Test 1: Environment variables
      results.env = {
        corsProxy: !!import.meta.env.VITE_CORS_PROXY_URL,
        youtubeApi: !!import.meta.env.VITE_YOUTUBE_API_KEY,
        claudeProxy: !!import.meta.env.VITE_CLAUDE_PROXY_URL,
        claudeApiKey: !!import.meta.env.VITE_CLAUDE_API_KEY,
        values: {
          corsProxy: import.meta.env.VITE_CORS_PROXY_URL?.substring(0, 50) + '...',
          youtubeApi: import.meta.env.VITE_YOUTUBE_API_KEY ? 'AIza...' : 'Not set',
          claudeProxy: import.meta.env.VITE_CLAUDE_PROXY_URL?.substring(0, 50) + '...',
        }
      };

      // Test 2: URL validation
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll for testing
      results.urlValidation = {
        isValid: transcriptService.isValidYouTubeUrl(testUrl),
        videoId: transcriptService.extractVideoId(testUrl)
      };

      // Test 3: Transcript service availability
      try {
        const videoId = transcriptService.extractVideoId(testUrl);
        const metadata = await transcriptService.getBasicMetadata(videoId);
        results.transcriptService = {
          status: 'working',
          metadata: metadata
        };
      } catch (error) {
        results.transcriptService = {
          status: 'error',
          error: error.message
        };
      }

      // Test 4: NLP service availability
      try {
        const serviceStatus = await nlpService.getServiceStatus();
        results.nlpService = serviceStatus;
      } catch (error) {
        results.nlpService = {
          status: 'error',
          error: error.message
        };
      }

      // Test 5: Test with a known working video
      try {
        console.log('Testing with Rick Roll video...');
        // This is just for testing the flow, not actually fetching
        results.realVideoTest = {
          status: 'ready',
          message: 'Ready to test with real video (click "Test Real Video" below)'
        };
      } catch (error) {
        results.realVideoTest = {
          status: 'error',
          error: error.message
        };
      }

    } catch (error) {
      results.globalError = error.message;
    }

    setTestResults(results);
    setTesting(false);
  };

  const testRealVideo = async () => {
    setTesting(true);
    try {
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      console.log('🧪 Testing real video transcript fetch...');
      
      const result = await transcriptService.getTranscript(testUrl);
      console.log('✅ Real video test successful:', result);
      
      setTestResults(prev => ({
        ...prev,
        realVideoTest: {
          status: 'success',
          videoId: result.videoId,
          transcriptLength: result.transcript.length,
          wordCount: result.wordCount,
          duration: result.duration,
          title: result.metadata.title
        }
      }));
    } catch (error) {
      console.error('❌ Real video test failed:', error);
      setTestResults(prev => ({
        ...prev,
        realVideoTest: {
          status: 'failed',
          error: error.message,
          suggestion: 'Try a different video with auto-generated captions'
        }
      }));
    }
    setTesting(false);
  };

  return (
    <div className="bg-gray-50 border rounded-lg p-6 mt-4">
      <h3 className="text-lg font-semibold mb-4">🔧 Video2Promo Debug Panel</h3>
      
      <div className="space-y-4">
        <button
          onClick={runTests}
          disabled={testing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? 'Running Tests...' : 'Run System Tests'}
        </button>

        {Object.keys(testResults).length > 0 && (
          <button
            onClick={testRealVideo}
            disabled={testing}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Real Video'}
          </button>
        )}
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="font-medium">Test Results:</h4>
          
          {/* Environment Variables */}
          <div className="bg-white p-4 rounded border">
            <h5 className="font-medium text-sm mb-2">Environment Variables</h5>
            <div className="text-sm space-y-1">
              <div>CORS Proxy: {testResults.env?.corsProxy ? '✅' : '❌'}</div>
              <div>YouTube API: {testResults.env?.youtubeApi ? '✅' : '❌'}</div>
              <div>Claude Proxy: {testResults.env?.claudeProxy ? '✅' : '❌'}</div>
              <div>Claude API Key: {testResults.env?.claudeApiKey ? '✅' : '❌'}</div>
              {testResults.env?.values && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600">Show Values</summary>
                  <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                    {JSON.stringify(testResults.env.values, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>

          {/* URL Validation */}
          <div className="bg-white p-4 rounded border">
            <h5 className="font-medium text-sm mb-2">URL Validation</h5>
            <div className="text-sm">
              <div>Valid URL: {testResults.urlValidation?.isValid ? '✅' : '❌'}</div>
              <div>Video ID: {testResults.urlValidation?.videoId || 'None'}</div>
            </div>
          </div>

          {/* Service Status */}
          <div className="bg-white p-4 rounded border">
            <h5 className="font-medium text-sm mb-2">Service Status</h5>
            <div className="text-sm space-y-1">
              <div>Transcript Service: {testResults.transcriptService?.status === 'working' ? '✅' : '❌'}</div>
              <div>NLP Service: {testResults.nlpService?.available ? '✅' : '❌'}</div>
              {testResults.nlpService && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600">Service Details</summary>
                  <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                    {JSON.stringify(testResults.nlpService, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>

          {/* Real Video Test */}
          {testResults.realVideoTest && (
            <div className="bg-white p-4 rounded border">
              <h5 className="font-medium text-sm mb-2">Real Video Test</h5>
              <div className="text-sm">
                <div>Status: {
                  testResults.realVideoTest.status === 'success' ? '✅ Success' :
                  testResults.realVideoTest.status === 'failed' ? '❌ Failed' :
                  testResults.realVideoTest.status === 'ready' ? '⏳ Ready' : '❓ Unknown'
                }</div>
                {testResults.realVideoTest.error && (
                  <div className="text-red-600 mt-1">Error: {testResults.realVideoTest.error}</div>
                )}
                {testResults.realVideoTest.suggestion && (
                  <div className="text-orange-600 mt-1">💡 {testResults.realVideoTest.suggestion}</div>
                )}
                {testResults.realVideoTest.videoId && (
                  <div className="mt-2 space-y-1">
                    <div>Video ID: {testResults.realVideoTest.videoId}</div>
                    <div>Title: {testResults.realVideoTest.title}</div>
                    <div>Transcript Length: {testResults.realVideoTest.transcriptLength} chars</div>
                    <div>Word Count: {testResults.realVideoTest.wordCount}</div>
                    <div>Duration: {testResults.realVideoTest.duration}s</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Global Error */}
          {testResults.globalError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <h5 className="font-medium text-sm mb-2 text-red-800">Global Error</h5>
              <div className="text-sm text-red-700">{testResults.globalError}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}