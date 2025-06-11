// src/pages/Subscription.jsx - UPDATED with UsageMeter integration
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import useAuth from '../shared/hooks/useAuth';
import { useToast } from '../shared/hooks/useToast';
import { useUsageTracking } from '../shared/hooks/useUsageTracking';
import { useContentLibrary } from '../shared/hooks/useContentLibrary';
import { subscriptions } from '../core/services/subscriptions';
import { Card, Button, Badge, Loader, Toast, UsageMeter, SystemStatus } from '../shared/components/ui';

const Subscription = () => {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const { 
    limits, 
    getUsagePercentages, 
    getRemainingLimits,
    isNearLimit,
    isAtLimit,
    wsConnected,
    loading: usageLoading 
  } = useUsageTracking();
  const { totalItems, videoTranscriptCount, generatedAssetCount } = useContentLibrary();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availableTiers, setAvailableTiers] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch data once on mount
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subscription and tiers (required)
        const [subscription, tiers] = await Promise.all([
          subscriptions.getCurrentSubscription(),
          subscriptions.getTiers()
        ]);
        
        setCurrentSubscription(subscription);
        setAvailableTiers(tiers);
        
        // Try to fetch subscription history
        try {
          const history = await subscriptions.getSubscriptionHistory();
          setSubscriptionHistory(history || []);
        } catch (error) {
          console.warn('Subscription history not available:', error);
          setSubscriptionHistory([]);
        }
        
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        showToast('Error loading subscription information', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, showToast]);

  // Filter tiers for display
  const currentTier = currentSubscription?.subscription_tier || limits.tier || 'free';
  const filteredTiers = availableTiers.filter(tier => {
    // Hide Free and superAdmin tiers
    if (tier.name === 'free' || tier.name === 'superAdmin') {
      return false;
    }
    
    // Show upgrade options based on current tier
    if (currentTier === 'free') {
      return tier.name === 'pro' || tier.name === 'gold';
    } else if (currentTier === 'pro') {
      return tier.name === 'gold';
    }
    
    return false; // Gold and superAdmin users see no upgrades
  });

  // Utility functions
  const getTierBadgeColor = (tierName) => {
    switch (tierName) {
      case 'free': return 'gray';
      case 'pro': return 'blue';
      case 'gold': return 'purple';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getUsageBarColor = (percentage) => {
    if (percentage >= 90) return '#EF4444'; // Red
    if (percentage >= 75) return '#F59E0B'; // Orange  
    return '#10B981'; // Green
  };

  // Loading state
  if (loading || usageLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader size="lg" text="Loading subscription information..." />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const usagePercentages = getUsagePercentages();
  const remainingLimits = getRemainingLimits();

  return (
    <div className="container mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Usage & Billing</h1>
            <p className="text-gray-600">Manage your plan and track your real-time usage</p>
          </div>
          
          {/* Real-time connection indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-500">
              {wsConnected ? 'Live updates' : 'Offline mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Usage Alert Banner */}
      {(isNearLimit || isAtLimit) && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isAtLimit ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${isAtLimit ? 'text-red-400' : 'text-yellow-400'}`}>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${isAtLimit ? 'text-red-800' : 'text-yellow-800'}`}>
                {isAtLimit ? 'Usage Limit Reached' : 'Approaching Usage Limit'}
              </h3>
              <div className={`mt-2 text-sm ${isAtLimit ? 'text-red-700' : 'text-yellow-700'}`}>
                <p>
                  {isAtLimit 
                    ? 'You\'ve reached your daily limits. Upgrade to continue using AI features.'
                    : `You've used a significant portion of your daily allowance. Consider upgrading for unlimited access.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan Section */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Current Plan</h2>
                <Badge colorScheme={getTierBadgeColor(currentTier)}>
                  {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Plan Status</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {currentSubscription?.subscription_status || 'Active'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Started</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDate(currentSubscription?.subscription_started_at)}
                  </p>
                </div>
              </div>

              {/* Real-time Usage Meter */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Real-time Usage Overview</h3>
                <UsageMeter variant="expanded" showLabels={true} className="mb-4" />
              </div>

              {/* Detailed Usage Statistics */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Usage Details</h3>
                
                <div className="space-y-6">
                  {/* Daily AI Tokens */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Daily AI Tokens</span>
                      <span className="text-sm text-gray-500">
                        {limits.daily_tokens_used.toLocaleString()} / {limits.daily_token_limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${usagePercentages.daily_tokens}%`,
                          backgroundColor: getUsageBarColor(usagePercentages.daily_tokens)
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-400">
                        {remainingLimits.daily_tokens.toLocaleString()} remaining today
                      </span>
                      <span className="text-xs text-gray-400">
                        {usagePercentages.daily_tokens.toFixed(1)}% used
                      </span>
                    </div>
                  </div>

                  {/* Monthly AI Tokens */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Monthly AI Tokens</span>
                      <span className="text-sm text-gray-500">
                        {limits.monthly_tokens_used.toLocaleString()} / {limits.monthly_token_limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${usagePercentages.monthly_tokens}%`,
                          backgroundColor: getUsageBarColor(usagePercentages.monthly_tokens)
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-400">
                        {remainingLimits.monthly_tokens.toLocaleString()} remaining this month
                      </span>
                      <span className="text-xs text-gray-400">
                        {usagePercentages.monthly_tokens.toFixed(1)}% used
                      </span>
                    </div>
                  </div>

                  {/* Video Processing */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Daily Video Processing</span>
                      <span className="text-sm text-gray-500">
                        {limits.daily_videos_processed} / {limits.daily_video_limit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${usagePercentages.daily_videos}%`,
                          backgroundColor: getUsageBarColor(usagePercentages.daily_videos)
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-400">
                        {remainingLimits.daily_videos} videos remaining today
                      </span>
                      <span className="text-xs text-gray-400">
                        {usagePercentages.daily_videos.toFixed(1)}% used
                      </span>
                    </div>
                  </div>

                  {/* Content Library Stats */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Content Library</span>
                      <span className="text-sm text-gray-500">
                        {totalItems} items stored
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{videoTranscriptCount}</div>
                        <div className="text-xs text-gray-500">Video Transcripts</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{generatedAssetCount}</div>
                        <div className="text-xs text-gray-500">Generated Assets</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Available Plans */}
          <Card className="mt-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Available Plans</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTiers.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">You're on the highest plan!</h3>
                      <p className="text-gray-600">You have access to all premium features.</p>
                    </div>
                  </div>
                ) : (
                  filteredTiers.map((tier) => (
                    <div 
                      key={tier.name}
                      className="border rounded-lg p-4 border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{tier.display_name}</h3>
                          <p className="text-xl font-bold text-gray-900">
                            ${tier.price_monthly}
                            <span className="text-sm font-normal text-gray-500">/month</span>
                          </p>
                        </div>
                        <Badge colorScheme="green" variant="subtle">
                          Upgrade
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Daily tokens:</span>
                          <span className="font-medium">
                            {tier.daily_tokens === -1 ? 'Unlimited' : tier.daily_tokens?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Monthly tokens:</span>
                          <span className="font-medium">
                            {tier.monthly_tokens === -1 ? 'Unlimited' : tier.monthly_tokens?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Daily videos:</span>
                          <span className="font-medium">
                            {tier.daily_videos === -1 ? 'Unlimited' : tier.daily_videos}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => showToast(`Upgrade to ${tier.display_name} selected! Contact support to complete the upgrade.`, 'info')}
                      >
                        Upgrade to {tier.display_name}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* System Status */}
          <SystemStatus className="mb-6" />

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link to="/dashboard" className="block w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Button>
                </Link>
              
                <Link to="/tools/video2promo" className="block w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Process Videos
                  </Button>
                </Link>

                <Link to="/tools/email-generator" className="block w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Generate Emails
                  </Button>
                </Link>

                <Link to="/tools/content-library" className="block w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2h10a2 2 0 012 2v2M7 19h10a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
                    </svg>
                    Content Library
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {showHistory ? 'Hide History' : 'View History'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Subscription History */}
          {showHistory && (
            <Card className="mt-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Subscription History</h3>
                
                {subscriptionHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No subscription history available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptionHistory.slice(0, 10).map((history, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            history.action === 'upgrade' ? 'bg-green-100 text-green-600' :
                            history.action === 'downgrade' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {history.action === 'upgrade' ? '↑' : 
                             history.action === 'downgrade' ? '↓' : '→'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {history.action === 'upgrade' && `Upgraded to ${history.to_tier}`}
                              {history.action === 'downgrade' && `Downgraded to ${history.to_tier}`}
                              {history.action === 'change' && `Changed from ${history.from_tier} to ${history.to_tier}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(history.created_at)}
                            </p>
                            {history.reason && (
                              <p className="text-xs text-gray-400 mt-1">
                                Reason: {history.reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge 
                          colorScheme={
                            history.action === 'upgrade' ? 'green' :
                            history.action === 'downgrade' ? 'red' : 'blue'
                          } 
                          variant="subtle"
                        >
                          {history.to_tier}
                        </Badge>
                      </div>
                    ))}
                    
                    {subscriptionHistory.length > 10 && (
                      <div className="text-center pt-4">
                        <p className="text-sm text-gray-500">
                          Showing latest 10 entries. {subscriptionHistory.length - 10} more in history.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Need Help?</h3>
              
              <p className="text-gray-600 text-sm mb-4">
                Have questions about your subscription or need to make changes? Our support team is here to help.
              </p>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => showToast('Contact support at support@example.com', 'info')}
              >
                Contact Support
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Subscription;