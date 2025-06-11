// src/components/ContentLibrary/CampaignContentModal.jsx - View Campaign Content
import React, { useState } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Modal for viewing all content within a campaign
 */
const CampaignContentModal = ({ campaign, content, loading, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'emails', label: `Email Series (${content?.emailSeries?.length || 0})`, icon: '📧' },
    { id: 'social', label: `Social Posts (${content?.socialContent?.length || 0})`, icon: '📱' },
    { id: 'blog', label: `Blog Posts (${content?.blogContent?.length || 0})`, icon: '📝' },
    { id: 'video', label: `Video Assets (${content?.videoAssets?.length || 0})`, icon: '🎥' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Campaign Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Campaign Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Industry:</span>
            <span className="ml-2 capitalize">{campaign.industry || 'General'}</span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <span className="ml-2 capitalize">{campaign.status || 'Active'}</span>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>
            <span className="ml-2">{formatDate(campaign.created_at)}</span>
          </div>
          <div>
            <span className="text-gray-500">Last Activity:</span>
            <span className="ml-2">{formatDate(campaign.last_activity_at)}</span>
          </div>
        </div>
        {campaign.description && (
          <div className="mt-3">
            <span className="text-gray-500">Description:</span>
            <p className="mt-1 text-gray-900">{campaign.description}</p>
          </div>
        )}
      </div>

      {/* Content Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-900">{content?.emailSeries?.length || 0}</div>
          <div className="text-sm text-blue-600">Email Series</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-900">{content?.socialContent?.length || 0}</div>
          <div className="text-sm text-green-600">Social Posts</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-900">{content?.blogContent?.length || 0}</div>
          <div className="text-sm text-purple-600">Blog Posts</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-900">{content?.videoAssets?.length || 0}</div>
          <div className="text-sm text-red-600">Video Assets</div>
        </div>
      </div>

      {/* Tags */}
      {campaign.tags && campaign.tags.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {campaign.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEmailSeries = () => (
    <div className="space-y-4">
      {content?.emailSeries?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No email series found in this campaign.
        </div>
      ) : (
        content?.emailSeries?.map((series) => (
          <div key={series.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{series.series_name}</h4>
                <p className="text-sm text-gray-500 mt-1">{series.series_description}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {series.total_emails} emails
              </span>
            </div>
            
            <div className="text-sm text-gray-500 mb-3">
              Created: {formatDate(series.created_at)} • 
              Tone: {series.tone} • 
              Industry: {series.industry}
            </div>

            {/* Individual Emails */}
            {series.campaign_emails && series.campaign_emails.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Individual Emails:</h5>
                {series.campaign_emails.map((email) => (
                  <div key={email.id} className="bg-gray-50 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">
                          Email #{email.email_number}: {email.subject_line}
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {email.email_body.substring(0, 150)}...
                        </div>
                        {email.focus_benefit && (
                          <div className="text-xs text-blue-600 mt-1">
                            Focus: {email.focus_benefit}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard(
                          `Subject: ${email.subject_line}\n\n${email.email_body}`,
                          'Email'
                        )}
                        className="ml-3 text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderSocialContent = () => (
    <div className="space-y-4">
      {content?.socialContent?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No social content found in this campaign.
        </div>
      ) : (
        content?.socialContent?.map((post) => (
          <div key={post.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {post.platform}
                </span>
                <span className="text-sm text-gray-500">{post.content_type}</span>
              </div>
              <button
                onClick={() => copyToClipboard(post.content_text, 'Social post')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Copy
              </button>
            </div>
            
            <div className="text-gray-900 mb-3 whitespace-pre-wrap">
              {post.content_text}
            </div>
            
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.hashtags.map((hashtag, index) => (
                  <span key={index} className="text-blue-600 text-sm">
                    #{hashtag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-2">
              Created: {formatDate(post.created_at)}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderBlogContent = () => (
    <div className="space-y-4">
      {content?.blogContent?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No blog content found in this campaign.
        </div>
      ) : (
        content?.blogContent?.map((blog) => (
          <div key={blog.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-900">{blog.title}</h4>
              <button
                onClick={() => copyToClipboard(
                  `# ${blog.title}\n\n${blog.content_body}`,
                  'Blog post'
                )}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Copy
              </button>
            </div>
            
            {blog.excerpt && (
              <p className="text-gray-600 mb-3">{blog.excerpt}</p>
            )}
            
            <div className="text-gray-900 mb-3 line-clamp-3">
              {blog.content_body}
            </div>
            
            {blog.seo_keywords && blog.seo_keywords.length > 0 && (
              <div className="mb-3">
                <span className="text-sm text-gray-500">SEO Keywords: </span>
                {blog.seo_keywords.join(', ')}
              </div>
            )}
            
            <div className="text-sm text-gray-500 flex items-center space-x-4">
              <span>Created: {formatDate(blog.created_at)}</span>
              {blog.word_count && <span>Words: {blog.word_count.toLocaleString()}</span>}
              {blog.estimated_read_time && <span>Read time: {blog.estimated_read_time} min</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderVideoAssets = () => (
    <div className="space-y-4">
      {content?.videoAssets?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No video assets found in this campaign.
        </div>
      ) : (
        content?.videoAssets?.map((video) => (
          <div key={video.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{video.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{video.description}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {video.asset_type}
              </span>
            </div>
            
            <div className="text-sm text-gray-500 flex items-center space-x-4">
              <span>Created: {formatDate(video.created_at)}</span>
              {video.duration && <span>Duration: {video.duration}s</span>}
              {video.file_size && <span>Size: {(video.file_size / 1024 / 1024).toFixed(1)}MB</span>}
              {video.format && <span>Format: {video.format}</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'emails': return renderEmailSeries();
      case 'social': return renderSocialContent();
      case 'blog': return renderBlogContent();
      case 'video': return renderVideoAssets();
      default: return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white mb-10">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: campaign.color || '#4f46e5' }}
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
              <p className="text-sm text-gray-500">{content?.totalItems || 0} content pieces</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="large" message="Loading campaign content..." />
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignContentModal;