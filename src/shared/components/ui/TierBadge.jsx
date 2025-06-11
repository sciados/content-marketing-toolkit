// src/components/ui/TierBadge.jsx
import React from 'react';
import { getTierDisplayName, getTierClasses, isSuperAdmin } from '../../utils/tierUtils';

const TierBadge = ({ tier, size = 'sm', showIcon = true, className = '' }) => {
  const displayName = getTierDisplayName(tier);
  const classes = getTierClasses(tier);
  const isSuper = isSuperAdmin(tier);
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-2 text-lg'
  };
  
  const iconMap = {
    'Free': '🆓',
    'Gold': '⭐',
    'Enterprise': '🏢',
    'Super Admin': '🛡️'
  };
  
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full border
        ${classes.badge}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && (
        <span className="flex-shrink-0">
          {iconMap[displayName] || '📦'}
        </span>
      )}
      <span className={isSuper ? 'font-bold' : ''}>
        {displayName}
      </span>
      {isSuper && (
        <span className="ml-1 text-xs opacity-75">
          (Admin)
        </span>
      )}
    </span>
  );
};

export default TierBadge;