import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  Zap,
  Database,
  Leaf,
  Target,
  Award,
  RefreshCw,
  Globe
} from 'lucide-react';
import { useGlobalCache } from '../shared/hooks/useGlobalCache';

export const GlobalCacheStats = ({ 
  showRealTime = true,
  showEnvironmentalImpact = true,
  showUserContribution = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const { globalStats, fetchGlobalStats, getUserContribution } = useGlobalCache();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [userContribution, setUserContribution] = useState(null);

  useEffect(() => {
    // Load user contribution data
    setUserContribution(getUserContribution());
  }, [getUserContribution]);

  useEffect(() => {
    if (!showRealTime) return;

    const interval = setInterval(async () => {
      setIsRefreshing(true);
      await fetchGlobalStats();
      setLastRefresh(Date.now());
      setIsRefreshing(false);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [showRealTime, refreshInterval, fetchGlobalStats]);

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Calculate environmental impact
  const environmentalImpact = {
    co2Saved: (globalStats.totalSavings || 0) * 0.1, // Rough estimate: $1 saved ≈ 0.1kg CO2
    serverHoursSaved: (globalStats.totalRequests || 0) * (globalStats.cacheHitRate || 0) * 0.5,
    energySaved: (globalStats.totalSavings || 0) * 2.3 // kWh saved
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Global Cache Performance</h2>
          <p className="text-gray-600 mt-1">
            Real-time community cache statistics and impact metrics
          </p>
        </div>
        
        {showRealTime && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span>Updated {formatTimeAgo(lastRefresh)}</span>
            </div>
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await fetchGlobalStats();
                setLastRefresh(Date.now());
                setIsRefreshing(false);
              }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cache Hit Rate */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Cache Hit Rate</h3>
              <p className="text-sm text-green-700">Community efficiency</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-900 mb-2">
            {Math.round((globalStats.cacheHitRate || 0) * 100)}%
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(globalStats.cacheHitRate || 0) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-green-700 mt-2">
            {formatNumber((globalStats.totalRequests || 0) * (globalStats.cacheHitRate || 0))} cache hits
          </p>
        </div>

        {/* Total Savings */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Total Savings</h3>
              <p className="text-sm text-blue-700">Community impact</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-900 mb-2">
            {formatCurrency(globalStats.totalSavings || 0)}
          </div>
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <TrendingUp className="h-4 w-4" />
            <span>+{formatCurrency((globalStats.totalSavings || 0) * 0.1)} this week</span>
          </div>
        </div>

        {/* Processing Time Saved */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">Time Saved</h3>
              <p className="text-sm text-purple-700">Processing hours</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-900 mb-2">
            {formatNumber(Math.round((globalStats.totalRequests || 0) * (globalStats.cacheHitRate || 0) * 1.5))}h
          </div>
          <div className="flex items-center space-x-2 text-sm text-purple-700">
            <Zap className="h-4 w-4" />
            <span>Avg {globalStats.avgProcessingTime || 45}s per video</span>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">Videos Processed</h3>
              <p className="text-sm text-orange-700">Community total</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-900 mb-2">
            {formatNumber(globalStats.totalRequests || 0)}
          </div>
          <div className="flex items-center space-x-2 text-sm text-orange-700">
            <Database className="h-4 w-4" />
            <span>{formatNumber(globalStats.uniqueVideos || 0)} unique videos</span>
          </div>
        </div>
      </div>

      {/* Environmental Impact Section */}
      {showEnvironmentalImpact && (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <Leaf className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Environmental Impact</h3>
              <p className="text-sm text-green-700">Cache efficiency reduces server load and energy consumption</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-70 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-900 mb-1">
                {environmentalImpact.co2Saved.toFixed(1)}kg
              </div>
              <div className="text-sm text-green-700">CO₂ Emissions Saved</div>
              <div className="text-xs text-green-600 mt-1">
                Equivalent to planting {Math.round(environmentalImpact.co2Saved / 22)} trees
              </div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-900 mb-1">
                {formatNumber(environmentalImpact.serverHoursSaved)}h
              </div>
              <div className="text-sm text-green-700">Server Hours Saved</div>
              <div className="text-xs text-green-600 mt-1">
                Reduced computational overhead
              </div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-900 mb-1">
                {environmentalImpact.energySaved.toFixed(1)}kWh
              </div>
              <div className="text-sm text-green-700">Energy Saved</div>
              <div className="text-xs text-green-600 mt-1">
                Clean energy equivalent
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Contribution Section */}
      {showUserContribution && userContribution && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <Award className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Your Contribution</h3>
              <p className="text-sm text-purple-700">Your impact on the community cache</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-70 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-purple-900 mb-1">
                {userContribution.videosContributed || 0}
              </div>
              <div className="text-sm text-purple-700">Videos Contributed</div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-purple-900 mb-1">
                {formatCurrency(userContribution.savingsProvided || 0)}
              </div>
              <div className="text-sm text-purple-700">Savings Provided</div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-purple-900 mb-1">
                {userContribution.cacheHitsHelped || 0}
              </div>
              <div className="text-sm text-purple-700">Cache Hits Helped</div>
            </div>
          </div>
        </div>
      )}

      {/* Cache Performance Trends */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
            <p className="text-sm text-gray-600">Cache efficiency over time</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3">
            <div className="text-lg font-bold text-gray-900 mb-1">73%</div>
            <div className="text-xs text-gray-600">This Week</div>
            <div className="text-xs text-green-600">+5%</div>
          </div>
          <div className="p-3">
            <div className="text-lg font-bold text-gray-900 mb-1">68%</div>
            <div className="text-xs text-gray-600">This Month</div>
            <div className="text-xs text-green-600">+12%</div>
          </div>
          <div className="p-3">
            <div className="text-lg font-bold text-gray-900 mb-1">61%</div>
            <div className="text-xs text-gray-600">Last Month</div>
            <div className="text-xs text-blue-600">Baseline</div>
          </div>
          <div className="p-3">
            <div className="text-lg font-bold text-gray-900 mb-1">85%</div>
            <div className="text-xs text-gray-600">Target</div>
            <div className="text-xs text-purple-600">Goal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalCacheStats;