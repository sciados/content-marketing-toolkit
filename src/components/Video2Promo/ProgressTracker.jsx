// src/components/Video2Promo/ProgressTracker.jsx - Google STT Progress Tracking
import React from 'react';
import { CheckCircle, Clock, AlertCircle, Cloud, Zap } from 'lucide-react';

const ProgressTracker = ({ 
  progress = 0, 
  stage = '', 
  method = 'google_stt', 
  cached = false, 
  costSaved = 0,
  processingTime = 0,
  error = null 
}) => {
  
  // Get method display information (Google STT only)
  const getMethodInfo = (methodName) => {
    const methods = {
      'google_stt': { icon: '☁️', label: 'Google STT', color: 'blue', description: 'Enterprise Speech-to-Text' },
      'google_stt_chunked': { icon: '☁️', label: 'Google STT Pro', color: 'blue', description: 'Parallel chunk processing' },
      'google_stt_direct': { icon: '☁️', label: 'Google STT', color: 'blue', description: 'Direct processing' },
      'google_stt_hybrid': { icon: '☁️', label: 'Google STT Hybrid', color: 'blue', description: 'Intelligent optimization' },
      'cached': { icon: '⚡', label: 'Cached', color: 'green', description: 'Instant result' },
      'unknown': { icon: '🔄', label: 'Processing', color: 'gray', description: 'Video processing' }
    };
    
    return methods[methodName] || methods['unknown'];
  };

  const methodInfo = getMethodInfo(method);

  // Progress bar color based on status
  const getProgressColor = () => {
    if (error) return 'bg-red-500';
    if (cached) return 'bg-green-500';
    if (progress === 100) return 'bg-green-500';
    return 'bg-blue-500';
  };

  // Status icon
  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (cached) return <Zap className="h-5 w-5 text-green-500" />;
    if (progress === 100) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-gray-900">
              {cached ? 'Instant Result!' : 
               error ? 'Processing Failed' : 
               progress === 100 ? 'Processing Complete' : 'Processing Video'}
            </h3>
            <p className="text-sm text-gray-600">
              {stage || 'Initializing...'}
            </p>
          </div>
        </div>
        
        {/* Method Badge */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          methodInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
          methodInfo.color === 'green' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          <span>{methodInfo.icon}</span>
          <span>{methodInfo.label}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {!error && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Cache/Performance Info */}
      {(cached || costSaved > 0 || processingTime > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {cached && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Cache Hit</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Found existing transcript
              </p>
            </div>
          )}
          
          {costSaved > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <span className="text-sm font-medium text-blue-800">Saved ${costSaved.toFixed(2)}</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Processing cost avoided
              </p>
            </div>
          )}
          
          {processingTime > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  {processingTime < 1 ? `${(processingTime * 1000).toFixed(0)}ms` : `${processingTime.toFixed(1)}s`}
                </span>
              </div>
              <p className="text-xs text-purple-700 mt-1">
                {cached ? 'Response time' : 'Processing time'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Method Description */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">Processing Method</span>
        </div>
        <p className="text-sm text-gray-700">
          {methodInfo.description}
          {cached && ' • Retrieved from global cache for instant results'}
          {method.includes('google_stt') && !cached && ' • Enterprise-grade accuracy and reliability'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Processing Error</span>
          </div>
          <p className="text-sm text-red-700">{error}</p>
          <p className="text-xs text-red-600 mt-1">
            Please try again or contact support if the issue persists.
          </p>
        </div>
      )}

      {/* Success Message */}
      {progress === 100 && !error && !cached && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Processing Complete!</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Your video has been successfully processed with Google Speech-to-Text.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;