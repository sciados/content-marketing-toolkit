// src/services/supabase/subscriptions.js
import { supabase } from './supabaseClient';

/**
 * Subscription service for managing user tiers and limits
 */
export const subscriptions = {
  /**
   * Get all available subscription tiers
   * @returns {Promise} - Array of subscription tiers
   */
  getTiers: async () => {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  /**
   * Get a specific tier by name
   * @param {string} tierName - Name of the tier
   * @returns {Promise} - Tier data
   */
  getTier: async (tierName) => {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('name', tierName)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get current user's subscription info
   * @returns {Promise} - User's subscription data
   */
  getCurrentSubscription: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, subscription_started_at, subscription_ends_at')
      .eq('id', user.id)
      .single();
    
    if (profileError) throw profileError;

    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('name', profile.subscription_tier || 'free')
      .single();
    
    if (tierError) throw tierError;

    return {
      ...profile,
      tier
    };
  },

  /**
   * Check if user has access to a feature
   * @param {string} feature - Feature name
   * @returns {Promise<boolean>} - Access allowed
   */
  checkFeatureAccess: async (feature) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .rpc('check_tier_access', {
        user_id: user.id,
        feature_name: feature
      });
    
    if (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
    
    return data;
  },

  /**
   * Check usage limit for a resource
   * @param {string} limitType - Type of limit ('emails', 'series', 'ai_tokens')
   * @returns {Promise} - Usage data
   */
  checkUsageLimit: async (limitType) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .rpc('check_usage_limit', {
        user_id: user.id,
        limit_type: limitType
      });
    
    if (error) throw error;
    
    return data[0] || {
      allowed: false,
      current_usage: 0,
      limit_value: 0,
      remaining: 0
    };
  },

  /**
   * Update usage tracking
   * @param {string} usageType - Type of usage
   * @param {number} amount - Amount to add
   * @returns {Promise} - Update result
   */
  updateUsage: async (usageType, amount = 1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .rpc('update_usage_tracking', {
        user_id: user.id,
        usage_type: usageType,
        amount: amount
      });
    
    if (error) throw error;
  },

  /**
   * Get usage statistics for current month
   * @returns {Promise} - Usage stats
   */
  getUsageStats: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth.toISOString().split('T')[0])
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return data || {
      emails_generated: 0,
      emails_saved: 0,
      ai_tokens_used: 0,
      series_created: 0
    };
  },

  /**
   * Get subscription history
   * @returns {Promise} - Array of subscription changes
   */
  getSubscriptionHistory: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Update user's subscription tier (admin only)
   * @param {string} userId - User ID
   * @param {string} newTier - New tier name
   * @param {string} reason - Reason for change
   * @returns {Promise} - Update result
   */
  updateUserTier: async (userId, newTier, reason = '') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if current user is super admin
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    if (currentUserProfile?.subscription_tier !== 'gold') {
      throw new Error('Unauthorized: Only super admins can change tiers');
    }

    // Get current tier
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
    
    const fromTier = targetProfile?.subscription_tier || 'free';
    
    // Record history
    const { error: historyError } = await supabase
      .from('subscription_history')
      .insert({
        user_id: userId,
        from_tier: fromTier,
        to_tier: newTier,
        action: fromTier === 'free' && newTier !== 'free' ? 'upgrade' : 
                newTier === 'free' ? 'downgrade' : 'change',
        reason: reason
      });
    
    if (historyError) throw historyError;

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: newTier,
        subscription_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) throw updateError;

    return { success: true };
  },

  /**
   * Check if user is on a specific tier
   * @param {string} tierName - Tier to check
   * @returns {Promise<boolean>} - Is on tier
   */
  isOnTier: async (tierName) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    return data?.subscription_tier === tierName;
  },

  /**
   * Check if user is super admin
   * @returns {Promise<boolean>} - Is super admin
   */
  isGold: async () => {
    return await subscriptions.isOnTier('gold');
  }
};