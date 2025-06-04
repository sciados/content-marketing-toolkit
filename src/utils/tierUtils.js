// src/utils/tierUtils.js - Complete Tier Management Utility
// Handles all subscription tier logic, normalization, and display

/**
 * Normalizes tier names to standard format
 * Handles legacy tier names and variations
 */
export const normalizeTier = (tier) => {
  if (!tier) return 'free';
  
  const tierMap = {
    // Legacy mappings
    'pro': 'gold',
    'premium': 'gold',
    'basic': 'free',
    'starter': 'free',
    
    // Standard tiers
    'free': 'free',
    'gold': 'gold',
    'enterprise': 'enterprise',
    
    // Admin tiers
    'superadmin': 'superAdmin',
    'superAdmin': 'superAdmin',
    'admin': 'superAdmin',
    'super_admin': 'superAdmin',
    
    // Future tiers
    'platinum': 'enterprise',
    'business': 'enterprise'
  };
  
  const normalized = tierMap[tier.toLowerCase()];
  return normalized || 'free';
};

/**
 * Gets display-friendly tier name
 */
export const getTierDisplayName = (tier) => {
  const normalized = normalizeTier(tier);
  
  const displayNames = {
    'free': 'Free',
    'gold': 'Gold',
    'enterprise': 'Enterprise',
    'superAdmin': 'Super Admin'
  };
  
  return displayNames[normalized] || 'Free';
};

/**
 * Gets tier color for badges and UI elements
 */
export const getTierColor = (tier) => {
  const normalized = normalizeTier(tier);
  
  const colors = {
    'free': 'gray',
    'gold': 'yellow',
    'enterprise': 'purple',
    'superAdmin': 'red'
  };
  
  return colors[normalized] || 'gray';
};

/**
 * Gets Tailwind CSS classes for tier display
 */
export const getTierClasses = (tier) => {
  const normalized = normalizeTier(tier);
  
  const classes = {
    'free': {
      badge: 'bg-gray-100 text-gray-800 border-gray-200',
      text: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200'
    },
    'gold': {
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      text: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
    'enterprise': {
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      text: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    },
    'superAdmin': {
      badge: 'bg-red-100 text-red-800 border-red-200',
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    }
  };
  
  return classes[normalized] || classes.free;
};

/**
 * Gets tier limits and quotas
 */
export const getTierLimits = (tier) => {
  const normalized = normalizeTier(tier);
  
  const limits = {
    'free': {
      monthlyTokens: 10000,
      dailyTokens: 500,
      videosPerDay: 5,
      apiCallsPerHour: 20,
      contentLibraryItems: 50,
      emailsPerGeneration: 3
    },
    'gold': {
      monthlyTokens: 100000,
      dailyTokens: 5000,
      videosPerDay: 50,
      apiCallsPerHour: 200,
      contentLibraryItems: 500,
      emailsPerGeneration: 5
    },
    'enterprise': {
      monthlyTokens: 500000,
      dailyTokens: 25000,
      videosPerDay: 200,
      apiCallsPerHour: 1000,
      contentLibraryItems: 2000,
      emailsPerGeneration: 10
    },
    'superAdmin': {
      monthlyTokens: 999999999,
      dailyTokens: 999999,
      videosPerDay: 999,
      apiCallsPerHour: 9999,
      contentLibraryItems: 9999,
      emailsPerGeneration: 20
    }
  };
  
  return limits[normalized] || limits.free;
};

/**
 * Gets tier features and capabilities
 */
export const getTierFeatures = (tier) => {
  const normalized = normalizeTier(tier);
  
  const features = {
    'free': {
      videoTranscription: true,
      basicEmailGeneration: true,
      contentLibrary: true,
      basicSupport: true,
      // Disabled features
      advancedEmailGeneration: false,
      bulkOperations: false,
      customBranding: false,
      prioritySupport: false,
      apiAccess: false,
      teamFeatures: false,
      adminPanel: false
    },
    'gold': {
      videoTranscription: true,
      basicEmailGeneration: true,
      advancedEmailGeneration: true,
      contentLibrary: true,
      bulkOperations: true,
      basicSupport: true,
      prioritySupport: true,
      // Disabled features
      customBranding: false,
      apiAccess: false,
      teamFeatures: false,
      adminPanel: false
    },
    'enterprise': {
      videoTranscription: true,
      basicEmailGeneration: true,
      advancedEmailGeneration: true,
      contentLibrary: true,
      bulkOperations: true,
      customBranding: true,
      apiAccess: true,
      teamFeatures: true,
      basicSupport: true,
      prioritySupport: true,
      dedicatedSupport: true,
      // Disabled features
      adminPanel: false
    },
    'superAdmin': {
      // All features enabled
      videoTranscription: true,
      basicEmailGeneration: true,
      advancedEmailGeneration: true,
      contentLibrary: true,
      bulkOperations: true,
      customBranding: true,
      apiAccess: true,
      teamFeatures: true,
      basicSupport: true,
      prioritySupport: true,
      dedicatedSupport: true,
      adminPanel: true,
      systemManagement: true,
      userManagement: true,
      analytics: true
    }
  };
  
  return features[normalized] || features.free;
};

/**
 * Check if user is super admin
 */
export const isSuperAdmin = (tier) => {
  return normalizeTier(tier) === 'superAdmin';
};

/**
 * Check if user has admin privileges
 */
export const isAdmin = (tier) => {
  const normalized = normalizeTier(tier);
  return normalized === 'superAdmin' || normalized === 'admin';
};

/**
 * Check if user can access a specific feature
 */
export const hasFeature = (tier, featureName) => {
  const features = getTierFeatures(tier);
  return features[featureName] === true;
};

/**
 * Get tier upgrade suggestions
 */
export const getUpgradeSuggestions = (tier) => {
  const normalized = normalizeTier(tier);
  
  const suggestions = {
    'free': {
      nextTier: 'gold',
      benefits: [
        'Increase monthly tokens from 10K to 100K',
        'Process 50 videos per day instead of 5',
        'Generate up to 5 emails per session',
        'Access advanced email generation features',
        'Priority customer support'
      ]
    },
    'gold': {
      nextTier: 'enterprise',
      benefits: [
        'Increase monthly tokens from 100K to 500K',
        'Process 200 videos per day',
        'Generate up to 10 emails per session',
        'Custom branding options',
        'API access for integrations',
        'Team collaboration features',
        'Dedicated support'
      ]
    },
    'enterprise': {
      nextTier: null,
      benefits: [
        'You have access to all premium features',
        'Contact sales for custom enterprise solutions'
      ]
    },
    'superAdmin': {
      nextTier: null,
      benefits: [
        'You have unlimited access to all features',
        'Administrative control over the platform'
      ]
    }
  };
  
  return suggestions[normalized] || suggestions.free;
};

/**
 * Format usage percentage with tier context
 */
export const formatUsagePercentage = (used, limit, tier) => {
  if (!limit || limit === 0) return '0%';
  
  const percentage = Math.round((used / limit) * 100);
  const normalized = normalizeTier(tier);
  
  // Super admin gets special formatting
  if (normalized === 'superAdmin') {
    return `${used.toLocaleString()} (unlimited)`;
  }
  
  return `${percentage}% (${used.toLocaleString()} / ${limit.toLocaleString()})`;
};

/**
 * Get tier priority for sorting
 */
export const getTierPriority = (tier) => {
  const normalized = normalizeTier(tier);
  
  const priorities = {
    'superAdmin': 100,
    'enterprise': 80,
    'gold': 60,
    'free': 40
  };
  
  return priorities[normalized] || 0;
};

/**
 * Check if tier change is allowed
 */
export const canChangeTier = (fromTier, toTier, userRole = 'user') => {
  // Only super admins can change tiers
  if (!isSuperAdmin(userRole)) {
    return false;
  }
  
  // Can't change from/to same tier
  if (normalizeTier(fromTier) === normalizeTier(toTier)) {
    return false;
  }
  
  // Super admins can change any tier
  return true;
};

/**
 * Get tier description for UI
 */
export const getTierDescription = (tier) => {
  const normalized = normalizeTier(tier);
  
  const descriptions = {
    'free': 'Basic features with limited usage',
    'gold': 'Enhanced features with increased limits',
    'enterprise': 'Full feature access with enterprise-grade support',
    'superAdmin': 'Unlimited access with administrative privileges'
  };
  
  return descriptions[normalized] || descriptions.free;
};

/**
 * Export default object with all functions
 */
export default {
  normalizeTier,
  getTierDisplayName,
  getTierColor,
  getTierClasses,
  getTierLimits,
  getTierFeatures,
  isSuperAdmin,
  isAdmin,
  hasFeature,
  getUpgradeSuggestions,
  formatUsagePercentage,
  getTierPriority,
  canChangeTier,
  getTierDescription
};