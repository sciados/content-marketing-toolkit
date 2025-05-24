// src/components/EmailGenerator/EmailAnalyticsPanel.jsx
import React, { useState, useEffect } from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import { Loader } from '../Common/Loader';
// Remove unused import: import { db } from '../../services/supabase/db';
import { useProfile } from '../../hooks/useProfile';
import useSupabase from '../../hooks/useSupabase';

/**
 * Panel for displaying email analytics
 * Shows statistics and charts for email performance
 */
const EmailAnalyticsPanel = ({ savedEmails, emailCollections, onCreateNewEmail }) => {
  const { user } = useSupabase();
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
        
        // Refresh profile stats to get latest counts
        await refreshProfileStats();
        
        // Use savedEmails and emailCollections for initial stats
        const emailCount = savedEmails?.length || 0;
        const seriesCount = emailCollections?.length || 0;
        
        // Count emails by month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const emailsThisMonth = savedEmails.filter(email => {
          const emailDate = new Date(email.createdAt || email.savedAt);
          return emailDate >= startOfMonth;
        }).length;
        
        // Count AI vs manual generation
        const aiGenerated = savedEmails.filter(email => email.generatedWithAI).length;
        const manuallyGenerated = emailCount - aiGenerated;
        
        // Get top domains
        const domains = savedEmails
          .map(email => email.domain)
          .filter(Boolean);
        
        const domainCounts = domains.reduce((acc, domain) => {
          acc[domain] = (acc[domain] || 0) + 1;
          return acc;
        }, {});
        
        const topDomains = Object.entries(domainCounts)
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 5)
          .map(([domain, count]) => ({ domain, count }));
        
        // Count emails by industry and tone
        const industries = {};
        const tones = {};
        
        emailCollections.forEach(collection => {
          // Get the first email in the collection to extract metadata
          const firstEmail = collection.emails[0];
          
          if (firstEmail) {
            // Extract industry from the collection or email
            const industry = collection.industry || firstEmail.industry || 'Unknown';
            industries[industry] = (industries[industry] || 0) + collection.emails.length;
            
            // Extract tone from the collection or email
            const tone = collection.tone || firstEmail.tone || 'Unknown';
            tones[tone] = (tones[tone] || 0) + collection.emails.length;
          }
        });
        
        // If available, fetch metrics from Supabase for open and click rates
        let openRate = 0;
        let clickRate = 0;
        
        try {
          // This would typically connect to an analytics service
          // For demo purposes, we'll simulate some data
          openRate = Math.round(Math.random() * 40 + 10); // Random between 10-50%
          clickRate = Math.round(Math.random() * 20 + 5); // Random between 5-25%
        } catch (error) {
          console.error('Error fetching metrics:', error);
        }
        
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
                  <span className="text-gray-500">{item.count} emails</span>
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
                    <span className="text-xs text-gray-500">{count} emails</span>
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
                    <span className="text-xs text-gray-500">{count} emails</span>
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
          Performance Metrics (Demo Data)
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
          Note: These metrics are simulated for demonstration purposes. In a production environment, 
          these would be connected to your email service provider's analytics.
        </p>
      </Card>
      
      {/* Pro Upgrade CTA */}
      {profileStats && profileStats.subscriptionTier === 'free' && (
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