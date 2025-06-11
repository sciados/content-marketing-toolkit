// src/pages/CampaignList.jsx - FIXED: No slice errors, safe data handling
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Eye, Edit3, Trash2, Play, Pause, Archive,
  Target, Calendar, Users, BarChart3, Sparkles, Clock, CheckCircle,
  AlertCircle, Folder, Settings, Download, RefreshCw, Grid, List
} from 'lucide-react';
import { useContentLibrary } from '../shared/hooks/useContentLibrary';

const CampaignList = () => {
  const navigate = useNavigate();
  
  // Use the working useContentLibrary hook
  const {
    campaigns,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    deleteCampaign
  } = useContentLibrary();
  
  // Local state for view mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

  // Categories and statuses for filters
  const categories = [
    'Marketing & Sales', 'Technology & Software', 'Health & Wellness',
    'Finance & Business', 'Education & Training', 'Entertainment & Media',
    'E-commerce & Retail', 'Real Estate', 'Food & Beverage', 'Travel & Tourism'
  ];

  const statuses = [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'paused', label: 'Paused', color: 'yellow' },
    { value: 'completed', label: 'Completed', color: 'blue' },
    { value: 'archived', label: 'Archived', color: 'gray' }
  ];

  // FIXED: Safe campaign deletion with proper error handling
  const handleDeleteCampaign = async (campaignId, campaignName) => {
    if (!confirm(`Are you sure you want to delete "${campaignName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCampaign(campaignId);
      console.log('✅ Campaign deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete campaign:', error);
      alert(`Failed to delete campaign: ${error.message}`);
    }
  };

  // FIXED: Safe status update function
  const updateCampaignStatus = async (campaignId, newStatus) => {
    try {
      // This would ideally use a hook function, but for now just update local state
      console.log(`Updating campaign ${campaignId} status to: ${newStatus}`);
      // TODO: Implement status update when backend supports it
    } catch (error) {
      console.error('❌ Failed to update campaign status:', error);
    }
  };

  // FIXED: Safe data access with fallbacks
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  
  // Get status color safely
  const getStatusColor = (status) => {
    const statusConfig = statuses.find(s => s.value === status);
    return statusConfig?.color || 'gray';
  };

  // Format date safely
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown date';
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  // FIXED: Safe filtering with proper null/undefined checks
  const getFilteredCampaigns = () => {
    return safeCampaigns.filter(campaign => {
      if (!campaign) return false;
      
      const campaignName = campaign.name || '';
      const campaignDescription = campaign.description || '';
      const campaignKeywords = Array.isArray(campaign.keywords) ? campaign.keywords : [];
      
      const matchesSearch = !searchTerm || 
        campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaignDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaignKeywords.some(keyword => 
          typeof keyword === 'string' && keyword.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesCategory = !filterType || filterType === 'all' || campaign.category === filterType;
      const matchesStatus = !filterType || filterType === 'all' || campaign.status === filterType;
      
      return matchesSearch && (matchesCategory || matchesStatus);
    });
  };

  // Campaign Card Component with safe data access
  const CampaignCard = ({ campaign }) => {
    if (!campaign) return null;
    
    const safeCampaign = {
      id: campaign.id || 'unknown',
      name: campaign.name || 'Untitled Campaign',
      category: campaign.category || 'Uncategorized',
      description: campaign.description || 'No description available',
      keywords: Array.isArray(campaign.keywords) ? campaign.keywords : [],
      status: campaign.status || 'unknown',
      metadata: campaign.metadata || {},
      updated_at: campaign.updated_at || campaign.created_at || new Date().toISOString()
    };
    
    return (
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{safeCampaign.name}</h3>
              <p className="text-sm text-gray-500">{safeCampaign.category}</p>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            getStatusColor(safeCampaign.status) === 'green' ? 'bg-green-100 text-green-700' :
            getStatusColor(safeCampaign.status) === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
            getStatusColor(safeCampaign.status) === 'blue' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {safeCampaign.status}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{safeCampaign.description}</p>

        {/* Keywords - FIXED: Safe array handling */}
        <div className="flex flex-wrap gap-1 mb-4">
          {safeCampaign.keywords.slice(0, 3).map((keyword, index) => (
            <span key={`${keyword}-${index}`} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {keyword}
            </span>
          ))}
          {safeCampaign.keywords.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{safeCampaign.keywords.length - 3} more
            </span>
          )}
        </div>

        {/* Stats - FIXED: Safe metadata access */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <p className="text-sm font-medium text-gray-900">{safeCampaign.metadata.source_count || 0}</p>
            <p className="text-xs text-gray-500">Sources</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{safeCampaign.metadata.output_count || 0}</p>
            <p className="text-xs text-gray-500">Content</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{formatDate(safeCampaign.updated_at)}</p>
            <p className="text-xs text-gray-500">Updated</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/campaigns/${safeCampaign.id}`)}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center justify-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          
          <button
            onClick={() => console.log('Edit campaign:', safeCampaign.id)}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            title="Edit campaign"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          {safeCampaign.status === 'active' ? (
            <button
              onClick={() => updateCampaignStatus(safeCampaign.id, 'paused')}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              title="Pause campaign"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => updateCampaignStatus(safeCampaign.id, 'active')}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              title="Activate campaign"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => handleDeleteCampaign(safeCampaign.id, safeCampaign.name)}
            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
            title="Delete campaign"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Campaign List Row Component
  const CampaignRow = ({ campaign }) => {
    if (!campaign) return null;
    
    const safeCampaign = {
      id: campaign.id || 'unknown',
      name: campaign.name || 'Untitled Campaign',
      category: campaign.category || 'Uncategorized',
      status: campaign.status || 'unknown',
      metadata: campaign.metadata || {},
      updated_at: campaign.updated_at || campaign.created_at || new Date().toISOString()
    };
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-medium text-gray-900">{safeCampaign.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(safeCampaign.status) === 'green' ? 'bg-green-100 text-green-700' :
                  getStatusColor(safeCampaign.status) === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  getStatusColor(safeCampaign.status) === 'blue' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {safeCampaign.status}
                </span>
              </div>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                <span>{safeCampaign.category}</span>
                <span>•</span>
                <span>{safeCampaign.metadata.source_count || 0} sources</span>
                <span>•</span>
                <span>{safeCampaign.metadata.output_count || 0} content pieces</span>
                <span>•</span>
                <span>Updated {formatDate(safeCampaign.updated_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/campaigns/${safeCampaign.id}`)}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
            
            <button
              onClick={() => console.log('Edit campaign:', safeCampaign.id)}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredCampaigns = getFilteredCampaigns();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Campaigns</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Campaigns</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your content marketing campaigns and generated assets
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <button
                onClick={() => navigate('/content-library')}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Campaign</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setSearchTerm('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600">
                {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {safeCampaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {safeCampaigns.length === 0 
                ? 'Create your first content campaign to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {safeCampaigns.length === 0 && (
              <button
                onClick={() => navigate('/content-library')}
                className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Campaign</span>
              </button>
            )}
          </div>
        )}

        {/* Campaigns List - FIXED: Safe rendering */}
        {!loading && !error && filteredCampaigns.length > 0 && (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredCampaigns.map(campaign => 
              campaign && campaign.id ? (
                viewMode === 'grid' ? (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ) : (
                  <CampaignRow key={campaign.id} campaign={campaign} />
                )
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignList;