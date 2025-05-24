// src/hooks/useProfile.js - Fixed to use actual profile data
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase/supabaseClient';
import useSupabase from './useSupabase';
import { profiles } from '../services/supabase/profiles';
import { v4 as uuidv4 } from 'uuid';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [profileStats, setProfileStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSupabase();
  
  // Fetch profile data function
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // If profile doesn't exist, create it
      if (!data) {
        console.log('Creating new profile for user', user.id);
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
      
      // Get actual profile stats using the profiles service
      try {
        const stats = await profiles.getProfileStats();
        setProfileStats(stats);
      } catch (statsError) {
        console.error('Error fetching profile stats:', statsError);
        // Fallback to data from profile if stats fetch fails
        setProfileStats({
          subscriptionTier: data?.subscription_tier || 'free',
          subscriptionStatus: data?.subscription_status || 'active',
          emailsGenerated: data?.emails_generated || 0,
          emailsSaved: data?.emails_saved || 0,
          emailQuota: data?.email_quota || 100,
          seriesCount: data?.series_count || 0
        });
      }
      
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [fetchProfile, user]);
  
  // Update profile function
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
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
  
  // Update avatar function - using the approach from the example
  const updateAvatar = async (file) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!file) throw new Error('No file provided');
      
      // Create a unique file path using UUID
      const filePath = `private/${user.id}-${uuidv4()}`;
      
      console.log('Uploading avatar to path:', filePath);
      
      // Upload to Supabase storage - using the same approach as the example
      const { data, error: uploadError } = await supabase
        .storage
        .from('avatars') // Make sure this bucket exists
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('Upload successful:', data);
      
      // Get the public URL
      const { data: urlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = urlData.publicUrl;
      console.log('Avatar URL:', avatarUrl);
      
      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
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
    fetchProfile
  };
};