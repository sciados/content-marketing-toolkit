// src/hooks/useEmailSeries.js
import { extractDomain, createSeriesNameFromDomain } from '../services/emailGenerator';
import { useState, useCallback } from 'react';
import { generateEmailSeries, generateAIEmailSeries } from '../services/emailGenerator/emailGenerator';

/**
 * Custom hook for email series generation and management
 * Handles generating, exporting, and copying emails
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
  // emailLayout,
  exportFormat,
  currentEmailIndex,
  showToast,
  onGenerateComplete
}) => {

  console.log('🎯 useEmailSeries hook called!');
  
  const [emailSeries, setEmailSeries] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate email series
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
      
      if (isUsingAI && aiAvailable) {
        // Generate emails using Claude AI
        showToast('Generating emails with AI...', 'info');
        
        try {
          emails = await generateAIEmailSeries(
            selectedBenefitsList,
            websiteData,
            {
              domain,
              affiliateLink,
              tone,
              industry
            }
          );
          
          showToast(`Successfully generated ${emails.length} emails with AI!`, 'success');
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
        domain
      }));
      
      setEmailSeries(emails);
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
    onGenerateComplete
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
  </style>
</head>
<body>
  <h1>${email.subject}</h1>
  <div class="email-body">${email.body.replace(/\n/g, '<br>')}</div>
</body>
</html>`;
        fileName = `email-${email.emailNumber}-${email.domain}.html`;
        mimeType = 'text/html';
      } else if (format === 'text') {
        content = `Subject: ${email.subject}\n\n${email.body}`;
        fileName = `email-${email.emailNumber}-${email.domain}.txt`;
        mimeType = 'text/plain';
      } else if (format === 'markdown') {
        content = `# ${email.subject}\n\n${email.body}`;
        fileName = `email-${email.emailNumber}-${email.domain}.md`;
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
    handleExportEmail
  };
};