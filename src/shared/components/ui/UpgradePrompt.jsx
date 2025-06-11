// src/components/ui/UpgradePrompt.jsx - FIXED VERSION
import React from 'react';
import { useUsageTracking } from '../../hooks/useUsageTracking';

const UpgradePrompt = ({ feature, tokensRequired = 0, onUpgrade, onCancel }) => {
  const { canPerformAction, getRemainingLimits } = useUsageTracking();
  const remaining = getRemainingLimits();
  
  const canPerform = canPerformAction('ai_generation', tokensRequired);
  
  if (canPerform) return null;

  const tierBenefits = {
    pro: {
      name: 'Pro',
      price: '$29/month',
      features: [
        '50,000 tokens/month',
        '2,000 tokens/day',
        '500 Content Library items',
        '15+ Video2Promo projects',
        'Priority support'
      ]
    },
    gold: {
      name: 'Gold',
      price: '$99/month',
      features: [
        '200,000 tokens/month',
        '8,000 tokens/day',
        'Unlimited Content Library',
        '40+ Video2Promo projects',
        'Premium AI models',
        'Team collaboration'
      ]
    }
  };

  const recommendedTier = tokensRequired > 2000 ? 'gold' : 'pro';
  const tier = tierBenefits[recommendedTier];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upgrade Required
              </h3>
              <p className="text-sm text-gray-600">
                You've reached your {feature} limit
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Usage:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Daily tokens remaining:</span>
                  <span className="font-medium">{remaining.daily_tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly tokens remaining:</span>
                  <span className="font-medium">{remaining.monthly_tokens.toLocaleString()}</span>
                </div>
                {tokensRequired > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Tokens needed:</span>
                    <span className="font-medium">{tokensRequired.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
              <h4 className="font-semibold text-indigo-900 mb-2">
                Upgrade to {tier.name} - {tier.price}
              </h4>
              <ul className="space-y-1 text-sm text-indigo-800">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 text-indigo-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onUpgrade(recommendedTier)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;