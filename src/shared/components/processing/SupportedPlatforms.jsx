import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Zap, 
  Monitor, 
  AlertCircle, 
  TrendingUp,
  Star,
  Globe,
  Play,
  Download,
  Volume2
} from 'lucide-react';
import { SUPPORTED_PLATFORMS } from '../../utils/videoUrlValidation';

export const SupportedPlatforms = ({ 
  selectedPlatform = null,
  onPlatformSelect = null,
  showHealthStatus = true,
  showCapabilities = true,
  layout = 'grid' // grid, list, compact
}) => {
  const [platformHealth, setPlatformHealth] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Mock platform health data (in real implementation, this would come from your backend)
  useEffect(() => {
    const fetchPlatformHealth = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setPlatformHealth({
          youtube: { status: 'excellent', responseTime: 850, reliability: 99.2, lastChecked: Date.now() },
          vimeo: { status: 'good', responseTime: 1200, reliability: 97.8, lastChecked: Date.now() },
          tiktok: { status: 'good', responseTime: 1100, reliability: 96.5, lastChecked: Date.now() },
          twitch: { status: 'fair', responseTime: 1800, reliability: 94.1, lastChecked: Date.now() },
          dailymotion: { status: 'good', responseTime: 1300, reliability: 95.7, lastChecked: Date.now() }
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchPlatformHealth();
    
    // Refresh health status every 5 minutes
    const interval = setInterval(fetchPlatformHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getServiceInfo = (platformKey) => {
    const isYoutube = platformKey === 'youtube';
    return {
      service: isYoutube ? 'Railway' : 'Render',
      speed: isYoutube ? 'Optimized' : 'Standard',
      description: isYoutube ? 'Direct API access with enhanced processing' : 'Reliable universal processing',
      estimatedTime: isYoutube ? '30-90 seconds' : '60-180 seconds'
    };
  };

  const PlatformCard = ({ platformKey, platform }) => {
    const health = platformHealth[platformKey] || {};
    const serviceInfo = getServiceInfo(platformKey);
    const isSelected = selectedPlatform === platformKey;

    return (
      <div 
        className={`bg-white rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg cursor-pointer ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onPlatformSelect?.(platformKey)}
      >
        {/* Platform Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
              platformKey === 'youtube' ? 'from-red-500 to-red-600' :
              platformKey === 'vimeo' ? 'from-blue-500 to-blue-600' :
              platformKey === 'tiktok' ? 'from-pink-500 to-purple-600' :
              platformKey === 'twitch' ? 'from-purple-500 to-purple-600' :
              'from-orange-500 to-orange-600'
            } flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold text-lg">
                {platform.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{platform.name}</h3>
              <p className="text-sm text-gray-600">{platform.description}</p>
            </div>
          </div>
          
          {/* Health Status */}
          {showHealthStatus && health.status && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(health.status)}`}>
              {health.status}
            </div>
          )}
        </div>

        {/* Service Information */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className={`h-4 w-4 ${platformKey === 'youtube' ? 'text-green-600' : 'text-blue-600'}`} />
              <span className="text-sm font-medium text-gray-900">
                {serviceInfo.service} Service
              </span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              platformKey === 'youtube' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {serviceInfo.speed}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-2">{serviceInfo.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{serviceInfo.estimatedTime}</span>
            </div>
            {health.responseTime && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>{health.responseTime}ms</span>
              </div>
            )}
          </div>
        </div>

        {/* Platform Capabilities */}
        {showCapabilities && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Capabilities</h4>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-2">
              {platform.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span className="text-xs text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Quality Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
              <div className="text-center">
                <div className="text-xs font-medium text-gray-900">
                  {platform.qualityScore || 85}%
                </div>
                <div className="text-xs text-gray-600">Quality</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-900">
                  {health.reliability || 95}%
                </div>
                <div className="text-xs text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-900">
                  {platform.supportLevel || 'Full'}
                </div>
                <div className="text-xs text-gray-600">Support</div>
              </div>
            </div>

            {/* Limitations (if any) */}
            {platform.limitations && platform.limitations.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center space-x-1 mb-1">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <span className="text-xs font-medium text-amber-700">Limitations</span>
                </div>
                {platform.limitations.slice(0, 2).map((limitation, index) => (
                  <div key={index} className="text-xs text-amber-600 ml-4">
                    • {limitation}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-gray-300 rounded"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Supported Platforms
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our universal transcription system supports major video platforms with optimized processing 
          for each platform's unique characteristics and requirements.
        </p>
      </div>

      {/* Platform Grid */}
      <div className={`grid gap-6 ${
        layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        layout === 'list' ? 'grid-cols-1' :
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
      }`}>
        {Object.entries(PLATFORM_REGISTRY).map(([platformKey, platform]) => (
          <PlatformCard 
            key={platformKey} 
            platformKey={platformKey} 
            platform={platform} 
          />
        ))}
      </div>

      {/* Global Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Platform Performance Overview
          </h3>
          <p className="text-sm text-gray-600">
            Real-time performance metrics across all supported platforms
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600 mb-1">99.1%</div>
            <div className="text-xs text-gray-600">Overall Uptime</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600 mb-1">1.2s</div>
            <div className="text-xs text-gray-600">Avg Response</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600 mb-1">87%</div>
            <div className="text-xs text-gray-600">Avg Quality</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600 mb-1">5</div>
            <div className="text-xs text-gray-600">Platforms</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportedPlatforms;