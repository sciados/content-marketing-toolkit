// src/components/Video2Promo/VideoEmailGenerator.jsx
// Complete UI for Video → Benefits → Email Generation

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loader } from '../ui/Loader';
import { useVideo2PromoEmailGenerator } from '../../shared/hooks/useVideo2PromoEmailGenerator';

export const VideoEmailGenerator = ({ 
  transcript, 
  videoData, 
  user, 
  showToast,
  onEmailsGenerated 
}) => {
  // Form state
  const [keywords, setKeywords] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [tone, setTone] = useState('persuasive');
  const [industry, setIndustry] = useState('general');
  
  // Processing state
  const [currentStep, setCurrentStep] = useState(1); // 1: Extract, 2: Select, 3: Generate
  
  // Hook for video processing and email generation
  const {
    // Video processing
    isProcessingVideo,
    videoProgress,
    videoStage,
    processVideoForBenefits,
    
    // Benefits
    extractedBenefits,
    selectedBenefits,
    toggleBenefit,
    
    // Email generation
    isGeneratingEmails,
    generateEmailsFromBenefits,
    generatedEmails,
    emailUsage,
    
    // Utilities
    reset
  } = useVideo2PromoEmailGenerator({ user, showToast });
  
  // Step 1: Extract benefits from video
  const handleExtractBenefits = async () => {
    const result = await processVideoForBenefits(transcript, videoData, {
      keywords,
      industry
    });
    
    if (result.success) {
      setCurrentStep(2);
    }
  };
  
  // Step 2: Generate emails from selected benefits
  const handleGenerateEmails = async () => {
    const result = await generateEmailsFromBenefits({
      affiliateLink,
      tone,
      industry
    });
    
    if (result.success) {
      setCurrentStep(3);
      if (onEmailsGenerated) {
        onEmailsGenerated(result.emails, result.usage);
      }
    }
  };
  
  // Reset to start over
  const handleStartOver = () => {
    reset();
    setCurrentStep(1);
  };
  
  return (
    <div className="space-y-6">
      
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {[1, 2, 3].map(step => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500'
              }
            `}>
              {step}
            </div>
            {step < 3 && (
              <div className={`
                w-12 h-0.5 mx-2
                ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-600 mb-6">
        <span className="font-medium">
          {currentStep === 1 && 'Extract Benefits'}
          {currentStep === 2 && 'Select Benefits'}
          {currentStep === 3 && 'Generated Emails'}
        </span>
      </div>

      {/* Step 1: Extract Benefits */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Extract Benefits from Video</h3>
          
          {/* Video Info */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-blue-900">
              {videoData?.title || 'YouTube Video'}
            </h4>
            <p className="text-blue-700 text-sm">
              {transcript?.length || 0} transcript segments • Ready for analysis
            </p>
          </div>
          
          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Keywords (optional)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="fitness, weight loss, muscle"
                className="w-full p-2 border border-gray-300 rounded-lg"
                disabled={isProcessingVideo}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                disabled={isProcessingVideo}
              >
                <option value="general">General</option>
                <option value="health">Health & Fitness</option>
                <option value="finance">Finance</option>
                <option value="technology">Technology</option>
                <option value="education">Education</option>
                <option value="ecommerce">E-commerce</option>
              </select>
            </div>
          </div>
          
          {/* Processing State */}
          {isProcessingVideo && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <Loader size="sm" className="mr-2" />
                <span className="text-sm font-medium">{videoStage}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Extract Button */}
          <Button
            onClick={handleExtractBenefits}
            disabled={!transcript || transcript.length === 0 || isProcessingVideo}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            loading={isProcessingVideo}
          >
            {isProcessingVideo ? 'Extracting Benefits...' : 'Extract Benefits from Video'}
          </Button>
        </Card>
      )}

      {/* Step 2: Select Benefits */}
      {currentStep === 2 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Select Benefits for Email Generation</h3>
            <span className="text-sm text-gray-500">
              {selectedBenefits.filter(Boolean).length} of {extractedBenefits.length} selected
            </span>
          </div>
          
          {/* Benefits List */}
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {extractedBenefits.map((benefit, index) => (
              <div
                key={index}
                className={`
                  p-3 border rounded-lg cursor-pointer transition-all
                  ${selectedBenefits[index] 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                  }
                `}
                onClick={() => toggleBenefit(index)}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedBenefits[index]}
                    onChange={() => toggleBenefit(index)}
                    className="mt-1 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{benefit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Email Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="persuasive">Persuasive</option>
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="urgent">Urgent</option>
                <option value="educational">Educational</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Affiliate Link (optional)</label>
              <input
                type="url"
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                placeholder="https://your-affiliate-link.com"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          {/* Token Estimate */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estimated tokens needed:</span>
              <span className="text-lg font-bold text-blue-600">
                {selectedBenefits.filter(Boolean).length * 160}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-600">Remaining tokens:</span>
              <span className="text-sm font-medium">
                {user?.tokens_remaining?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleStartOver}
              variant="outline"
              className="flex-1"
            >
              Start Over
            </Button>
            <Button
              onClick={handleGenerateEmails}
              disabled={selectedBenefits.filter(Boolean).length === 0 || isGeneratingEmails}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              loading={isGeneratingEmails}
            >
              {isGeneratingEmails ? 'Generating Emails...' : 'Generate Email Series'}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Generated Emails */}
      {currentStep === 3 && generatedEmails.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Generated Email Series</h3>
            <div className="text-sm text-gray-500">
              {generatedEmails.length} emails • {emailUsage?.totalTokens || 0} tokens used
            </div>
          </div>
          
          {/* Usage Summary */}
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <div className="flex items-center text-green-800">
              <span className="text-green-600 mr-2">✅</span>
              <span className="font-medium">
                Successfully generated {generatedEmails.length} emails from video benefits!
              </span>
            </div>
            <div className="text-green-700 text-sm mt-1">
              Model: {emailUsage?.modelDisplayName || 'Claude AI'} • 
              Success Rate: {emailUsage?.aiSuccessRate || 100}%
            </div>
          </div>
          
          {/* Email Preview */}
          <div className="space-y-4 mb-6">
            {generatedEmails.slice(0, 2).map((email, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Email {email.emailNumber} of {email.totalEmails}
                  </span>
                  <span className="text-xs text-gray-500">
                    {email.wordCount} words
                  </span>
                </div>
                <h4 className="font-medium mb-2">{email.subject}</h4>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                  {email.body.substring(0, 200)}...
                </div>
              </div>
            ))}
            
            {generatedEmails.length > 2 && (
              <div className="text-center text-sm text-gray-500">
                ... and {generatedEmails.length - 2} more emails
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleStartOver}
              variant="outline"
              className="flex-1"
            >
              Generate More
            </Button>
            <Button
              onClick={() => window.location.href = '/saved-emails'}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              View All Emails
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
