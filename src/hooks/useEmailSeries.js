// src/hooks/useEmailSeries.js - COMPLETELY FIXED for AI-first approach
import { useState, useCallback } from 'react';
import { generateAIEmailSeries } from '../services/emailGenerator/emailGenerator';
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
 * Templates only used as absolute last resort when all AI attempts fail
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

  console.log('🎯 useEmailSeries hook initialized with AI-first approach');
  
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
   * Enhanced AI email generation with comprehensive retry logic
   * Templates only as absolute last resort
   */
  const generateEmailsWithAI = useCallback(async (selectedBenefitsList, websiteData, options) => {
    try {
      const userTier = user?.subscription_tier || 'free';
      
      console.log('🤖 Starting AI-first email generation with tier:', userTier);
      console.log('🎯 Benefits to process:', selectedBenefitsList.length);
      
      // Always try AI first, regardless of settings
      const result = await generateAIEmailSeries(
        selectedBenefitsList,
        websiteData,
        {
          ...options,
          userTier: userTier,
          user: user
        }
      );
      
      // Process results
      if (result.usage) {
        console.log('🤖 AI Generation Complete:', {
          emails: result.emails?.length || 0,
          model: result.usage.modelDisplayName,
          totalTokens: result.usage.totalTokens,
          estimatedCost: `$${result.usage.estimatedCost.toFixed(6)}`,
          aiSuccessRate: `${result.usage.aiSuccessRate}%`,
          aiFailures: result.usage.aiFailureCount
        });
        
        // Track actual AI tokens used
        if (result.usage.totalTokens > 0) {
          await trackAITokenUsage(result.usage.totalTokens);
          console.log(`✅ Tracked ${result.usage.totalTokens} AI tokens for ${userTier} tier`);
        }
        
        // Show success/warning messages based on AI success rate
        if (result.usage.aiSuccessRate === 100) {
          showToast(`All ${result.emails.length} emails generated with AI! 🤖`, 'success');
        } else if (result.usage.aiSuccessRate >= 80) {
          showToast(`${result.usage.aiSuccessRate}% AI generated, ${result.usage.aiFailureCount} template fallbacks`, 'warning');
        } else {
          showToast(`Warning: Only ${result.usage.aiSuccessRate}% AI generated. Check your AI service.`, 'error');
        }
        
        return {
          emails: result.emails || [],
          usage: result.usage
        };
      } else {
        // Fallback handling for old format
        const emails = Array.isArray(result) ? result : [result];
        console.log('📝 Using fallback result processing');
        
        return {
          emails: emails,
          usage: {
            totalTokens: 0,
            estimatedCost: 0,
            model: 'fallback',
            aiSuccessRate: 0,
            aiFailureCount: emails.length
          }
        };
      }
      
    } catch (error) {
      console.error('❌ Complete AI generation failure:', error);
      
      // Absolute last resort - show clear error message
      showToast('AI service completely unavailable. Please check your configuration.', 'error');
      
      // Return empty result to prevent template fallback
      throw new Error('AI service unavailable - no fallback templates will be used');
    }
  }, [user, trackAITokenUsage, showToast]);
  
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
        // Always attempt AI generation first
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
        
        // Don't fallback to templates - show error instead
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
        generatedWith: email.generatedWithAI ? 'AI' : 'Template (Last Resort)',
        userTier: userTier,
        aiModel: aiUsageData?.model || null,
        readingLevel: '5th grade',
        isAffilateMarketing: true,
        // Add quality indicators
        qualityScore: email.generatedWithAI ? 
          (userTier === 'gold' ? 'Premium' : userTier === 'pro' ? 'Professional' : 'Standard') : 
          'Basic Template',
        generationMethod: email.generatedWithAI ? 
          `AI (${aiUsageData?.modelDisplayName || 'Unknown'})` : 
          'Template Fallback'
      }));
      
      setEmailSeries(emails);
      
      // Track usage comprehensively
      try {
        await trackEmailGeneration(emails.length);
        await trackSeriesCreated(1);
        
        console.log(`✅ Usage tracked: ${emails.length} emails, 1 series for ${userTier} user`);
        
        if (aiUsageData && aiUsageData.estimatedCost > 0) {
          console.log(`💰 AI Generation Cost: $${aiUsageData.estimatedCost.toFixed(6)} (${aiUsageData.totalTokens} tokens)`);
          console.log(`📊 AI Success Rate: ${aiUsageData.aiSuccessRate}%`);
        }
        
      } catch (trackingError) {
        console.error('⚠️ Error tracking usage:', trackingError);
        // Don't fail the whole operation if tracking fails
      }
      
      // Final success message with details
      const aiCount = emails.filter(e => e.generatedWithAI).length;
      const templateCount = emails.filter(e => !e.generatedWithAI).length;
      
      if (templateCount === 0) {
        showToast(`🎉 Successfully generated ${emails.length} unique AI emails!`, 'success');
      } else {
        showToast(`Generated ${aiCount} AI emails, ${templateCount} template fallbacks`, 'warning');
      }
      
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
        content = `Subject: ${email.subject}\n\n${email.body}`;
      } else if (exportFormat === 'html') {
        content = `<h2>${email.subject}</h2>\n<div>${email.body.replace(/\n/g, '<br>')}</div>`;
      } else if (exportFormat === 'markdown') {
        content = `# ${email.subject}\n\n${email.body}`;
      }
      
      navigator.clipboard.writeText(content);
      
      // Enhanced success message with quality info
      const qualityInfo = email.generatedWithAI ? ' (AI Generated)' : ' (Template)';
      showToast(`Email copied to clipboard as ${exportFormat.toUpperCase()}!${qualityInfo}`, 'success');
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
Generated with: ${email.generationMethod || email.generatedWith}
User Tier: ${email.userTier || 'free'}
Quality Score: ${email.qualityScore || 'Unknown'}
Reading Level: ${email.readingLevel || '5th grade'}
Word Count: ${email.wordCount || 'Unknown'}
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
    }
    .ai-generated { background: #dcfce7; color: #166534; }
    .template-fallback { background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <h1>${email.subject}</h1>
  <div class="quality-badges">
    <span class="quality-badge ${email.generatedWithAI ? 'ai-generated' : 'template-fallback'}">
      ${email.generatedWithAI ? '🤖 AI Generated' : '📝 Template'}
    </span>
  </div>
  <div class="email-body">${email.body.replace(/\n/g, '<br>')}</div>
  <div class="email-meta">
    <strong>Email Metadata:</strong>${metadata}
  </div>
</body>
</html>`;
        fileName = `email-${email.emailNumber}-${email.domain}-${email.userTier}-${email.generatedWithAI ? 'ai' : 'template'}.html`;
        mimeType = 'text/html';
      } else if (format === 'text') {
        content = `Subject: ${email.subject}\n\n${email.body}\n\n---\nEmail Metadata:${metadata}`;
        fileName = `email-${email.emailNumber}-${email.domain}-${email.userTier}-${email.generatedWithAI ? 'ai' : 'template'}.txt`;
        mimeType = 'text/plain';
      } else if (format === 'markdown') {
        content = `# ${email.subject}\n\n${email.body}\n\n---\n**Email Metadata:**${metadata}`;
        fileName = `email-${email.emailNumber}-${email.domain}-${email.userTier}-${email.generatedWithAI ? 'ai' : 'template'}.md`;
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
      
      const qualityInfo = email.generatedWithAI ? ' (AI Generated)' : ' (Template)';
      showToast(`Email exported as ${format.toUpperCase()}!${qualityInfo}`, 'success');
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
      aiGenerated: emailSeries.filter(e => e.generatedWithAI).length,
      templateFallback: emailSeries.filter(e => !e.generatedWithAI).length,
      aiSuccessRate: Math.round((emailSeries.filter(e => e.generatedWithAI).length / emailSeries.length) * 100)
    } : null
  };
};