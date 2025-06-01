// src/hooks/useEmailGenerator.js - FIXED AUTH VERSION
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase/supabaseClient'; // ADD THIS IMPORT

// Backend API URL - Using your existing environment variable
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Custom hook for email scanning and generation with backend integration
 * FIXED: Proper Supabase auth token handling
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
   * FIXED: Get auth headers using proper Supabase session
   */
const getAuthHeaders = useCallback(async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.access_token) {
      console.warn('No valid session from supabase.auth.getSession(), trying localStorage fallback');
      
      // FALLBACK: Read directly from localStorage
      const storedAuth = localStorage.getItem('sb-gjqpyfrdxvecxwfsmory-auth-token');
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          if (authData.access_token) {
            console.log('✅ Using auth token from localStorage fallback');
            return {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authData.access_token}`
            };
          }
        } catch (parseError) {
          console.error('Failed to parse stored auth data:', parseError);
        }
      }
      
      console.warn('No valid auth token found anywhere');
      return {
        'Content-Type': 'application/json'
      };
    }
    
    console.log('✅ Using auth token from supabase session');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    };
  } catch (error) {
    console.error('Failed to get auth headers:', error);
    return {
      'Content-Type': 'application/json'
    };
  }
}, []);

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
  
  // FIXED: Handle scanning a sales page using backend API with proper auth
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
      
      updateProgress('Getting auth token...', 20);
      const headers = await getAuthHeaders(); // FIXED: Await the async function
      
      updateProgress('Analyzing page structure...', 30);
      await new Promise(r => setTimeout(r, 500));
      
      updateProgress('Extracting content with AI...', 60);
      
      console.log('🔧 Making scan request with headers:', { 
        hasAuth: !!headers.Authorization,
        url: url.trim()
      });
      
      // FIXED: Call backend API for page scanning with proper auth
      const response = await fetch(`${API_BASE}/api/email-generator/scan-page`, {
        method: 'POST',
        headers, // Now contains proper auth token
        body: JSON.stringify({
          url: url.trim(),
          keywords: keywords.trim(),
          industry
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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
        const fallbackBenefits = [
          "Primary benefit not clearly identified", 
          "Try scanning with more specific keywords", 
          "Check if the page contains clear value propositions"
        ];
        setExtractedBenefits(fallbackBenefits);
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
      const fallbackBenefits = [
        "Could not extract benefits from this page",
        "Try a different URL or check if the page is accessible",
        "Manual benefit entry may be required"
      ];
      setExtractedBenefits(fallbackBenefits);
    } finally {
      setIsScanning(false);
    }
  }, [url, keywords, industry, showToast, onScanComplete, getAuthHeaders]); // Added getAuthHeaders to dependencies

  // FIXED: Generate emails using backend API with proper auth
  const generateEmails = useCallback(async () => {
    if (!extractedBenefits.length || !selectedBenefits.some(Boolean)) {
      showToast('Please select at least one benefit to generate emails', 'error');
      return;
    }

    setIsGeneratingEmails(true);
    
    try {
      const headers = await getAuthHeaders(); // FIXED: Await the async function

      // Add this right after: const headers = await getAuthHeaders();
console.log('🔧 Debug Auth Token:', {
  hasAuthHeader: !!headers.Authorization,
  tokenLength: headers.Authorization?.length,
  tokenStart: headers.Authorization?.substring(0, 50) + '...',
  contentType: headers['Content-Type']
});
      
      // FIXED: Include AI flags in request data
      const requestData = {
        benefits: extractedBenefits,
        selectedBenefits,
        websiteData,
        tone,
        industry,
        affiliateLink: affiliateLink.trim(),
        isUsingAI, // ADDED: Send AI generation flag
        aiAvailable // ADDED: Send AI availability flag
      };
      
      console.log('🔧 Making generate request with headers:', { 
        hasAuth: !!headers.Authorization,
        benefitsCount: extractedBenefits.length
      });
      
      console.log('🔧 Email generation request data:', requestData);
      
      const response = await fetch(`${API_BASE}/api/email-generator/generate`, {
        method: 'POST',
        headers, // Now contains proper auth token
        body: JSON.stringify(requestData) // FIXED: Send complete request data including AI flags
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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
  }, [extractedBenefits, selectedBenefits, websiteData, tone, industry, affiliateLink, showToast, getAuthHeaders, isUsingAI, aiAvailable]); // FIXED: Added missing dependencies

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