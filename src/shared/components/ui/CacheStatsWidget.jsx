// src/components/ui/CacheStatsWidget.jsx - Cache Performance Widget
import React, { useState, useEffect } from 'react';
import { systemApi } from '../../services/api';
import { Zap, Database, DollarSign, Clock, TrendingUp, RefreshCw } from 'lucide-react';

const CacheStatsWidget = ({ variant = 'compact', className = '' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchCacheStats();
    
    // Update cache stats every 30 seconds
    const interval = setInterval(fetchCacheStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchCacheStats = async () => {
    try {
      setError(null);
      const result = await systemApi.getCacheStats();
      
      if (result.success) {
        setStats(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch cache stats');
      }
    } catch (err) {
      console.warn('⚠️ Failed to fetch cache stats:', err);
      setError(err.message);
      // Set default stats so widget still shows something useful
      setStats({
        total_cached_items: 0,
        cache_hit_rate: 0,
        total_cost_saved: 0,
        avg_response_time: 0,
        cache_enabled: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchCacheStats();
  };

  if (loading && !stats) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading cache stats...</span>
        </div>
      </div>
    );
  }

  // Compact variant for dashboard
  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Cache Performance</h3>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-white/50 rounded transition-colors"
            disabled={loading}
            title="Refresh cache stats"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-600">
              {stats?.cache_hit_rate ? `${Math.round(stats.cache_hit_rate * 100)}%` : '0%'}
            </div>
            <div className="text-xs text-gray-600">Hit Rate</div>
          </div>
          
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-600">
              ${stats?.total_cost_saved ? stats.total_cost_saved.toFixed(0) : '0'}
            </div>
            <div className="text-xs text-gray-600">Saved</div>
          </div>
        </div>

        {lastUpdated && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  }

  // Detailed variant for expanded view
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Global Cache Performance</h3>
              <p className="text-sm text-gray-600">Google STT transcript caching system</p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-sm font-medium text-yellow-800">Cache Stats Unavailable</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Cache Hit Rate */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.cache_hit_rate ? `${Math.round(stats.cache_hit_rate * 100)}%` : '0%'}
                </div>
                <div className="text-sm text-blue-700 font-medium">Hit Rate</div>
                <div className="text-xs text-blue-600">Cache efficiency</div>
              </div>
            </div>
          </div>

          {/* Total Cached Items */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.total_cached_items || 0}
                </div>
                <div className="text-sm text-green-700 font-medium">Cached Videos</div>
                <div className="text-xs text-green-600">Ready for instant access</div>
              </div>
            </div>
          </div>

          {/* Cost Savings */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  ${stats?.total_cost_saved ? stats.total_cost_saved.toFixed(0) : '0'}
                </div>
                <div className="text-sm text-purple-700 font-medium">Total Saved</div>
                <div className="text-xs text-purple-600">Processing costs avoided</div>
              </div>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.avg_response_time ? 
                    (stats.avg_response_time < 1 ? `${Math.round(stats.avg_response_time * 1000)}ms` : `${stats.avg_response_time.toFixed(1)}s`) 
                    : '0.1s'
                  }
                </div>
                <div className="text-sm text-orange-700 font-medium">Avg Response</div>
                <div className="text-xs text-orange-600">Cache hit speed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Performance Insights</h4>
          
          <div className="space-y-2">
            {stats?.cache_hit_rate >= 0.8 ? (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <span className="text-green-500">✅</span>
                <span>Excellent cache performance - 80%+ hit rate means most videos load instantly</span>
              </div>
            ) : stats?.cache_hit_rate >= 0.5 ? (
              <div className="flex items-center gap-2 text-sm text-yellow-700">
                <span className="text-yellow-500">⚠️</span>
                <span>Good cache performance - Room for improvement in hit rate</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span className="text-blue-500">ℹ️</span>
                <span>Cache is building up - Performance will improve as more videos are cached</span>
              </div>
            )}

            {stats?.total_cost_saved > 100 && (
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <span className="text-purple-500">💰</span>
                <span>Significant cost savings achieved through intelligent caching</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-blue-700">
              <span className="text-blue-500">☁️</span>
              <span>Powered by Google Speech-to-Text with global transcript sharing</span>
            </div>
          </div>
        </div>

        {lastUpdated && (
          <div className="mt-4 text-center text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CacheStatsWidget;