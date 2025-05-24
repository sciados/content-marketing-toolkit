// src/components/Common/UsageDisplay.jsx
import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';

const UsageDisplay = ({ type = 'emails', showDetails = true, className = '' }) => {
  const { usage, subscription, loading, getUsagePercentage } = useSubscription();

  if (loading || !subscription?.tier) {
    return <div className="animate-pulse h-20 bg-gray-100 rounded"></div>;
  }

  const limits = {
    emails: {
      current: usage?.emails_generated || 0,
      limit: subscription.tier.email_quota,
      label: 'Emails Generated',
      icon: '✉️'
    },
    series: {
      current: usage?.series_created || 0,
      limit: subscription.tier.series_limit,
      label: 'Email Series',
      icon: '📚'
    },
    aiTokens: {
      current: usage?.ai_tokens_used || 0,
      limit: subscription.tier.ai_tokens_monthly,
      label: 'AI Tokens Used',
      icon: '🤖'
    }
  };

  const data = limits[type];
  const percentage = getUsagePercentage(type);
  const isUnlimited = data.limit === -1;
  const isNearLimit = percentage >= 80 && !isUnlimited;
  const isAtLimit = percentage >= 100 && !isUnlimited;

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{data.icon}</span>
          <span className="text-sm font-medium text-gray-700">{data.label}</span>
        </div>
        <span className={`text-sm font-semibold ${
          isAtLimit ? 'text-red-600' : 
          isNearLimit ? 'text-yellow-600' : 
          'text-gray-600'
        }`}>
          {isUnlimited ? 'Unlimited' : `${data.current} / ${data.limit}`}
        </span>
      </div>
      
      {showDetails && !isUnlimited && (
        <>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isAtLimit ? 'bg-red-500' : 
                isNearLimit ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          {isNearLimit && (
            <p className="text-xs mt-1 text-yellow-600">
              You're approaching your limit. Consider upgrading for more.
            </p>
          )}
          
          {isAtLimit && (
            <p className="text-xs mt-1 text-red-600">
              You've reached your limit. Upgrade to continue.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default UsageDisplay;