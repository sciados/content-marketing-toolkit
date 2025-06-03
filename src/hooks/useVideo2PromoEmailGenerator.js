// src/hooks/useVideo2PromoEmailGenerator.js
// Complete integration hook for Video2Promo → Email Generation

import { useState, useCallback } from 'react';
import { nlpService } from '../services/video2promo/nlpService';
import { emailApi } from '../services/api'; // Use centralized API
import { useUsageTracking } from './useUsageTracking';

export const useVideo2PromoEmailGenerator = ({ user, showToast }) => {
  // Video processing state
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStage, setVideoStage] = useState('');
  
  // Benefits extraction state
  const [extractedBenefits, setExtractedBenefits] = useState(/** @type {string[]} */ ([]));
  const [selectedBenefits, setSelectedBenefits] = useState(/** @type {boolean[]} */ ([]));
  const [videoData, setVideoData] = useState(null);
  
  // Email generation state
  const [isGeneratingEmails, setIsGeneratingEmails] = useState(false);
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [emailUsage, setEmailUsage] = useState(null);
  
  // Usage tracking
  const { trackUsage, checkCanUseTokens } = useUsageTracking();
  
  // Process video and extract benefits
  const processVideoForBenefits = useCallback(async (transcript, videoMetadata, options = {}) => {
    try {
      setIsProcessingVideo(true);
      setVideoProgress(0);
      setVideoStage('Analyzing video transcript...');
      
      // Stage 1: Convert transcript to email format (your bridge function)
      setVideoProgress(25);
      setVideoStage('Extracting benefits and features...');
      
      const convertedData = await nlpService.convertTranscriptToEmailFormat(
        transcript,
        videoMetadata,
        {
          keywords: options.keywords || '',
          industry: options.industry || 'general',
          userTier: user?.subscription_tier || 'free',
          user: user
        }
      );
      
      if (!convertedData.success) {
        throw new Error(`Failed to extract benefits: ${convertedData.error}`);
      }
      
      // Stage 2: Process and validate benefits
      setVideoProgress(75);
      setVideoStage('Processing extracted data...');
      
      const benefits = convertedData.benefits || [];
      const features = convertedData.features || [];
      
      if (benefits.length === 0) {
        throw new Error('No benefits could be extracted from this video');
      }
      
      // Stage 3: Finalize
      setVideoProgress(100);
      setVideoStage('Benefits extracted successfully!');
      
      // Set state
      setExtractedBenefits(benefits);
      setSelectedBenefits(benefits.map(() => true)); // All selected by default
      setVideoData(convertedData.websiteData);
      
      showToast(`Successfully extracted ${benefits.length} benefits from video!`, 'success');
      
      return {
        success: true,
        benefits,
        features,
        websiteData: convertedData.websiteData
      };
      
    } catch (error) {
      console.error('Video benefit extraction failed:', error);
      showToast(`Failed to extract benefits: ${error.message}`, 'error');
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsProcessingVideo(false);
    }
  }, [user, showToast]);
  
  // Generate emails from selected benefits using centralized API
  const generateEmailsFromBenefits = useCallback(async (options = {}) => {
    try {
      // Get selected benefits
      const selectedBenefitList = extractedBenefits.filter((_, index) => selectedBenefits[index]);
      
      if (selectedBenefitList.length === 0) {
        throw new Error('Please select at least one benefit to generate emails');
      }
      
      // Estimate token usage
      const estimatedTokens = selectedBenefitList.length * 160; // ~160 tokens per email
      
      // Check if user has enough tokens
      const canUse = await checkCanUseTokens(estimatedTokens);
      if (!canUse.allowed) {
        throw new Error(`Insufficient tokens. You need ${canUse.needed} more tokens.`);
      }
      
      setIsGeneratingEmails(true);
      
      // Generate emails using centralized emailApi
      const emailResult = await emailApi.generateEmails({
        benefits: selectedBenefitList,
        selectedBenefits: selectedBenefitList.map(() => true),
        websiteData: videoData,
        tone: options.tone || 'persuasive',
        industry: options.industry || 'general',
        affiliateLink: options.affiliateLink || ''
      });
      
      if (!emailResult.success || !emailResult.emails || emailResult.emails.length === 0) {
        throw new Error(emailResult.error || 'Failed to generate emails');
      }
      
      // Track token usage
      if (emailResult.total_tokens) {
        await trackUsage(emailResult.total_tokens, 'email_generation', {
          source: 'video2promo',
          emailCount: emailResult.emails.length,
          benefitCount: selectedBenefitList.length
        });
      }
      
      // Process emails to match expected format
      const processedEmails = emailResult.emails.map((email, index) => ({
        ...email,
        id: `video-email-${index + 1}`,
        emailNumber: index + 1,
        createdAt: new Date().toISOString(),
        source: 'video2promo',
        benefit: selectedBenefitList[index] || email.benefit,
        domain: videoData?.domain || 'YouTube Video',
        generatedWithAI: true,
        generationMethod: 'backend-api'
      }));
      
      // Set results
      setGeneratedEmails(processedEmails);
      setEmailUsage({
        totalTokens: emailResult.total_tokens || 0,
        model: 'backend-ai',
        aiSuccessRate: 100,
        totalEmails: processedEmails.length
      });
      
      showToast(`Successfully generated ${processedEmails.length} emails!`, 'success');
      
      return {
        success: true,
        emails: processedEmails,
        usage: {
          totalTokens: emailResult.total_tokens || 0,
          model: 'backend-ai',
          aiSuccessRate: 100,
          totalEmails: processedEmails.length
        }
      };
      
    } catch (error) {
      console.error('Email generation failed:', error);
      showToast(`Failed to generate emails: ${error.message}`, 'error');
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsGeneratingEmails(false);
    }
  }, [extractedBenefits, selectedBenefits, videoData, showToast, checkCanUseTokens, trackUsage]);
  
  // Toggle benefit selection
  const toggleBenefit = useCallback((index) => {
    setSelectedBenefits(prev => {
      const newSelected = [...prev];
      newSelected[index] = !newSelected[index];
      return newSelected;
    });
  }, []);
  
  // Reset all state
  const reset = useCallback(() => {
    setExtractedBenefits([]);
    setSelectedBenefits([]);
    setVideoData(null);
    setGeneratedEmails([]);
    setEmailUsage(null);
    setVideoProgress(0);
    setVideoStage('');
  }, []);
  
  return {
    // Video processing
    isProcessingVideo,
    videoProgress,
    videoStage,
    processVideoForBenefits,
    
    // Benefits
    extractedBenefits,
    selectedBenefits,
    toggleBenefit,
    videoData,
    
    // Email generation
    isGeneratingEmails,
    generateEmailsFromBenefits,
    generatedEmails,
    emailUsage,
    
    // Utilities
    reset
  };
};