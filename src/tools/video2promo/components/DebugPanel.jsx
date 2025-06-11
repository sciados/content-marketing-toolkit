// src/components/Video2Promo/DebugPanel.jsx - UPDATED FOR PYTHON BACKEND (No Card Dependencies)

import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/Badge';
import { useAuth } from '../shared/hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const DebugPanel = ({ isVisible = true }) => {
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);
  const { session, user } = useAuth();

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/`);
      const data = await response.json();
      setBackendStatus({
        connected: true,
        services: data.services,
        version: data.version,
        environment: data.environment
      });
    } catch (error) {
      setBackendStatus({
        connected: false,
        error: error.message
      });
    }
  };

  const runSystemTests = async () => {
    setIsRunningTests(true);
    const results = {};

    try {
      // Test 1: Backend Health Check
      console.log('🧪 Testing backend connection...');
      try {
        const healthResponse = await fetch(`${API_BASE}/`);
        const healthData = await healthResponse.json();
        results.backendHealth = {
          status: 'success',
          message: `Backend connected - ${healthData.version}`,
          details: healthData
        };
      } catch (error) {
        results.backendHealth = {
          status: 'error', 
          message: `Backend connection failed: ${error.message}`
        };
      }

      // Test 2: Authentication
      console.log('🧪 Testing authentication...');
      results.authentication = {
        status: session ? 'success' : 'warning',
        message: session ? `Authenticated as ${user?.email}` : 'No active session',
        details: { hasSession: !!session, userId: user?.id }
      };

      // Test 3: Environment Variables
      console.log('🧪 Testing environment variables...');
      results.environment = {
        status: API_BASE ? 'success' : 'error',
        message: API_BASE ? `API Base: ${API_BASE}` : 'API_BASE not configured',
        details: {
          apiBase: API_BASE,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing',
          supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'
        }
      };

     // Test 4: Usage Tracking API (only if authenticated)
      if (session) {
        console.log('🧪 Testing Usage API...');
        try {
          const usageResponse = await fetch(`${API_BASE}/api/usage/limits`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            }
          });

          console.log('🧪 Usage API response status:', usageResponse.status);

          if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            console.log('🧪 Usage API data:', usageData);
            results.usageAPI = {
              status: 'success',
              message: `Usage API accessible - User tier: ${usageData.user_tier || 'unknown'}`,
              details: usageData
            };
          } else {
            const errorData = await usageResponse.json();
            results.usageAPI = {
              status: 'warning',
              message: `Usage API responded with ${usageResponse.status}: ${errorData.error || 'Unknown error'}`,
              details: errorData
            };
          }
        } catch (error) {
          results.usageAPI = {
            status: 'error',
            message: `Usage API test failed: ${error.message}`
          };
        }
      } else {
        results.usageAPI = {
          status: 'warning',
          message: 'Skipped - No authentication'
        };
      }

      // Test 5: Video2Promo API (only if authenticated)
      if (session) {
        console.log('🧪 Testing Video2Promo API...');
        try {
          // Test with a sample YouTube URL
          const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
          const transcriptResponse = await fetch(`${API_BASE}/api/video2promo/extract-transcript`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ videoUrl: testUrl, method: 'auto' })
          });

          if (transcriptResponse.ok) {
            results.video2promoAPI = {
              status: 'success',
              message: 'Video2Promo API accessible'
            };
          } else {
            const errorData = await transcriptResponse.json();
            results.video2promoAPI = {
              status: 'warning',
              message: `API responded with ${transcriptResponse.status}: ${errorData.error || 'Unknown error'}`
            };
          }
        } catch (error) {
          results.video2promoAPI = {
            status: 'error',
            message: `Video2Promo API test failed: ${error.message}`
          };
        }
      } else {
        results.video2promoAPI = {
          status: 'warning',
          message: 'Skipped - No authentication'
        };
      }

      setTestResults(results);
    } catch (error) {
      console.error('System test error:', error);
      setTestResults({
        systemError: {
          status: 'error',
          message: `System test failed: ${error.message}`
        }
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const testRickRollVideo = async () => {
    console.log('🎵 Testing Rick Roll video...');
    // This would trigger your Video2Promo workflow with a known video
    window.dispatchEvent(new CustomEvent('test-video-url', {
      detail: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
    }));
  };

  const testCustomVideo = async () => {
    const url = prompt('Enter YouTube URL to test:');
    if (url) {
      console.log('🎬 Testing custom video:', url);
      window.dispatchEvent(new CustomEvent('test-video-url', {
        detail: { url }
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';  
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
      <div className="p-4 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span>🧪</span>
            <span>Video2Promo Debug Panel</span>
            <Badge className="bg-green-100 text-green-800 text-sm">
              Python Backend v2.0
            </Badge>
          </div>
          <Badge className="text-xs text-blue-600 bg-blue-100">
            Development Mode
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={runSystemTests}
            disabled={isRunningTests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 flex items-center gap-2"
          >
            <span>⚡</span>
            {isRunningTests ? 'Running Tests...' : 'Run System Tests'}
          </button>
          
          <button 
            onClick={testRickRollVideo}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <span>🎵</span>
            Test Rick Roll Video
          </button>
          
          <button 
            onClick={testCustomVideo}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <span>🎬</span>
            Test Custom Video
          </button>
        </div>

        {/* Backend Status */}
        {backendStatus && (
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>⚡</span>
              Backend Connection Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span>{getStatusIcon(backendStatus.connected ? 'success' : 'error')}</span>
                  <span className="font-medium">Connection:</span>
                  <Badge className={getStatusColor(backendStatus.connected ? 'success' : 'error')}>
                    {backendStatus.connected ? 'Connected' : 'Failed'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>URL: <code className="bg-gray-100 px-1 rounded">{API_BASE}</code></div>
                  {backendStatus.version && <div>Version: {backendStatus.version}</div>}
                  {backendStatus.environment && <div>Env: {backendStatus.environment}</div>}
                </div>
              </div>
              
              {backendStatus.services && (
                <div>
                  <span className="font-medium mb-2 block">Backend Services:</span>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span>{getStatusIcon(backendStatus.services.supabase ? 'success' : 'error')}</span>
                      Supabase: {backendStatus.services.supabase ? '✓' : '✗'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{getStatusIcon(backendStatus.services.claude ? 'success' : 'error')}</span>
                      Claude: {backendStatus.services.claude ? '✓' : '✗'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{getStatusIcon(backendStatus.services.openai ? 'success' : 'error')}</span>
                      OpenAI: {backendStatus.services.openai ? '✓' : '✗'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{getStatusIcon(backendStatus.services.youtube ? 'success' : 'error')}</span>
                      YouTube: {backendStatus.services.youtube ? '✓' : '✗'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>🧪</span>
              Test Results
            </h3>
            <div className="space-y-3">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                  <span>{getStatusIcon(result.status)}</span>
                  <div className="flex-1">
                    <div className="font-medium capitalize">
                      {testName.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                    {result.details && (
                      <details className="text-xs text-gray-500 mt-1">
                        <summary className="cursor-pointer">Details</summary>
                        <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environment Info */}
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-semibold mb-3">Environment Variables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Backend URL:</span>
                {API_BASE ? (
                  <Badge className="bg-green-100 text-green-800">✓ Set</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">✗ Missing</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Supabase URL:</span>
                {import.meta.env.VITE_SUPABASE_URL ? (
                  <Badge className="bg-green-100 text-green-800">✓ Set</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">✗ Missing</Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Supabase Key:</span>
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? (
                  <Badge className="bg-green-100 text-green-800">✓ Set</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">✗ Missing</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Auth Status:</span>
                {session ? (
                  <Badge className="bg-green-100 text-green-800">✓ Authenticated</Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">! Not Authenticated</Badge>
                )}
              </div>
            </div>
          </div>
          
          <details className="mt-3">
            <summary className="cursor-pointer text-blue-600 text-sm">Show Configuration</summary>
            <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">
{`API Base: ${API_BASE}
Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}
Environment: ${import.meta.env.VITE_APP_ENV}
User ID: ${user?.id || 'Not authenticated'}
Session: ${session ? 'Active' : 'None'}`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
