// src/pages/Video2Promo.jsx - FIXED: Real profile integration
import React, { useState, useEffect, useCallback } from 'react';
import { 
  VideoUrlForm,
  TranscriptDisplay, 
  AssetGenerator,
  GeneratedAssets
} from '../components/Video2Promo';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Alert } from '../components/Common/Alert';
import { Badge } from '../components/Common/Badge';
import { useVideo2Promo } from '../hooks/useVideo2Promo';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useProfile } from '../hooks/useProfile'; // ADDED: Real profile hook
import { useToast } from '../hooks/useToast';
import { DebugPanel } from '../components/Video2Promo/DebugPanel';

function Video2Promo() {
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [remainingTokens, setRemainingTokens] = useState(0);
  
  const { user } = useSupabaseAuth();
  const { profileStats, loading: profileLoading } = useProfile(); // FIXED: Only destructure what we use
  const { showToast } = useToast();
  
  const {
    project,
    projects,
    assets,
    isLoading,
    error,
    createProject,
    generateAssets,
    loadProjects,
    setProject,
    getRemainingTokens
  } = useVideo2Promo();

  // Load remaining tokens from real usage tracking
  const loadRemainingTokens = useCallback(async () => {
    try {
      const tokens = await getRemainingTokens();
      setRemainingTokens(tokens);
      
      if (import.meta.env.VITE_ENABLE_API_LOGGING === 'true') {
        console.log('Video2Promo tokens loaded:', tokens);
      }
    } catch (err) {
      console.error('Error loading remaining tokens:', err);
      // Fallback to tier defaults
      if (profileStats?.subscriptionTier) {
        const defaults = { free: 2000, pro: 50000, gold: 200000 };
        setRemainingTokens(defaults[profileStats.subscriptionTier] || 2000);
      }
    }
  }, [getRemainingTokens, profileStats]);

  // Load initial data
  useEffect(() => {
    if (user && profileStats) { // Wait for both user and profile
      loadProjects();
      loadRemainingTokens();
    }
  }, [user, profileStats, loadProjects, loadRemainingTokens]);

  // Reload tokens when profile stats change (after token usage)
  useEffect(() => {
    if (profileStats) {
      loadRemainingTokens();
    }
  }, [profileStats, loadRemainingTokens]);

  const handleCreateProject = async (formData) => {
    try {
      await createProject(formData);
      showToast('Video analyzed successfully! Benefits extracted.', 'success');
      setSelectedBenefits([]); // Reset selections
      await loadRemainingTokens(); // Refresh token count
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleGenerateAssets = async (generationParams) => {
    try {
      console.log('🚀 Starting asset generation with params:', generationParams);
      const assets = await generateAssets(generationParams);
      console.log('✅ Assets generated successfully:', assets);
      showToast(`Generated ${assets.length} marketing assets!`, 'success');
      await loadRemainingTokens(); // Refresh token count
    } catch (err) {
      console.error('❌ Asset generation failed:', err);
      showToast(err.message, 'error');
    }
  };

  const handleBenefitSelect = (benefitIndices) => {
    setSelectedBenefits(benefitIndices);
  };

  const handleProjectSelect = (selectedProject) => {
    setProject(selectedProject);
    setSelectedBenefits([]); // Reset benefit selections when switching projects
  };

  // FIXED: Use real profile data
  const userTier = profileStats?.subscriptionTier || 'free';
  const tierLimits = {
    free: { projects: 5, name: 'Free' },
    pro: { projects: 50, name: 'Pro' },
    gold: { projects: 200, name: 'Gold' }
  };

  // Show loading state while profile is loading
  if (profileLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading Profile...
            </h3>
            <p className="text-gray-600">
              Setting up your Video2Promo workspace
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Video2Promo
            </h1>
            <p className="mt-2 text-gray-600">
              Transform YouTube videos into complete marketing campaigns
            </p>
          </div>
          
          <div className="text-right">
            <Badge variant="primary" size="lg">
              {tierLimits[userTier].name} Plan
            </Badge>
            <div className="mt-2 text-sm text-gray-500">
              {remainingTokens.toLocaleString()} tokens remaining
            </div>
            {/* ADDED: Show actual user name */}
            {profileStats?.displayName && (
              <div className="mt-1 text-xs text-gray-400">
                Welcome back, {profileStats.firstNameOnly}!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Project
            </h2>
            <VideoUrlForm 
              onSubmit={handleCreateProject}
              loading={isLoading}
              disabled={false}
            />
          </Card>

          {/* Recent Projects */}
          {projects.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Projects
              </h3>
              <div className="space-y-2">
                {projects.slice(0, 5).map((proj) => (
                  <div
                    key={proj.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      project?.id === proj.id 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleProjectSelect(proj)}
                  >
                    <div className="font-medium text-gray-900 text-sm">
                      {proj.video_title || 'Untitled Video'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {proj.benefits?.length || 0} benefits • {
                        new Date(proj.created_at).toLocaleDateString()
                      }
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge 
                        variant={proj.status === 'ready' ? 'success' : 'warning'} 
                        size="sm"
                      >
                        {proj.status}
                      </Badge>
                      {proj.tokens_used > 0 && (
                        <span className="text-xs text-gray-400">
                          {proj.tokens_used} tokens used
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {projects.length > 5 && (
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Projects ({projects.length})
                </Button>
              )}
            </Card>
          )}

          {/* Usage Stats - FIXED: Real data */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Usage This Month
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Projects Created:</span>
                <span className="font-medium">{projects.length} / {tierLimits[userTier].projects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">AI Tokens Used:</span>
                <span className="font-medium">
                  {(
                    {
                      free: 2000,
                      pro: 50000,
                      gold: 200000
                    }[userTier] - remainingTokens
                  ).toLocaleString()}
                </span>
              </div>
              
              {/* FIXED: Show upgrade prompt only for free users */}
              {userTier === 'free' && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-800">
                    <strong>Upgrade to Pro</strong> for more projects and advanced features!
                  </p>
                  <Button variant="primary" size="sm" className="mt-2 w-full">
                    Upgrade Now
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {!project && !isLoading && (
            <Card className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Transform Videos into Marketing Gold?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Enter a YouTube URL to extract key benefits and generate email campaigns, 
                blog posts, and newsletter content automatically.
              </p>
              
              {/* Feature highlights - same as before */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900">Extract Benefits</h4>
                  <p className="text-sm text-gray-600">AI analyzes video transcript</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900">Generate Content</h4>
                  <p className="text-sm text-gray-600">Create marketing materials</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900">Export & Use</h4>
                  <p className="text-sm text-gray-600">Download ready campaigns</p>
                </div>
              </div>
            </Card>
          )}

          {/* Transcript and Benefits Display */}
          {project && (
            <TranscriptDisplay 
              project={project}
              loading={isLoading && !project.transcript}
              onBenefitSelect={handleBenefitSelect}
              selectedBenefits={selectedBenefits}
            />
          )}

          {/* Asset Generation Panel */}
          {project && project.benefits && project.benefits.length > 0 && (
            <AssetGenerator
              project={project}
              onGenerate={handleGenerateAssets}
              loading={isLoading}
              selectedBenefits={selectedBenefits}
              userTier={userTier}
              remainingTokens={remainingTokens}
            />
          )}

          {/* Generated Assets Display */}
          {assets && assets.length > 0 && (
            <GeneratedAssets
              assets={assets}
              project={project}
              onCopy={(message) => showToast(message, 'success')}
            />
          )}

          {/* Loading State */}
          {isLoading && (
            <Card>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Processing Video...
                  </h3>
                  <p className="text-gray-600">
                    {!project ? 'Analyzing transcript and extracting benefits' : 'Generating marketing content'}
                  </p>
                  {/* ADDED: Show token usage estimate */}
                  <p className="text-sm text-gray-500 mt-2">
                    This may use {project ? 'AI tokens for content generation' : '~500-1000 tokens for analysis'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Feature Highlights - Only show for new users */}
      {!project && !isLoading && projects.length === 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Campaigns</h3>
            <p className="text-sm text-gray-600">
              Generate 3-5 email drip sequences focused on key benefits
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 011 1.73l4 3.46V16a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Blog Posts</h3>
            <p className="text-sm text-gray-600">
              SEO-optimized articles that drive traffic and conversions
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">UTM Tracking</h3>
            <p className="text-sm text-gray-600">
              Built-in affiliate link optimization and campaign tracking
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Tier-based Claude AI for quality content generation
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
{import.meta.env.DEV && <DebugPanel />}

// Export as default for React.lazy()
export default Video2Promo;