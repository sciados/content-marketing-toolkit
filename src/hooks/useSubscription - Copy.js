// src/hooks/useSubscription.js
import { useState, useEffect, useCallback } from 'react';
import { subscriptions } from '../services/supabase/subscriptions';
import useSupabase from './useSupabase';
import { useToast } from './useToast';

export const useSubscription = () => {
  const { user } = useSupabase();
  const { showToast } = useToast();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subscription data
  const fetchSubscription = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [subData, usageData, tiersData] = await Promise.all([
        subscriptions.getCurrentSubscription(),
        subscriptions.getUsageStats(),
        subscriptions.getTiers()
      ]);

      setSubscription(subData);
      setUsage(usageData);
      setTiers(tiersData);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Check feature access
  const checkFeatureAccess = useCallback(async (feature) => {
    try {
      return await subscriptions.checkFeatureAccess(feature);
    } catch (err) {
      console.error('Error checking feature access:', err);
      return false;
    }
  }, []);

  // Check usage limit
  const checkUsageLimit = useCallback(async (limitType) => {
    try {
      return await subscriptions.checkUsageLimit(limitType);
    } catch (err) {
      console.error('Error checking usage limit:', err);
      return {
        allowed: false,
        current_usage: 0,
        limit_value: 0,
        remaining: 0
      };
    }
  }, []);

  // Update usage
  const updateUsage = useCallback(async (usageType, amount = 1) => {
    try {
      await subscriptions.updateUsage(usageType, amount);
      // Refresh usage stats
      const newUsage = await subscriptions.getUsageStats();
      setUsage(newUsage);
    } catch (err) {
      console.error('Error updating usage:', err);
      showToast('Error updating usage tracking', 'error');
    }
  }, [showToast]);

  // Check if limit reached before action
  const canPerformAction = useCallback(async (actionType) => {
    const limitCheck = await checkUsageLimit(actionType);
    
    if (!limitCheck.allowed) {
      const tierName = subscription?.tier?.display_name || 'Pro';
      showToast(
        `You've reached your ${actionType} limit. Upgrade to ${tierName} for more.`,
        'warning'
      );
      return false;
    }
    
    return true;
  }, [checkUsageLimit, subscription, showToast]);

  // Helper functions
  const isFreeTier = subscription?.subscription_tier === 'free';
  const isProTier = subscription?.subscription_tier === 'pro';
  const isSuperAdmin = subscription?.subscription_tier === 'superAdmin';

  // Get tier display info
  const getTierInfo = () => {
    if (!subscription?.tier) return null;
    
    return {
      name: subscription.tier.display_name,
      color: subscription.tier.badge_color,
      limits: {
        emails: subscription.tier.email_quota === -1 ? 'Unlimited' : subscription.tier.email_quota,
        series: subscription.tier.series_limit === -1 ? 'Unlimited' : subscription.tier.series_limit,
        aiTokens: subscription.tier.ai_tokens_monthly === -1 ? 'Unlimited' : subscription.tier.ai_tokens_monthly
      }
    };
  };

  // Get usage percentage
  const getUsagePercentage = (type) => {
    if (!usage || !subscription?.tier) return 0;
    
    const limits = {
      emails: subscription.tier.email_quota,
      series: subscription.tier.series_limit,
      aiTokens: subscription.tier.ai_tokens_monthly
    };
    
    const current = {
      emails: usage.emails_generated || 0,
      series: usage.series_created || 0,
      aiTokens: usage.ai_tokens_used || 0
    };
    
    const limit = limits[type];
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100; // No access
    
    return Math.min(100, Math.round((current[type] / limit) * 100));
  };

  return {
    subscription,
    usage,
    tiers,
    loading,
    error,
    
    // Actions
    checkFeatureAccess,
    checkUsageLimit,
    updateUsage,
    canPerformAction,
    fetchSubscription,
    
    // Helpers
    isFreeTier,
    isProTier,
    isSuperAdmin,
    getTierInfo,
    getUsagePercentage
  };
};