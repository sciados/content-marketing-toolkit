// src/pages/Subscription.jsx
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import useSupabase from '../hooks/useSupabase';
import { useToast } from '../hooks/useToast';
import { subscriptions } from '../services/supabase/subscriptions';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Badge from '../components/Common/Badge';
import Loader from '../components/Common/Loader';
import Toast from '../components/Common/Toast';

const Subscription = () => {
  const { user } = useSupabase();
  const { toast, showToast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availableTiers, setAvailableTiers] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
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
        
        // Try to fetch optional data (don't fail if these error)
        try {
          const usage = await subscriptions.getUsageStats();
          setUsageStats(usage);
        } catch (error) {
          console.warn('Usage stats not available:', error);
          // Set default usage stats if API fails
          setUsageStats({
            emails_generated: 0,
            emails_saved: 0,
            ai_tokens_used: 0,
            series_created: 0
          });
        }
        
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
  const currentTier = currentSubscription?.subscription_tier || 'free';
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

  const getUsagePercentage = (current, limit) => {
    if (!limit || limit === -1) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageBarColor = (percentage) => {
    if (percentage >= 90) return '#EF4444'; // Red
    if (percentage >= 75) return '#F59E0B'; // Orange  
    return '#10B981'; // Green
  };

  // Loading state
  if (loading) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Subscription Management</h1>
        <p className="text-gray-600">Manage your plan and track your usage</p>
      </div>

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

              {/* Usage Statistics */}
              {usageStats && currentSubscription?.tier && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage This Month</h3>
                  
                  <div className="space-y-6">
                    {/* Emails Generated */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Emails Generated</span>
                        <span className="text-sm text-gray-500">
                          {usageStats.emails_generated || 0}
                          {currentSubscription.tier.email_quota && currentSubscription.tier.email_quota !== -1 && 
                            ` / ${currentSubscription.tier.email_quota}`
                          }
                          {currentSubscription.tier.email_quota === -1 && ' / Unlimited'}
                        </span>
                      </div>
                      {currentSubscription.tier.email_quota && currentSubscription.tier.email_quota !== -1 && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${getUsagePercentage(usageStats.emails_generated || 0, currentSubscription.tier.email_quota)}%`,
                                backgroundColor: getUsageBarColor(getUsagePercentage(usageStats.emails_generated || 0, currentSubscription.tier.email_quota))
                              }}
                            />
                          </div>
                          {getUsagePercentage(usageStats.emails_generated || 0, currentSubscription.tier.email_quota) >= 80 && (
                            <p className="text-xs mt-1 text-orange-600">
                              You're approaching your limit. Consider upgrading for more emails.
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Emails Saved */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Emails Saved</span>
                        <span className="text-sm text-gray-500">
                          {usageStats.emails_saved || 0}
                          {currentSubscription.tier.storage_limit && currentSubscription.tier.storage_limit !== -1 && 
                            ` / ${currentSubscription.tier.storage_limit}`
                          }
                          {currentSubscription.tier.storage_limit === -1 && ' / Unlimited'}
                        </span>
                      </div>
                      {currentSubscription.tier.storage_limit && currentSubscription.tier.storage_limit !== -1 && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${getUsagePercentage(usageStats.emails_saved || 0, currentSubscription.tier.storage_limit)}%`,
                                backgroundColor: getUsageBarColor(getUsagePercentage(usageStats.emails_saved || 0, currentSubscription.tier.storage_limit))
                              }}
                            />
                          </div>
                          {getUsagePercentage(usageStats.emails_saved || 0, currentSubscription.tier.storage_limit) >= 80 && (
                            <p className="text-xs mt-1 text-orange-600">
                              You're approaching your storage limit. Consider upgrading for more space.
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Email Series Created */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Email Series Created</span>
                        <span className="text-sm text-gray-500">
                          {usageStats.series_created || 0}
                          {currentSubscription.tier.series_limit && currentSubscription.tier.series_limit !== -1 && 
                            ` / ${currentSubscription.tier.series_limit}`
                          }
                          {currentSubscription.tier.series_limit === -1 && ' / Unlimited'}
                        </span>
                      </div>
                      {currentSubscription.tier.series_limit && currentSubscription.tier.series_limit !== -1 && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${getUsagePercentage(usageStats.series_created || 0, currentSubscription.tier.series_limit)}%`,
                                backgroundColor: getUsageBarColor(getUsagePercentage(usageStats.series_created || 0, currentSubscription.tier.series_limit))
                              }}
                            />
                          </div>
                          {getUsagePercentage(usageStats.series_created || 0, currentSubscription.tier.series_limit) >= 80 && (
                            <p className="text-xs mt-1 text-orange-600">
                              You're approaching your series limit. Consider upgrading for more series.
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* AI Tokens Used (if available) */}
                    {currentSubscription.tier.ai_tokens_monthly && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">AI Tokens Used</span>
                          <span className="text-sm text-gray-500">
                            {usageStats.ai_tokens_used || 0}
                            {currentSubscription.tier.ai_tokens_monthly !== -1 && 
                              ` / ${currentSubscription.tier.ai_tokens_monthly}`
                            }
                            {currentSubscription.tier.ai_tokens_monthly === -1 && ' / Unlimited'}
                          </span>
                        </div>
                        {currentSubscription.tier.ai_tokens_monthly !== -1 && (
                          <>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${getUsagePercentage(usageStats.ai_tokens_used || 0, currentSubscription.tier.ai_tokens_monthly)}%`,
                                  backgroundColor: getUsageBarColor(getUsagePercentage(usageStats.ai_tokens_used || 0, currentSubscription.tier.ai_tokens_monthly))
                                }}
                              />
                            </div>
                            {getUsagePercentage(usageStats.ai_tokens_used || 0, currentSubscription.tier.ai_tokens_monthly) >= 80 && (
                              <p className="text-xs mt-1 text-orange-600">
                                You're approaching your AI token limit. Consider upgrading for more tokens.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                          <span>Emails per month:</span>
                          <span className="font-medium">
                            {tier.email_quota === -1 ? 'Unlimited' : tier.email_quota}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Saved emails:</span>
                          <span className="font-medium">
                            {tier.storage_limit === -1 ? 'Unlimited' : tier.storage_limit}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Email series:</span>
                          <span className="font-medium">
                            {tier.series_limit === -1 ? 'Unlimited' : tier.series_limit}
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
              
                <Link to="/tools/email-generator" className="block w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Generate Emails
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