// src/hooks/useContentLibrary.js - UPDATED for campaign schema
import { useState, useCallback, useEffect } from 'react';
import useAuth from './useAuth';

/**
 * Content Library hook that works with the new campaign schema
 * Shows organized content by campaigns instead of flat list
 */
export const useContentLibrary = () => {
  const { supabase, user } = useAuth();
  
  // State for campaign-organized content
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, emails, social, blog, video

  /**
   * ✅ Load all campaigns with their content counts
   */
  const loadCampaigns = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📚 Loading campaigns for Content Library...');

      // Use the campaign_overview view for rich data
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaign_overview')
        .select('*')
        .eq('user_id', user.id)
        .order('last_activity_at', { ascending: false });

      if (campaignError) throw campaignError;

      console.log('✅ Loaded campaigns:', campaignData?.length || 0);
      setCampaigns(campaignData || []);

    } catch (err) {
      console.error('❌ Error loading campaigns:', err);
      setError(err.message);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  /**
   * ✅ Get detailed content for a specific campaign
   */
  const getCampaignContent = useCallback(async (campaignId) => {
    if (!campaignId) return null;

    try {
      console.log('🔍 Loading content for campaign:', campaignId);

      // Load all content types for this campaign
      const [emailSeries, socialContent, blogContent, videoAssets] = await Promise.all([
        supabase
          .from('campaign_email_series')
          .select(`
            *,
            campaign_emails(*)
          `)
          .eq('campaign_id', campaignId),
        
        supabase
          .from('campaign_social_content')
          .select('*')
          .eq('campaign_id', campaignId),
        
        supabase
          .from('campaign_blog_content')
          .select('*')
          .eq('campaign_id', campaignId),
        
        supabase
          .from('campaign_video_assets')
          .select('*')
          .eq('campaign_id', campaignId)
      ]);

      // Check for errors
      if (emailSeries.error) throw emailSeries.error;
      if (socialContent.error) throw socialContent.error;
      if (blogContent.error) throw blogContent.error;
      if (videoAssets.error) throw videoAssets.error;

      const content = {
        emailSeries: emailSeries.data || [],
        socialContent: socialContent.data || [],
        blogContent: blogContent.data || [],
        videoAssets: videoAssets.data || [],
        totalItems: (emailSeries.data?.length || 0) + 
                   (socialContent.data?.length || 0) + 
                   (blogContent.data?.length || 0) + 
                   (videoAssets.data?.length || 0)
      };

      console.log('✅ Campaign content loaded:', content.totalItems, 'items');
      return content;

    } catch (err) {
      console.error('❌ Error loading campaign content:', err);
      throw err;
    }
  }, [supabase]);

  /**
   * ✅ Create a new campaign (replaces old addToLibrary)
   */
  const createCampaign = useCallback(async (campaignData) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      console.log('📁 Creating new campaign:', campaignData.name);

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          name: campaignData.name,
          description: campaignData.description,
          industry: campaignData.industry || 'general',
          tone: campaignData.tone || 'professional',
          target_audience: campaignData.targetAudience,
          status: 'active',
          tags: campaignData.tags || [],
          color: campaignData.color || '#4f46e5'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Campaign created:', data.id);
      
      // Refresh campaigns list
      await loadCampaigns();
      
      return data;

    } catch (err) {
      console.error('❌ Error creating campaign:', err);
      throw err;
    }
  }, [supabase, user, loadCampaigns]);

  /**
   * ✅ Add content to library (now organized by campaign)
   * This maintains compatibility with existing code but organizes by campaign
   */
  const addToLibrary = useCallback(async (contentData) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      console.log('📚 Adding content to library (campaign-organized):', contentData.type);

      // If no campaign specified, create a default one
      let campaignId = contentData.campaignId;
      
      if (!campaignId) {
        const defaultCampaign = await createCampaign({
          name: contentData.title || 'Untitled Campaign',
          description: contentData.description || 'Auto-created campaign',
          industry: contentData.metadata?.industry || 'general',
          tone: contentData.metadata?.tone || 'professional',
          tags: contentData.tags || ['auto-created']
        });
        campaignId = defaultCampaign.id;
      }

      // Add content based on type
      let savedContent = null;

      if (contentData.type === 'email_series') {
        // Save as campaign email series
        const { data, error } = await supabase
          .from('campaign_email_series')
          .insert({
            campaign_id: campaignId,
            user_id: user.id,
            series_name: contentData.title,
            series_description: contentData.description,
            total_emails: contentData.metadata?.emails_count || 0,
            tone: contentData.metadata?.tone,
            industry: contentData.metadata?.industry,
            affiliate_link: contentData.metadata?.affiliate_link,
            ai_model_used: 'imported',
            tokens_consumed: 0
          })
          .select()
          .single();

        if (error) throw error;
        savedContent = data;

      } else if (contentData.type === 'social_content') {
        // Save as campaign social content
        const { data, error } = await supabase
          .from('campaign_social_content')
          .insert({
            campaign_id: campaignId,
            user_id: user.id,
            platform: contentData.metadata?.platform || 'generic',
            content_type: contentData.metadata?.content_type || 'post',
            content_text: contentData.content || contentData.description,
            hashtags: contentData.tags || [],
            ai_model_used: 'imported'
          })
          .select()
          .single();

        if (error) throw error;
        savedContent = data;

      } else {
        // For other types, save as blog content (fallback)
        const { data, error } = await supabase
          .from('campaign_blog_content')
          .insert({
            campaign_id: campaignId,
            user_id: user.id,
            title: contentData.title,
            content_body: contentData.content || contentData.description,
            excerpt: contentData.description,
            seo_keywords: contentData.tags || [],
            ai_model_used: 'imported'
          })
          .select()
          .single();

        if (error) throw error;
        savedContent = data;
      }

      console.log('✅ Content added to campaign library:', savedContent.id);
      
      // Refresh campaigns list
      await loadCampaigns();
      
      return savedContent;

    } catch (err) {
      console.error('❌ Error adding to library:', err);
      throw err;
    }
  }, [supabase, user, createCampaign, loadCampaigns]);

  /**
   * ✅ Search across all campaigns and content
   */
  const searchContent = useCallback(async (query) => {
    if (!user?.id || !query.trim()) return [];

    try {
      console.log('🔍 Searching content:', query);

      // Search campaigns by name/description
      const { data: campaignResults, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

      if (campaignError) throw campaignError;

      // Search email content
      const { data: emailResults, error: emailError } = await supabase
        .from('campaign_emails')
        .select(`
          *,
          campaign_email_series(series_name, campaign_id),
          campaigns(name)
        `)
        .or(`subject_line.ilike.%${query}%,email_body.ilike.%${query}%`)
        .limit(20);

      if (emailError) throw emailError;

      const searchResults = {
        campaigns: campaignResults || [],
        emails: emailResults || [],
        totalResults: (campaignResults?.length || 0) + (emailResults?.length || 0)
      };

      console.log('✅ Search completed:', searchResults.totalResults, 'results');
      return searchResults;

    } catch (err) {
      console.error('❌ Search error:', err);
      return { campaigns: [], emails: [], totalResults: 0 };
    }
  }, [supabase, user]);

  /**
   * ✅ Delete campaign and all its content
   */
  const deleteCampaign = useCallback(async (campaignId) => {
    if (!campaignId) return;

    try {
      console.log('🗑️ Deleting campaign:', campaignId);

      // Delete campaign (CASCADE will handle related content)
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Campaign deleted');
      
      // Refresh campaigns list
      await loadCampaigns();

    } catch (err) {
      console.error('❌ Error deleting campaign:', err);
      throw err;
    }
  }, [supabase, user, loadCampaigns]);

  /**
   * ✅ Get library statistics (campaign-based)
   */
  const getLibraryStats = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('campaign_overview')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = {
        totalCampaigns: data?.length || 0,
        totalInputSources: data?.reduce((sum, campaign) => sum + (campaign.total_input_sources || 0), 0) || 0,
        totalOutputContent: data?.reduce((sum, campaign) => sum + (campaign.total_output_content || 0), 0) || 0,
        emailSeriesCount: data?.reduce((sum, campaign) => sum + (campaign.email_series_count || 0), 0) || 0,
        socialContentCount: data?.reduce((sum, campaign) => sum + (campaign.social_content_count || 0), 0) || 0,
        totalTokensUsed: data?.reduce((sum, campaign) => sum + (campaign.total_tokens_used || 0), 0) || 0,
        activeCampaigns: data?.filter(campaign => campaign.status === 'active').length || 0
      };

      console.log('📊 Library stats:', stats);
      return stats;

    } catch (err) {
      console.error('❌ Error getting library stats:', err);
      return null;
    }
  }, [supabase, user]);

  // Load campaigns on mount and user change
  useEffect(() => {
    if (user?.id) {
      loadCampaigns();
    }
  }, [user?.id, loadCampaigns]);

  // Filter campaigns based on search and type
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = !searchTerm || 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || 
      (filterType === 'emails' && campaign.email_series_count > 0) ||
      (filterType === 'social' && campaign.social_content_count > 0) ||
      (filterType === 'blog' && campaign.blog_content_count > 0) ||
      (filterType === 'video' && campaign.video_assets_count > 0);

    return matchesSearch && matchesType;
  });

  return {
    // Campaign-organized data
    campaigns: filteredCampaigns,
    allCampaigns: campaigns,
    
    // State
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    
    // Actions
    loadCampaigns,
    getCampaignContent,
    createCampaign,
    addToLibrary, // Maintains compatibility but uses campaigns
    searchContent,
    deleteCampaign,
    getLibraryStats,
    
    // Backward compatibility (for components still expecting old format)
    items: campaigns, // Maps campaigns to old 'items' property
    refreshItems: loadCampaigns // Maps to old refresh function
  };
};