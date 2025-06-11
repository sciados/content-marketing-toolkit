// src/components/EmailGenerator/EmailAnalyticsPanel.jsx
import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Loader } from '../../../shared/components/ui/Loader';
import { useProfile } from '../../../shared/hooks/useProfile';
import { useAuth } from '../../../shared/hooks/useAuth';

/**
 * Panel for displaying email analytics
 * Shows statistics and charts for email performance
 */
const EmailAnalyticsPanel = ({ savedEmails = [], emailCollections = [], onCreateNewEmail }) => {
  const { user } = useAuth();
  const { profileStats, refreshProfileStats } = useProfile();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmails: 0,
    totalSeries: 0,
    createdThisMonth: 0,
    topDomains: [],
    generatedByAI: 0,
    generatedManually: 0,
    emailsByIndustry: {},
    emailsByTone: {},
    openRate: 0,
    clickRate: 0,
  });
  
  // Load analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        console.log('📊 Analytics - Processing data:');
        console.log('- Saved emails:', savedEmails?.length || 0);
        console.log('- Email collections:', emailCollections?.length || 0);
        
        // Refresh profile stats to get latest counts
        await refreshProfileStats();
        
        // Use savedEmails and emailCollections for stats
        const emailCount = Array.isArray(savedEmails) ? savedEmails.length : 0;
        const seriesCount = Array.isArray(emailCollections) ? emailCollections.length : 0;
        
        // Count emails by month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const emailsThisMonth = Array.isArray(savedEmails) ? savedEmails.filter(email => {
          if (!email) return false;
          
          // Try multiple date fields
          const emailDate = new Date(
            email.createdAt || 
            email.savedAt || 
            email.created_at || 
            email.updated_at ||
            Date.now()
          );
          
          return emailDate >= startOfMonth;
        }).length : 0;
        
        // Count AI vs manual generation
        const aiGenerated = Array.isArray(savedEmails) ? savedEmails.filter(email => {
          return email?.generated_with_ai || email?.generatedWithAI || false;
        }).length : 0;
        
        const manuallyGenerated = emailCount - aiGenerated;
        
        // Get top domains - improved logic
        const domains = Array.isArray(savedEmails) ? savedEmails
          .map(email => email?.domain)
          .filter(Boolean) // Remove null/undefined/empty values
          : [];
        
        const domainCounts = domains.reduce((acc, domain) => {
          if (domain && typeof domain === 'string') {
            acc[domain] = (acc[domain] || 0) + 1;
          }
          return acc;
        }, {});
        
        const topDomains = Object.entries(domainCounts)
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 5)
          .map(([domain, count]) => ({ domain, count }));
        
        // Count emails by industry and tone - improved logic
        const industries = {};
        const tones = {};
        
        if (Array.isArray(emailCollections)) {
          emailCollections.forEach(collection => {
            if (!collection || !Array.isArray(collection.emails)) return;
            
            // Get metadata from collection or first email
            const firstEmail = collection.emails[0];
            const emailCount = collection.emails.length;
            
            // Extract industry
            const industry = collection.industry || 
                            firstEmail?.industry || 
                            'General';
            industries[industry] = (industries[industry] || 0) + emailCount;
            
            // Extract tone
            const tone = collection.tone || 
                        firstEmail?.tone || 
                        'Professional';
            tones[tone] = (tones[tone] || 0) + emailCount;
          });
        }
        
        // If no collections data, try to extract from individual emails
        if (Object.keys(industries).length === 0 && Array.isArray(savedEmails)) {
          savedEmails.forEach(email => {
            if (!email) return;
            
            const industry = email.industry || 'General';
            industries[industry] = (industries[industry] || 0) + 1;
            
            const tone = email.tone || 'Professional';
            tones[tone] = (tones[tone] || 0) + 1;
          });
        }
        
        // Generate realistic demo metrics based on actual data
        let openRate = 0;
        let clickRate = 0;
        
        if (emailCount > 0) {
          // Generate more realistic rates based on email count and AI usage
          const baseOpenRate = aiGenerated > manuallyGenerated ? 35 : 25; // AI emails perform better
          const baseClickRate = aiGenerated > manuallyGenerated ? 8 : 5;
          
          openRate = Math.round(baseOpenRate + (Math.random() * 10 - 5)); // ±5% variation
          clickRate = Math.round(baseClickRate + (Math.random() * 4 - 2)); // ±2% variation
          
          // Ensure reasonable bounds
          openRate = Math.max(15, Math.min(55, openRate));
          clickRate = Math.max(3, Math.min(15, clickRate));
        }
        
        console.log('📊 Calculated stats:', {
          totalEmails: emailCount,
          totalSeries: seriesCount,
          createdThisMonth: emailsThisMonth,
          topDomainsCount: topDomains.length,
          industriesCount: Object.keys(industries).length,
          aiGenerated,
          manuallyGenerated
        });
        
        // Set the stats
        setStats({
          totalEmails: emailCount,
          totalSeries: seriesCount,
          createdThisMonth: emailsThisMonth,
          topDomains,
          generatedByAI: aiGenerated,
          generatedManually: manuallyGenerated,
          emailsByIndustry: industries,
          emailsByTone: tones,
          openRate,
          clickRate,
        });
        
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Always run the analytics calculation
    fetchAnalytics();
  }, [user, savedEmails, emailCollections, refreshProfileStats]);
  
  // Format percentage
  const formatPercentage = (value) => {
    return `${value}%`;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Email Analytics
        </h2>
        <p className="text-gray-600 mb-6">
          Please sign in to view your email analytics.
        </p>
        <Button onClick={() => window.location.href = '/login'}>
          Sign In
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Email Analytics Dashboard
        </h2>
        <Button onClick={onCreateNewEmail}>
          Create New Email
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Total Emails</span>
            <span className="text-2xl font-semibold text-gray-800">{stats.totalEmails}</span>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Email Series</span>
            <span className="text-2xl font-semibold text-gray-800">{stats.totalSeries}</span>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Created This Month</span>
            <span className="text-2xl font-semibold text-gray-800">{stats.createdThisMonth}</span>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Quota Usage</span>
            <span className="text-2xl font-semibold text-gray-800">
              {profileStats ? `${stats.totalEmails}/${profileStats.emailQuota}` : `${stats.totalEmails}/∞`}
            </span>
          </div>
        </Card>
      </div>
      
      {/* Generation Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Generation Method
          </h3>
          
          <div className="flex items-center mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ 
                  width: `${stats.totalEmails > 0 
                    ? (stats.generatedByAI / stats.totalEmails * 100) 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <div>
              <span className="inline-block w-3 h-3 rounded-full bg-indigo-600 mr-1"></span>
              <span className="text-gray-700">AI Generated: {stats.generatedByAI}</span>
            </div>
            <div>
              <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-1"></span>
              <span className="text-gray-700">Manual: {stats.generatedManually}</span>
            </div>
          </div>
        </Card>
        
        {/* Top Domains */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top Domains
          </h3>
          
          {stats.topDomains.length > 0 ? (
            <div className="space-y-2">
              {stats.topDomains.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.domain}</span>
                  <span className="text-gray-500">{item.count} email{item.count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No domain data available yet.</p>
          )}
        </Card>
      </div>
      
      {/* Industry & Tone Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Industry Distribution
          </h3>
          
          {Object.keys(stats.emailsByIndustry).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.emailsByIndustry).map(([industry, count], index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700">{industry}</span>
                    <span className="text-xs text-gray-500">{count} email{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.totalEmails > 0 
                          ? (count / stats.totalEmails * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No industry data available yet.</p>
          )}
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Tone Distribution
          </h3>
          
          {Object.keys(stats.emailsByTone).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.emailsByTone).map(([tone, count], index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700 capitalize">{tone}</span>
                    <span className="text-xs text-gray-500">{count} email{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.totalEmails > 0 
                          ? (count / stats.totalEmails * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tone data available yet.</p>
          )}
        </Card>
      </div>
      
      {/* Performance Metrics */}
      <Card className="p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Performance Metrics {stats.totalEmails === 0 ? '(Demo Data)' : '(Simulated Based on Your Data)'}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Email Open Rate</span>
              <span className="text-gray-900 font-medium">{formatPercentage(stats.openRate)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-teal-500 h-2.5 rounded-full" 
                style={{ width: `${stats.openRate}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Click-through Rate</span>
              <span className="text-gray-900 font-medium">{formatPercentage(stats.clickRate)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-amber-500 h-2.5 rounded-full" 
                style={{ width: `${stats.clickRate}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          {stats.totalEmails === 0 
            ? "Note: These metrics are simulated for demonstration purposes. Generate some emails to see data based on your content!"
            : "Note: These performance metrics are simulated based on your email data and generation method. In a production environment, these would be connected to your email service provider's analytics."
          }
        </p>
      </Card>
      
      {/* Empty State Message */}
      {stats.totalEmails === 0 && (
        <Card className="p-6 text-center bg-gray-50">
          <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Data Yet</h3>
          <p className="text-gray-500 mb-4">
            Start by generating and saving some emails to see your analytics data here.
          </p>
          <Button onClick={onCreateNewEmail}>
            Generate Your First Email
          </Button>
        </Card>
      )}
      
      {/* Pro Upgrade CTA */}
      {profileStats && profileStats.subscriptionTier === 'free' && stats.totalEmails > 0 && (
        <Card className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">
                Upgrade to Pro for Advanced Analytics
              </h3>
              <p className="text-indigo-100">
                Get detailed performance tracking, A/B testing capabilities, 
                and unlimited email generation.
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="whitespace-nowrap"
              onClick={() => window.open('/subscription', '_blank')}
            >
              Upgrade Now
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EmailAnalyticsPanel;
