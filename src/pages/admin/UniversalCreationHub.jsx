import React, { useState, useRef } from 'react';
import { Upload, X, Plus, Globe, Video, FileText, Image, Download, Eye, Settings, Target, Tags, Wand2, Sparkles, Calendar, Users, Database, Clock, CheckCircle, Search, Folder, Star } from 'lucide-react';
import { useContentLibrary } from '../shared/hooks/useContentLibrary';
import { ContentLibraryCard } from './ContentLibrary/ContentLibraryCard';
import { contentLibraryApi } from '../services/api/index';

const UniversalCreationHub = () => {
  const {
    items: libraryItems,
    loading: libraryLoading,
    toggleFavorite,
    deleteItem,
    getFavoriteItems
  } = useContentLibrary();

  const [campaign, setCampaign] = useState({
    name: '',
    category: '',
    keywords: [],
    description: '',
    targetAudience: '',
    goals: []
  });

  const [campaignInputs, setCampaignInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [currentStep, setCurrentStep] = useState('setup'); // setup, inputs, generation, outputs
  const [keywordInput, setKeywordInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInputForm, setShowInputForm] = useState(null);
  const [selectedOutputs, setSelectedOutputs] = useState([]);
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  const [selectedLibraryItems, setSelectedLibraryItems] = useState([]);
  const [libraryView, setLibraryView] = useState('category'); // 'category', 'all', 'favorites'
  const fileInputRef = useRef(null);

  // Input Types Configuration
  const inputTypes = [
    {
      id: 'website',
      name: 'Website/Landing Page',
      icon: Globe,
      description: 'Scan and extract content from any website',
      color: 'bg-blue-500',
      fields: ['url']
    },
    {
      id: 'video',
      name: 'Video URL',
      icon: Video,
      description: 'Extract transcript from YouTube, Vimeo, etc.',
      color: 'bg-red-500',
      fields: ['url']
    },
    {
      id: 'document',
      name: 'Upload Documents',
      icon: FileText,
      description: 'PDFs, Word docs, text files',
      color: 'bg-green-500',
      fields: ['file']
    },
    {
      id: 'text',
      name: 'Direct Text Input',
      icon: FileText,
      description: 'Paste or type content directly',
      color: 'bg-purple-500',
      fields: ['text']
    }
  ];

  // Output Types Configuration
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

  const categories = [
    'Marketing & Sales', 'Technology & Software', 'Health & Wellness', 
    'Finance & Business', 'Education & Training', 'Entertainment & Media',
    'E-commerce & Retail', 'Real Estate', 'Food & Beverage', 'Travel & Tourism'
  ];

  // Filter library items based on current view and search
  const getFilteredLibraryItems = () => {
    let filtered = libraryItems;

    // Apply view filter
    if (libraryView === 'favorites') {
      filtered = getFavoriteItems();
    } else if (libraryView === 'category' && campaign.category) {
      // Filter by category tags or metadata
      filtered = filtered.filter(item => 
        item.tags?.some(tag => tag.toLowerCase().includes(campaign.category.toLowerCase())) ||
        item.description?.toLowerCase().includes(campaign.category.toLowerCase())
      );
    }

    // Apply search filter
    if (librarySearchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(librarySearchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(librarySearchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(librarySearchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !campaign.keywords.includes(keywordInput.trim())) {
      setCampaign(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setCampaign(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addNewInput = (type, data) => {
    const newInput = {
      id: Date.now(),
      type: type.id,
      name: type.name,
      icon: type.icon,
      color: type.color,
      data,
      status: 'processing',
      extractedContent: null,
      isFromLibrary: false
    };
    setCampaignInputs(prev => [...prev, newInput]);
    
    // Simulate processing
    setTimeout(() => {
      setCampaignInputs(prev => prev.map(input => 
        input.id === newInput.id 
          ? { ...input, status: 'completed', extractedContent: 'Sample extracted content...' }
          : input
      ));
    }, 2000);
  };

  const addFromLibrary = (libraryItem) => {
    // Check if already added
    const alreadyAdded = selectedLibraryItems.some(item => item.id === libraryItem.id);
    if (alreadyAdded) return;

    setSelectedLibraryItems(prev => [...prev, libraryItem]);
  };

  const removeFromCampaign = (itemId, isLibraryItem = false) => {
    if (isLibraryItem) {
      setSelectedLibraryItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCampaignInputs(prev => prev.filter(input => input.id !== itemId));
    }
  };

  const handleFileUpload = (files) => {
    const documentType = inputTypes.find(t => t.id === 'document');
    Array.from(files).forEach(file => {
      addNewInput(documentType, { file: file.name, size: file.size });
    });
  };

  const generateContent = async () => {
    setIsGenerating(true);
    setCurrentStep('generation');
    
    try {
      // Create campaign with real API
      const campaignData = {
        name: campaign.name,
        category: campaign.category,
        keywords: campaign.keywords,
        description: campaign.description,
        input_sources: [
          ...campaignInputs.map(input => ({
            id: input.id,
            type: input.type,
            name: input.name,
            data: input.data,
            status: input.status,
            isFromLibrary: false
          })),
          ...selectedLibraryItems.map(item => ({
            id: item.id,
            type: item.content_type,
            name: item.title,
            data: { libraryItemId: item.id },
            status: 'completed',
            isFromLibrary: true
          }))
        ]
      };

      const result = await contentLibraryApi.createCampaign(campaignData);
      
      if (result.success) {
        console.log('✅ Campaign created successfully:', result.campaign);
        
        // Simulate content generation for now
        setTimeout(() => {
          const mockOutputs = [
            {
              id: 1,
              type: 'blog-post',
              title: `${selectedOutputs.length} Content Pieces from "${campaign.name}"`,
              content: `Generated content based on ${campaignInputs.length + selectedLibraryItems.length} input sources...`,
              status: 'completed',
              thumbnail: '/api/placeholder/300/200'
            },
            {
              id: 2,
              type: 'social-posts',
              title: `Social Media Content for ${campaign.category}`,
              content: `${selectedOutputs.length} different content types generated...`,
              status: 'completed',
              thumbnail: '/api/placeholder/300/200'
            }
          ];
          setOutputs(mockOutputs);
          setIsGenerating(false);
          setCurrentStep('outputs');
        }, 2000);
      } else {
        console.error('Failed to create campaign:', result.error);
        // Still show generated content but without saving campaign
        setTimeout(() => {
          const mockOutputs = [
            {
              id: 1,
              type: 'blog-post',
              title: '5 Key Insights from Your Campaign Content',
              content: 'Generated blog post content...',
              status: 'completed',
              thumbnail: '/api/placeholder/300/200'
            }
          ];
          setOutputs(mockOutputs);
          setIsGenerating(false);
          setCurrentStep('outputs');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setIsGenerating(false);
      setCurrentStep('inputs'); // Go back to inputs on error
    }
  };

  const InputForm = ({ type, onAdd, onCancel }) => {
    const [formData, setFormData] = useState({});

    const handleSubmit = () => {
      onAdd(type, formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center`}>
                <type.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{type.name}</h3>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {type.fields.includes('url') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                />
              </div>
            )}

            {type.fields.includes('text') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  rows={6}
                  placeholder="Paste your content here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                />
              </div>
            )}

            {type.fields.includes('file') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Files</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Drop files here or click to upload</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Choose Files
                  </button>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Add to Campaign
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Universal Creation Hub</h1>
                <p className="text-sm text-gray-500">Create campaigns with unlimited input sources</p>
              </div>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center space-x-2">
              {['setup', 'inputs', 'generation', 'outputs'].map((step, index) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep === step
                      ? 'bg-blue-500 text-white'
                      : index < ['setup', 'inputs', 'generation', 'outputs'].indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Campaign Setup Step */}
        {currentStep === 'setup' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold">Campaign Setup</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                  <input
                    type="text"
                    placeholder="Q4 Product Launch Campaign"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={campaign.name}
                    onChange={(e) => setCampaign(prev => ({...prev, name: e.target.value}))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={campaign.category}
                    onChange={(e) => setCampaign(prev => ({...prev, category: e.target.value}))}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add keywords..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <button
                      onClick={addKeyword}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {campaign.keywords.map(keyword => (
                      <span
                        key={keyword}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your campaign goals and target audience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={campaign.description}
                    onChange={(e) => setCampaign(prev => ({...prev, description: e.target.value}))}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setCurrentStep('inputs')}
                  disabled={!campaign.name || !campaign.category}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue to Input Sources
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Sources Step */}
        {currentStep === 'inputs' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Upload className="w-6 h-6 text-blue-500" />
                  <h2 className="text-xl font-semibold">Add Input Sources</h2>
                </div>
                <span className="text-sm text-gray-500">
                  {campaignInputs.length + selectedLibraryItems.length} sources added
                </span>
              </div>

              {/* Add New Content Section */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Extract New Content</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {inputTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setShowInputForm(type)}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                    >
                      <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <type.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{type.name}</h4>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Library Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Your Content Library</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={libraryView}
                      onChange={(e) => setLibraryView(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1"
                    >
                      <option value="category">Category Match</option>
                      <option value="all">All Content</option>
                      <option value="favorites">Favorites</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search your content library..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={librarySearchTerm}
                    onChange={(e) => setLibrarySearchTerm(e.target.value)}
                  />
                </div>

                {libraryLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {getFilteredLibraryItems().map(item => (
                      <div key={item.id} className="relative">
                        <ContentLibraryCard
                          item={item}
                          onToggleFavorite={toggleFavorite}
                          onUseItem={() => {}} // Disable default use
                          onDeleteItem={deleteItem}
                        />
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => addFromLibrary(item)}
                            disabled={selectedLibraryItems.some(selected => selected.id === item.id)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              selectedLibraryItems.some(selected => selected.id === item.id)
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {selectedLibraryItems.some(selected => selected.id === item.id) ? 'Added' : 'Add'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {getFilteredLibraryItems().length === 0 && !libraryLoading && (
                  <div className="text-center py-8 text-gray-500">
                    <Folder className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No content found matching your criteria</p>
                  </div>
                )}
              </div>

              {/* Selected Sources Summary */}
              {(campaignInputs.length > 0 || selectedLibraryItems.length > 0) && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Selected Campaign Sources</h3>
                  
                  {/* Library Items */}
                  {selectedLibraryItems.map(item => (
                    <div key={`lib-${item.id}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <Database className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-500">From your library • {item.content_type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCampaign(item.id, true)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* New Campaign Inputs */}
                  {campaignInputs.map(input => (
                    <div key={input.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${input.color} rounded-lg flex items-center justify-center`}>
                          <input.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{input.name}</p>
                          <p className="text-sm text-gray-500">
                            {input.data.url || input.data.file || 'New content'} • 
                            <span className={`ml-1 ${input.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                              {input.status === 'completed' ? 'Processed' : 'Processing...'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCampaign(input.id, false)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep('setup')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Back to Setup
                </button>
                <button
                  onClick={() => setCurrentStep('generation')}
                  disabled={campaignInputs.length === 0 && selectedLibraryItems.length === 0}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue to Generation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Generation Step */}
        {currentStep === 'generation' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Wand2 className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold">Select Output Content Types</h2>
              </div>

              <div className="space-y-6">
                {outputTypes.map(category => (
                  <div key={category.category}>
                    <div className="flex items-center space-x-2 mb-4">
                      <category.icon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-medium text-gray-900">{category.category}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.types.map(type => (
                        <label
                          key={type.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedOutputs.includes(type.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selectedOutputs.includes(type.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOutputs(prev => [...prev, type.id]);
                              } else {
                                setSelectedOutputs(prev => prev.filter(id => id !== type.id));
                              }
                            }}
                          />
                          <h4 className="font-medium text-gray-900 mb-1">{type.name}</h4>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep('inputs')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Back to Inputs
                </button>
                <button
                  onClick={generateContent}
                  disabled={selectedOutputs.length === 0 || isGenerating}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Content...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Content ({selectedOutputs.length} types)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generated Content Step */}
        {currentStep === 'outputs' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6 text-green-500" />
                  <h2 className="text-xl font-semibold">Generated Content</h2>
                </div>
                <span className="text-sm text-gray-500">{outputs.length} pieces created</span>
              </div>

              {/* Campaign Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Campaign: {campaign.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium">{campaign.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sources:</span>
                    <span className="ml-2 font-medium">{campaignInputs.length + selectedLibraryItems.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Output Types:</span>
                    <span className="ml-2 font-medium">{selectedOutputs.length}</span>
                  </div>
                </div>
                {campaign.keywords.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-500 text-sm">Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaign.keywords.map(keyword => (
                        <span key={keyword} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Generated Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outputs.map(output => (
                  <div key={output.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{output.title}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          ✓ Ready
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{output.content}</p>
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>Preview</span>
                        </button>
                        <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Campaign Actions */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentStep('generation')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generate More Content</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Campaign Settings</span>
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Save Campaign</span>
                  </button>
                  <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export All</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Performance Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Performance Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <div className="text-sm text-gray-600">Estimated Engagement Rate</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">2.3x</div>
                  <div className="text-sm text-gray-600">Expected Reach Multiplier</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">$1,240</div>
                  <div className="text-sm text-gray-600">Estimated Value Created</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form Modal */}
      {showInputForm && (
        <InputForm
          type={showInputForm}
          onAdd={addNewInput}
          onCancel={() => setShowInputForm(null)}
        />
      )}
    </div>
  );
};

export default UniversalCreationHub;