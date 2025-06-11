// src/services/useAuth/profiles.js
import { useAuth } from '../../shared/hooks/useAuth';

/**
 * Profiles service for interacting with the profiles table
 */
export const profiles = {
  /**
   * Get the current user's profile
   * @returns {Promise} - Profile data
   */
  getCurrentProfile: async () => {
    try {
      const { data: { session } } = await useAuth.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      const { data, error } = await useAuth
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },
  
  /**
   * Get a profile by ID
   * @param {string} userId - User ID
   * @returns {Promise} - Profile data
   */
  getProfile: async (userId) => {
    try {
      const { data, error } = await useAuth
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },
  
  /**
   * Update the current user's profile
   * @param {object} updates - Profile fields to update
   * @returns {Promise} - Updated profile
   */
  updateProfile: async (updates) => {
    try {
      const { data: { session } } = await useAuth.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      const { data, error } = await useAuth
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  /**
   * Update a user's profile avatar
   * @param {File} file - Image file
   * @returns {Promise} - Storage response with URL
   */
  updateAvatar: async (file) => {
    try {
      const { data: { session } } = await useAuth.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      const userId = session.user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload file to useAuth Storage
      // eslint-disable-next-line no-unused-vars
      const { data: uploadData, error: uploadError } = await useAuth
        .storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = useAuth
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { data: profileData, error: profileError } = await useAuth
        .from('profiles')
        .update({
          avatar_url: urlData.publicUrl
        })
        .eq('id', userId)
        .select();
      
      if (profileError) throw profileError;
      
      return {
        url: urlData.publicUrl,
        profile: profileData[0]
      };
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  },
  
  /**
   * Get profile statistics
   * @returns {Promise} - Profile statistics
   */
  getProfileStats: async () => {
    try {
      const { data: { session } } = await useAuth.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      const userId = session.user.id;
      
      // Get email count
      const { count: emailCount, error: emailError } = await useAuth
        .from('emails')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (emailError) throw emailError;
      
      // Get series count
      const { count: seriesCount, error: seriesError } = await useAuth
        .from('email_series')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (seriesError) throw seriesError;
      
      // Get profile data
      const { data: profile, error: profileError } = await useAuth
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      return {
        emailCount,
        seriesCount,
        emailsGenerated: profile.emails_generated || 0,
        emailsSaved: profile.emails_saved || emailCount || 0,
        aiTokensUsed: profile.ai_tokens_used || 0,
        subscriptionTier: profile.subscription_tier || 'free',
        subscriptionStatus: profile.subscription_status || 'active',
        emailQuota: profile.email_quota || 100
      };
    } catch (error) {
      console.error('Error getting profile stats:', error);
      throw error;
    }
  },
  
  /**
   * Increment the emails generated count
   * @param {number} count - Number of emails to add (default: 1)
   * @returns {Promise} - Update response
   */
  incrementEmailsGenerated: async (count = 1) => {
    try {
      const { data: { session } } = await useAuth.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      // Get current count
      const { data: profile, error: profileError } = await useAuth
        .from('profiles')
        .select('emails_generated')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      const currentCount = profile.emails_generated || 0;
      
      // Update count
      const { data, error } = await useAuth
        .from('profiles')
        .update({
          emails_generated: currentCount + count
        })
        .eq('id', session.user.id)
        .select();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error incrementing emails generated:', error);
      throw error;
    }
  },
  
  /**
   * Update AI tokens used
   * @param {number} tokens - Number of tokens to add
   * @returns {Promise} - Update response
   */
  updateAiTokensUsed: async (tokens) => {
    try {
      const { data: { session } } = await useAuth.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      // Get current count
      const { data: profile, error: profileError } = await useAuth
        .from('profiles')
        .select('ai_tokens_used')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      const currentTokens = profile.ai_tokens_used || 0;
      
      // Update count
      const { data, error } = await useAuth
        .from('profiles')
        .update({
          ai_tokens_used: currentTokens + tokens
        })
        .eq('id', session.user.id)
        .select();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating AI tokens used:', error);
      throw error;
    }
  },
  
  /**
   * Update user preferences
   * @param {object} preferences - Preferences object
   * @returns {Promise} - Update response
   */
  updatePreferences: async (preferences) => {
    try {
      const { data: { session } } = await useAuth.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      // Get current preferences
      const { data: profile, error: profileError } = await useAuth
        .from('profiles')
        .select('preferences')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      const currentPreferences = profile.preferences || {};
      
      // Merge preferences
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences
      };
      
      // Update preferences
      const { data, error } = await useAuth
        .from('profiles')
        .update({
          preferences: updatedPreferences
        })
        .eq('id', session.user.id)
        .select();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }
};
