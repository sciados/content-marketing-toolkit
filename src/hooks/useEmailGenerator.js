// src/hooks/useEmailGenerator.js - UPDATED VERSION
import { useState, useEffect, useCallback } from 'react';
import { emailApi } from '../services/api';

/**
 * Updated hook using centralized API service
 */
export const useEmailGenerator = ({ showToast, onScanComplete }) => {
  // Form inputs
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [tone, setTone] = useState('persuasive');
  const [industry, setIndustry] = useState('general');
  
  // AI state
  const [isUsingAI, setIsUsingAI] = useState(true);
  const [aiAvailable, setAiAvailable] = useState(true);
  
  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  
  // Extracted data
  const [extractedBenefits, setExtractedBenefits] = useState([]);
  const [extractedFeatures, setExtractedFeatures] = useState([]);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [websiteData, setWebsiteData] = useState(null);

  // Email generation state
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [isGeneratingEmails, setIsGeneratingEmails] = useState(false);

  // Check AI availability
  useEffect(() => {
    const checkBackendAvailability = async () => {
      try {
        const health = await emailApi.getHealth();
        const backendAiAvailable = health.services?.claude || health.services?.openai || false;
        setAiAvailable(backendAiAvailable);
        setIsUsingAI(backendAiAvailable);
        console.log('Backend AI services available:', backendAiAvailable);
      } catch (error) {
        console.error('Error checking backend availability:', error);
        setAiAvailable(false);
        setIsUsingAI(false);
      }
    };
    
    checkBackendAvailability();
  }, []);
  
  // Update selected benefits when extracted benefits change
  useEffect(() => {
    if (Array.isArray(extractedBenefits)) {
      setSelectedBenefits(extractedBenefits.map(() => true));
    } else {
      console.warn("extractedBenefits is not an array:", extractedBenefits);
      setSelectedBenefits([]);
      setExtractedBenefits([]);
    }
  }, [extractedBenefits]);
  
  // Toggle benefit selection
  const toggleBenefit = useCallback((index) => {
    setSelectedBenefits(prev => {
      const newSelected = [...prev];
      newSelected[index] = !newSelected[index];
      return newSelected;
    });
  }, []);
  
  // Handle scanning a sales page
  const handleScanPage = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    if (!url) {
      showToast('Please enter a sales page URL', 'error');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      showToast('Please enter a valid URL', 'error');
      return;
    }
    
    setIsScanning(true);
    setScanProgress(0);
    setScanStage('Initializing scan...');
    setExtractedBenefits([]);
    setExtractedFeatures([]);
    setWebsiteData(null);
    
    try {
      console.log('\n🚀 === SCAN PAGE REQUEST START ===');
      
      // Update progress in stages
      const updateProgress = (stage, progress) => {
        setScanStage(stage);
        setScanProgress(progress);
      };
      
      updateProgress('Connecting to backend...', 10);
      await new Promise(r => setTimeout(r, 500));
      
      updateProgress('Analyzing page structure...', 30);
      await new Promise(r => setTimeout(r, 500));
      
      updateProgress('Extracting content with AI...', 60);
      
      // Use centralized API service
      const result = await emailApi.scanPage({
        url: url.trim(),
        keywords: keywords.trim(),
        industry
      });

      console.log('🚀 SCAN: Success response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Page scanning failed');
      }

      updateProgress('Processing results...', 90);
      
      // Set extracted data
      const benefits = result.benefits || [];
      const features = result.features || [];
      const websiteInfo = result.website_data || {};

      setExtractedBenefits(benefits);
      setExtractedFeatures(features);
      setWebsiteData(websiteInfo);

      // Validate results
      if (!Array.isArray(benefits) || benefits.length === 0) {
        console.warn("No benefits found. Using fallback.");
        const fallbackBenefits = [
          "Primary benefit not clearly identified", 
          "Try scanning with more specific keywords", 
          "Check if the page contains clear value propositions"
        ];
        setExtractedBenefits(fallbackBenefits);
      }
      
      updateProgress('Scan completed!', 100);
      showToast(result.message || 'Scan completed successfully!', 'success');
      
      console.log('✅ SCAN: Page scan successful:', {
        benefits: benefits.length,
        features: features.length,
        websiteData: websiteInfo
      });
      
      if (onScanComplete) {
        onScanComplete();
      }
    } catch (error) {
      console.error('❌ SCAN: Page scanning error:', error);
      setScanStage('Scan failed');
      setScanProgress(0);
      showToast(`Failed to scan the page: ${error.message}`, 'error');
      
      // Set fallback benefits
      const fallbackBenefits = [
        "Could not extract benefits from this page",
        "Try a different URL or check if the page is accessible",
        "Manual benefit entry may be required"
      ];
      setExtractedBenefits(fallbackBenefits);
    } finally {
      setIsScanning(false);
    }
  }, [url, keywords, industry, showToast, onScanComplete]);

  // Generate emails
  const generateEmails = useCallback(async () => {
    if (!extractedBenefits.length || !selectedBenefits.some(Boolean)) {
      showToast('Please select at least one benefit to generate emails', 'error');
      return;
    }

    setIsGeneratingEmails(true);
    
    try {
      console.log('\n📧 === EMAIL GENERATION REQUEST START ===');
      
      // Use centralized API service
      const result = await emailApi.generateEmails({
        benefits: extractedBenefits,
        selectedBenefits,
        websiteData,
        tone,
        industry,
        affiliateLink: affiliateLink.trim(),
        isUsingAI,
        aiAvailable
      });

      console.log('📧 EMAIL: Success response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Email generation failed');
      }

      const emails = result.emails || [];
      setGeneratedEmails(emails);

      showToast(result.message || `Generated ${emails.length} emails successfully!`, 'success');
      
      console.log('✅ EMAIL: Email generation successful:', {
        emailsGenerated: emails.length,
        totalTokens: result.total_tokens
      });

      return emails;

    } catch (error) {
      console.error('❌ EMAIL: Email generation error:', error);
      showToast(`Failed to generate emails: ${error.message}`, 'error');
      throw error;
    } finally {
      setIsGeneratingEmails(false);
    }
  }, [extractedBenefits, selectedBenefits, websiteData, tone, industry, affiliateLink, showToast, isUsingAI, aiAvailable]);

  // Clear all data
  const clearData = useCallback(() => {
    setExtractedBenefits([]);
    setExtractedFeatures([]);
    setSelectedBenefits([]);
    setWebsiteData(null);
    setGeneratedEmails([]);
    setScanProgress(0);
    setScanStage('');
  }, []);

  // Get selected benefits
  const getSelectedBenefits = useCallback(() => {
    return extractedBenefits.filter((_, index) => selectedBenefits[index]);
  }, [extractedBenefits, selectedBenefits]);

  return {
    // Form inputs
    url, setUrl,
    keywords, setKeywords,
    affiliateLink, setAffiliateLink,
    tone, setTone,
    industry, setIndustry,
    
    // AI state
    isUsingAI, setIsUsingAI,
    aiAvailable,
    
    // Scanning state
    isScanning,
    scanProgress,
    scanStage,
    
    // Extracted data
    extractedBenefits,
    extractedFeatures,
    websiteData,
    selectedBenefits,
    
    // Email generation
    generatedEmails,
    isGeneratingEmails,
    
    // Methods
    toggleBenefit,
    handleScanPage,
    generateEmails,
    clearData,
    getSelectedBenefits
  };
};