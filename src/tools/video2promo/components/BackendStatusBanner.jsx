// src/components/Video2Promo/BackendStatusBanner.jsx - Google STT Only (Whisper removed)
import React, { useState, useEffect } from 'react';
import { videoApi, systemApi } from '../../services/api';
import { Badge } from '../ui/Badge';
import SystemStatus from '../ui/SystemStatus';

export const BackendStatusBanner = ({ variant = 'compact' }) => {
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    checkBackendStatus();
    
    // Set up periodic health checks
    const interval = setInterval(checkBackendStatus, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const checkBackendStatus = async () => {
    try {
      console.log('🔍 Checking backend status...');
      
      // Use the correct API method
      const healthData = await videoApi.getHealth();
      
      console.log('✅ Backend health check response:', healthData);
      
      if (healthData.success) {
        setBackendStatus({
          connected: true,
          message: healthData.message || 'Backend connected',
          version: healthData.version || '5.0.1',
          processingMethod: healthData.processing_method || 'google_stt_only',
          services: {
            google_stt: healthData.google_stt_available !== false,
            video_extraction: true,
            ai_generation: true,
            content_library: true,
            usage_tracking: true,
            global_cache: healthData.features?.cache_enabled !== false
          },
          features: healthData.features || {},
          cache_status: {
            total_cached_videos: 0 // This would come from a specific cache endpoint
          }
        });
      } else {
        throw new Error(healthData.error || 'Health check failed');
      }
      
      setLastChecked(new Date());
    } catch (error) {
      console.warn('❌ Backend health check failed:', error);
      
      // Try fallback system health check
      try {
        console.log('🔄 Trying system health check...');
        const systemHealth = await systemApi.getHealth();
        
        if (systemHealth.success) {
          setBackendStatus({
            connected: true,
            message: 'Backend connected (system check)',
            version: systemHealth.version || '5.0.1',
            processingMethod: systemHealth.processing_method || 'google_stt_only',
            services: {
              system: true,
              api: true,
              google_stt: systemHealth.google_stt_available !== false
            },
            fallback: true
          });
          setLastChecked(new Date());
          return;
        }
      } catch (systemError) {
        console.warn('❌ System health check also failed:', systemError);
      }
      
      setBackendStatus({
        connected: false,
        error: error.message || 'Connection failed'
      });
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    checkBackendStatus();
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 font-medium">Checking backend connection...</span>
        </div>
      </div>
    );
  }

  if (!backendStatus) {
    return null;
  }

  // Get backend base URL for display
  const getBackendHost = () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://aiworkers.onrender.com';
      return new URL(baseUrl).hostname;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return 'Backend API';
    }
  };

  // Expanded variant with SystemStatus integration
  if (variant === 'expanded') {
    return (
      <div className="mb-4 space-y-4">
        {/* Main status banner */}
        <div className={`border rounded-lg p-4 ${
          backendStatus.connected 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {backendStatus.connected ? '✅' : '❌'}
              </span>
              
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${
                  backendStatus.connected ? 'text-green-800' : 'text-red-800'
                }`}>
                  {backendStatus.connected ? 'Backend Connected' : 'Backend Connection Failed'}
                </span>
                
                {backendStatus.connected && (
                  <>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      v{backendStatus.version}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      Google STT Enterprise
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span>🔗</span>
                      <span className="text-xs text-green-700">
                        {getBackendHost()}
                      </span>
                    </div>
                    {backendStatus.fallback && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        System Check
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="text-xs px-2 py-1 rounded bg-white border hover:bg-gray-50 transition-colors"
                title="Refresh status"
              >
                🔄 Refresh
              </button>
              {lastChecked && (
                <span className="text-xs text-gray-500">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Service status indicators */}
          {backendStatus.connected && backendStatus.services && Object.keys(backendStatus.services).length > 0 && (
            <div className="mt-3 flex items-center gap-4 flex-wrap">
              <span className="text-xs text-green-700 font-medium">Services:</span>
              {Object.entries(backendStatus.services).map(([service, status]) => (
                <Badge 
                  key={service}
                  className={`text-xs ${
                    status 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {service === 'google_stt' ? '☁️ Google STT' : service.replace('_', ' ')}: {status ? '✓' : '✗'}
                </Badge>
              ))}
            </div>
          )}

          {/* Processing method indicator */}
          {backendStatus.connected && backendStatus.processingMethod && (
            <div className="mt-2 text-xs text-green-700">
              <span>🎤</span> Processing: {backendStatus.processingMethod === 'google_stt_only' ? 'Google Speech-to-Text Enterprise (Whisper-free)' : backendStatus.processingMethod}
            </div>
          )}

          {/* Cache status */}
          {backendStatus.connected && backendStatus.cache_status && backendStatus.cache_status.total_cached_videos !== undefined && (
            <div className="mt-2 text-xs text-green-700">
              <span>💾</span> Cache: {backendStatus.cache_status.total_cached_videos} videos cached
            </div>
          )}

          {backendStatus.connected && (
            <div className="mt-2 text-xs text-green-700">
              <span>⚡</span> Video2Promo API ready • {backendStatus.fallback ? 'System health confirmed' : 'Google STT operational'} • Enterprise-grade reliability
            </div>
          )}

          {!backendStatus.connected && (
            <div className="mt-2 text-xs text-red-700">
              <span>❌</span> {backendStatus.error || 'Connection failed'} • Video processing may be limited
            </div>
          )}
        </div>

        {/* Detailed system status */}
        <SystemStatus />
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div className={`border rounded-lg p-3 mb-4 ${
      backendStatus.connected 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {backendStatus.connected ? '✅' : '❌'}
          </span>
          
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm ${
              backendStatus.connected ? 'text-green-800' : 'text-red-800'
            }`}>
              {backendStatus.connected ? 'Backend Online' : 'Backend Offline'}
            </span>
            
            {backendStatus.connected && backendStatus.version && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                v{backendStatus.version}
              </Badge>
            )}

            {backendStatus.connected && backendStatus.processingMethod === 'google_stt_only' && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                ☁️ Google STT
              </Badge>
            )}

            {backendStatus.connected && backendStatus.fallback && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                System
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {backendStatus.connected && backendStatus.services && Object.keys(backendStatus.services).length > 0 && (
            <div className="flex items-center gap-1">
              {Object.entries(backendStatus.services).map(([service, status]) => (
                <div
                  key={service}
                  className={`w-2 h-2 rounded-full ${
                    status ? 'bg-green-400' : 'bg-red-400'
                  }`}
                  title={`${service === 'google_stt' ? 'Google STT' : service.replace('_', ' ')}: ${status ? 'operational' : 'unavailable'}`}
                />
              ))}
            </div>
          )}
          
          <button
            onClick={handleRefresh}
            className="text-xs px-2 py-1 rounded bg-white border hover:bg-gray-50 transition-colors"
            title="Refresh status"
          >
            🔄
          </button>
        </div>
      </div>

      {!backendStatus.connected && (
        <div className="mt-2 text-xs text-red-700">
          {backendStatus.error || 'Connection failed'} • Operating in limited mode
        </div>
      )}

      {backendStatus.connected && backendStatus.processingMethod === 'google_stt_only' && (
        <div className="mt-2 text-xs text-green-700">
          ☁️ Enterprise-grade video processing • Whisper-free architecture • Global caching enabled
        </div>
      )}
    </div>
  );
};

export default BackendStatusBanner;