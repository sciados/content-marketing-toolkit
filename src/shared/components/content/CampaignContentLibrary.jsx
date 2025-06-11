// src/components/ContentLibrary/CampaignContentLibrary.jsx - NEW Campaign-Based Content Library
import React, { useState, useEffect } from 'react';
import { useContentLibrary } from '../../../shared/hooks/useContentLibrary';
import { useToast } from '../../../shared/hooks/useToast';
import LoadingSpinner from '../ui/LoadingSpinner';
import CampaignCard from './CampaignCard';
import CampaignContentModal from './CampaignContentModal';
import CreateCampaignModal from './CreateCampaignModal';
import Toast from '../ui/Toast';

/**
 * Campaign-based Content Library - The new way to organize content
 * Shows campaigns as the organizing principle with content nested inside
 */
const CampaignContentLibrary = () => {
  const { toast, showToast } = useToast();
  const {
    campaigns,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    // loadCampaigns,
    getCampaignContent,
    createCampaign,
    deleteCampaign,
    getLibraryStats
  } = useContentLibrary();

  // Modal states
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignContent, setCampaignContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [libraryStats, setLibraryStats] = useState(null);

  // Load library stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getLibraryStats();
        setLibraryStats(stats);
      } catch (err) {
        console.warn('Could not load library stats:', err);
      }
    };
    
    if (campaigns.length > 0) {
      loadStats();
    }
  }, [campaigns, getLibraryStats]);

  // Handle campaign selection and content loading
  const handleCampaignClick = async (campaign) => {
    setSelectedCampaign(campaign);
    setLoadingContent(true);
    setShowContentModal(true);
    
    try {
      console.log('🔍 Loading content for campaign:', campaign.name);
      const content = await getCampaignContent(campaign.id);
      setCampaignContent(content);
    } catch (err) {
      console.error('Failed to load campaign content:', err);
      showToast(`Failed to load campaign content: ${err.message}`, 'error');
      setCampaignContent(null);
    } finally {
      setLoadingContent(false);
    }
  };

  // Handle campaign creation
  const handleCreateCampaign = async (campaignData) => {
    try {
      await createCampaign(campaignData);
      setShowCreateModal(false);
      showToast(`Campaign "${campaignData.name}" created successfully!`, 'success');
    } catch (err) {
      console.error('Failed to create campaign:', err);
      showToast(`Failed to create campaign: ${err.message}`, 'error');
    }
  };

  // Handle campaign deletion
  const handleDeleteCampaign = async (campaignId, campaignName) => {
    if (!confirm(`Are you sure you want to delete "${campaignName}" and all its content? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteCampaign(campaignId);
      showToast(`Campaign "${campaignName}" deleted successfully.`, 'success');
      
      // Close modal if deleted campaign was selected
      if (selectedCampaign?.id === campaignId) {
        setShowContentModal(false);
        setSelectedCampaign(null);
      }
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      showToast(`Failed to delete campaign: ${err.message}`, 'error');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Content Library Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-red-800 underline hover:text-red-900"
                  >
                    Reload page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaign Manager</h1>
              <p className="mt-1 text-sm text-gray-500">
                Organize your content by marketing campaigns for better project management
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Campaign
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          {libraryStats && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-semibold text-gray-900">{libraryStats.totalCampaigns}</div>
                <div className="text-xs text-gray-500">Campaigns</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-lg font-semibold text-blue-900">{libraryStats.emailSeriesCount}</div>
                <div className="text-xs text-blue-600">Email Series</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-lg font-semibold text-green-900">{libraryStats.socialContentCount}</div>
                <div className="text-xs text-green-600">Social Posts</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-lg font-semibold text-purple-900">{libraryStats.totalInputSources}</div>
                <div className="text-xs text-purple-600">Input Sources</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-lg font-semibold text-yellow-900">{libraryStats.activeCampaigns}</div>
                <div className="text-xs text-yellow-600">Active</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-lg font-semibold text-orange-900">{libraryStats.totalTokensUsed?.toLocaleString() || 0}</div>
                <div className="text-xs text-orange-600">AI Tokens</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Content Type Filter */}
          <div className="md:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Campaigns</option>
              <option value="emails">With Emails</option>
              <option value="social">With Social Content</option>
              <option value="blog">With Blog Posts</option>
              <option value="video">With Video Assets</option>
            </select>
          </div>
        </div>

        {/* Campaign Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="large" message="Loading campaigns..." />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first campaign.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Campaign
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onClick={() => handleCampaignClick(campaign)}
                onDelete={() => handleDeleteCampaign(campaign.id, campaign.name)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCampaign}
        />
      )}

      {showContentModal && selectedCampaign && (
        <CampaignContentModal
          campaign={selectedCampaign}
          content={campaignContent}
          loading={loadingContent}
          onClose={() => {
            setShowContentModal(false);
            setSelectedCampaign(null);
            setCampaignContent(null);
          }}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default CampaignContentLibrary;