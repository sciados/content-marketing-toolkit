// src/hooks/useEmailSeries.js - FINAL VERSION for your clean campaign schema
import { useState, useCallback } from 'react';
import { emailApi } from '../../core/api';
import { useUsageTracking } from './useUsageTracking';
import useAuth from './useAuth'; // Your existing Supabase hook (properly typed)

// Helper functions
const extractDomain = (url) => {
  try {
    const domain = url.replace(/(^\w+:|^)\/\//, '').split('/')[0];
    return domain.split('.').slice(-2, -1)[0] || domain;
  } catch {
    return 'website';
  }
};

const createSeriesNameFromDomain = (domain) => {
  return `${domain.charAt(0).toUpperCase() + domain.slice(1)} Email Series`;
};

/**
 * ✅ HYBRID APPROACH: Email series hook that uses Render API + Campaign Organization
 * 
 * Flow:
 * 1. Generate emails via your existing Render backend API (preserves your AI logic)
 * 2. Organize results into campaign database (adds structure & relationships)
 * 3. Update UI state (fixes the empty emailSeries issue)
 * 
 * This keeps your proven Render API while adding campaign organization!
 */
export const useEmailSeries = ({
  extractedBenefits,
  selectedBenefits,
  websiteData,
  url,
  affiliateLink,
  tone,
  industry,
  exportFormat,
  currentEmailIndex,
  showToast,
  onGenerateComplete,
  user
}) => {

  console.log('🎯 useEmailSeries hook initialized for CLEAN campaign schema');
  
  const [emailSeries, setEmailSeries] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { supabase } = useAuth();
  
  // Usage tracking
  const { trackEmailGeneration, trackSeriesCreated, trackAITokenUsage } = useUsageTracking();

  /**
   * ✅ Save to your clean campaign database schema
   */
  const saveToCampaignDatabase = useCallback(async (emails, campaignData) => {
    try {
      console.log('💾 Saving to clean campaign database schema...');
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Step 1: Create or get campaign
      let campaign;
      const { data: existingCampaigns, error: searchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', campaignData.name)
        .limit(1);

      if (searchError) throw searchError;

      if (existingCampaigns && existingCampaigns.length > 0) {
        campaign = existingCampaigns[0];
        console.log('📁 Using existing campaign:', campaign.id);
      } else {
        const { data: newCampaign, error: createError } = await supabase
          .from('campaigns')
          .insert({
            user_id: user.id,
            name: campaignData.name,
            description: campaignData.description,
            industry: campaignData.industry || 'general',
            tone: campaignData.tone || 'professional',
            status: 'active',
            tags: ['email-marketing', 'ai-generated']
          })
          .select()
          .single();

        if (createError) throw createError;
        campaign = newCampaign;
        console.log('📁 Created new campaign:', campaign.id);
      }

      // Step 2: Add webpage source (if from URL scan)
      let webpageSource = null;
      if (url) {
        const { data: existingSource, error: sourceSearchError } = await supabase
          .from('campaign_webpage_sources')
          .select('*')
          .eq('campaign_id', campaign.id)
          .eq('source_url', url)
          .limit(1);

        if (sourceSearchError) throw sourceSearchError;

        if (existingSource && existingSource.length > 0) {
          webpageSource = existingSource[0];
          console.log('🌐 Using existing webpage source:', webpageSource.id);
        } else {
          const { data: newSource, error: sourceCreateError } = await supabase
            .from('campaign_webpage_sources')
            .insert({
              campaign_id: campaign.id,
              user_id: user.id,
              source_url: url,
              page_title: websiteData?.title || campaignData.name,
              page_description: websiteData?.description || `Scanned page for ${campaignData.name}`,
              domain: extractDomain(url),
              extracted_benefits: extractedBenefits || [],
              extracted_features: [], // Add if you have this data
              processing_status: 'completed',
              processed_at: new Date().toISOString()
            })
            .select()
            .single();

          if (sourceCreateError) throw sourceCreateError;
          webpageSource = newSource;
          console.log('🌐 Created new webpage source:', webpageSource.id);
        }
      }

      // Step 3: Save email series
      const { data: savedSeries, error: seriesError } = await supabase
        .from('campaign_email_series')
        .insert({
          campaign_id: campaign.id,
          user_id: user.id,
          series_name: campaignData.seriesName,
          series_description: `Generated ${emails.length} emails from ${url || 'manual input'}`,
          total_emails: emails.length,
          tone: campaignData.tone || 'professional',
          industry: campaignData.industry || 'general',
          target_audience: campaignData.targetAudience || null,
          affiliate_link: campaignData.affiliateLink || null,
          source_webpage_ids: webpageSource ? [webpageSource.id] : [],
          ai_model_used: 'backend-api',
          tokens_consumed: campaignData.tokensUsed || 0,
          generation_quality_score: 8, // Default good quality score
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (seriesError) throw seriesError;
      console.log('📧 Saved email series:', savedSeries.id);

      // Step 4: Save individual emails
      const emailsToInsert = emails.map((email, index) => ({
        series_id: savedSeries.id,
        campaign_id: campaign.id,
        email_number: index + 1,
        subject_line: email.subject,
        email_body: email.content || email.body,
        focus_benefit: email.benefit || extractedBenefits[index] || `Benefit ${index + 1}`,
        word_count: (email.content || email.body).split(' ').length,
        reading_level: '5th grade',
        estimated_read_time: Math.ceil((email.content || email.body).split(' ').length / 200) * 60, // seconds
        created_at: new Date().toISOString()
      }));

      const { data: savedEmails, error: emailsError } = await supabase
        .from('campaign_emails')
        .insert(emailsToInsert)
        .select();

      if (emailsError) throw emailsError;
      console.log('📬 Saved individual emails:', savedEmails.length);

      // Step 5: Track usage in campaign_usage_tracking
      const { error: usageError } = await supabase
        .from('campaign_usage_tracking')
        .insert({
          user_id: user.id,
          campaign_id: campaign.id,
          feature_used: 'email_generation',
          tokens_consumed: campaignData.tokensUsed || 0,
          content_pieces_generated: emails.length,
          source_type: webpageSource ? 'webpage' : 'manual',
          source_id: webpageSource?.id || null,
          output_type: 'email_series',
          output_id: savedSeries.id,
          success: true,
          session_id: `email_gen_${Date.now()}`,
          created_at: new Date().toISOString()
        });

      if (usageError) {
        console.warn('⚠️ Usage tracking failed (non-critical):', usageError);
        // Don't fail the whole operation
      }

      console.log('✅ Successfully saved to campaign database schema');
      
      return {
        campaign,
        emailSeries: savedSeries,
        emails: savedEmails,
        webpageSource
      };

    } catch (error) {
      console.error('❌ Campaign database save error:', error);
      throw new Error(`Failed to save to campaign database: ${error.message}`);
    }
  }, [supabase, user, extractedBenefits, websiteData, url]);

  /**
   * ✅ MAIN: Generate emails via Render API and save to campaign database
   */
  const handleGenerateEmails = useCallback(async () => {
    const selectedBenefitsList = extractedBenefits.filter((_, index) => selectedBenefits[index]);
    
    if (selectedBenefitsList.length === 0) {
      showToast('Please select at least one benefit', 'error');
      return;
    }
    
    console.log('🚀 Starting email generation - Render API + Campaign Database...');
    
    setIsGenerating(true);
    
    try {
      const domain = extractDomain(url || '');
      const userTier = user?.subscription_tier || 'free';
      
      showToast(`Generating ${selectedBenefitsList.length} emails with AI...`, 'info');
      
      // Step 1: Use your existing Render backend API for email generation
      console.log('📡 Calling Render backend email generation API...');
      
      const result = await emailApi.generateEmails({
        benefits: selectedBenefitsList,
        selectedBenefits: selectedBenefitsList.map(() => true),
        websiteData: websiteData || {},
        tone: tone || 'persuasive',
        industry: industry || 'general',
        affiliateLink: affiliateLink || '',
        autoSave: false // We'll organize into campaigns ourselves
      });
      
      console.log('✅ Render API Response received:', {
        success: result.success,
        emailCount: result.emails ? result.emails.length : 0,
        totalTokens: result.total_tokens,
        backendSaved: result.auto_saved || false
      });

      if (!result.success) {
        throw new Error(result.message || result.error || 'Failed to generate emails via Render API');
      }

      if (!result.emails || result.emails.length === 0) {
        throw new Error('No emails were generated by the Render API');
      }

      // Step 2: Process emails for UI state and campaign organization
      const processedEmails = result.emails.map((email, index) => ({
        ...email,
        emailNumber: index + 1,
        createdAt: new Date().toISOString(),
        domain,
        generatedWith: 'Render API + AI',
        userTier: userTier,
        benefit: selectedBenefitsList[index] || selectedBenefitsList[0],
        renderApiGenerated: true, // Mark as generated by your Render backend
        backendSaveStatus: result.auto_saved ? 'saved' : 'campaign_only'
      }));
      
      console.log('📧 Processed emails for campaign organization:', processedEmails.length);
      
      // Step 3: Organize into campaign database (frontend organization layer)
      console.log('📁 Organizing emails into campaign structure...');
      const campaignData = {
        name: createSeriesNameFromDomain(domain || 'email-campaign'),
        description: `Email series generated via Render API from ${url || 'manual input'}`,
        seriesName: createSeriesNameFromDomain(domain || 'email-campaign'),
        industry: industry || 'general',
        tone: tone || 'professional',
        targetAudience: websiteData?.targetAudience || null,
        affiliateLink: affiliateLink || null,
        tokensUsed: result.total_tokens || 0,
        renderApiUsed: true // Track that this used your Render backend
      };

      const savedData = await saveToCampaignDatabase(processedEmails, campaignData);
      
      // Step 4: Set state for UI display (this is what fixes the empty state issue!)
      setEmailSeries(processedEmails);
      
      // Step 5: Use your existing Render API usage tracking where possible
      try {
        // If your Render API has usage tracking endpoints, use those
        if (result.usage_tracked) {
          console.log('✅ Usage already tracked by Render API');
        } else {
          // Fallback to local tracking hooks
          await trackEmailGeneration(processedEmails.length);
          await trackSeriesCreated(1);
          
          if (result.total_tokens > 0) {
            await trackAITokenUsage(result.total_tokens);
          }
        }
        
        console.log('✅ Usage tracking completed');
      } catch (trackingError) {
        console.warn('⚠️ Usage tracking failed but continuing:', trackingError);
      }
      
      // Success message highlighting the hybrid approach
      showToast(`🎉 Generated ${processedEmails.length} emails via Render API & organized into campaign!`, 'success');
      
      // Call completion callback
      if (onGenerateComplete) {
        console.log('🎯 Calling onGenerateComplete with Render API results...');
        onGenerateComplete({ 
          emails: processedEmails,
          campaign: savedData.campaign,
          emailSeries: savedData.emailSeries,
          renderApiUsed: true,
          tokensConsumed: result.total_tokens || 0
        });
      }
      
      console.log('✅ Render API generation + campaign organization completed successfully');
      
    } catch (error) {
      console.error('❌ Email generation error (Render API + Campaign):', error);
      showToast(`Failed to generate emails: ${error.message}`, 'error');
      setEmailSeries([]);
    } finally {
      setIsGenerating(false);
    }     
    
  }, [
    extractedBenefits, 
    selectedBenefits, 
    websiteData, 
    url, 
    affiliateLink, 
    tone, 
    industry, 
    showToast, 
    onGenerateComplete,
    user,
    trackEmailGeneration,
    trackSeriesCreated,
    trackAITokenUsage,
    saveToCampaignDatabase
  ]);
  
  // Copy current email to clipboard
  const copyEmailToClipboard = useCallback(() => {
    if (emailSeries.length === 0) {
      console.warn('⚠️ No emails to copy - emailSeries is empty');
      return;
    }
    
    const email = emailSeries[currentEmailIndex];
    
    if (!email) {
      console.warn('⚠️ No email at current index:', currentEmailIndex);
      return;
    }
    
    try {
      let content = '';
      
      if (exportFormat === 'text') {
        content = `Subject: ${email.subject}\n\n${email.content || email.body}`;
      } else if (exportFormat === 'html') {
        content = `<h2>${email.subject}</h2>\n<div>${(email.content || email.body).replace(/\n/g, '<br>')}</div>`;
      } else if (exportFormat === 'markdown') {
        content = `# ${email.subject}\n\n${email.content || email.body}`;
      }
      
      navigator.clipboard.writeText(content);
      showToast(`Email copied to clipboard as ${exportFormat.toUpperCase()}!`, 'success');
    } catch (error) {
      console.error('❌ Error copying to clipboard:', error);
      showToast('Failed to copy to clipboard', 'error');
    }
  }, [emailSeries, currentEmailIndex, exportFormat, showToast]);
  
  // Handle export email
  const handleExportEmail = useCallback((format) => {
    if (emailSeries.length === 0) {
      console.warn('⚠️ No emails to export - emailSeries is empty');
      return;
    }
    
    const email = emailSeries[currentEmailIndex];
    
    if (!email) {
      console.warn('⚠️ No email at current index for export:', currentEmailIndex);
      return;
    }
    
    try {
      let content = '';
      let fileName = '';
      let mimeType = '';
      
      const metadata = `
Generated with: Campaign-Based AI System
User Tier: ${email.userTier || 'free'}
Created: ${new Date(email.createdAt).toLocaleDateString()}
Focus Benefit: ${email.benefit || 'Unknown'}
Campaign: ${email.domain} Email Series`;
      
      if (format === 'pdf') {
        showToast('PDF export will be available in a future update', 'info');
        return;
      } else if (format === 'html') {
        content = `<!DOCTYPE html>
<html>
<head>
  <title>${email.subject}</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
    .email-body { white-space: pre-wrap; margin: 20px 0; }
    .email-meta { 
      font-size: 12px; 
      color: #666; 
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 5px;
      padding: 15px; 
      margin-top: 30px; 
      white-space: pre-line;
    }
  </style>
</head>
<body>
  <h1>${email.subject}</h1>
  <div class="email-body">${(email.content || email.body).replace(/\n/g, '<br>')}</div>
  <div class="email-meta">
    <strong>Email Metadata:</strong>${metadata}
  </div>
</body>
</html>`;
        fileName = `email-${email.emailNumber}-${email.domain || 'campaign'}.html`;
        mimeType = 'text/html';
      } else if (format === 'text') {
        content = `Subject: ${email.subject}\n\n${email.content || email.body}\n\n---\nEmail Metadata:${metadata}`;
        fileName = `email-${email.emailNumber}-${email.domain || 'campaign'}.txt`;
        mimeType = 'text/plain';
      } else if (format === 'markdown') {
        content = `# ${email.subject}\n\n${email.content || email.body}\n\n---\n**Email Metadata:**${metadata}`;
        fileName = `email-${email.emailNumber}-${email.domain || 'campaign'}.md`;
        mimeType = 'text/markdown';
      }
      
      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast(`Email exported as ${format.toUpperCase()}!`, 'success');
    } catch (error) {
      console.error(`❌ Error exporting as ${format}:`, error);
      showToast(`Failed to export as ${format}`, 'error');
    }
  }, [emailSeries, currentEmailIndex, showToast]);
  
  return {
    emailSeries,
    isGenerating,
    handleGenerateEmails,
    copyEmailToClipboard,
    handleExportEmail,
    userTier: user?.subscription_tier || 'free',
    aiAvailableForTier: true,
    generationStats: emailSeries.length > 0 ? {
      total: emailSeries.length,
      aiGenerated: emailSeries.length,
      templateFallback: 0,
      aiSuccessRate: 100
    } : null
  };
};