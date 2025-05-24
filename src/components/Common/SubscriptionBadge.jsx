// src/components/Common/SubscriptionBadge.jsx
import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';

const SubscriptionBadge = ({ showUpgradeButton = false, className = '' }) => {
  const { subscription, loading } = useSubscription();

  if (loading || !subscription?.tier) {
    return null;
  }

  const tier = subscription.tier;
  
  // Color mapping for badge
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    gold: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  const badgeColor = colorClasses[tier.badge_color] || colorClasses.gray;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badgeColor}`}>
        {tier.display_name}
      </span>
      
      {showUpgradeButton && tier.name !== 'gold' && (
        <button
          onClick={() => window.location.href = '/pricing'}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          Upgrade
        </button>
      )}
    </div>
  );
};

export default SubscriptionBadge;