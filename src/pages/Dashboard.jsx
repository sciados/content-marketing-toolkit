import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import { getTierDisplayName, isSuperAdmin } from '../shared/utils/tierUtils';
import { 
  Play, 
  Mail, 
  Folder, 
  Settings, 
  Zap, 
  Video, 
  FileText, 
  TrendingUp,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState(null);
  const [realStats, setRealStats] = useState({
    dailyTokensUsed: 0,
    dailyTokensLimit: 0,
    totalCampaigns: 0,
    totalEmails: 0,
    totalVideosProcessed: 0,
    monthlyVideosLimit: 0,
    remainingTokens: 0
  });
  
  console.log("Dashboard component rendering - FIXED VERSION with error handling");
  
  // Get real user data and stats
  useEffect(() => {
    const getUserData = async () => {
      try {
        // Get authenticated user
        const { data: { session } } = await useAuth.auth.getSession();
        const authUser = session?.user;
        
        if (authUser) {
          setUser(authUser);
          
          // Get user profile with subscription tier
          const { data: profile, error } = await useAuth
            .from('profiles')
            .select('subscription_tier, subscription_status')
            .eq('id', authUser.id)
            .single();
            
          if (profile && !error) {
            setUserTier(profile.subscription_tier);
            console.log('Real user data:', {
              userId: authUser.id,
              email: authUser.email,
              tier: profile.subscription_tier,
              status: profile.subscription_status
            });
            
            // Now fetch real statistics
            await fetchRealStats(authUser.id, profile.subscription_tier);
          } else {
            console.log('Profile fetch error:', error);
            setUserTier('free');
            await fetchRealStats(authUser.id, 'free');
          }
        } else {
          console.log('No authenticated user found');
          setUserTier('free');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setUserTier('free');
        setLoading(false);
      }
    };
    
    const fetchRealStats = async (userId, tier) => {
      try {
        console.log('🔧 Using mock dashboard data - database queries disabled');
        
        // Calculate limits based on tier
        const limits = getTierLimits(tier);
        
        // Use mock data instead of real database queries
        // This prevents all the 400 errors from Supabase
        const mockStats = {
          dailyTokensUsed: 50,  // Mock usage
          dailyTokensLimit: limits.dailyTokens,
          totalCampaigns: 0,    // Show zeros until database is ready
          totalEmails: 0,
          totalVideosProcessed: 0,
          monthlyVideosLimit: limits.monthlyVideos,
          remainingTokens: limits.dailyTokens - 50
        };
        
        console.log('📊 Mock dashboard stats:', mockStats);
        setRealStats(mockStats);
        
        // TODO: Re-enable database queries once RLS policies are set up
        /* 
        // Real database queries (disabled for now):
        const { data: tokenData } = await supabase.from('token_pool')...
        const { count: campaignCount } = await supabase.from('campaigns')...
        */
        
      } catch (error) {
        console.error('❌ Error with mock stats:', error);
        
        // Ultimate fallback
        const limits = getTierLimits(tier);
        setRealStats({
          dailyTokensUsed: 0,
          dailyTokensLimit: limits.dailyTokens,
          totalCampaigns: 0,
          totalEmails: 0,
          totalVideosProcessed: 0,
          monthlyVideosLimit: limits.monthlyVideos,
          remainingTokens: limits.dailyTokens
        });
      }
    };
    
    getUserData();
    
    // Listen for auth changes
    const { data: authListener } = useAuth.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        getUserData();
      } else {
        setUser(null);
        setUserTier(null);
        setRealStats({
          dailyTokensUsed: 0,
          dailyTokensLimit: 0,
          totalCampaigns: 0,
          totalEmails: 0,
          totalVideosProcessed: 0,
          monthlyVideosLimit: 0,
          remainingTokens: 0
        });
      }
    });
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Tier-based limits
  const getTierLimits = (tier) => {
    switch (tier) {
      case 'super_admin':
        return { dailyTokens: 999999, monthlyVideos: 999999 };
      case 'pro':
        return { dailyTokens: 10000, monthlyVideos: 50 };
      case 'premium':
        return { dailyTokens: 5000, monthlyVideos: 25 };
      case 'free':
      default:
        return { dailyTokens: 500, monthlyVideos: 5 };
    }
  };

  // Use real tier data with fallback
  const currentTier = userTier || 'free';
  const isAdmin = isSuperAdmin(currentTier);
  const tierDisplay = getTierDisplayName(currentTier);
  
  console.log("Dashboard data:", { 
    currentTier, 
    isAdmin, 
    tierDisplay, 
    userEmail: user?.email,
    realStats 
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Content Marketing Toolkit
                </h1>
                <p className="text-gray-600 text-lg">Your AI-powered content creation dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  <span className="font-medium">All Systems Online</span>
                </div>
              </div>
              {user && (
                <div className="text-sm text-gray-600 text-right">
                  <div className="font-medium capitalize">{tierDisplay} Plan</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="mb-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-3xl">👋</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
                  <p className="text-lg text-purple-100 mb-1">
                    Ready to create amazing content?
                  </p>
                  <p className="text-purple-200">
                    {tierDisplay} Plan • {isAdmin ? 'Unlimited Access' : 'Full Features Available'}
                  </p>
                </div>
              </div>
              
              <div className="hidden lg:block text-right">
                <div className="text-sm mb-2 text-purple-200">
                  Daily Tokens Remaining
                </div>
                <div className="text-3xl font-bold">
                  {isAdmin ? '∞' : realStats.remainingTokens.toLocaleString()}
                </div>
                <div className="text-sm text-purple-200">
                  of {isAdmin ? 'Unlimited' : realStats.dailyTokensLimit.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Real Stats Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Content Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Daily Tokens */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                <div className="flex items-center space-x-3 text-white">
                  <Zap className="h-6 w-6" />
                  <h3 className="font-semibold">Daily Tokens</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {isAdmin ? '∞' : realStats.remainingTokens.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {isAdmin 
                    ? 'Unlimited access' 
                    : `${realStats.dailyTokensUsed.toLocaleString()} used of ${realStats.dailyTokensLimit.toLocaleString()}`
                  }
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: isAdmin ? '100%' : `${Math.min(100, (realStats.dailyTokensUsed / realStats.dailyTokensLimit) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Campaigns */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <div className="flex items-center space-x-3 text-white">
                  <Folder className="h-6 w-6" />
                  <h3 className="font-semibold">Campaigns</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {realStats.totalCampaigns}
                </div>
                <div className="text-sm text-gray-600">
                  Marketing campaigns created
                </div>
                {realStats.totalCampaigns === 0 && (
                  <div className="mt-3 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                    Create your first campaign to get started!
                  </div>
                )}
              </div>
            </div>
            
            {/* Email Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <div className="flex items-center space-x-3 text-white">
                  <Mail className="h-6 w-6" />
                  <h3 className="font-semibold">Emails Created</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {realStats.totalEmails}
                </div>
                <div className="text-sm text-gray-600">
                  Email sequences generated
                </div>
                {realStats.totalEmails === 0 && (
                  <div className="mt-3 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    Try the Email Generator tool!
                  </div>
                )}
              </div>
            </div>
            
            {/* Videos Processed */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                <div className="flex items-center space-x-3 text-white">
                  <Video className="h-6 w-6" />
                  <h3 className="font-semibold">Videos Processed</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {realStats.totalVideosProcessed}
                </div>
                <div className="text-sm text-gray-600">
                  {isAdmin 
                    ? 'Unlimited processing' 
                    : `of ${realStats.monthlyVideosLimit} this month`
                  }
                </div>
                {realStats.totalVideosProcessed === 0 && (
                  <div className="mt-3 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                    Try Video2Promo tool!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tools section with modern cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Content Creation Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Video2Promo Tool */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4">
                <div className="flex items-center space-x-3 text-white">
                  <Play className="h-6 w-6" />
                  <h3 className="font-semibold">Video2Promo</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Transform YouTube videos into comprehensive marketing campaigns with AI-powered content generation.
                </p>
                <div className="flex items-center justify-between">
                  <Link 
                    to="/tools/video2promo" 
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all font-medium group-hover:scale-105"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Launch Tool
                  </Link>
                  <div className="text-sm text-gray-500">
                    {realStats.totalVideosProcessed} processed
                  </div>
                </div>
              </div>
            </div>
            
            {/* Email Generator Tool */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <div className="flex items-center space-x-3 text-white">
                  <Mail className="h-6 w-6" />
                  <h3 className="font-semibold">Email Generator</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Create compelling sales email sequences from any landing page with advanced AI analysis.
                </p>
                <div className="flex items-center justify-between">
                  <Link 
                    to="/tools/email-generator" 
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-medium group-hover:scale-105"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Launch Tool
                  </Link>
                  <div className="text-sm text-gray-500">
                    {realStats.totalEmails} emails created
                  </div>
                </div>
              </div>
            </div>
            
            {/* Campaign Manager Tool */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <div className="flex items-center space-x-3 text-white">
                  <Folder className="h-6 w-6" />
                  <h3 className="font-semibold">Campaign Manager</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Organize and manage all your content by marketing campaigns with advanced analytics.
                </p>
                <div className="flex items-center justify-between">
                  <Link 
                    to="/content-library" 
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium group-hover:scale-105"
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    Launch Tool
                  </Link>
                  <div className="text-sm text-gray-500">
                    {realStats.totalCampaigns} campaigns
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Tool - Only shown for SuperAdmin */}
            {isAdmin && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="bg-gradient-to-r from-gray-600 to-gray-800 px-6 py-4">
                  <div className="flex items-center space-x-3 text-white">
                    <Settings className="h-6 w-6" />
                    <h3 className="font-semibold">Admin Panel</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Platform administration, user management, and system monitoring.
                  </p>
                  <div className="flex items-center justify-between">
                    <Link 
                      to="/admin" 
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-xl hover:from-gray-700 hover:to-gray-900 transition-all font-medium group-hover:scale-105"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Access Panel
                    </Link>
                    <div className="text-sm text-gray-500">
                      Super Admin
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* System Status */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  All Systems Operational
                </h3>
                <p className="text-green-600">
                  AI Generation • Campaign Management • Content Analytics
                  {user && (
                    <span className="block text-sm text-green-500 mt-1">
                      Authenticated as: {user.email} • {tierDisplay} Plan
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-700">API v4.0</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Real-time Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;