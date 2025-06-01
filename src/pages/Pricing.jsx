// src/pages/Pricing.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptions } from '../services/supabase/subscriptions';
import { useSubscription } from '../hooks/useSubscription';
import useSupabase from '../hooks/useSupabase';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useSupabase();
  const { subscription } = useSubscription();
  const [tiers, setTiers] = useState([]);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const data = await subscriptions.getTiers();
      // Filter out gold tier from public pricing
      setTiers(data.filter(tier => tier.name !== 'gold'));
    } catch (error) {
      console.error('Error fetching tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (tier) => {
    if (!user) {
      navigate('/register');
      return;
    }

    if (tier.name === subscription?.subscription_tier) {
      return; // Already on this plan
    }

    // For now, just show an alert. You'd integrate with Stripe here
    alert(`Integration with payment processor needed for ${tier.display_name} plan`);
  };

  const getFeatureIcon = (hasFeature) => {
    return hasFeature ? (
      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that's right for your business
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="relative bg-gray-200 rounded-lg p-0.5">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-700'
              } relative rounded-md py-2 px-6 text-sm font-medium transition-all`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`${
                billingPeriod === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-700'
              } relative rounded-md py-2 px-6 text-sm font-medium transition-all`}
            >
              Yearly
              <span className="ml-1 text-green-600 text-xs">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const isCurrentPlan = subscription?.subscription_tier === tier.name;
            const price = billingPeriod === 'monthly' ? tier.price_monthly : tier.price_yearly;
            
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 ${
                  tier.name === 'pro' ? 'ring-2 ring-brand-600' : ''
                }`}
              >
                {tier.name === 'pro' && (
                  <div className="absolute top-0 right-6 -translate-y-1/2">
                    <span className="inline-flex items-center rounded-full bg-brand-600 px-4 py-1 text-xs font-semibold text-white">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">{tier.display_name}</h3>
                  <p className="mt-2 text-gray-600">{tier.description}</p>
                  
                  <div className="mt-6 flex items-baseline">
                    <span className="text-5xl font-extrabold text-gray-900">
                      ${price}
                    </span>
                    <span className="ml-1 text-xl text-gray-500">
                      /{billingPeriod === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <span className="mr-3">{getFeatureIcon(true)}</span>
                    <span className="text-gray-700">
                      {tier.email_quota === -1 ? 'Unlimited' : tier.email_quota} emails per month
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">{getFeatureIcon(true)}</span>
                    <span className="text-gray-700">
                      {tier.series_limit === -1 ? 'Unlimited' : tier.series_limit} email series
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">{getFeatureIcon(true)}</span>
                    <span className="text-gray-700">
                      {tier.ai_tokens_monthly === -1 ? 'Unlimited' : tier.ai_tokens_monthly.toLocaleString()} AI tokens
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">{getFeatureIcon(tier.template_access)}</span>
                    <span className={tier.template_access ? 'text-gray-700' : 'text-gray-400'}>
                      Premium email templates
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">{getFeatureIcon(tier.advanced_analytics)}</span>
                    <span className={tier.advanced_analytics ? 'text-gray-700' : 'text-gray-400'}>
                      Advanced analytics
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">{getFeatureIcon(tier.priority_support)}</span>
                    <span className={tier.priority_support ? 'text-gray-700' : 'text-gray-400'}>
                      Priority support
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">{getFeatureIcon(tier.api_access)}</span>
                    <span className={tier.api_access ? 'text-gray-700' : 'text-gray-400'}>
                      API access
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">{getFeatureIcon(tier.team_members > 1)}</span>
                    <span className={tier.team_members > 1 ? 'text-gray-700' : 'text-gray-400'}>
                      {tier.team_members === -1 ? 'Unlimited' : tier.team_members} team members
                    </span>
                  </li>
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(tier)}
                  disabled={isCurrentPlan}
                  className={`w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-colors ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : tier.name === 'pro'
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : `Get ${tier.display_name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ or additional info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Questions? Contact our sales team at{' '}
            <a href="mailto:sales@example.com" className="text-brand-600 hover:text-brand-700">
              sales@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
