// src/hooks/useVideo2Promo.js
import { useState, useCallback, useEffect } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useUsageTracking } from './useUsageTracking';
import { transcriptService } from '../services/video2promo/transcriptService';
import { nlpService } from '../services/video2promo/nlpService';
import { assetGenerationService } from '../services/video2promo/assetGenerationService';
import { supabase } from '../services/supabase/supabaseClient';

export function useVideo2Promo() {
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useSupabaseAuth();
  const [profile, setProfile] = useState(null);
  
  // Load user profile separately since useSupabaseAuth doesn't provide it
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
        setProfile(null);
      }
    };
    
    loadProfile();
  }, [user]);

  const { 
    trackAITokenUsage,
    getCurrentUsage
  } = useUsageTracking();

  /**
   * Check if user can create new projects based on tier limits
   * MOVED UP: This function needs to be defined before createProject uses it
   */
  const checkCanCreateProject = useCallback(async () => {
    if (!profile) {
      return { allowed: false, message: 'Profile not loaded' };
    }

    const tierLimits = {
      free: { projects: 5 },
      pro: { projects: 50 },
      gold: { projects: 200 }
    };

    const userTier = profile.subscription_tier || 'free';
    const limit = tierLimits[userTier]?.projects || tierLimits.free.projects;

    try {
      const { count, error } = await supabase
        .from('video_projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if (error) throw error;

      const currentCount = count || 0;
      const remaining = Math.max(0, limit - currentCount);

      return {
        allowed: currentCount < limit,
        current: currentCount,
        limit,
        remaining,
        message: currentCount >= limit ? `Monthly limit of ${limit} projects reached` : ''
      };
    } catch (err) {
      console.error('Error checking project limit:', err);
      return { allowed: false, message: 'Error checking limits' };
    }
  }, [profile, user]);

  /**
   * Create a new Video2Promo project
   */
  const createProject = useCallback(async (formData) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Check if user can create projects based on tier limits
    const canCreate = await checkCanCreateProject();
    if (!canCreate.allowed) {
      throw new Error(`Project limit reached. ${canCreate.message}`);
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate YouTube URL
      if (!transcriptService.isValidYouTubeUrl(formData.youtube_url)) {
        throw new Error('Please enter a valid YouTube URL');
      }

      // 1. Create project record
      const { data: projectData, error: insertError } = await supabase
        .from('video_projects')
        .insert({
          user_id: user.id,
          youtube_url: formData.youtube_url,
          keywords: formData.keywords || [],
          affiliate_link: formData.affiliate_link || '',
          utm_params: formData.utm_params || {},
          tone: formData.tone || 'friendly',
          status: 'processing'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Get transcript
      const transcriptData = await transcriptService.getTranscript(formData.youtube_url);
      
      // 3. Extract benefits using AI
      const benefits = await nlpService.extractBenefits(
        transcriptData.transcript, 
        formData.keywords,
        profile?.subscription_tier || 'free'
      );

      // 4. Update project with results
      const { data: updatedProject, error: updateError } = await supabase
        .from('video_projects')
        .update({
          transcript: transcriptData.transcript,
          video_title: transcriptData.metadata?.title || `Video ${transcriptData.videoId}`,
          video_duration: transcriptData.duration || 0,
          benefits: benefits,
          status: 'ready'
        })
        .eq('id', projectData.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // 5. Track usage (estimated tokens for transcript analysis)
      const estimatedTokens = Math.ceil(transcriptData.transcript.length / 4); // Rough estimate
      await trackAITokenUsage(estimatedTokens);

      setProject(updatedProject);
      return updatedProject;

    } catch (err) {
      console.error('Error creating Video2Promo project:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, trackAITokenUsage, checkCanCreateProject]);

  /**
   * Generate marketing assets for selected benefits
   */
  const generateAssets = useCallback(async (generationParams) => {
    if (!project || !user) {
      throw new Error('Project and user required for asset generation');
    }

    const { benefitIndices, assetTypes, generateVariants = false } = generationParams;

    if (!benefitIndices?.length || !assetTypes?.length) {
      throw new Error('Please select benefits and asset types');
    }

    setIsLoading(true);
    setError(null);

    try {
      let totalTokensUsed = 0;
      const generatedAssets = [];

      // Generate assets for each selected benefit
      for (const benefitIndex of benefitIndices) {
        const benefit = project.benefits[benefitIndex];
        if (!benefit) continue;

        // Generate each requested asset type
        for (const assetType of assetTypes) {
          const assetParams = {
            benefit: { ...benefit, index: benefitIndex },
            keywords: project.keywords,
            affiliateLink: project.affiliate_link,
            tone: project.tone,
            userTier: profile?.subscription_tier || 'free',
            generateVariants: generateVariants && (profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'gold')
          };

          let asset;
          switch (assetType) {
            case 'email_series':
              asset = await assetGenerationService.generateEmailSeries(assetParams);
              break;
            case 'blog_post':
              asset = await assetGenerationService.generateBlogPost(assetParams);
              break;
            case 'newsletter':
              asset = await assetGenerationService.generateNewsletter(assetParams);
              break;
            default:
              console.warn(`Unknown asset type: ${assetType}`);
              continue;
          }

          if (asset) {
            // Save asset to database
            const { data: savedAsset, error: saveError } = await supabase
              .from('video_assets')
              .insert({
                project_id: project.id,
                asset_type: assetType,
                benefit_index: benefitIndex,
                title: `${assetType} for ${benefit.title}`,
                content: asset.content,
                tokens_used: asset.total_tokens || 0,
                generation_cost: (asset.total_tokens || 0) * 0.000001 // Rough cost estimate
              })
              .select()
              .single();

            if (saveError) {
              console.error('Error saving asset:', saveError);
            } else {
              generatedAssets.push(savedAsset);
              totalTokensUsed += asset.total_tokens || 0;
            }
          }
        }
      }

      // Track total token usage
      if (totalTokensUsed > 0) {
        await trackAITokenUsage(totalTokensUsed);
      }

      // Update assets state
      setAssets(prev => [...prev, ...generatedAssets]);

      return generatedAssets;

    } catch (err) {
      console.error('Error generating assets:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [project, user, profile, trackAITokenUsage]);

  /**
   * Load user's Video2Promo projects
   */
  const loadProjects = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('video_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err.message);
    }
  }, [user]);

  /**
   * Load assets for a specific project
   */
  const loadProjectAssets = useCallback(async (projectId) => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('video_assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      console.error('Error loading assets:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Get remaining tokens for the user
   */
  const getRemainingTokens = useCallback(async () => {
    try {
      const usage = await getCurrentUsage();
      const tierLimits = {
        free: 2000,
        pro: 50000,
        gold: 200000
      };

      const userTier = profile?.subscription_tier || 'free';
      const monthlyLimit = tierLimits[userTier];
      const used = usage.ai_tokens_used || 0;

      return Math.max(0, monthlyLimit - used);
    } catch (err) {
      console.error('Error getting remaining tokens:', err);
      return 0;
    }
  }, [profile, getCurrentUsage]);

  /**
   * Delete a project and its assets
   */
  const deleteProject = useCallback(async (projectId) => {
    if (!projectId) return;

    try {
      // Delete assets first (cascade should handle this, but being explicit)
      await supabase
        .from('video_assets')
        .delete()
        .eq('project_id', projectId);

      // Delete project
      const { error } = await supabase
        .from('video_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id); // Ensure user owns the project

      if (error) throw error;

      // Update local state
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (project?.id === projectId) {
        setProject(null);
        setAssets([]);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err.message);
      throw err;
    }
  }, [user, project]);

  return {
    // State
    project,
    projects,
    assets,
    isLoading,
    error,
    
    // Actions
    createProject,
    generateAssets,
    loadProjects,
    loadProjectAssets,
    deleteProject,
    setProject,
    
    // Utilities
    checkCanCreateProject,
    getRemainingTokens
  };
}