// src/components/Common/UsageMeter.jsx
import React from 'react';

const TIER_COLORS = {
  free: {
    bg: 'bg-gray-200',
    fill: 'bg-gray-500',
    text: 'text-gray-700',
    accent: 'text-gray-500'
  },
  pro: {
    bg: 'bg-indigo-200',
    fill: 'bg-indigo-600',
    text: 'text-indigo-700',
    accent: 'text-indigo-600'
  },
  gold: {
    bg: 'bg-yellow-200',
    fill: 'bg-yellow-600',
    text: 'text-yellow-700',
    accent: 'text-yellow-600'
  }
};

export const UsageMeter = ({
  current = 0,
  limit = 100,
  label = 'Usage',
  tier = 'free',
  showPercentage = true,
  showNumbers = true,
  size = 'default', // 'small', 'default', 'large'
  className = '',
  warningThreshold = 80,
  criticalThreshold = 95
}) => {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - current, 0);
  const isWarning = percentage >= warningThreshold;
  const isCritical = percentage >= criticalThreshold;
  
  const colors = TIER_COLORS[tier] || TIER_COLORS.free;
  
  // Override colors for warning states
  const barColors = isCritical 
    ? { bg: 'bg-red-200', fill: 'bg-red-600', text: 'text-red-700', accent: 'text-red-600' }
    : isWarning 
    ? { bg: 'bg-orange-200', fill: 'bg-orange-600', text: 'text-orange-700', accent: 'text-orange-600' }
    : colors;

  const sizeClasses = {
    small: 'h-2 text-xs',
    default: 'h-3 text-sm',
    large: 'h-4 text-base'
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${sizeClasses[size]} ${barColors.text}`}>
            {label}
          </span>
          {tier !== 'free' && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
              ${tier === 'pro' ? 'bg-indigo-100 text-indigo-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {tier}
            </span>
          )}
        </div>
        
        {showPercentage && (
          <span className={`${sizeClasses[size]} font-medium ${barColors.accent}`}>
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className={`w-full ${barColors.bg} rounded-full ${sizeClasses[size]}`}>
          <div
            className={`${sizeClasses[size]} ${barColors.fill} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Numbers */}
        {showNumbers && (
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              {formatNumber(current)} used
            </span>
            <span>
              {formatNumber(remaining)} remaining of {formatNumber(limit)}
            </span>
          </div>
        )}
      </div>

      {/* Warning Messages */}
      {isCritical && (
        <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>Critical: Almost at limit!</span>
        </div>
      )}
      
      {isWarning && !isCritical && (
        <div className="flex items-center space-x-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>Warning: {100 - percentage.toFixed(1)}% remaining</span>
        </div>
      )}
    </div>
  );
};

// Composite component for multiple usage metrics
export const UsageMeters = ({ 
  usageData = {},
  userTier = 'free',
  className = ''
}) => {
  const {
    monthlyTokens = { current: 0, limit: 5000 },
    dailyTokens = { current: 0, limit: 200 },
    videoProjects = { current: 0, limit: 1 },
    emails = { current: 0, limit: 10 },
    series = { current: 0, limit: 2 }
  } = usageData;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary Metric - Monthly Tokens */}
      <UsageMeter
        current={monthlyTokens.current}
        limit={monthlyTokens.limit}
        label="Monthly Tokens"
        tier={userTier}
        size="large"
      />

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UsageMeter
          current={dailyTokens.current}
          limit={dailyTokens.limit}
          label="Daily Tokens"
          tier={userTier}
          size="small"
        />
        
        <UsageMeter
          current={videoProjects.current}
          limit={videoProjects.limit}
          label="Video Projects"
          tier={userTier}
          size="small"
        />
        
        <UsageMeter
          current={emails.current}
          limit={emails.limit}
          label="Emails Generated"
          tier={userTier}
          size="small"
        />
        
        <UsageMeter
          current={series.current}
          limit={series.limit}
          label="Email Series"
          tier={userTier}
          size="small"
        />
      </div>
    </div>
  );
};
