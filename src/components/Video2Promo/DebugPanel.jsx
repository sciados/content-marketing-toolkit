// src/components/Video2Promo/DebugPanel.jsx - UPDATED VERSION

import React, { useState } from 'react';
import { transcriptService } from '../../services/video2promo/transcriptService';
import { nlpService } from '../../services/video2promo/nlpService';

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
        openaiKey: !!import.meta.env.VITE_OPENAI_API_KEY,
        values: {
          corsProxy: import.meta.env.VITE_CORS_PROXY_URL?.substring(0, 50) + '...',
          youtubeApi: import.meta.env.VITE_YOUTUBE_API_KEY ? 'AIza...' : 'Not set',
          claudeProxy: import.meta.env.VITE_CLAUDE_PROXY_URL?.substring(0, 50) + '...',
          openaiKey: import.meta.env.VITE_OPENAI_API_KEY ? 'sk-...' : 'Not set'
        }
      };

      // Test 2: URL validation
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll for testing
      try {
        const videoId = transcriptService.extractVideoId(testUrl);
        results.urlValidation = {
          isValid: true,
          videoId: videoId,
          testUrl: testUrl
        };
      } catch (error) {
        results.urlValidation = {
          isValid: false,
          error: error.message,
          testUrl: testUrl
        };
      }

      // Test 3: Transcript service basic functionality
      results.transcriptService = {
        status: 'available',
        methods: {
          extractVideoId: typeof transcriptService.extractVideoId === 'function',
          getTranscript: typeof transcriptService.getTranscript === 'function',
          getOfficialTranscript: typeof transcriptService.getOfficialTranscript === 'function'
        }
      };

      // Test 4: NLP service basic functionality
      results.nlpService = {
        status: 'available',
        methods: {
          extractBenefits: typeof nlpService.extractBenefits === 'function',
          prepareTranscriptText: typeof nlpService.prepareTranscriptText === 'function',
          analyzeWithClaude: typeof nlpService.analyzeWithClaude === 'function'
        }
      };

      // Test 5: Sample benefit extraction with dummy data
      try {
        const sampleTranscript = [
          { text: "This amazing product will save you 10 hours per week", start: 0 },
          { text: "It's 50% faster than the competition and costs less", start: 30 },
          { text: "Users report 300% increase in productivity", start: 60 },
          { text: "Simple to use, no technical skills required", start: 90 }
        ];

        console.log('🧪 Testing benefit extraction with sample data...');
        const benefitResult = await nlpService.extractBenefits(sampleTranscript, { 
          userTier: 'pro' 
        });

        results.sampleBenefitExtraction = {
          status: benefitResult.success ? 'success' : 'failed',
          benefitsFound: benefitResult.benefits?.length || 0,
          error: benefitResult.error,
          sampleBenefit: benefitResult.benefits?.[0]
        };
      } catch (error) {
        results.sampleBenefitExtraction = {
          status: 'error',
          error: error.message
        };
      }

      // Test 6: Ready status for real video test
      results.realVideoTest = {
        status: 'ready',
        message: 'Click "Test Real Video" to test with actual YouTube video'
      };

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
      console.log('🧪 Testing real video transcript fetch for:', testUrl);
      
      const result = await transcriptService.getTranscript(testUrl);
      console.log('✅ Real video test result:', result);
      
      if (result.success && result.transcript) {
        // Test benefit extraction on real transcript
        console.log('🔍 Testing benefit extraction on real transcript...');
        const benefitResult = await nlpService.extractBenefits(result.transcript, {
          userTier: 'pro'
        });

        setTestResults(prev => ({
          ...prev,
          realVideoTest: {
            status: 'success',
            videoId: result.videoId,
            transcriptSegments: result.transcript.length,
            method: result.method,
            benefitExtraction: {
              success: benefitResult.success,
              benefitsFound: benefitResult.benefits?.length || 0,
              error: benefitResult.error,
              sampleBenefit: benefitResult.benefits?.[0]
            }
          }
        }));
      } else {
        throw new Error(result.error || 'Failed to extract transcript');
      }
    } catch (error) {
      console.error('❌ Real video test failed:', error);
      setTestResults(prev => ({
        ...prev,
        realVideoTest: {
          status: 'failed',
          error: error.message,
          suggestion: 'Check console for detailed error logs. Try with a video that has auto-generated captions.'
        }
      }));
    }
    setTesting(false);
  };

  const testSpecificVideo = async () => {
    const customUrl = prompt('Enter YouTube URL to test:');
    if (!customUrl) return;

    setTesting(true);
    try {
      console.log('🧪 Testing custom video:', customUrl);
      
      const result = await transcriptService.getTranscript(customUrl);
      console.log('✅ Custom video test result:', result);
      
      if (result.success && result.transcript) {
        const benefitResult = await nlpService.extractBenefits(result.transcript, {
          userTier: 'pro'
        });

        setTestResults(prev => ({
          ...prev,
          customVideoTest: {
            status: 'success',
            url: customUrl,
            videoId: result.videoId,
            transcriptSegments: result.transcript.length,
            method: result.method,
            benefitExtraction: {
              success: benefitResult.success,
              benefitsFound: benefitResult.benefits?.length || 0,
              benefits: benefitResult.benefits
            }
          }
        }));
      } else {
        throw new Error(result.error || 'Failed to extract transcript');
      }
    } catch (error) {
      console.error('❌ Custom video test failed:', error);
      setTestResults(prev => ({
        ...prev,
        customVideoTest: {
          status: 'failed',
          url: customUrl,
          error: error.message
        }
      }));
    }
    setTesting(false);
  };

  return (
    <div className="bg-gray-50 border rounded-lg p-6 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">🔧 Video2Promo Debug Panel</h3>
        <div className="text-xs text-gray-500">
          {import.meta.env.DEV ? 'Development Mode' : 'Production Mode'}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={runTests}
          disabled={testing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? 'Running Tests...' : '🧪 Run System Tests'}
        </button>

        {Object.keys(testResults).length > 0 && (
          <>
            <button
              onClick={testRealVideo}
              disabled={testing}
              className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {testing ? 'Testing...' : '🎥 Test Rick Roll Video'}
            </button>

            <button
              onClick={testSpecificVideo}
              disabled={testing}
              className="ml-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {testing ? 'Testing...' : '🎯 Test Custom Video'}
            </button>
          </>
        )}
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">📊 Test Results:</h4>
          
          {/* Environment Variables */}
          <div className="bg-white p-4 rounded border">
            <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
              🔧 Environment Variables
            </h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>CORS Proxy: {testResults.env?.corsProxy ? '✅' : '❌'}</div>
              <div>YouTube API: {testResults.env?.youtubeApi ? '✅' : '❌'}</div>
              <div>Claude Proxy: {testResults.env?.claudeProxy ? '✅' : '❌'}</div>
              <div>Claude API Key: {testResults.env?.claudeApiKey ? '✅' : '❌'}</div>
              <div>OpenAI Key: {testResults.env?.openaiKey ? '✅' : '❌'}</div>
            </div>
            {testResults.env?.values && (
              <details className="mt-3">
                <summary className="cursor-pointer text-blue-600 text-sm">🔍 Show Configuration</summary>
                <pre className="text-xs mt-2 bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(testResults.env.values, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* URL Validation */}
          <div className="bg-white p-4 rounded border">
            <h5 className="font-medium text-sm mb-2">🔗 URL Validation</h5>
            <div className="text-sm space-y-1">
              <div>Valid URL: {testResults.urlValidation?.isValid ? '✅' : '❌'}</div>
              <div>Video ID: <code className="bg-gray-100 px-1 rounded">{testResults.urlValidation?.videoId || 'None'}</code></div>
              {testResults.urlValidation?.error && (
                <div className="text-red-600">Error: {testResults.urlValidation.error}</div>
              )}
            </div>
          </div>

          {/* Service Status */}
          <div className="bg-white p-4 rounded border">
            <h5 className="font-medium text-sm mb-2">⚙️ Service Status</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Transcript Service:</div>
                <div>Status: {testResults.transcriptService?.status === 'available' ? '✅ Available' : '❌ Unavailable'}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Methods: {Object.values(testResults.transcriptService?.methods || {}).filter(Boolean).length}/3 available
                </div>
              </div>
              <div>
                <div className="font-medium">NLP Service:</div>
                <div>Status: {testResults.nlpService?.status === 'available' ? '✅ Available' : '❌ Unavailable'}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Methods: {Object.values(testResults.nlpService?.methods || {}).filter(Boolean).length}/3 available
                </div>
              </div>
            </div>
          </div>

          {/* Sample Benefit Extraction */}
          {testResults.sampleBenefitExtraction && (
            <div className="bg-white p-4 rounded border">
              <h5 className="font-medium text-sm mb-2">🧠 Sample Benefit Extraction</h5>
              <div className="text-sm space-y-1">
                <div>Status: {
                  testResults.sampleBenefitExtraction.status === 'success' ? '✅ Success' :
                  testResults.sampleBenefitExtraction.status === 'failed' ? '⚠️ Failed' : '❌ Error'
                }</div>
                <div>Benefits Found: {testResults.sampleBenefitExtraction.benefitsFound}</div>
                {testResults.sampleBenefitExtraction.error && (
                  <div className="text-red-600">Error: {testResults.sampleBenefitExtraction.error}</div>
                )}
                {testResults.sampleBenefitExtraction.sampleBenefit && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600">Show Sample Benefit</summary>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <div><strong>Title:</strong> {testResults.sampleBenefitExtraction.sampleBenefit.title}</div>
                      <div><strong>Description:</strong> {testResults.sampleBenefitExtraction.sampleBenefit.description}</div>
                      <div><strong>Category:</strong> {testResults.sampleBenefitExtraction.sampleBenefit.category}</div>
                    </div>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* Real Video Test */}
          {testResults.realVideoTest && testResults.realVideoTest.status !== 'ready' && (
            <div className="bg-white p-4 rounded border">
              <h5 className="font-medium text-sm mb-2">🎥 Real Video Test</h5>
              <div className="text-sm space-y-1">
                <div>Status: {
                  testResults.realVideoTest.status === 'success' ? '✅ Success' :
                  testResults.realVideoTest.status === 'failed' ? '❌ Failed' : '❓ Unknown'
                }</div>
                {testResults.realVideoTest.videoId && (
                  <>
                    <div>Video ID: <code className="bg-gray-100 px-1 rounded">{testResults.realVideoTest.videoId}</code></div>
                    <div>Transcript Segments: {testResults.realVideoTest.transcriptSegments}</div>
                    <div>Method Used: {testResults.realVideoTest.method}</div>
                  </>
                )}
                {testResults.realVideoTest.benefitExtraction && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <div className="font-medium text-blue-800">Benefit Extraction:</div>
                    <div>Success: {testResults.realVideoTest.benefitExtraction.success ? '✅' : '❌'}</div>
                    <div>Benefits Found: {testResults.realVideoTest.benefitExtraction.benefitsFound}</div>
                    {testResults.realVideoTest.benefitExtraction.error && (
                      <div className="text-red-600">Error: {testResults.realVideoTest.benefitExtraction.error}</div>
                    )}
                  </div>
                )}
                {testResults.realVideoTest.error && (
                  <div className="text-red-600">Error: {testResults.realVideoTest.error}</div>
                )}
                {testResults.realVideoTest.suggestion && (
                  <div className="text-orange-600">💡 {testResults.realVideoTest.suggestion}</div>
                )}
              </div>
            </div>
          )}

          {/* Custom Video Test */}
          {testResults.customVideoTest && (
            <div className="bg-white p-4 rounded border">
              <h5 className="font-medium text-sm mb-2">🎯 Custom Video Test</h5>
              <div className="text-sm space-y-1">
                <div>URL: <code className="bg-gray-100 px-1 rounded text-xs">{testResults.customVideoTest.url}</code></div>
                <div>Status: {testResults.customVideoTest.status === 'success' ? '✅ Success' : '❌ Failed'}</div>
                {testResults.customVideoTest.videoId && (
                  <>
                    <div>Video ID: <code className="bg-gray-100 px-1 rounded">{testResults.customVideoTest.videoId}</code></div>
                    <div>Transcript Segments: {testResults.customVideoTest.transcriptSegments}</div>
                    <div>Method Used: {testResults.customVideoTest.method}</div>
                  </>
                )}
                {testResults.customVideoTest.benefitExtraction && (
                  <div className="mt-2">
                    <div>Benefits Found: {testResults.customVideoTest.benefitExtraction.benefitsFound}</div>
                    {testResults.customVideoTest.benefitExtraction.benefits && testResults.customVideoTest.benefitExtraction.benefits.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600">Show Extracted Benefits</summary>
                        <div className="mt-2 max-h-40 overflow-y-auto">
                          {testResults.customVideoTest.benefitExtraction.benefits.slice(0, 3).map((benefit, idx) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded mb-2 text-xs">
                              <div><strong>{benefit.title}</strong></div>
                              <div className="text-gray-600">{benefit.description?.substring(0, 100)}...</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
                {testResults.customVideoTest.error && (
                  <div className="text-red-600">Error: {testResults.customVideoTest.error}</div>
                )}
              </div>
            </div>
          )}

          {/* Global Error */}
          {testResults.globalError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <h5 className="font-medium text-sm mb-2 text-red-800">💥 Global Error</h5>
              <div className="text-sm text-red-700">{testResults.globalError}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}