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
  const supabaseContext = useSupabase();
  const { user, loading: authLoading } = supabaseContext;
  const { toast, showToast } = useToast();
  
  // Debug logging - let's see what the hook returns
  console.log('=== SUBSCRIPTION DEBUG ===');
  console.log('Full Supabase Context:', supabaseContext);
  console.log('Auth Loading:', authLoading);
  console.log('User:', user);
  console.log('User exists:', !!user);
  console.log('========================');
  
  // State management (hooks must come first)
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availableTiers, setAvailableTiers] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch subscription data on mount (hooks must be called unconditionally)
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      // Don't fetch if user is not authenticated
      if (!user) {
        console.log('No authenticated user, skipping subscription data fetch');
        setLoading(false);
        return;
      }
      
      console.log('Fetching subscription data for user:', user.id);
      
      try {
        setLoading(true);
        
        // Fetch current subscription
        const subscription = await subscriptions.getCurrentSubscription();
        setCurrentSubscription(subscription);
        
        // Fetch available tiers
        const tiers = await subscriptions.getTiers();
        setAvailableTiers(tiers);
        
        // Fetch usage statistics
        const usage = await subscriptions.getUsageStats();
        setUsageStats(usage);
        
        // Fetch subscription history
        const history = await subscriptions.getSubscriptionHistory();
        setSubscriptionHistory(history);
        
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        showToast('Error loading subscription information', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user, showToast]);

  // Debug logging
  console.log('Subscription component - Auth Loading:', authLoading);
  console.log('Subscription component - User:', user ? 'Authenticated' : 'Not authenticated');
  console.log('Subscription component - User ID:', user?.id);

  // Redirect to login if not authenticated (after auth loading is complete)
  if (!authLoading && !user) {
    console.log('🔄 SHOULD REDIRECT: Auth loading complete, no user found');
    return <Navigate to="/login" replace />;
  }

  // Show loading while authentication is being checked
  if (authLoading) {
    console.log('🔄 SHOWING AUTH LOADING');
    return (
      <div className="flex items-center justify-center h-80">
        <Loader size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Get tier badge color
  const getTierBadgeColor = (tierName) => {
    switch (tierName) {
      case 'free':
        return 'gray';
      case 'pro':
        return 'blue';
      case 'superAdmin':
        return 'purple';
      default:
        return 'gray';
    }
  };

  // Get tier display name
  const getTierDisplayName = (tierName) => {
    const tier = availableTiers.find(t => t.name === tierName);
    return tier?.display_name || tierName;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate usage percentage
  const getUsagePercentage = (current, limit) => {
    if (!limit || limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  // Get usage bar color
  const getUsageBarColor = (percentage) => {
    if (percentage >= 90) return '#EF4444'; // Red
    if (percentage >= 75) return '#F59E0B'; // Yellow
    return '#10B981'; // Green
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader size="lg" text="Loading subscription information..." />
      </div>
    );
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
                <Badge colorScheme={getTierBadgeColor(currentSubscription?.subscription_tier || 'free')}>
                  {getTierDisplayName(currentSubscription?.subscription_tier || 'free')}
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
              {usageStats && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage This Month</h3>
                  
                  <div className="space-y-4">
                    {/* Emails Generated */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Emails Generated</span>
                        <span className="text-sm text-gray-500">
                          {usageStats.emails_generated || 0}
                          {currentSubscription?.tier?.email_limit && 
                            ` / ${currentSubscription.tier.email_limit === -1 ? 'Unlimited' : currentSubscription.tier.email_limit}`
                          }
                        </span>
                      </div>
                      {currentSubscription?.tier?.email_limit && currentSubscription.tier.email_limit !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${getUsagePercentage(usageStats.emails_generated || 0, currentSubscription.tier.email_limit)}%`,
                              backgroundColor: getUsageBarColor(getUsagePercentage(usageStats.emails_generated || 0, currentSubscription.tier.email_limit))
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Emails Saved */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Emails Saved</span>
                        <span className="text-sm text-gray-500">
                          {usageStats.emails_saved || 0}
                          {currentSubscription?.tier?.storage_limit && 
                            ` / ${currentSubscription.tier.storage_limit === -1 ? 'Unlimited' : currentSubscription.tier.storage_limit}`
                          }
                        </span>
                      </div>
                      {currentSubscription?.tier?.storage_limit && currentSubscription.tier.storage_limit !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${getUsagePercentage(usageStats.emails_saved || 0, currentSubscription.tier.storage_limit)}%`,
                              backgroundColor: getUsageBarColor(getUsagePercentage(usageStats.emails_saved || 0, currentSubscription.tier.storage_limit))
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Series Created */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Email Series Created</span>
                        <span className="text-sm text-gray-500">
                          {usageStats.series_created || 0}
                          {currentSubscription?.tier?.series_limit && 
                            ` / ${currentSubscription.tier.series_limit === -1 ? 'Unlimited' : currentSubscription.tier.series_limit}`
                          }
                        </span>
                      </div>
                      {currentSubscription?.tier?.series_limit && currentSubscription.tier.series_limit !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${getUsagePercentage(usageStats.series_created || 0, currentSubscription.tier.series_limit)}%`,
                              backgroundColor: getUsageBarColor(getUsagePercentage(usageStats.series_created || 0, currentSubscription.tier.series_limit))
                            }}
                          />
                        </div>
                      )}
                    </div>
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
                {availableTiers.map((tier) => (
                  <div 
                    key={tier.name}
                    className={`border rounded-lg p-4 ${
                      currentSubscription?.subscription_tier === tier.name 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{tier.display_name}</h3>
                        {tier.price && (
                          <p className="text-xl font-bold text-gray-900">
                            ${tier.price}
                            <span className="text-sm font-normal text-gray-500">/month</span>
                          </p>
                        )}
                      </div>
                      {currentSubscription?.subscription_tier === tier.name && (
                        <Badge colorScheme="blue">Current</Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Emails per month:</span>
                        <span className="font-medium">
                          {tier.email_limit === -1 ? 'Unlimited' : tier.email_quota}
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
                    
                    {currentSubscription?.subscription_tier !== tier.name && (
                      <Button
                        variant={tier.name === 'pro' ? 'primary' : 'outline'}
                        size="sm"
                        className="w-full"
                        onClick={() => showToast('Contact support to change your plan', 'info')}
                      >
                        {tier.name === 'pro' ? 'Upgrade to Pro' : 'Contact Support'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link 
                  to="/tools/email-generator" 
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Generate Emails
                  </Button>
                </Link>
                
                <Link 
                  to="/profile" 
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Edit Profile
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View History
                </Button>
              </div>
            </div>
          </Card>

          {/* Subscription History */}
          {showHistory && subscriptionHistory.length > 0 && (
            <Card className="mt-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Subscription History</h3>
                
                <div className="space-y-3">
                  {subscriptionHistory.slice(0, 5).map((history, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {history.action === 'upgrade' ? '↑' : history.action === 'downgrade' ? '↓' : '→'} 
                          {' '}{getTierDisplayName(history.to_tier)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(history.created_at)}
                        </p>
                      </div>
                      <Badge colorScheme={getTierBadgeColor(history.to_tier)} variant="subtle">
                        {history.action}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Support Contact */}
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