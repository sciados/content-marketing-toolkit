// src/pages/CampaignList.jsx - Campaign List and Management Page
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Eye, Edit3, Trash2, Play, Pause, Archive,
  Target, Calendar, Users, BarChart3, Sparkles, Clock, CheckCircle,
  AlertCircle, Folder, Settings, Download, RefreshCw, Grid, List
} from 'lucide-react';
import { contentLibraryApi } from '../services/api';
import { useErrorHandler } from '../hooks/useErrorHandler';

const CampaignList = () => {
  const navigate = useNavigate();
  const { withErrorHandling } = useErrorHandler();
  
  // State management
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

  // Categories and statuses
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

  // Demo campaigns data
  const getDemoCampaigns = () => [
    {
      id: 'demo-1',
      name: 'Q4 Product Launch Campaign',
      category: 'Marketing & Sales',
      description: 'Comprehensive content campaign for Q4 product launch including emails, social media, and blog content.',
      keywords: ['product launch', 'marketing', 'sales', 'conversion'],
      status: 'active',
      input_sources: [
        { type: 'video', name: 'Product Demo' },
        { type: 'website', name: 'Competitor Analysis' },
        { type: 'document', name: 'Strategy Brief' }
      ],
      metadata: {
        source_count: 3,
        output_count: 12,
        last_generated: '2025-06-05T10:30:00Z'
      },
      created_at: '2025-06-04T15:30:00Z',
      updated_at: '2025-06-05T10:30:00Z'
    },
    {
      id: 'demo-2',
      name: 'SaaS Onboarding Content',
      category: 'Technology & Software',
      description: 'Educational content series for new SaaS users including tutorials, guides, and email sequences.',
      keywords: ['onboarding', 'tutorial', 'user experience', 'saas'],
      status: 'active',
      input_sources: [
        { type: 'video', name: 'Onboarding Video' },
        { type: 'document', name: 'User Guide' }
      ],
      metadata: {
        source_count: 2,
        output_count: 8,
        last_generated: '2025-06-03T14:20:00Z'
      },
      created_at: '2025-06-01T09:15:00Z',
      updated_at: '2025-06-03T14:20:00Z'
    },
    {
      id: 'demo-3',
      name: 'Holiday Marketing Blitz',
      category: 'Marketing & Sales',
      description: 'Seasonal marketing campaign for holiday promotions across multiple channels.',
      keywords: ['holiday', 'promotion', 'seasonal', 'sales'],
      status: 'completed',
      input_sources: [
        { type: 'website', name: 'Previous Campaign Data' },
        { type: 'document', name: 'Holiday Strategy' }
      ],
      metadata: {
        source_count: 2,
        output_count: 15,
        last_generated: '2025-05-28T16:45:00Z'
      },
      created_at: '2025-05-20T11:00:00Z',
      updated_at: '2025-05-28T16:45:00Z'
    },
    {
      id: 'demo-4',
      name: 'Health Blog Content Series',
      category: 'Health & Wellness',
      description: 'Weekly blog content focused on nutrition and wellness tips.',
      keywords: ['health', 'nutrition', 'wellness', 'blog'],
      status: 'paused',
      input_sources: [
        { type: 'document', name: 'Research Papers' },
        { type: 'video', name: 'Expert Interviews' }
      ],
      metadata: {
        source_count: 2,
        output_count: 6,
        last_generated: '2025-05-25T12:30:00Z'
      },
      created_at: '2025-05-15T14:20:00Z',
      updated_at: '2025-05-25T12:30:00Z'
    }
  ];

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const safeApiCall = withErrorHandling(contentLibraryApi.getCampaigns);
      const result = await safeApiCall({
        category: selectedCategory,
        status: selectedStatus,
        search: searchTerm,
        limit: '50'
      });

      if (result.success && result.campaigns) {
        setCampaigns(result.campaigns);
        console.log(`✅ Fetched ${result.campaigns.length} campaigns`);
      } else {
        // Fallback to demo data
        console.warn('⚠️ Using demo campaigns data');
        setCampaigns(getDemoCampaigns());
      }
    } catch (error) {
      console.error('❌ Failed to fetch campaigns:', error);
      setError(error.message);
      // Fallback to demo data
      setCampaigns(getDemoCampaigns());
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedStatus, searchTerm, withErrorHandling]);

  // Load campaigns on mount and filter changes
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Delete campaign
  const deleteCampaign = async (campaignId, campaignName) => {
    if (!confirm(`Are you sure you want to delete "${campaignName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const safeApiCall = withErrorHandling(contentLibraryApi.deleteCampaign);
      const result = await safeApiCall(campaignId);
      
      if (result.success) {
        setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
        console.log('✅ Campaign deleted successfully');
      } else {
        // For demo: remove from local state
        setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
      }
    } catch (error) {
      console.error('❌ Failed to delete campaign:', error);
    }
  };

  // Update campaign status
  const updateCampaignStatus = async (campaignId, newStatus) => {
    try {
      const safeApiCall = withErrorHandling(contentLibraryApi.updateCampaign);
      const result = await safeApiCall(campaignId, { status: newStatus });
      
      if (result.success) {
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus }
            : campaign
        ));
        console.log(`✅ Campaign status updated to: ${newStatus}`);
      } else {
        // For demo: update local state
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus }
            : campaign
        ));
      }
    } catch (error) {
      console.error('❌ Failed to update campaign status:', error);
    }
  };

  // Filter campaigns
  const getFilteredCampaigns = () => {
    return campaigns.filter(campaign => {
      const matchesSearch = !searchTerm || 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !selectedCategory || campaign.category === selectedCategory;
      const matchesStatus = !selectedStatus || campaign.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusConfig = statuses.find(s => s.value === status);
    return statusConfig?.color || 'gray';
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  // Campaign Card Component
  const CampaignCard = ({ campaign }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
            <p className="text-sm text-gray-500">{campaign.category}</p>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          getStatusColor(campaign.status) === 'green' ? 'bg-green-100 text-green-700' :
          getStatusColor(campaign.status) === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
          getStatusColor(campaign.status) === 'blue' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {campaign.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1 mb-4">
        {campaign.keywords.slice(0, 3).map(keyword => (
          <span key={keyword} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            {keyword}
          </span>
        ))}
        {campaign.keywords.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            +{campaign.keywords.length - 3} more
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div>
          <p className="text-sm font-medium text-gray-900">{campaign.metadata.source_count}</p>
          <p className="text-xs text-gray-500">Sources</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{campaign.metadata.output_count}</p>
          <p className="text-xs text-gray-500">Content</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{formatDate(campaign.updated_at)}</p>
          <p className="text-xs text-gray-500">Updated</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => navigate(`/campaigns/${campaign.id}`)}
          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center justify-center space-x-1"
        >
          <Eye className="w-4 h-4" />
          <span>View</span>
        </button>
        
        <button
          onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        
        {campaign.status === 'active' ? (
          <button
            onClick={() => updateCampaignStatus(campaign.id, 'paused')}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            title="Pause campaign"
          >
            <Pause className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => updateCampaignStatus(campaign.id, 'active')}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            title="Activate campaign"
          >
            <Play className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={() => deleteCampaign(campaign.id, campaign.name)}
          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
          title="Delete campaign"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Campaign List Row Component
  const CampaignRow = ({ campaign }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="font-medium text-gray-900">{campaign.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                getStatusColor(campaign.status) === 'green' ? 'bg-green-100 text-green-700' :
                getStatusColor(campaign.status) === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                getStatusColor(campaign.status) === 'blue' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {campaign.status}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <span>{campaign.category}</span>
              <span>•</span>
              <span>{campaign.metadata.source_count} sources</span>
              <span>•</span>
              <span>{campaign.metadata.output_count} content pieces</span>
              <span>•</span>
              <span>Updated {formatDate(campaign.updated_at)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/campaigns/${campaign.id}`)}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          
          <button
            onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const filteredCampaigns = getFilteredCampaigns();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Campaigns</h1>
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
                onClick={() => navigate('/campaigns/create')}
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
        {/* Filters and Search */}
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
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedStatus('');
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
              
              {(selectedCategory || selectedStatus || searchTerm) && (
                <button
                  onClick={fetchCampaigns}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              )}
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

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Campaigns</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchCampaigns}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {campaigns.length === 0 
                ? 'Create your first content campaign to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {campaigns.length === 0 && (
              <button
                onClick={() => navigate('/campaigns/create')}
                className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Campaign</span>
              </button>
            )}
          </div>
        )}

        {/* Campaigns List */}
        {!loading && !error && filteredCampaigns.length > 0 && (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredCampaigns.map(campaign => 
              viewMode === 'grid' ? (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ) : (
                <CampaignRow key={campaign.id} campaign={campaign} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignList;