// src/hooks/useSubscription.js
import { useState, useEffect, useCallback } from 'react';
import { subscriptions } from '../services/supabase/subscriptions';
import useAuth from './useAuth';
import { useToast } from './useToast';

/**
 * Custom hook for managing subscription state and operations
 * @returns {Object} Subscription data and methods
 */
const useSubscription = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // State
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availableTiers, setAvailableTiers] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);

  // Fetch current subscription
  const fetchCurrentSubscription = useCallback(async () => {
    if (!user) return;
    
    try {
      const subscription = await subscriptions.getCurrentSubscription();
      setCurrentSubscription(subscription);
      return subscription;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      throw error;
    }
  }, [user]);

  // Fetch available tiers
  const fetchAvailableTiers = useCallback(async () => {
    try {
      const tiers = await subscriptions.getTiers();
      setAvailableTiers(tiers);
      return tiers;
    } catch (error) {
      console.error('Error fetching available tiers:', error);
      throw error;
    }
  }, []);

  // Fetch usage statistics
  const fetchUsageStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const usage = await subscriptions.getUsageStats();
      setUsageStats(usage);
      return usage;
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      throw error;
    }
  }, [user]);

  // Fetch subscription history
  const fetchSubscriptionHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      const history = await subscriptions.getSubscriptionHistory();
      setSubscriptionHistory(history);
      return history;
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      throw error;
    }
  }, [user]);

  // Check if user has access to a feature
  const checkFeatureAccess = useCallback(async (feature) => {
    if (!user) return false;
    
    try {
      return await subscriptions.checkFeatureAccess(feature);
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }, [user]);

  // Check usage limit for a resource
  const checkUsageLimit = useCallback(async (limitType) => {
    if (!user) return { allowed: false, current_usage: 0, limit_value: 0, remaining: 0 };
    
    try {
      return await subscriptions.checkUsageLimit(limitType);
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return { allowed: false, current_usage: 0, limit_value: 0, remaining: 0 };
    }
  }, [user]);

  // Update usage tracking
  const updateUsage = useCallback(async (usageType, amount = 1) => {
    if (!user) return;
    
    try {
      await subscriptions.updateUsage(usageType, amount);
      // Refresh usage stats after update
      await fetchUsageStats();
    } catch (error) {
      console.error('Error updating usage:', error);
      throw error;
    }
  }, [user, fetchUsageStats]);

  // Check if user is on a specific tier
  const isOnTier = useCallback(async (tierName) => {
    if (!user) return false;
    
    try {
      return await subscriptions.isOnTier(tierName);
    } catch (error) {
      console.error('Error checking tier:', error);
      return false;
    }
  }, [user]);

  // Check if user is super admin
  const isGold = useCallback(async () => {
    if (!user) return false;
    
    try {
      return await subscriptions.isGold();
    } catch (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
  }, [user]);

  // Load all subscription data
  const loadSubscriptionData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchCurrentSubscription(),
        fetchAvailableTiers(),
        fetchUsageStats(),
        fetchSubscriptionHistory()
      ]);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      showToast('Error loading subscription data', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, fetchCurrentSubscription, fetchAvailableTiers, fetchUsageStats, fetchSubscriptionHistory, showToast]);

  // Utility functions
  const getTierDisplayName = useCallback((tierName) => {
    const tier = availableTiers.find(t => t.name === tierName);
    return tier?.display_name || tierName;
  }, [availableTiers]);

  const getTierBadgeColor = useCallback((tierName) => {
    switch (tierName) {
      case 'free':
        return 'gray';
      case 'pro':
        return 'blue';
      case 'gold':
        return 'purple';
      default:
        return 'gray';
    }
  }, []);

  const getUsagePercentage = useCallback((current, limit) => {
    if (!limit || limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  }, []);

  const getUsageBarColor = useCallback((percentage) => {
    if (percentage >= 90) return '#EF4444'; // Red
    if (percentage >= 75) return '#F59E0B'; // Yellow
    return '#10B981'; // Green
  }, []);

  const canUseFeature = useCallback((featureName) => {
    if (!currentSubscription?.tier) return false;
    
    const tier = currentSubscription.tier;
    
    // Check specific feature limits
    switch (featureName) {
      case 'email_generation':
        if (tier.email_limit === -1) return true; // Unlimited
        return (usageStats?.emails_generated || 0) < tier.email_limit;
      
      case 'email_saving':
        if (tier.storage_limit === -1) return true; // Unlimited
        return (usageStats?.emails_saved || 0) < tier.storage_limit;
      
      case 'series_creation':
        if (tier.series_limit === -1) return true; // Unlimited
        return (usageStats?.series_created || 0) < tier.series_limit;
      
      default:
        return true;
    }
  }, [currentSubscription, usageStats]);

  const getRemainingUsage = useCallback((featureType) => {
    if (!currentSubscription?.tier || !usageStats) return 0;
    
    const tier = currentSubscription.tier;
    
    switch (featureType) {
      case 'emails':
        if (tier.email_limit === -1) return -1; // Unlimited
        return Math.max(0, tier.email_limit - (usageStats.emails_generated || 0));
      
      case 'storage':
        if (tier.storage_limit === -1) return -1; // Unlimited
        return Math.max(0, tier.storage_limit - (usageStats.emails_saved || 0));
      
      case 'series':
        if (tier.series_limit === -1) return -1; // Unlimited
        return Math.max(0, tier.series_limit - (usageStats.series_created || 0));
      
      default:
        return 0;
    }
  }, [currentSubscription, usageStats]);

  // Load subscription data when user changes
  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user, loadSubscriptionData]);

  return {
    // State
    loading,
    currentSubscription,
    availableTiers,
    usageStats,
    subscriptionHistory,
    
    // Data fetching methods
    fetchCurrentSubscription,
    fetchAvailableTiers,
    fetchUsageStats,
    fetchSubscriptionHistory,
    loadSubscriptionData,
    
    // Feature checking methods
    checkFeatureAccess,
    checkUsageLimit,
    updateUsage,
    isOnTier,
    isGold,
    canUseFeature,
    getRemainingUsage,
    
    // Utility methods
    getTierDisplayName,
    getTierBadgeColor,
    getUsagePercentage,
    getUsageBarColor
  };
};

export default useSubscription;
