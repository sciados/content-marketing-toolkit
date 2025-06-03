// src/hooks/useEmailSeries.js - UPDATED for centralized API architecture
import { useState, useCallback } from 'react';
import { emailApi } from '../services/api'; // Use centralized API
import { useUsageTracking } from './useUsageTracking';

// Helper functions - moved from emailGenerator to avoid circular imports
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
 * Custom hook for email series generation and management with AI-first approach
 * Uses centralized emailApi for backend integration
 */
export const useEmailSeries = ({
  extractedBenefits,
  selectedBenefits,
  websiteData,
  url,
  affiliateLink,
  tone,
  industry,
  isUsingAI, // Keeping for backwards compatibility but not actively used
  aiAvailable, // Keeping for backwards compatibility but not actively used
  exportFormat,
  currentEmailIndex,
  showToast,
  onGenerateComplete,
  user
}) => {

  console.log('🎯 useEmailSeries hook initialized with centralized API architecture');
  
  const [emailSeries, setEmailSeries] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Add usage tracking hook
  const { trackEmailGeneration, trackSeriesCreated, trackAITokenUsage } = useUsageTracking();

  // Remove unused variables warning by using them in debug logs
  // Using underscore prefix to indicate intentionally unused parameters
  const _isUsingAI = isUsingAI;
  const _aiAvailable = aiAvailable;
  
  // Log for debugging purposes
  console.log('Hook initialized with legacy params:', { 
    hasIsUsingAI: !!_isUsingAI, 
    hasAiAvailable: !!_aiAvailable 
  });

  /**
   * Enhanced AI email generation using centralized emailApi
   */
  const generateEmailsWithAI = useCallback(async (selectedBenefitsList, websiteData, options) => {
    try {
      const userTier = user?.subscription_tier || 'free';
      
      console.log('🤖 Starting AI-first email generation with tier:', userTier);
      console.log('🎯 Benefits to process:', selectedBenefitsList.length);
      
      // Use centralized emailApi for generation
      const result = await emailApi.generateEmails({
        benefits: selectedBenefitsList,
        selectedBenefits: selectedBenefitsList.map(() => true),
        websiteData,
        tone: options.tone || 'persuasive',
        industry: options.industry || 'general',
        affiliateLink: options.affiliateLink || ''
      });
      
      // Process results
      if (result.success && result.emails) {
        console.log('🤖 AI Generation Complete:', {
          emails: result.emails.length,
          totalTokens: result.total_tokens || 0
        });
        
        // Track actual AI tokens used
        if (result.total_tokens > 0) {
          await trackAITokenUsage(result.total_tokens);
          console.log(`✅ Tracked ${result.total_tokens} AI tokens for ${userTier} tier`);
        }
        
        showToast(`All ${result.emails.length} emails generated with AI! 🤖`, 'success');
        
        return {
          emails: result.emails.map((email, index) => ({
            ...email,
            emailNumber: index + 1,
            createdAt: new Date().toISOString(),
            generatedWithAI: true,
            domain: extractDomain(options.domain || url || ''),
            readingLevel: '5th grade',
            generationMethod: 'backend-api'
          })),
          usage: {
            totalTokens: result.total_tokens || 0,
            model: 'backend-ai',
            aiSuccessRate: 100,
            totalEmails: result.emails.length
          }
        };
      } else {
        throw new Error(result.error || 'Failed to generate emails');
      }
      
    } catch (error) {
      console.error('❌ AI generation failure:', error);
      throw new Error(`AI service unavailable: ${error.message}`);
    }
  }, [user, trackAITokenUsage, showToast, url]);
  
  // Generate email series with AI-first approach
  const handleGenerateEmails = useCallback(async () => {
    const selectedBenefitsList = extractedBenefits.filter((_, index) => selectedBenefits[index]);
    
    if (selectedBenefitsList.length === 0) {
      showToast('Please select at least one benefit', 'error');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const domain = extractDomain(url);      
      let emails = [];
      let aiUsageData = null;
      const userTier = user?.subscription_tier || 'free';
      
      // Show initial generation message
      const tierMessage = userTier === 'gold' ? 'premium AI' : 
                         userTier === 'pro' ? 'professional AI' : 'AI';
      showToast(`Generating ${selectedBenefitsList.length} unique emails with ${tierMessage}...`, 'info');
      
      try {
        // Always attempt AI generation first using centralized API
        const aiResult = await generateEmailsWithAI(
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
        
      } catch (error) {
        console.error('❌ AI generation completely failed:', error);
        showToast('Unable to generate emails. Please check your AI service configuration.', 'error');
        setIsGenerating(false);
        return;
      }
      
      // Validate we have emails
      if (!emails || emails.length === 0) {
        showToast('No emails were generated. Please try again.', 'error');
        setIsGenerating(false);
        return;
      }
      
      // Add comprehensive metadata to emails
      emails = emails.map((email, index) => ({
        ...email,
        emailNumber: index + 1,
        createdAt: new Date().toISOString(),
        seriesName: createSeriesNameFromDomain(domain),
        domain,
        generatedWith: 'AI',
        userTier: userTier,
        aiModel: aiUsageData?.model || 'backend-ai',
        readingLevel: '5th grade',
        isAffilateMarketing: true,
        qualityScore: userTier === 'gold' ? 'Premium' : userTier === 'pro' ? 'Professional' : 'Standard',
        generationMethod: `AI (Backend API)`
      }));
      
      setEmailSeries(emails);
      
      // Track usage comprehensively
      try {
        await trackEmailGeneration(emails.length);
        await trackSeriesCreated(1);
        
        console.log(`✅ Usage tracked: ${emails.length} emails, 1 series for ${userTier} user`);
        
        if (aiUsageData && aiUsageData.totalTokens > 0) {
          console.log(`💰 AI Generation: ${aiUsageData.totalTokens} tokens`);
          console.log(`📊 AI Success Rate: ${aiUsageData.aiSuccessRate}%`);
        }
        
      } catch (trackingError) {
        console.error('⚠️ Error tracking usage:', trackingError);
        // Don't fail the whole operation if tracking fails
      }
      
      // Final success message
      showToast(`🎉 Successfully generated ${emails.length} unique AI emails!`, 'success');
      
      if (onGenerateComplete) {
        onGenerateComplete();
      }
      
    } catch (error) {
      console.error('❌ Email generation error:', error);
      showToast('Failed to generate emails. Please check your AI service and try again.', 'error');
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
    generateEmailsWithAI
  ]);
  
  // Copy current email to clipboard
  const copyEmailToClipboard = useCallback(() => {
    if (emailSeries.length === 0) return;
    
    const email = emailSeries[currentEmailIndex];
    
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
      
      showToast(`Email copied to clipboard as ${exportFormat.toUpperCase()}! (AI Generated)`, 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Failed to copy to clipboard', 'error');
    }
  }, [emailSeries, currentEmailIndex, exportFormat, showToast]);
  
  // Handle export email with enhanced metadata
  const handleExportEmail = useCallback((format) => {
    if (emailSeries.length === 0) return;
    
    const email = emailSeries[currentEmailIndex];
    
    try {
      let content = '';
      let fileName = '';
      let mimeType = '';
      
      // Enhanced metadata for exports
      const metadata = `
Generated with: ${email.generationMethod || 'Backend API'}
User Tier: ${email.userTier || 'free'}
Quality Score: ${email.qualityScore || 'Standard'}
Reading Level: ${email.readingLevel || '5th grade'}
Created: ${new Date(email.createdAt).toLocaleDateString()}
Focus Benefit: ${email.benefit || 'Unknown'}`;
      
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
    .quality-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      margin-right: 10px;
      background: #dcfce7;
      color: #166534;
    }
  </style>
</head>
<body>
  <h1>${email.subject}</h1>
  <div class="quality-badges">
    <span class="quality-badge">🤖 AI Generated</span>
  </div>
  <div class="email-body">${(email.content || email.body).replace(/\n/g, '<br>')}</div>
  <div class="email-meta">
    <strong>Email Metadata:</strong>${metadata}
  </div>
</body>
</html>`;
        fileName = `email-${email.emailNumber}-${email.domain}-${email.userTier}-ai.html`;
        mimeType = 'text/html';
      } else if (format === 'text') {
        content = `Subject: ${email.subject}\n\n${email.content || email.body}\n\n---\nEmail Metadata:${metadata}`;
        fileName = `email-${email.emailNumber}-${email.domain}-${email.userTier}-ai.txt`;
        mimeType = 'text/plain';
      } else if (format === 'markdown') {
        content = `# ${email.subject}\n\n${email.content || email.body}\n\n---\n**Email Metadata:**${metadata}`;
        fileName = `email-${email.emailNumber}-${email.domain}-${email.userTier}-ai.md`;
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
      
      showToast(`Email exported as ${format.toUpperCase()}! (AI Generated)`, 'success');
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
    // Enhanced metadata for UI components
    userTier: user?.subscription_tier || 'free',
    aiAvailableForTier: true, // Always attempt AI first
    generationStats: emailSeries.length > 0 ? {
      total: emailSeries.length,
      aiGenerated: emailSeries.length, // All emails now AI generated
      templateFallback: 0,
      aiSuccessRate: 100
    } : null
  };
};