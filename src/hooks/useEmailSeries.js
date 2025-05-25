// src/hooks/useEmailSeries.js
import { extractDomain, createSeriesNameFromDomain } from '../services/emailGenerator';
import { useState, useCallback } from 'react';
import { generateEmailSeries, generateAIEmailSeries } from '../services/emailGenerator/emailGenerator';
import { useUsageTracking } from './useUsageTracking';

/**
 * Custom hook for email series generation and management with tier-based AI integration
 * Handles generating, exporting, and copying emails with accurate token tracking
 */
export const useEmailSeries = ({
  extractedBenefits,
  selectedBenefits,
  websiteData,
  url,
  affiliateLink,
  tone,
  industry,
  isUsingAI,
  aiAvailable,
  exportFormat,
  currentEmailIndex,
  showToast,
  onGenerateComplete,
  user // Add user prop for tier detection
}) => {

  console.log('🎯 useEmailSeries hook called!');
  
  const [emailSeries, setEmailSeries] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Add usage tracking hook
  const { trackEmailGeneration, trackSeriesCreated, trackAITokenUsage } = useUsageTracking();

  /**
   * Enhanced AI email generation with tier-based model selection and accurate token tracking
   */
  const generateAIEmailsWithTierSupport = useCallback(async (selectedBenefitsList, websiteData, options) => {
    try {
      // Get user tier for model selection
      const userTier = user?.subscription_tier || 'free';
      
      console.log('🤖 Generating AI emails with tier:', userTier);
      
      // Call the enhanced AI generation service with user tier
      const result = await generateAIEmailSeries(
        selectedBenefitsList,
        websiteData,
        {
          ...options,
          userTier: userTier, // Pass user tier to AI service
          user: user // Pass full user object
        }
      );
      
      // The enhanced AI service now returns both emails and usage data
      if (result.usage) {
        console.log('🤖 AI Generation Results:', {
          emails: result.emails?.length || 0,
          model: result.usage.modelDisplayName,
          totalTokens: result.usage.totalTokens,
          estimatedCost: `$${result.usage.estimatedCost.toFixed(6)}`
        });
        
        // Track the actual AI tokens used (not estimated)
        if (result.usage.totalTokens > 0) {
          await trackAITokenUsage(result.usage.totalTokens);
          console.log(`✅ Tracked ${result.usage.totalTokens} AI tokens for ${userTier} tier`);
        }
        
        return {
          emails: result.emails || result, // Support both new and old formats
          usage: result.usage
        };
      } else {
        // Fallback for old format - estimate tokens
        const emails = Array.isArray(result) ? result : [result];
        const inputText = JSON.stringify(selectedBenefitsList) + JSON.stringify(websiteData);
        const outputText = emails.map(email => `${email.subject || ''} ${email.body || ''}`).join(' ');
        const estimatedTokens = Math.ceil((inputText.length + outputText.length) / 3.5 * 1.1);
        
        if (estimatedTokens > 0) {
          await trackAITokenUsage(estimatedTokens);
          console.log(`✅ Tracked ${estimatedTokens} estimated AI tokens (fallback)`);
        }
        
        return {
          emails: emails,
          usage: {
            totalTokens: estimatedTokens,
            estimatedCost: estimatedTokens * 0.001, // Rough estimate
            model: 'estimated'
          }
        };
      }
      
    } catch (error) {
      console.error('Error in tier-based AI generation:', error);
      throw error;
    }
  }, [user, trackAITokenUsage]);
  
  // Generate email series with enhanced tracking
  const handleGenerateEmails = useCallback(async () => {
    const selectedBenefitsList = extractedBenefits.filter((_, index) => selectedBenefits[index]);
    
    if (selectedBenefitsList.length === 0) {
      showToast('Please select at least one benefit', 'error');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Get domain from URL
      const domain = extractDomain(url);      
      let emails = [];
      let aiUsageData = null;
      const userTier = user?.subscription_tier || 'free';
      
      if (isUsingAI && aiAvailable) {
        // Generate emails using Claude AI with tier-based models
        const tierMessage = userTier === 'gold' ? 'premium AI' : 
                           userTier === 'pro' ? 'professional AI' : 'AI';
        showToast(`Generating emails with ${tierMessage}...`, 'info');
        
        try {
          const aiResult = await generateAIEmailsWithTierSupport(
            selectedBenefitsList,
            websiteData,
            {
              domain,
              affiliateLink,
              tone,
              industry
            }
          );
          
          emails = aiResult.emails;
          aiUsageData = aiResult.usage;
          
          const modelInfo = aiUsageData?.modelDisplayName ? ` using ${aiUsageData.modelDisplayName}` : '';
          showToast(`Successfully generated ${emails.length} emails with AI${modelInfo}!`, 'success');
          
        } catch (error) {
          console.error('Error generating emails with AI:', error);
          showToast('AI generation failed, falling back to templates', 'warning');
          
          // Fallback to template generation
          emails = generateEmailSeries(selectedBenefitsList, {
            domain,
            affiliateLink,
            tone,
            industry
          });
        }
      } else {
        // Generate emails using our template utility
        emails = generateEmailSeries(selectedBenefitsList, {
          domain,
          affiliateLink,
          tone,
          industry
        });
      }
      
      // Add metadata to emails
      emails = emails.map((email, index) => ({
        ...email,
        emailNumber: index + 1,
        createdAt: new Date().toISOString(),
        seriesName: createSeriesNameFromDomain(domain),
        domain,
        generatedWith: isUsingAI && aiAvailable ? 'AI' : 'Template',
        userTier: userTier,
        aiModel: aiUsageData?.model || null
      }));
      
      setEmailSeries(emails);
      
      // 🎯 TRACK USAGE: Email generation and series creation
      try {
        // Track emails generated
        await trackEmailGeneration(emails.length);
        
        // Track series created (1 series per generation)
        await trackSeriesCreated(1);
        
        // AI tokens are already tracked in generateAIEmailsWithTierSupport
        
        console.log(`✅ Usage tracked: ${emails.length} emails, 1 series for ${userTier} user`);
        
        if (aiUsageData) {
          console.log(`💰 AI Cost: $${aiUsageData.estimatedCost.toFixed(6)} (${aiUsageData.totalTokens} tokens)`);
        }
        
      } catch (trackingError) {
        console.error('Error tracking usage:', trackingError);
        // Don't fail the whole operation if tracking fails
      }
      
      showToast(`Successfully generated ${emails.length} emails!`, 'success');
      
      if (onGenerateComplete) {
        onGenerateComplete();
      }
    } catch (error) {
      console.error('Error generating emails:', error);
      showToast('Failed to generate emails. Please try again.', 'error');
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
    isUsingAI, 
    aiAvailable, 
    showToast, 
    onGenerateComplete,
    user, // Add user to dependencies
    trackEmailGeneration,
    trackSeriesCreated,
    generateAIEmailsWithTierSupport
  ]);
  
  // Copy current email to clipboard
  const copyEmailToClipboard = useCallback(() => {
    if (emailSeries.length === 0) return;
    
    const email = emailSeries[currentEmailIndex];
    
    try {
      let content = '';
      
      if (exportFormat === 'text') {
        content = `Subject: ${email.subject}\n\n${email.body}`;
      } else if (exportFormat === 'html') {
        content = `<h2>${email.subject}</h2>\n<div>${email.body.replace(/\n/g, '<br>')}</div>`;
      } else if (exportFormat === 'markdown') {
        content = `# ${email.subject}\n\n${email.body}`;
      }
      
      navigator.clipboard.writeText(content);
      showToast(`Email copied to clipboard as ${exportFormat.toUpperCase()}!`, 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Failed to copy to clipboard', 'error');
    }
  }, [emailSeries, currentEmailIndex, exportFormat, showToast]);
  
  // Handle export email in various formats
  const handleExportEmail = useCallback((format) => {
    if (emailSeries.length === 0) return;
    
    const email = emailSeries[currentEmailIndex];
    
    try {
      let content = '';
      let fileName = '';
      let mimeType = '';
      
      // Prepare content based on format
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
    h1 { color: #333; }
    .email-body { white-space: pre-wrap; }
    .email-meta { 
      font-size: 12px; 
      color: #666; 
      border-top: 1px solid #eee; 
      padding-top: 10px; 
      margin-top: 20px; 
    }
  </style>
</head>
<body>
  <h1>${email.subject}</h1>
  <div class="email-body">${email.body.replace(/\n/g, '<br>')}</div>
  <div class="email-meta">
    Generated with: ${email.generatedWith || 'Template'} | 
    User Tier: ${email.userTier || 'free'} | 
    Created: ${new Date(email.createdAt).toLocaleDateString()}
    ${email.aiModel ? ` | AI Model: ${email.aiModel}` : ''}
  </div>
</body>
</html>`;
        fileName = `email-${email.emailNumber}-${email.domain}-${email.userTier}.html`;
        mimeType = 'text/html';
      } else if (format === 'text') {
        content = `Subject: ${email.subject}\n\n${email.body}`;
        
        // Add metadata for text format
        content += `\n\n---\nGenerated with: ${email.generatedWith || 'Template'}\n`;
        content += `User Tier: ${email.userTier || 'free'}\n`;
        content += `Created: ${new Date(email.createdAt).toLocaleDateString()}`;
        if (email.aiModel) {
          content += `\nAI Model: ${email.aiModel}`;
        }
        
        fileName = `email-${email.emailNumber}-${email.domain}-${email.userTier}.txt`;
        mimeType = 'text/plain';
      } else if (format === 'markdown') {
        content = `# ${email.subject}\n\n${email.body}`;
        
        // Add metadata for markdown format
        content += `\n\n---\n**Generated with:** ${email.generatedWith || 'Template'}  \n`;
        content += `**User Tier:** ${email.userTier || 'free'}  \n`;
        content += `**Created:** ${new Date(email.createdAt).toLocaleDateString()}`;
        if (email.aiModel) {
          content += `  \n**AI Model:** ${email.aiModel}`;
        }
        
        fileName = `email-${email.emailNumber}-${email.domain}-${email.userTier}.md`;
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
      console.error(`Error exporting as ${format}:`, error);
      showToast(`Failed to export as ${format}`, 'error');
    }
  }, [emailSeries, currentEmailIndex, showToast]);
  
  return {
    emailSeries,
    isGenerating,
    handleGenerateEmails,
    copyEmailToClipboard,
    handleExportEmail,
    // Expose user tier info for UI components
    userTier: user?.subscription_tier || 'free',
    // Expose AI availability with tier context
    aiAvailableForTier: aiAvailable && user
  };
};