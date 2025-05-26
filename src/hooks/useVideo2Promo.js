// src/hooks/useVideo2Promo.js - FIXED: Real database integration
import { useState, useCallback, useEffect } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useProfile } from './useProfile';
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
  const { profileStats, refreshProfileStats } = useProfile();
  const { trackAITokenUsage, getCurrentUsage } = useUsageTracking();

  /**
   * Load user's Video2Promo projects from database
   */
  const loadProjects = useCallback(async () => {
    if (!user) {
      console.log('No user, skipping project load');
      setProjects([]);
      return;
    }

    try {
      console.log('Loading Video2Promo projects for user:', user.id);
      
      const { data, error } = await supabase
        .from('video_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Loaded projects:', data);
      setProjects(data || []);
    } catch (err) {
      console.error('Error loading Video2Promo projects:', err);
      setError(err.message);
      setProjects([]);
    }
  }, [user]);

  /**
   * Check if user can create projects based on tier limits
   */
  const checkCanCreateProject = useCallback(async () => {
    if (!profileStats) {
      return { allowed: false, message: 'Profile loading...' };
    }

    const tierLimits = {
      free: { projects: 5 },
      pro: { projects: 50 },
      gold: { projects: 200 }
    };

    const userTier = profileStats.subscriptionTier || 'free';
    const limit = tierLimits[userTier]?.projects || 5;
    const current = projects.length;

    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
      message: current >= limit ? `You've reached your ${userTier} plan limit of ${limit} projects` : ''
    };
  }, [profileStats, projects.length]);

  /**
   * Get remaining tokens from real usage tracking
   */
  const getRemainingTokens = useCallback(async () => {
    if (!profileStats) {
      console.log('No profile stats, returning default tokens');
      return 2000;
    }

    try {
      // Get current month's usage
      const usage = await getCurrentUsage();
      const tokensUsed = usage.ai_tokens_used || 0;

      // Get tier limits
      const tierLimits = {
        free: 2000,
        pro: 50000,
        gold: 200000
      };

      const userTier = profileStats.subscriptionTier || 'free';
      const totalLimit = tierLimits[userTier] || 2000;
      const remaining = Math.max(0, totalLimit - tokensUsed);

      console.log(`Token calculation for ${userTier}:`, {
        totalLimit,
        tokensUsed,
        remaining
      });

      return remaining;
    } catch (err) {
      console.error('Error getting remaining tokens:', err);
      // Fallback to tier default
      const tierLimits = {
        free: 2000,
        pro: 50000,
        gold: 200000
      };
      return tierLimits[profileStats.subscriptionTier || 'free'] || 2000;
    }
  }, [profileStats, getCurrentUsage]);

  /**
   * Create a new Video2Promo project - REAL DATABASE
   */
  const createProject = useCallback(async (formData) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Check project limits
    const canCreate = await checkCanCreateProject();
    if (!canCreate.allowed) {
      throw new Error(canCreate.message);
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating Video2Promo project with data:', formData);

      // 1. Validate YouTube URL
      if (!transcriptService.isValidYouTubeUrl(formData.youtube_url)) {
        throw new Error('Please enter a valid YouTube URL');
      }

      // 2. Get transcript
      const transcriptData = await transcriptService.getTranscript(formData.youtube_url);
      console.log('Transcript received:', transcriptData);
      
      // 3. Extract benefits using AI (this will use tokens)
      const benefits = await nlpService.extractBenefits(
        transcriptData.transcript, 
        formData.keywords || [],
        profileStats?.subscriptionTier || 'free'
      );
      console.log('Benefits extracted:', benefits);

      // 4. Track AI token usage for benefit extraction
      if (benefits.tokens_used) {
        await trackAITokenUsage(benefits.tokens_used);
        await refreshProfileStats(); // Refresh to show updated token usage
      }

      // 5. Create project in database
      const projectData = {
        user_id: user.id,
        youtube_url: formData.youtube_url,
        video_id: transcriptData.videoId,
        video_title: transcriptData.metadata?.title || `Video ${transcriptData.videoId}`,
        video_duration: transcriptData.duration || 0,
        transcript: transcriptData.transcript,
        benefits: benefits.benefits || benefits, // Handle different response formats
        keywords: formData.keywords || [],
        affiliate_link: formData.affiliate_link || '',
        utm_params: formData.utm_params || {},
        tone: formData.tone || 'friendly',
        status: 'ready',
        tokens_used: benefits.tokens_used || 0
      };

      const { data: newProject, error: insertError } = await supabase
        .from('video_projects')
        .insert([projectData])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('✅ Project created successfully:', newProject);

      // Update state
      setProject(newProject);
      setProjects(prev => [newProject, ...prev]);
      
      return newProject;

    } catch (err) {
      console.error('❌ Error creating Video2Promo project:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, profileStats, checkCanCreateProject, trackAITokenUsage, refreshProfileStats]);

  /**
   * Generate marketing assets - REAL TOKEN TRACKING
   */
  const generateAssets = useCallback(async (generationParams) => {
    if (!project || !user) {
      throw new Error('Project and user required for asset generation');
    }

    const { benefitIndices, assetTypes, generateVariants = false } = generationParams;

    if (!benefitIndices?.length || !assetTypes?.length) {
      throw new Error('Please select benefits and asset types');
    }

    // Check remaining tokens
    const remainingTokens = await getRemainingTokens();
    const estimatedTokensNeeded = benefitIndices.length * assetTypes.length * 1500; // Rough estimate

    if (remainingTokens < estimatedTokensNeeded) {
      throw new Error(`Not enough tokens remaining. Need ~${estimatedTokensNeeded}, have ${remainingTokens}`);
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Generating assets:', { benefitIndices, assetTypes });
      const generatedAssets = [];
      let totalTokensUsed = 0;

      // Generate assets for each selected benefit
      for (const benefitIndex of benefitIndices) {
        const benefit = project.benefits[benefitIndex];
        if (!benefit) continue;

        // Generate each requested asset type
        for (const assetType of assetTypes) {
          const assetParams = {
            benefit: { ...benefit, index: benefitIndex },
            keywords: project.keywords || [],
            affiliateLink: project.affiliate_link || '',
            tone: project.tone || 'friendly',
            userTier: profileStats?.subscriptionTier || 'free',
            generateVariants
          };

          let assetResult;
          switch (assetType) {
            case 'email_series':
              assetResult = await assetGenerationService.generateEmailSeries(assetParams);
              break;
            case 'blog_post':
              assetResult = await assetGenerationService.generateBlogPost(assetParams);
              break;
            case 'newsletter':
              assetResult = await assetGenerationService.generateNewsletter(assetParams);
              break;
            default:
              console.warn(`Unknown asset type: ${assetType}`);
              continue;
          }

          if (assetResult) {
            // Track tokens used
            const tokensUsed = assetResult.total_tokens || 0;
            totalTokensUsed += tokensUsed;

            // Save asset to database
            const assetData = {
              project_id: project.id,
              user_id: user.id,
              asset_type: assetType,
              benefit_index: benefitIndex,
              title: `${assetType.replace('_', ' ')} for ${benefit.title}`,
              content: assetResult.content,
              metadata: {
                benefit: benefit,
                generation_params: assetParams,
                ai_model: assetResult.model_used
              },
              tokens_used: tokensUsed,
              generation_cost: tokensUsed * 0.000001 // Rough cost estimate
            };

            const { data: savedAsset, error: saveError } = await supabase
              .from('video_assets')
              .insert([assetData])
              .select()
              .single();

            if (saveError) {
              console.error('Error saving asset:', saveError);
              // Continue with other assets even if one fails to save
            } else {
              generatedAssets.push(savedAsset);
            }
          }
        }
      }

      // Track total AI token usage
      if (totalTokensUsed > 0) {
        await trackAITokenUsage(totalTokensUsed);
        await refreshProfileStats(); // Refresh to show updated usage
      }

      // Update project with total tokens used
      const { error: updateError } = await supabase
        .from('video_projects')
        .update({ 
          tokens_used: (project.tokens_used || 0) + totalTokensUsed,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (updateError) {
        console.error('Error updating project tokens:', updateError);
      }

      // Update assets state
      setAssets(prev => [...prev, ...generatedAssets]);
      console.log('✅ Generated assets successfully:', generatedAssets);

      return generatedAssets;

    } catch (err) {
      console.error('❌ Error generating assets:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [project, user, profileStats, getRemainingTokens, trackAITokenUsage, refreshProfileStats]);

  /**
   * Load assets for a project from database
   */
  const loadProjectAssets = useCallback(async (projectId) => {
    if (!projectId || !user) return;

    try {
      console.log('Loading assets for project:', projectId);
      
      const { data, error } = await supabase
        .from('video_assets')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Loaded assets:', data);
      setAssets(data || []);
    } catch (err) {
      console.error('Error loading project assets:', err);
      setAssets([]);
    }
  }, [user]);

  /**
   * Delete a project and its assets
   */
  const deleteProject = useCallback(async (projectId) => {
    if (!projectId || !user) return;

    try {
      // Delete assets first (foreign key constraint)
      const { error: assetsError } = await supabase
        .from('video_assets')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (assetsError) throw assetsError;

      // Delete project
      const { error: projectError } = await supabase
        .from('video_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (projectError) throw projectError;

      // Update state
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (project?.id === projectId) {
        setProject(null);
        setAssets([]);
      }

      console.log('✅ Project deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting project:', err);
      throw err;
    }
  }, [user, project]);

  // Load projects on mount
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, loadProjects]);

  // Load assets when project changes
  useEffect(() => {
    if (project?.id) {
      loadProjectAssets(project.id);
    } else {
      setAssets([]);
    }
  }, [project?.id, loadProjectAssets]);

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