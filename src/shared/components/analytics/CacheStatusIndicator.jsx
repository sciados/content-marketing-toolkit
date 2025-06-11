import React, { useState, useEffect } from 'react';
import { CheckCircle, DollarSign, Users, Zap, TrendingUp, Clock, Database } from 'lucide-react';

export const CacheStatusIndicator = ({ 
  cacheStatus, 
  savings = {}, 
  globalStats = {},
  showAnimation = true,
  showGlobalImpact = true 
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (cacheStatus === 'hit' && showAnimation) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [cacheStatus, showAnimation]);

  // Calculate total community impact
  const communityImpact = {
    totalSavings: globalStats.totalSavings || 0,
    totalRequests: globalStats.totalRequests || 0,
    cacheHitRate: globalStats.cacheHitRate || 0,
    avgProcessingTime: globalStats.avgProcessingTime || 0
  };

  if (cacheStatus === 'checking') {
    return (
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
          <div>
            <h4 className="font-medium text-blue-900">Checking Global Cache</h4>
            <p className="text-sm text-blue-700">
              Looking for existing transcription to save you time and money...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (cacheStatus === 'miss') {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-3">
          <Database className="h-5 w-5 text-gray-600" />
          <div>
            <h4 className="font-medium text-gray-900">New Transcription</h4>
            <p className="text-sm text-gray-600">
              This video hasn't been transcribed yet. Your transcription will be added to our global cache to help others!
            </p>
          </div>
        </div>
        
        {showGlobalImpact && (
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded p-2">
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="font-medium text-gray-900">
                  {Math.round(communityImpact.cacheHitRate * 100)}% Hit Rate
                </span>
              </div>
              <p className="text-gray-600">Community average</p>
            </div>
            <div className="bg-white rounded p-2">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3 text-blue-600" />
                <span className="font-medium text-gray-900">
                  {communityImpact.totalRequests.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600">Videos processed</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (cacheStatus === 'hit') {
    return (
      <div className={`relative overflow-hidden transition-all duration-500 ${
        showCelebration ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-green-50'
      } rounded-lg p-4 border-2 border-green-200`}>
        
        {/* Celebration Animation */}
        {showCelebration && !animationComplete && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center opacity-20 animate-ping">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <CheckCircle className={`h-6 w-6 text-green-600 ${showCelebration ? 'animate-bounce' : ''}`} />
              {showCelebration && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              )}
            </div>
            <div>
              <h4 className="font-bold text-green-900">🎉 Cache Hit! Instant Results</h4>
              <p className="text-sm text-green-800">
                This video was already transcribed - delivering results immediately!
              </p>
            </div>
          </div>

          {/* Savings Breakdown */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white bg-opacity-70 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-900">
                  ${(savings.cost || 0).toFixed(2)} Saved
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Processing cost avoided
              </p>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-900">
                  {savings.timeMinutes || 2}min Saved
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Processing time avoided
              </p>
            </div>
          </div>

          {/* Global Community Impact */}
          {showGlobalImpact && (
            <div className="bg-white bg-opacity-70 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Community Impact</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-green-900">
                    ${communityImpact.totalSavings.toLocaleString()}
                  </div>
                  <div className="text-green-700">Total Saved</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-900">
                    {Math.round(communityImpact.cacheHitRate * 100)}%
                  </div>
                  <div className="text-green-700">Hit Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-900">
                    {communityImpact.totalRequests.toLocaleString()}
                  </div>
                  <div className="text-green-700">Videos Served</div>
                </div>
              </div>

              <div className="mt-2 text-xs text-green-700 text-center">
                🌱 Your usage helps make transcription faster and cheaper for everyone!
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (cacheStatus === 'error') {
    return (
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <div className="flex items-center space-x-3">
          <Zap className="h-5 w-5 text-amber-600" />
          <div>
            <h4 className="font-medium text-amber-900">Cache Check Failed</h4>
            <p className="text-sm text-amber-700">
              Proceeding with fresh transcription. Cache will be populated for future requests.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CacheStatusIndicator;