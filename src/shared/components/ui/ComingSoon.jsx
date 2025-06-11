// src/components/ui/ComingSoon.jsx - Universal Coming Soon Placeholder
import React from 'react';
import { Link } from 'react-router-dom';
import  Button from './Button';
import  Card from './Card';

const FEATURE_CONFIG = {
  // Admin Pages
  'admin-analytics': {
    icon: '📊',
    title: 'System Analytics',
    subtitle: 'Advanced admin dashboard',
    description: 'Comprehensive system analytics, user activity monitoring, revenue tracking, and performance insights for administrators.',
    features: [
      'Real-time user activity tracking',
      'Revenue and subscription analytics',
      'System performance monitoring',
      'Usage pattern analysis',
      'Cost optimization insights',
      'User tier distribution'
    ],
    category: 'admin',
    estimatedLaunch: 'Q3 2025'
  },
  'admin-dashboard': {
    icon: '🛠️',
    title: 'Admin Dashboard',
    subtitle: 'Central admin control panel',
    description: 'Main administrative dashboard with system overview, quick actions, and key metrics for platform management.',
    features: [
      'System health monitoring',
      'Quick user management actions',
      'Revenue overview widgets',
      'Recent activity feeds',
      'Alert notifications',
      'Configuration shortcuts'
    ],
    category: 'admin',
    estimatedLaunch: 'Q2 2025'
  },
  'admin-settings': {
    icon: '⚙️',
    title: 'System Settings',
    subtitle: 'Platform configuration',
    description: 'Advanced system configuration, feature flags, and platform settings management.',
    features: [
      'Feature flag management',
      'System configuration',
      'Email template settings',
      'API rate limiting',
      'Security settings',
      'Backup management'
    ],
    category: 'admin',
    estimatedLaunch: 'Q3 2025'
  },
  
  // AI Tools
  'ai-writer': {
    icon: '✍️',
    title: 'AI Writing Assistant',
    subtitle: 'Advanced content creation',
    description: 'Generate high-quality blog posts, articles, social media content, and marketing copy with advanced AI assistance.',
    features: [
      'Blog post generation',
      'Social media content',
      'Marketing copy creation',
      'Content optimization',
      'Multiple writing styles',
      'SEO-optimized output'
    ],
    category: 'tools',
    estimatedLaunch: 'Q3 2025'
  },
  'competitor-analysis': {
    icon: '🔍',
    title: 'Competitor Analysis',
    subtitle: 'Market intelligence',
    description: 'Analyze competitor websites, SEO strategies, pricing, and market positioning to gain competitive insights.',
    features: [
      'Website content analysis',
      'SEO strategy insights',
      'Pricing intelligence',
      'Market positioning analysis',
      'Content gap identification',
      'Competitive benchmarking'
    ],
    category: 'tools',
    estimatedLaunch: 'Q4 2025'
  },
  'seo-generator': {
    icon: '📈',
    title: 'SEO Content Generator',
    subtitle: 'Search optimization',
    description: 'Keyword research, content optimization, and SEO-focused content generation to improve search rankings.',
    features: [
      'Keyword research tools',
      'Content optimization',
      'Meta tag generation',
      'SEO scoring',
      'Competitor keyword analysis',
      'Search trend insights'
    ],
    category: 'tools',
    estimatedLaunch: 'Q4 2025'
  },
  'social-scheduler': {
    icon: '📱',
    title: 'Social Media Scheduler',
    subtitle: 'Multi-platform posting',
    description: 'Schedule and manage social media posts across multiple platforms with analytics and automation.',
    features: [
      'Multi-platform scheduling',
      'Content calendar',
      'Post analytics',
      'Automated posting',
      'Content templates',
      'Engagement tracking'
    ],
    category: 'tools',
    estimatedLaunch: 'Q4 2025'
  },
  'page-builder': {
    icon: '🎨',
    title: 'Landing Page Builder',
    subtitle: 'Conversion-focused pages',
    description: 'Drag-and-drop landing page builder with conversion optimization and A/B testing capabilities.',
    features: [
      'Drag-and-drop editor',
      'Conversion templates',
      'A/B testing',
      'Analytics integration',
      'Mobile optimization',
      'Custom domains'
    ],
    category: 'tools',
    estimatedLaunch: 'Q1 2026'
  },
  'email-campaigns': {
    icon: '📧',
    title: 'Email Campaign Manager',
    subtitle: 'Advanced email automation',
    description: 'Comprehensive email campaign management with automation, segmentation, and advanced analytics.',
    features: [
      'Campaign automation',
      'Audience segmentation',
      'Advanced analytics',
      'A/B testing',
      'Deliverability tools',
      'Template library'
    ],
    category: 'tools',
    estimatedLaunch: 'Q1 2026'
  },
  'blog-post-creator': {
    icon: '📧',
    title: 'Blog Post Creator',
    subtitle: 'Advanced Blog Posts Creataor',
    description: 'Comprehensive blog post management with automation and advanced analytics.',
    features: [
      'Campaign automation',
      'Audience segmentation',
      'Advanced analytics',
      'A/B testing',
      'Deliverability tools',
      'Template library'
    ],
    category: 'tools',
    estimatedLaunch: 'Q1 2026'
  },
  'news-letter-creator': {
    icon: '📧',
    title: 'News Letter Creator',
    subtitle: 'Advanced News Letters',
    description: 'Comprehensive news letter management with automation and advanced analytics.',
    features: [
      'Campaign automation',
      'Audience segmentation',
      'Advanced analytics',
      'A/B testing',
      'Deliverability tools',
      'Template library'
    ],
    category: 'tools',
    estimatedLaunch: 'Q1 2026'
  }
};

export const ComingSoon = ({ 
  featureKey, 
  title, 
  subtitle, 
  description, 
  icon,
  customFeatures = [],
  estimatedLaunch,
  showNotifyButton = true,
  showBackButton = true,
  className = ''
}) => {
  // Get feature config or use provided props
  const config = featureKey ? FEATURE_CONFIG[featureKey] : {
    title: title || 'New Feature',
    subtitle: subtitle || 'Coming soon',
    description: description || 'This feature is currently in development.',
    icon: icon || '🚀',
    features: customFeatures,
    estimatedLaunch: estimatedLaunch || 'Coming soon'
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'admin':
        return 'from-red-500 to-pink-600';
      case 'core':
        return 'from-blue-500 to-indigo-600';
      case 'tools':
        return 'from-purple-500 to-indigo-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'admin':
        return { text: 'Admin Feature', bg: 'bg-red-100', textColor: 'text-red-800' };
      case 'core':
        return { text: 'Core Feature', bg: 'bg-blue-100', textColor: 'text-blue-800' };
      case 'tools':
        return { text: 'Marketing Tool', bg: 'bg-purple-100', textColor: 'text-purple-800' };
      default:
        return { text: 'New Feature', bg: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  const badge = getCategoryBadge(config.category);
  const gradientColor = getCategoryColor(config.category);

  return (
    <div className={`min-h-screen bg-gray-50 py-8 px-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-6">{config.icon}</div>
          
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.textColor}`}>
              {badge.text}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {config.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            {config.subtitle}
          </p>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${gradientColor}`}>
            🚧 In Development • Launch: {config.estimatedLaunch}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Description */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                What to Expect
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {config.description}
              </p>
              
              {config.features && config.features.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {config.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${gradientColor} flex items-center justify-center`}>
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Development Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Research & Planning</span>
                  <span className="text-xs text-green-600 font-medium">Complete</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 bg-gradient-to-r ${gradientColor} rounded-full animate-pulse`}></div>
                  <span className="text-sm text-gray-600">Development</span>
                  <span className="text-xs text-blue-600 font-medium">In Progress</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-600">Testing & Launch</span>
                  <span className="text-xs text-gray-500 font-medium">Upcoming</span>
                </div>
              </div>
            </Card>

            {/* Notify Button */}
            {showNotifyButton && (
              <Card className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Get Notified
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Be the first to know when this feature launches
                </p>
                <Button 
                  className={`w-full bg-gradient-to-r ${gradientColor} text-white hover:opacity-90`}
                  onClick={() => {
                    // You can implement notification signup here
                    alert('Notification signup coming soon!');
                  }}
                >
                  Notify Me
                </Button>
              </Card>
            )}

            {/* Alternative Features */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available Now
              </h3>
              <div className="space-y-3">
                <Link 
                  to="/tools/video2promo" 
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg">🎥</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Video2Promo</div>
                    <div className="text-xs text-gray-500">YouTube to campaigns</div>
                  </div>
                </Link>
                <Link 
                  to="/tools/email-generator" 
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg">📧</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Email Generator</div>
                    <div className="text-xs text-gray-500">AI sales emails</div>
                  </div>
                </Link>
                <Link 
                  to="/tools/content-library" 
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg">📧</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Content Library</div>
                    <div className="text-xs text-gray-500">Content Library</div>
                  </div>
                </Link>
                <Link 
                  to="/analytics" 
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg">📊</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Analytics</div>
                    <div className="text-xs text-gray-500">Usage insights</div>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {showBackButton && (
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="px-6 py-3"
              >
                ← Go Back
              </Button>
            )}
            
            <Button
              as={Link}
              to="/dashboard"
              className="px-6 py-3"
            >
              Return to Dashboard
            </Button>
            
            <Button
              as={Link}
              to="/tools/video2promo"
              className={`px-6 py-3 bg-gradient-to-r ${gradientColor} text-white`}
            >
              Try Available Tools
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            Questions about this feature? <a href="mailto:support@example.com" className="text-indigo-600 hover:text-indigo-700">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Preset components for specific features
export const AdminAnalyticsComingSoon = () => (
  <ComingSoon featureKey="admin-analytics" />
);

export const AdminDashboardComingSoon = () => (
  <ComingSoon featureKey="admin-dashboard" />
);

export const AIWritingAssistantComingSoon = () => (
  <ComingSoon featureKey="ai-writer" />
);

export const CompetitorAnalysisComingSoon = () => (
  <ComingSoon featureKey="competitor-analysis" />
);

export const SEOGeneratorComingSoon = () => (
  <ComingSoon featureKey="seo-generator" />
);

export const SocialSchedulerComingSoon = () => (
  <ComingSoon featureKey="social-scheduler" />
);

export const BlogPostCreatorComingSoon = () => (
  <ComingSoon featureKey="blog-post-creator" />
);

export const NewsLetterCreatorComingSoon = () => (
  <ComingSoon featureKey="news-letter-creator" />
);

export default ComingSoon;
