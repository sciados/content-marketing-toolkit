// src/pages/CampaignDetail.jsx - Campaign Detail and Management Page
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit3, Trash2, Download, Eye, Settings, Target, 
  Tags, Wand2, Sparkles, Calendar, Users, Database, Clock, 
  CheckCircle, Search, Folder, Star, Plus, Globe, Video, 
  FileText, Image, BarChart3, TrendingUp, Share2, Copy,
  RefreshCw, AlertCircle, Play, Pause, Archive
} from 'lucide-react';
import { useContentLibrary } from '../shared/hooks/useContentLibrary';
import { ContentLibraryCard } from '../shared/components/content/ContentLibraryCard';
import { contentLibraryApi } from '../core/api';
import { useErrorHandler } from '../shared/hooks/useErrorHandler';

// Demo campaign data for fallback
const getDemoCampaign = (campaignId) => ({
  id: campaignId,
  name: 'Q4 Product Launch Campaign',
  category: 'Marketing & Sales',
  description: 'Comprehensive content campaign for our Q4 product launch including emails, social media, and blog content.',
  keywords: ['product launch', 'marketing', 'sales', 'conversion', 'Q4'],
  status: 'active',
  input_sources: [
    {
      id: 1,
      type: 'video',
      name: 'Product Demo Video',
      data: { url: 'https://youtube.com/watch?v=demo123' },
      status: 'processed',
      isFromLibrary: false,
      extractedAt: '2025-06-05'
    },
    {
      id: 2,
      type: 'website',
      name: 'Competitor Landing Page',
      data: { url: 'https://competitor.com/product' },
      status: 'processed',
      isFromLibrary: false,
      extractedAt: '2025-06-04'
    },
    {
      id: 'demo-1',
      type: 'video_transcript',
      name: 'Marketing Strategy Video Transcript',
      data: { libraryItemId: 'demo-1' },
      status: 'completed',
      isFromLibrary: true,
      extractedAt: '2025-05-20'
    }
  ],
  metadata: {
    created_via: 'campaign_hub',
    source_count: 3,
    keyword_count: 5,
    last_generated: '2025-06-05T10:30:00Z',
    output_count: 8
  },
  created_at: '2025-06-04T15:30:00Z',
  updated_at: '2025-06-05T10:30:00Z'
});

// Demo generated content - used in component
const createDemoGeneratedContent = () => [
  {
    id: 1,
    type: 'blog-post',
    title: '5 Key Insights from Q4 Product Launch Strategy',
    content: 'Based on your campaign sources, here are the key insights for your product launch...',
    status: 'completed',
    createdAt: '2025-06-05T10:30:00Z',
    wordCount: 2847,
    engagement: '87%'
  },
  {
    id: 2,
    type: 'social-posts',
    title: 'Social Media Content Pack',
    content: '10 ready-to-post social media updates for LinkedIn, Twitter, and Instagram...',
    status: 'completed',
    createdAt: '2025-06-05T10:25:00Z',
    wordCount: 485,
    engagement: '92%'
  },
  {
    id: 3,
    type: 'email-series',
    title: 'Product Launch Email Sequence',
    content: '5-email series for product launch: Welcome, Features, Benefits, Social Proof, CTA...',
    status: 'completed',
    createdAt: '2025-06-05T10:20:00Z',
    wordCount: 1250,
    engagement: '78%'
  }
];

const CampaignDetail = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { withErrorHandling } = useErrorHandler();
  
  const {
    items: libraryItems,
    loading: libraryLoading,
    toggleFavorite,
    deleteItem: deleteLibraryItem,
    useContentItem
  } = useContentLibrary();

  // Campaign state
  const [campaign, setCampaign] = useState(null);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [campaignError, setCampaignError] = useState(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview'); // overview, inputs, outputs, settings
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOutputTypes, setSelectedOutputTypes] = useState([]);
  // Demo generated content
  const [generatedContent, setGeneratedContent] = useState(createDemoGeneratedContent);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Output types configuration
  const outputTypes = [
    {
      category: 'Written Content',
      icon: FileText,
      types: [
        { id: 'blog-post', name: 'Blog Posts', description: '1000-3000 word articles' },
        { id: 'social-posts', name: 'Social Media Posts', description: 'Twitter, LinkedIn, Instagram' },
        { id: 'email-series', name: 'Email Series', description: 'Newsletter campaigns' },
        { id: 'scripts', name: 'Video Scripts', description: 'YouTube, TikTok scripts' },
        { id: 'sales-copy', name: 'Sales Copy', description: 'Landing pages, ads' }
      ]
    },
    {
      category: 'Visual Content',
      icon: Image,
      types: [
        { id: 'social-graphics', name: 'Social Graphics', description: 'Instagram, LinkedIn posts' },
        { id: 'quote-cards', name: 'Quote Cards', description: 'Shareable quote images' },
        { id: 'infographics', name: 'Infographics', description: 'Data visualizations' },
        { id: 'thumbnails', name: 'Thumbnails', description: 'YouTube, blog headers' }
      ]
    },
    {
      category: 'Video Content',
      icon: Video,
      types: [
        { id: 'short-videos', name: 'Short Videos', description: 'TikTok, Reels, Shorts' },
        { id: 'story-videos', name: 'Story Videos', description: 'Instagram/Facebook stories' },
        { id: 'animated-graphics', name: 'Animated Graphics', description: 'Social media animations' }
      ]
    }
  ];

  // Demo generated content
  const getDemoGeneratedContent = () => [
    {
      id: 1,
      type: 'blog-post',
      title: '5 Key Insights from Q4 Product Launch Strategy',
      content: 'Based on your campaign sources, here are the key insights for your product launch...',
      status: 'completed',
      createdAt: '2025-06-05T10:30:00Z',
      wordCount: 2847,
      engagement: '87%'
    },
    {
      id: 2,
      type: 'social-posts',
      title: 'Social Media Content Pack',
      content: '10 ready-to-post social media updates for LinkedIn, Twitter, and Instagram...',
      status: 'completed',
      createdAt: '2025-06-05T10:25:00Z',
      wordCount: 485,
      engagement: '92%'
    },
    {
      id: 3,
      type: 'email-series',
      title: 'Product Launch Email Sequence',
      content: '5-email series for product launch: Welcome, Features, Benefits, Social Proof, CTA...',
      status: 'completed',
      createdAt: '2025-06-05T10:20:00Z',
      wordCount: 1250,
      engagement: '78%'
    }
  ];

  // Fetch campaign details
  const fetchCampaign = useCallback(async () => {
    setCampaignLoading(true);
    setCampaignError(null);
    
    try {
      const safeApiCall = withErrorHandling(contentLibraryApi.getCampaign);
      const result = await safeApiCall(campaignId);
      
      if (result.success && result.campaign) {
        setCampaign(result.campaign);
        console.log('✅ Fetched campaign:', result.campaign.name);
      } else {
        // Fallback to demo data
        console.warn('⚠️ Using demo campaign data');
        setCampaign(getDemoCampaign(campaignId));
      }
    } catch (error) {
      console.error('❌ Failed to fetch campaign:', error);
      setCampaignError(error.message);
      // Fallback to demo data
      setCampaign(getDemoCampaign(campaignId));
    } finally {
      setCampaignLoading(false);
    }
  }, [campaignId, withErrorHandling]);

  // Load campaign on mount
  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId, fetchCampaign]);

  // Load demo content
  useEffect(() => {
    setGeneratedContent(getDemoGeneratedContent());
  }, []);

  // Delete campaign
  const deleteCampaign = async () => {
    if (!confirm(`Are you sure you want to delete "${campaign?.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const safeApiCall = withErrorHandling(contentLibraryApi.deleteCampaign);
      const result = await safeApiCall(campaignId);
      
      if (result.success) {
        console.log('✅ Campaign deleted successfully');
        navigate('/campaigns');
      } else {
        console.error('❌ Failed to delete campaign:', result.error);
      }
    } catch (error) {
      console.error('❌ Failed to delete campaign:', error);
    }
  };

  // Update campaign status
  const updateCampaignStatus = async (newStatus) => {
    try {
      const safeApiCall = withErrorHandling(contentLibraryApi.updateCampaign);
      const result = await safeApiCall(campaignId, { status: newStatus });
      
      if (result.success) {
        setCampaign(prev => ({ ...prev, status: newStatus }));
        console.log(`✅ Campaign status updated to: ${newStatus}`);
      }
    } catch (error) {
      console.error('❌ Failed to update campaign status:', error);
    }
  };

  // Generate new content
  const generateContent = async () => {
    if (selectedOutputTypes.length === 0) {
      alert('Please select at least one output type to generate.');
      return;
    }

    setIsGenerating(true);
    
    // Simulate content generation
    setTimeout(() => {
      const newContent = selectedOutputTypes.map((typeId, index) => {
        const type = outputTypes.flatMap(cat => cat.types).find(t => t.id === typeId);
        return {
          id: Date.now() + index,
          type: typeId,
          title: `Generated ${type?.name || 'Content'} for ${campaign?.name}`,
          content: `New ${type?.name} content generated based on your campaign sources...`,
          status: 'completed',
          createdAt: new Date().toISOString(),
          wordCount: Math.floor(Math.random() * 2000) + 500,
          engagement: `${Math.floor(Math.random() * 30) + 70}%`
        };
      });
      
      setGeneratedContent(prev => [...newContent, ...prev]);
      setSelectedOutputTypes([]);
      setIsGenerating(false);
      setActiveTab('outputs');
    }, 3000);
  };

  // Get input source icon
  const getInputIcon = (type) => {
    switch (type) {
      case 'video':
      case 'video_transcript':
        return Video;
      case 'website':
      case 'scanned_page':
        return Globe;
      case 'document':
        return FileText;
      default:
        return Database;
    }
  };

  // Get library items used in campaign
  const getCampaignLibraryItems = () => {
    if (!campaign?.input_sources) return [];
    
    const librarySourceIds = campaign.input_sources
      .filter(source => source.isFromLibrary)
      .map(source => source.data?.libraryItemId);
    
    return libraryItems.filter(item => librarySourceIds.includes(item.id));
  };

  // Filter generated content
  const getFilteredContent = () => {
    if (!searchTerm) return generatedContent;
    
    return generatedContent.filter(content =>
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (campaignLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (campaignError && !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-4">{campaignError}</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/campaigns')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{campaign?.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{campaign?.category}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign?.status === 'active' ? 'bg-green-100 text-green-700' :
                      campaign?.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign?.status}
                    </span>
                    <span>•</span>
                    <span>{campaign?.input_sources?.length || 0} sources</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              
              {campaign?.status === 'active' ? (
                <button
                  onClick={() => updateCampaignStatus('paused')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={() => updateCampaignStatus('active')}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Activate</span>
                </button>
              )}
              
              <button
                onClick={deleteCampaign}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'inputs', name: 'Input Sources', icon: Database },
              { id: 'outputs', name: 'Generated Content', icon: Sparkles },
              { id: 'settings', name: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Campaign Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Input Sources</p>
                    <p className="text-2xl font-bold text-gray-900">{campaign?.input_sources?.length || 0}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Generated Content</p>
                    <p className="text-2xl font-bold text-gray-900">{generatedContent.length}</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Keywords</p>
                    <p className="text-2xl font-bold text-gray-900">{campaign?.keywords?.length || 0}</p>
                  </div>
                  <Tags className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Est. Engagement</p>
                    <p className="text-2xl font-bold text-gray-900">87%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Campaign Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{campaign?.description || 'No description provided'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign?.keywords?.map(keyword => (
                      <span
                        key={keyword}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                  <p className="text-gray-600">
                    {campaign?.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                  <p className="text-gray-600">
                    {campaign?.updated_at ? new Date(campaign.updated_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('outputs')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <Wand2 className="w-6 h-6 text-blue-500 mb-2" />
                  <h4 className="font-medium text-gray-900">Generate Content</h4>
                  <p className="text-sm text-gray-500">Create new content from your sources</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('inputs')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <Plus className="w-6 h-6 text-green-500 mb-2" />
                  <h4 className="font-medium text-gray-900">Add Sources</h4>
                  <p className="text-sm text-gray-500">Add more input content</p>
                </button>
                
                <button
                  onClick={() => {
                    // Export all generated content
                    const content = generatedContent.map(item => item.content).join('\n\n---\n\n');
                    navigator.clipboard.writeText(content);
                    alert('All content copied to clipboard!');
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <Download className="w-6 h-6 text-purple-500 mb-2" />
                  <h4 className="font-medium text-gray-900">Export All</h4>
                  <p className="text-sm text-gray-500">Download generated content</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Sources Tab */}
        {activeTab === 'inputs' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Input Sources</h2>
              <button
                onClick={() => navigate(`/campaigns/${campaignId}/edit`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add More Sources</span>
              </button>
            </div>

            {/* Campaign Sources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Sources</h3>
              {campaign?.input_sources?.map(source => {
                const IconComponent = getInputIcon(source.type);
                return (
                  <div key={source.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          source.isFromLibrary ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <IconComponent className={`w-5 h-5 ${
                            source.isFromLibrary ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{source.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{source.type.replace('_', ' ')}</span>
                            {source.isFromLibrary && (
                              <>
                                <span>•</span>
                                <span className="text-green-600">From Library</span>
                              </>
                            )}
                            <span>•</span>
                            <span>Added {source.extractedAt}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          source.status === 'completed' ? 'bg-green-100 text-green-700' :
                          source.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {source.status}
                        </span>
                        
                        {source.data?.url && (
                          <a
                            href={source.data.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-blue-500"
                          >
                            <Share2 className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Library Items Used */}
            {libraryLoading ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Content Library Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                  ))}
                </div>
              </div>
            ) : getCampaignLibraryItems().length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Content Library Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getCampaignLibraryItems().map(item => (
                    <ContentLibraryCard
                      key={item.id}
                      item={item}
                      onToggleFavorite={toggleFavorite}
                      onUseItem={useContentItem}
                      onDeleteItem={deleteLibraryItem}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generated Content Tab */}
        {activeTab === 'outputs' && (
          <div className="space-y-8">
            {/* Content Generation Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Content</h3>
              <div className="space-y-6">
                {outputTypes.map(category => (
                  <div key={category.category}>
                    <div className="flex items-center space-x-2 mb-4">
                      <category.icon className="w-5 h-5 text-gray-600" />
                      <h4 className="font-medium text-gray-900">{category.category}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.types.map(type => (
                        <label
                          key={type.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedOutputTypes.includes(type.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selectedOutputTypes.includes(type.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOutputTypes(prev => [...prev, type.id]);
                              } else {
                                setSelectedOutputTypes(prev => prev.filter(id => id !== type.id));
                              }
                            }}
                          />
                          <h5 className="font-medium text-gray-900 mb-1">{type.name}</h5>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-4">
                  <p className="text-sm text-gray-500">
                    {selectedOutputTypes.length} content type{selectedOutputTypes.length !== 1 ? 's' : ''} selected
                  </p>
                  <button
                    onClick={generateContent}
                    disabled={selectedOutputTypes.length === 0 || isGenerating}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>Generate Content</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Content List */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Generated Content</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setGeneratedContent(createDemoGeneratedContent())}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    title="Refresh content"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {getFilteredContent().length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Content Generated Yet</h4>
                  <p className="text-gray-500 mb-4">
                    Generate your first content pieces using the form above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredContent().map(content => (
                    <div key={content.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 truncate">{content.title}</h4>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            ✓ Ready
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{content.content}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span>{content.wordCount?.toLocaleString()} words</span>
                          <span>{content.engagement} engagement</span>
                          <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Preview content
                              alert(`Preview: ${content.title}\n\n${content.content}`);
                            }}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(content.content);
                              alert('Content copied to clipboard!');
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-1"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Campaign Settings</h3>
              
              <div className="space-y-6">
                {/* Basic Settings */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                      <input
                        type="text"
                        value={campaign?.name || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input
                        type="text"
                        value={campaign?.category || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Management */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Status Management</h4>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => updateCampaignStatus('active')}
                      className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                        campaign?.status === 'active'
                          ? 'bg-green-500 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      <span>Active</span>
                    </button>
                    <button
                      onClick={() => updateCampaignStatus('paused')}
                      className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                        campaign?.status === 'paused'
                          ? 'bg-yellow-500 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Pause className="w-4 h-4" />
                      <span>Paused</span>
                    </button>
                    <button
                      onClick={() => updateCampaignStatus('archived')}
                      className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                        campaign?.status === 'archived'
                          ? 'bg-gray-500 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Archive className="w-4 h-4" />
                      <span>Archived</span>
                    </button>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign?.keywords?.map(keyword => (
                      <span
                        key={keyword}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-medium text-red-600 mb-4">Danger Zone</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-red-800">Delete Campaign</h5>
                        <p className="text-sm text-red-600">
                          This action cannot be undone. This will permanently delete the campaign and all generated content.
                        </p>
                      </div>
                      <button
                        onClick={deleteCampaign}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Campaign</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Campaign editing is currently handled through the creation interface.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    navigate(`/campaigns/${campaignId}/edit`);
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                >
                  Edit Campaign
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetail;