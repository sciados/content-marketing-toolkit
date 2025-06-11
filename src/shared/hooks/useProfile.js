// src/hooks/useProfile.js - Enhanced with name support
import { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '../services/useAuth/useAuthClient';
import useAuth from './useAuth';
import { profiles } from '../../core/services/profiles';
import { v4 as uuidv4 } from 'uuid';

// Default quotas by tier - these should match your actual system
const DEFAULT_QUOTAS = {
  free: 10,
  pro: 200,
  gold: 1000,
  enterprise: 5000,
  superadmin: 5000
};

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [profileStats, setProfileStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  // Helper function to determine quota based on tier
  const getQuotaForTier = (tier) => {
    return DEFAULT_QUOTAS[tier?.toLowerCase()] || DEFAULT_QUOTAS.free;
  };
  
  // Helper function to get display name
  const getDisplayName = useCallback((profileData) => {
    if (!profileData) return 'User';
    
    const firstName = profileData.first_name;
    const lastName = profileData.last_name;
    const email = profileData.email;
    
    // Priority: First Name > First + Last > Email username > "User"
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (email) {
      return email.split('@')[0]; // Use email username as fallback
    }
    
    return 'User';
  }, []);
  
  // Helper function to get first name only
  const getFirstName = useCallback((profileData) => {
    if (!profileData) return 'User';
    
    const firstName = profileData.first_name;
    const email = profileData.email;
    
    if (firstName) {
      return firstName;
    } else if (email) {
      // Capitalize first letter of email username
      const emailUsername = email.split('@')[0];
      return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
    }
    
    return 'User';
  }, []);
  
  // Refresh profile stats function
  const refreshProfileStats = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Refreshing profile statistics...');
      
      // Fetch fresh profile data from database
      const { data: freshProfile, error: profileError } = await useAuth
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      console.log('📊 Fresh profile data:', freshProfile);
      
      // Calculate or use stored email quota
      let emailQuota = freshProfile.email_quota;
      
      // If no quota stored, calculate based on subscription tier
      if (!emailQuota || emailQuota <= 0) {
        const tier = freshProfile.subscription_tier || 'free';
        emailQuota = getQuotaForTier(tier);
        
        console.log(`⚠️ No quota found, using default for tier "${tier}": ${emailQuota}`);
        
        // Update the database with the calculated quota
        await useAuth
          .from('profiles')
          .update({ email_quota: emailQuota })
          .eq('id', user.id);
      }
      
      const updatedStats = {
        subscriptionTier: freshProfile.subscription_tier || 'free',
        subscriptionStatus: freshProfile.subscription_status || 'active',
        emailsGenerated: freshProfile.emails_generated || 0,
        emailsSaved: freshProfile.emails_saved || 0,
        emailQuota: emailQuota,
        seriesCount: freshProfile.series_count || 0,
        tokensUsed: freshProfile.tokens_used || 0,
        tokenQuota: freshProfile.token_quota || 2000,
        lastReset: freshProfile.last_reset,
        // Add name fields
        firstName: freshProfile.first_name,
        lastName: freshProfile.last_name,
        displayName: getDisplayName(freshProfile),
        firstNameOnly: getFirstName(freshProfile)
      };
      
      console.log('✅ Updated profile stats:', updatedStats);
      
      setProfile(freshProfile);
      setProfileStats(updatedStats);
      
      return updatedStats;
    } catch (err) {
      console.error('❌ Error refreshing profile stats:', err);
      throw err;
    }
  }, [user, getDisplayName, getFirstName]);
  
  // Fetch profile data function
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching profile for user:', user.id);
      
      // Fetch profile data
      const { data, error } = await useAuth
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // If profile doesn't exist, create it
      if (!data) {
        console.log('👤 Creating new profile for user', user.id);
        
        const newProfileData = {
          id: user.id,
          email: user.email,
          subscription_tier: 'free',
          subscription_status: 'active',
          email_quota: DEFAULT_QUOTAS.free,
          token_quota: 2000,
          emails_generated: 0,
          emails_saved: 0,
          series_count: 0,
          tokens_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: newProfile, error: insertError } = await useAuth
          .from('profiles')
          .insert([newProfileData])
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        setProfile(newProfile);
      } else {
        console.log('📋 Found existing profile:', data);
        setProfile(data);
      }
      
      // Get or calculate profile stats
      try {
        // Try the profiles service first
        const stats = await profiles.getProfileStats();
        console.log('📊 Got stats from service:', stats);
        setProfileStats({
          ...stats,
          displayName: getDisplayName(data),
          firstNameOnly: getFirstName(data),
          firstName: data?.first_name,
          lastName: data?.last_name
        });
      } catch (statsError) {
        console.error('⚠️ Stats service failed, calculating manually:', statsError);
        
        // Manual calculation with proper quota handling
        const profileData = data;
        
        let emailQuota = profileData?.email_quota;
        
        // If no quota, calculate based on tier
        if (!emailQuota || emailQuota <= 0) {
          const tier = profileData?.subscription_tier || 'free';
          emailQuota = getQuotaForTier(tier);
          
          console.log(`💡 Calculated quota for tier "${tier}": ${emailQuota}`);
        }
        
        const fallbackStats = {
          subscriptionTier: profileData?.subscription_tier || 'free',
          subscriptionStatus: profileData?.subscription_status || 'active',
          emailsGenerated: profileData?.emails_generated || 0,
          emailsSaved: profileData?.emails_saved || 0,
          emailQuota: emailQuota,
          seriesCount: profileData?.series_count || 0,
          tokensUsed: profileData?.tokens_used || 0,
          tokenQuota: profileData?.token_quota || 2000,
          lastReset: profileData?.last_reset,
          // Add name fields
          firstName: profileData?.first_name,
          lastName: profileData?.last_name,
          displayName: getDisplayName(profileData),
          firstNameOnly: getFirstName(profileData)
        };
        
        console.log('🔧 Using fallback stats:', fallbackStats);
        setProfileStats(fallbackStats);
      }
      
    } catch (err) {
      console.error('❌ Error fetching profile:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, getDisplayName, getFirstName]);
  
  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setProfileStats(null);
      setLoading(false);
    }
  }, [fetchProfile, user]);
  
  // Update profile function
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await useAuth
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      await fetchProfile();
      
      return { success: true };
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };
  
  // Update avatar function
  const updateAvatar = async (file) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!file) throw new Error('No file provided');
      
      // Create a unique file path using UUID
      const filePath = `private/${user.id}-${uuidv4()}`;
      
      console.log('Uploading avatar to path:', filePath);
      
      // Upload to useAuth storage
      const { data, error: uploadError } = await useAuth
        .storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('Upload successful:', data);
      
      // Get the public URL
      const { data: urlData } = useAuth
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = urlData.publicUrl;
      console.log('Avatar URL:', avatarUrl);
      
      // Update the user's profile with the new avatar URL
      const { error: updateError } = await useAuth
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Refresh profile data
      await fetchProfile();
      
      return avatarUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      throw err;
    }
  };
  
  return {
    profile,
    profileStats,
    loading,
    error,
    updateProfile,
    updateAvatar,
    fetchProfile,
    refreshProfileStats,
    // New convenience methods
    displayName: profileStats?.displayName || 'User',
    firstName: profileStats?.firstNameOnly || 'User'
  };
};
