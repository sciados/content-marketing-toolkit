// src/hooks/useEmailGenerator.js - ENHANCED DEBUG VERSION
import { useState, useEffect, useCallback } from 'react';

// Backend API URL - Using your existing environment variable
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Custom hook for email scanning and generation with backend integration
 * ENHANCED DEBUG VERSION - More detailed logging for auth troubleshooting
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

  /**
   * ENHANCED DEBUG: Get auth headers with Vercel→Render CORS fixes
   */
  const getAuthHeaders = useCallback(async () => {
    console.log('🔧 getAuthHeaders: Starting auth header retrieval (Vercel→Render)...');
    
    try {
      // Check localStorage directly
      const storedAuth = localStorage.getItem('sb-gjqpyfrdxvecxwfsmory-auth-token');
      console.log('🔧 getAuthHeaders: Raw localStorage data exists:', !!storedAuth);
      console.log('🔧 getAuthHeaders: Raw data length:', storedAuth?.length || 0);
      
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        console.log('🔧 getAuthHeaders: Parsed auth data keys:', Object.keys(authData));
        console.log('🔧 getAuthHeaders: Has access_token:', !!authData.access_token);
        console.log('🔧 getAuthHeaders: Token length:', authData.access_token?.length || 0);
        console.log('🔧 getAuthHeaders: Token preview:', authData.access_token?.substring(0, 50) + '...');
        
        if (authData.access_token) {
          // VERCEL→RENDER FIX: Enhanced headers for cross-origin requests
          const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authData.access_token}`,
            // Add origin header for better CORS handling
            'Origin': window.location.origin
          };
          
          console.log('🔧 getAuthHeaders: Vercel→Render headers:', {
            hasContentType: !!headers['Content-Type'],
            hasAccept: !!headers['Accept'],
            hasAuthorization: !!headers['Authorization'],
            hasOrigin: !!headers['Origin'],
            origin: headers['Origin'],
            authHeaderLength: headers['Authorization']?.length,
            authHeaderPreview: headers['Authorization']?.substring(0, 70) + '...'
          });
          
          return headers;
        }
      }
      
      console.log('❌ getAuthHeaders: No valid token found, returning basic headers');
      return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin
      };
    } catch (error) {
      console.error('❌ getAuthHeaders: Error processing auth data:', error);
      return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin
      };
    }
  }, []);

        // Enhanced manual auth test function for Render backend
  const testAuthManually = useCallback(async () => {
    console.log('\n🧪 === MANUAL AUTH TEST START (Vercel→Render) ===');
    
    try {
      const headers = await getAuthHeaders();
      console.log('🧪 Manual test headers for Render backend:', headers);
      console.log('🧪 API_BASE URL:', API_BASE);
      
      // Test with a simple endpoint first
      const testResponse = await fetch(`${API_BASE}/api/usage/limits`, {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('🧪 Manual test response from Render:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        ok: testResponse.ok,
        url: testResponse.url,
        type: testResponse.type,
        redirected: testResponse.redirected
      });
      
      // Log response headers
      console.log('🧪 Response headers from Render:');
      for (let [key, value] of testResponse.headers.entries()) {
        console.log(`   ${key}: ${value}`);
      }
      
      const responseText = await testResponse.text();
      console.log('🧪 Manual test response body:', responseText);
      
      return testResponse.ok;
    } catch (error) {
      console.error('🧪 Manual test failed (Vercel→Render):', error);
      return false;
    }
  }, [getAuthHeaders]);

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
  
  // ENHANCED DEBUG: Handle scanning a sales page
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
      
      updateProgress('Getting auth token...', 20);
      const headers = await getAuthHeaders();
      
      // Detailed request logging
      const requestData = {
        url: url.trim(),
        keywords: keywords.trim(),
        industry
      };
      
      console.log('🚀 SCAN: Request details:', {
        endpoint: `${API_BASE}/api/email-generator/scan-page`,
        method: 'POST',
        headers: headers,
        body: requestData
      });
      
      updateProgress('Analyzing page structure...', 30);
      await new Promise(r => setTimeout(r, 500));
      
      updateProgress('Extracting content with AI...', 60);
      
      // Make the request with Vercel→Render CORS handling
      console.log('🚀 SCAN: Making fetch request (Vercel→Render)...');
      const response = await fetch(`${API_BASE}/api/email-generator/scan-page`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestData),
        // Add CORS mode for cross-origin requests
        mode: 'cors',
        credentials: 'omit' // Don't send cookies, rely on Authorization header
      });

      console.log('🚀 SCAN: Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚀 SCAN: Error response body:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to scan page`);
      }

      const result = await response.json();
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
  }, [url, keywords, industry, showToast, onScanComplete, getAuthHeaders]);

  // ENHANCED DEBUG: Generate emails with extensive logging
  const generateEmails = useCallback(async () => {
    if (!extractedBenefits.length || !selectedBenefits.some(Boolean)) {
      showToast('Please select at least one benefit to generate emails', 'error');
      return;
    }

    setIsGeneratingEmails(true);
    
    try {
      console.log('\n📧 === EMAIL GENERATION REQUEST START ===');
      
      const headers = await getAuthHeaders();
      
      const requestData = {
        benefits: extractedBenefits,
        selectedBenefits,
        websiteData,
        tone,
        industry,
        affiliateLink: affiliateLink.trim(),
        isUsingAI,
        aiAvailable
      };
      
      console.log('📧 EMAIL: Request details:', {
        endpoint: `${API_BASE}/api/email-generator/generate`,
        method: 'POST',
        headers: headers,
        body: requestData
      });
      
      console.log('📧 EMAIL: Making fetch request (Vercel→Render)...');
      const response = await fetch(`${API_BASE}/api/email-generator/generate`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestData),
        // Add CORS mode for cross-origin requests
        mode: 'cors',
        credentials: 'omit' // Don't send cookies, rely on Authorization header
      });

      console.log('📧 EMAIL: Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('📧 EMAIL: Error response body:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: Email generation failed`);
      }

      const result = await response.json();
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
  }, [extractedBenefits, selectedBenefits, websiteData, tone, industry, affiliateLink, showToast, getAuthHeaders, isUsingAI, aiAvailable]);

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
    getSelectedBenefits,
    
    // DEBUG METHODS
    testAuthManually,
    getAuthHeaders
  };
};