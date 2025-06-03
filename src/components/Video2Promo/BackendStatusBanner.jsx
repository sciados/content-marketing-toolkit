// src/components/Video2Promo/BackendStatusBanner.jsx - FIXED
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { Badge } from '../Common/Badge';
import SystemStatus from '../Common/SystemStatus';

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
      // Use centralized apiClient for health check
      const data = await apiClient.getHealth();
      
      setBackendStatus({
        connected: true,
        message: data.message || 'Backend connected',
        version: data.version || '4.0',
        services: data.services || {},
        cache_status: data.cache_status || {}
      });
      setLastChecked(new Date());
    } catch (error) {
      console.warn('Backend health check failed:', error);
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
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
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
                    <div className="flex items-center gap-1">
                      <span>🔗</span>
                      <span className="text-xs text-green-700">
                        {getBackendHost()}
                      </span>
                    </div>
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
                  {service}: {status ? '✓' : '✗'}
                </Badge>
              ))}
            </div>
          )}

          {/* Cache status */}
          {backendStatus.connected && backendStatus.cache_status && backendStatus.cache_status.total_cached_videos && (
            <div className="mt-2 text-xs text-green-700">
              <span>💾</span> Cache: {backendStatus.cache_status.total_cached_videos} videos cached
            </div>
          )}

          {backendStatus.connected && (
            <div className="mt-2 text-xs text-green-700">
              <span>⚡</span> Direct API connection • Secure processing • Real-time updates available
            </div>
          )}

          {!backendStatus.connected && (
            <div className="mt-2 text-xs text-red-700">
              <span>❌</span> {backendStatus.error || 'Connection failed'} • Some features may be limited
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
                  title={`${service}: ${status ? 'operational' : 'unavailable'}`}
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
    </div>
  );
};

export default BackendStatusBanner;