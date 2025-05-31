// src/components/Common/UpgradePrompt.jsx
import React from 'react';
import { Button } from './Button';

const TIER_INFO = {
  free: {
    name: 'Free',
    nextTier: 'pro',
    limits: {
      monthlyTokens: 5000,
      videoProjects: 1,
      emails: 10,
      series: 2
    }
  },
  pro: {
    name: 'Pro',
    nextTier: 'gold',
    limits: {
      monthlyTokens: 100000,
      videoProjects: 15,
      emails: 200,
      series: 30
    }
  },
  gold: {
    name: 'Gold',
    nextTier: null,
    limits: {
      monthlyTokens: 500000,
      videoProjects: 50,
      emails: 1000,
      series: 150
    }
  }
};

const PRICING = {
  pro: {
    monthly: 49,
    annual: 39,
    features: [
      'AI-powered content generation',
      '15 Video2Promo projects/month',
      '200 emails, 30 series',
      'A/B variant generation',
      'Advanced analytics',
      'Priority support'
    ]
  },
  gold: {
    monthly: 149,
    annual: 119,
    features: [
      'Everything in Pro',
      '50+ Video2Promo projects/month',
      '1,000 emails, 150 series',
      'White-label options',
      'Custom integrations',
      'Dedicated account manager'
    ]
  }
};

export const UpgradePrompt = ({ 
  currentTier = 'free',
  feature = 'this feature',
  tokensNeeded = 0,
  tokensRemaining = 0,
  onUpgrade,
  onClose,
  className = ''
}) => {
  const tierInfo = TIER_INFO[currentTier];
  const nextTier = tierInfo?.nextTier;
  const pricing = nextTier ? PRICING[nextTier] : null;

  if (!nextTier || !pricing) {
    return null; // Already on highest tier
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade(nextTier);
    } else {
      // Default action - redirect to subscription page
      window.location.href = '/subscription';
    }
  };

  const tokenShortfall = tokensNeeded - tokensRemaining;
  const isTokenLimit = tokenShortfall > 0;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-lg ${className}`}>
      {/* Content */}
      <div className="px-6 py-6">
        {/* Current vs Next Tier Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Current Tier */}
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mb-2">
              Current: {tierInfo.name}
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>{tierInfo.limits.monthlyTokens.toLocaleString()} tokens/month</div>
              <div>{tierInfo.limits.videoProjects} video projects</div>
              <div>{tierInfo.limits.emails} emails</div>
            </div>
          </div>

          {/* Next Tier */}
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-2">
              Upgrade: {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}
            </div>
            <div className="space-y-1 text-sm text-gray-900">
              <div className="font-medium">{TIER_INFO[nextTier].limits.monthlyTokens.toLocaleString()} tokens/month</div>
              <div className="font-medium">{TIER_INFO[nextTier].limits.videoProjects} video projects</div>
              <div className="font-medium">{TIER_INFO[nextTier].limits.emails} emails</div>
            </div>
          </div>
        </div>

        {/* Token Usage Info */}
        {isTokenLimit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-800 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">Token Limit Reached</span>
            </div>
            <div className="text-sm text-red-700 space-y-1">
              <div>Tokens needed: {tokensNeeded.toLocaleString()}</div>
              <div>Tokens remaining: {tokensRemaining.toLocaleString()}</div>
              <div className="font-medium">Shortfall: {tokenShortfall.toLocaleString()} tokens</div>
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">
            What you'll get with {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}:
          </h4>
          <ul className="space-y-2">
            {pricing.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${pricing.monthly}/month
            </div>
            <div className="text-sm text-gray-600 mb-2">
              or ${pricing.annual}/month paid annually
            </div>
            <div className="text-xs text-green-600 font-medium">
              Save ${(pricing.monthly - pricing.annual) * 12}/year with annual billing
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleUpgrade}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            size="lg"
          >
            Upgrade to {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Maybe Later
            </Button>
          )}
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            ✓ 30-day money-back guarantee • ✓ Cancel anytime • ✓ Instant access
          </p>
        </div>
      </div>   
 
     {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🚀</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Upgrade to {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}
              </h3>
              <p className="text-sm text-gray-600">
                {isTokenLimit 
                  ? `Need ${tokensNeeded.toLocaleString()} tokens for ${feature}`
                  : `Unlock ${feature} with ${nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}`
                }
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      </div>
 );
}