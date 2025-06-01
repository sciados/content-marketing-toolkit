// src/components/Video2Promo/BackendStatusBanner.jsx

import React, { useState, useEffect } from 'react';
import { Badge } from '../Common/Badge';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const BackendStatusBanner = () => {
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/`);
      const data = await response.json();
      setBackendStatus({
        connected: true,
        message: data.message,
        version: data.version,
        services: data.services
      });
    } catch (error) {
      setBackendStatus({
        connected: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <div className={`border rounded-lg p-4 mb-4 ${
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
              {backendStatus.connected ? 'Python Backend Connected' : 'Backend Connection Failed'}
            </span>
            
            {backendStatus.connected && (
              <>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  v{backendStatus.version}
                </Badge>
                <div className="flex items-center gap-1">
                  <span>🔗</span>
                  <span className="text-xs text-green-700">
                    {new URL(API_BASE).hostname}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {backendStatus.connected && backendStatus.services && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-700">Services:</span>
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

        {!backendStatus.connected && (
          <div className="text-xs text-red-700">
            {backendStatus.error || 'Connection failed'}
          </div>
        )}
      </div>

      {backendStatus.connected && (
        <div className="mt-2 text-xs text-green-700">
          <span>⚡</span> No CORS issues • Direct API calls • Secure backend processing
        </div>
      )}
    </div>
  );
};

export default BackendStatusBanner;
