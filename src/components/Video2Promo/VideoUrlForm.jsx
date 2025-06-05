import React, { useState } from 'react';
import { Play, Target, Link, Settings, Zap, CheckCircle, Sparkles, X } from 'lucide-react';

const VideoUrlForm = ({ onSubmit, loading, disabled }) => {
  const [formData, setFormData] = useState({
    youtube_url: 'https://youtube.com/watch?v=example',
    keywords: ['marketing', 'sales', 'conversion', 'leads'],
    affiliate_link: 'https://example.com/product',
    utm_params: {
      source: 'email, social, newsletter',
      medium: 'drip, campaign, promoter',
      campaign: 'video_promo_jan2025',
      content: 'email1, blog_post, newsletter'
    },
    tone: 'friendly'
  });

  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData.youtube_url, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Video URL Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4">
          <div className="flex items-center space-x-3 text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">YouTube Video URL</h3>
              <p className="text-sm text-purple-100">Enter the video you want to transform</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="relative">
            <input
              type="url"
              value={formData.youtube_url}
              onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
              className="w-full px-4 py-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg"
              placeholder="https://youtube.com/watch?v=..."
              disabled={loading || disabled}
            />
            <Play className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
            <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Video Requirements</p>
              <ul className="space-y-1 text-blue-600">
                <li>• Must have captions/subtitles enabled</li>
                <li>• English captions work best</li>
                <li>• Longer videos (5+ minutes) provide better results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Marketing Keywords</h3>
                <p className="text-sm text-blue-100">Focus the AI on your target market</p>
              </div>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Optional</span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add keyword..."
              disabled={loading || disabled}
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              Add
            </button>
          </div>
          
          {formData.keywords.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Current Keywords ({formData.keywords.length})</p>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-2 rounded-xl text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Keywords help the AI focus on your target market and improve content relevance. 
              You can paste multiple keywords separated by commas.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Settings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Affiliate Link */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3">
            <div className="flex items-center space-x-3 text-white">
              <Link className="h-4 w-4" />
              <h3 className="font-medium">Affiliate Link</h3>
            </div>
          </div>
          <div className="p-6">
            <input
              type="url"
              value={formData.affiliate_link}
              onChange={(e) => setFormData(prev => ({ ...prev, affiliate_link: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="https://example.com/product"
              disabled={loading || disabled}
            />
            <p className="text-sm text-gray-500 mt-2">Optional - Link to include in generated content</p>
          </div>
        </div>

        {/* Content Tone */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3">
            <div className="flex items-center space-x-3 text-white">
              <Zap className="h-4 w-4" />
              <h3 className="font-medium">Content Tone</h3>
            </div>
          </div>
          <div className="p-6">
            <select
              value={formData.tone}
              onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
              disabled={loading || disabled}
            >
              <option value="friendly">Friendly & Conversational</option>
              <option value="professional">Professional & Authoritative</option>
              <option value="casual">Casual & Approachable</option>
              <option value="formal">Formal & Corporate</option>
              <option value="enthusiastic">Enthusiastic & Energetic</option>
            </select>
          </div>
        </div>
      </div>

      {/* UTM Parameters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">UTM Parameters</h3>
                <p className="text-sm text-orange-100">Advanced tracking options</p>
              </div>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Optional</span>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <input
                type="text"
                value={formData.utm_params.source}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  utm_params: { ...prev.utm_params, source: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="email, social, newsletter"
                disabled={loading || disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medium</label>
              <input
                type="text"
                value={formData.utm_params.medium}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  utm_params: { ...prev.utm_params, medium: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="drip, campaign, promoter"
                disabled={loading || disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign</label>
              <input
                type="text"
                value={formData.utm_params.campaign}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  utm_params: { ...prev.utm_params, campaign: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="video_promo_jan2025"
                disabled={loading || disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <input
                type="text"
                value={formData.utm_params.content}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  utm_params: { ...prev.utm_params, content: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="email1, blog_post, newsletter"
                disabled={loading || disabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-1 shadow-lg">
        <button
          type="submit"
          disabled={loading || disabled || !formData.youtube_url}
          className="w-full bg-white text-gray-800 font-semibold py-4 px-6 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span>Analyzing Video...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span>Analyze Video & Extract Benefits</span>
              <Play className="h-5 w-5 text-blue-600" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default VideoUrlForm;