// src/hooks/useEmailGenerator.js
import { useState, useEffect, useCallback } from 'react';
import { scanSalesPage, extractDomain } from '../services/emailGenerator';
import claudeAIService from '../services/ai/claudeAIService';

/**
 * Custom hook for email scanning and generation
 * Handles scanning sales pages and extracting benefits
 */
export const useEmailGenerator = ({ showToast, onScanComplete }) => {
  // Form inputs
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [tone, setTone] = useState('persuasive');
  const [industry, setIndustry] = useState('general');
  
  // AI state
  const [isUsingAI, setIsUsingAI] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  
  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  
  // Extracted data
  const [extractedBenefits, setExtractedBenefits] = useState([]);
  const [extractedFeatures, setExtractedFeatures] = useState([]);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [websiteData, setWebsiteData] = useState(null);
  
  // Check if Claude AI is available on mount
  useEffect(() => {
    const checkAiAvailability = async () => {
      try {
        const available = await claudeAIService.isAvailable();
        setAiAvailable(available);
        setIsUsingAI(available); // Default to using AI if available
        console.log('Claude AI service available:', available);
      } catch (error) {
        console.error('Error checking AI availability:', error);
        setAiAvailable(false);
        setIsUsingAI(false);
      }
    };
    
    checkAiAvailability();
  }, []);
  
  // Update selected benefits when extracted benefits change
  useEffect(() => {
    if (Array.isArray(extractedBenefits)) {
      setSelectedBenefits(extractedBenefits.map(() => true));
    } else {
      // Handle the case where extractedBenefits is not an array
      console.warn("extractedBenefits is not an array:", extractedBenefits);
      setSelectedBenefits([]);
      // Initialize extractedBenefits as an empty array if it's not already an array
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
      
      // Scan the page using our improved utility
      updateProgress('Analyzing page structure...', 10);
      await new Promise(r => setTimeout(r, 500));
      
      updateProgress('Extracting page content...', 30);
      await new Promise(r => setTimeout(r, 500));
      
      updateProgress('Identifying key benefits and features...', 50);
      await new Promise(r => setTimeout(r, 500));
      
      updateProgress('Processing extracted data...', 70);
      const { benefits, features, websiteData } = await scanSalesPage(url, keywords, industry);
      
      updateProgress('Finalizing results...', 90);
      setExtractedBenefits(benefits);
      if (!Array.isArray(benefits) || benefits.length === 0) {
        console.warn("No benefits found or benefits is not an array. Using fallback.");
        setExtractedBenefits(["Benefit not found", "Try scanning with different keywords", "Try a different URL"]);
      }
      setExtractedFeatures(features);
      setWebsiteData(websiteData);
      
      updateProgress('Scan completed!', 100);
      showToast('Scan completed successfully!', 'success');
      
      if (onScanComplete) {
        onScanComplete();
      }
    } catch (error) {
      console.error('Error scanning page:', error);
      showToast(`Failed to scan the page: ${error.message}`, 'error');
    } finally {
      setIsScanning(false);
    }
  }, [url, keywords, industry, showToast, onScanComplete]);
  
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
    
    // Methods
    toggleBenefit,
    handleScanPage
  };
};