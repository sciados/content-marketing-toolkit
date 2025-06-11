// src/components/ui/UsageMeter.jsx - NEW
import React from 'react';
import { useUsageTracking } from '../../hooks/useUsageTracking';

const UsageMeter = ({ type = 'daily_tokens', showDetails = true, className = '' }) => {
  const { limits, getUsagePercentages, getRemainingLimits, loading, wsConnected } = useUsageTracking();
  
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const percentages = getUsagePercentages();
  const remaining = getRemainingLimits();
  const percentage = percentages[type] || 0;
  
  // Get meter configuration based on type
  const getMeterConfig = () => {
    switch (type) {
      case 'daily_tokens':
        return {
          label: 'Daily Tokens',
          used: limits.daily_tokens_used,
          total: limits.daily_token_limit,
          remaining: remaining.daily_tokens,
          unit: 'tokens'
        };
      case 'monthly_tokens':
        return {
          label: 'Monthly Tokens',
          used: limits.monthly_tokens_used,
          total: limits.monthly_token_limit,
          remaining: remaining.monthly_tokens,
          unit: 'tokens'
        };
      case 'daily_videos':
        return {
          label: 'Daily Videos',
          used: limits.daily_videos_processed,
          total: limits.daily_video_limit,
          remaining: remaining.daily_videos,
          unit: 'videos'
        };
      default:
        return {
          label: 'Usage',
          used: 0,
          total: 100,
          remaining: 100,
          unit: ''
        };
    }
  };

   const config = getMeterConfig();
  
  // Get color based on percentage
  const getColor = () => {
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'yellow';
    return 'green';
  };

  const color = getColor();
  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 flex items-center">
            {config.label}
            {wsConnected && (
              <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Real-time updates active"></div>
            )}
          </span>
          <span className="text-gray-600">
            {config.used.toLocaleString()} / {config.total.toLocaleString()} {config.unit}
          </span>
        </div>
      )}
      
      <div className="relative">
        {/* Background bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          {/* Progress bar */}
          <div
            className={`h-2 rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        {/* Percentage overlay for high usage */}
        {percentage >= 90 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow">
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      
      {showDetails && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{config.remaining.toLocaleString()} {config.unit} remaining</span>
          <span>{percentage.toFixed(1)}% used</span>
        </div>
      )}
      
      {/* Warning message for high usage */}
      {percentage >= 90 && (
        <div className="text-xs text-red-600 font-medium">
          ⚠️ {percentage >= 100 ? 'Limit reached' : 'Approaching limit'}
        </div>
      )}
    </div>
  );
};

export default UsageMeter;