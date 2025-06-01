// src/components/Common/TierProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';
import Loader from './Loader';

const TierProtectedRoute = ({ 
  children, 
  requiredTier = 'free',
  requiredFeature = null,
  fallbackPath = '/pricing',
  showUpgradePrompt = true 
}) => {
  const { subscription, loading, checkFeatureAccess } = useSubscription();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!subscription) return;

      setCheckingAccess(true);
      
      try {
        // Check if user has required tier or higher
        const tierHierarchy = ['free', 'pro', 'gold'];
        const userTierIndex = tierHierarchy.indexOf(subscription.subscription_tier);
        const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
        
        const hasTierAccess = userTierIndex >= requiredTierIndex;
        
        // Check specific feature access if provided
        let hasFeatureAccess = true;
        if (requiredFeature) {
          hasFeatureAccess = await checkFeatureAccess(requiredFeature);
        }
        
        setHasAccess(hasTierAccess && hasFeatureAccess);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [subscription, requiredTier, requiredFeature, checkFeatureAccess]);

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!hasAccess) {
    if (showUpgradePrompt) {
      return <UpgradePrompt requiredTier={requiredTier} />;
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

const UpgradePrompt = ({ requiredTier }) => {
  const tierDisplayNames = {
    free: 'Free',
    pro: 'Pro',
    gold: 'Gold'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-yellow-100">
            <svg className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Upgrade Required
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            This feature requires a {tierDisplayNames[requiredTier]} plan or higher.
          </p>
          
          <div className="mt-8 space-y-4">
            <a
              href="/pricing"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              View Pricing Plans
            </a>
            
            <a
              href="/dashboard"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierProtectedRoute;
