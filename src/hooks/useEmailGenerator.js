// src/hooks/useEmailGenerator.js - UPDATED for Backend Integration
import { useState, useEffect, useCallback } from 'react';

// Backend API URL - Using your existing environment variable
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Custom hook for email scanning and generation with backend integration
 * Handles scanning sales pages and extracting benefits using the Python backend
 */
export const useEmailGenerator = ({ showToast, onScanComplete }) => {
  // Form inputs
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [tone, setTone] = useState('persuasive');
  const [industry, setIndustry] = useState('general');
  
  // AI state
  const [isUsingAI, setIsUsingAI] = useState(true); // Default to true since backend handles AI
  const [aiAvailable, setAiAvailable] = useState(true); // Backend handles AI availability
  
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

  /**
   * Get auth headers for API calls
   */
  const getAuthHeaders = () => {
    const token = localStorage.getItem('supabase.auth.token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Check AI availability by testing backend connection
  useEffect(() => {
    const checkBackendAvailability = async () => {
      try {
        const response = await fetch(`${API_BASE}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          const backendAiAvailable = data.services?.claude || data.services?.openai || false;
          setAiAvailable(backendAiAvailable);
          setIsUsingAI(backendAiAvailable);
          console.log('Backend AI services available:', backendAiAvailable);
        } else {
          setAiAvailable(false);
          setIsUsingAI(false);
          console.warn('Backend not available');
        }
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
  
  // Handle scanning a sales page using backend API
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
      
      // Call backend API for page scanning
      const response = await fetch(`${API_BASE}/api/email-generator/scan-page`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          url: url.trim(),
          keywords: keywords.trim(),
          industry
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to scan page`);
      }

      const result = await response.json();

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
        setExtractedBenefits([
          "Primary benefit not clearly identified", 
          "Try scanning with more specific keywords", 
          "Check if the page contains clear value propositions"
        ]);
      }
      
      updateProgress('Scan completed!', 100);
      showToast(result.message || 'Scan completed successfully!', 'success');
      
      console.log('✅ Page scan successful:', {
        benefits: benefits.length,
        features: features.length,
        websiteData: websiteInfo
      });
      
      if (onScanComplete) {
        onScanComplete();
      }
    } catch (error) {
      console.error('❌ Page scanning error:', error);
      setScanStage('Scan failed');
      setScanProgress(0);
      showToast(`Failed to scan the page: ${error.message}`, 'error');
      
      // Set fallback benefits
      setExtractedBenefits([
        "Could not extract benefits from this page",
        "Try a different URL or check if the page is accessible",
        "Manual benefit entry may be required"
      ]);
    } finally {
      setIsScanning(false);
    }
  }, [url, keywords, industry, showToast, onScanComplete]);

  // Generate emails using backend API
  const generateEmails = useCallback(async () => {
    if (!extractedBenefits.length || !selectedBenefits.some(Boolean)) {
      showToast('Please select at least one benefit to generate emails', 'error');
      return;
    }

    setIsGeneratingEmails(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/email-generator/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          benefits: extractedBenefits,
          selectedBenefits,
          websiteData,
          tone,
          industry,
          affiliateLink: affiliateLink.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Email generation failed`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Email generation failed');
      }

      const emails = result.emails || [];
      setGeneratedEmails(emails);

      showToast(result.message || `Generated ${emails.length} emails successfully!`, 'success');
      
      console.log('✅ Email generation successful:', {
        emailsGenerated: emails.length,
        totalTokens: result.total_tokens
      });

      return emails;

    } catch (error) {
      console.error('❌ Email generation error:', error);
      showToast(`Failed to generate emails: ${error.message}`, 'error');
      throw error;
    } finally {
      setIsGeneratingEmails(false);
    }
  }, [extractedBenefits, selectedBenefits, websiteData, tone, industry, affiliateLink, showToast]);

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