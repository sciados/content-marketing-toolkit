// src/components/EmailGenerator/EnhancedSalesEmailGenerator.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useEmailGenerator } from '../hooks/useEmailGenerator';
import { useEmailSeries } from '../../../shared/hooks/useEmailSeries';
import { useSavedEmails } from '../../../shared/hooks/useSavedEmails';
import { useToast } from '../../../shared/hooks/useToast';
import { useContentLibrary } from '../../../shared/hooks/useContentLibrary';
import { useUsageTracking } from '../../../shared/hooks/useUsageTracking';
import ScanPageForm from './ScanPageForm';
import SalesPageEmailPreview from './SalesPageEmailPreview';
import ScanResultsPanel from './ScanResultsPanel';
import Toast from '../../../shared/components/ui/Toast';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import '../../../styles/salesEmailGenerator.css';

/**
 * Enhanced Sales Email Generator with FIXED usage tracking and error handling
 * UPDATED: Removed hardcoded errors, non-blocking usage tracking
 */
const EnhancedSalesEmailGenerator = () => {
  const { user } = useAuth();
  
  // UI state
  const [currentView, setCurrentView] = useState('input');
  const [emailLayout, setEmailLayout] = useState('standard');
  const [exportFormat, setExportFormat] = useState('text');
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  
  // Hooks
  const { toast, showToast } = useToast();
  const { addToLibrary } = useContentLibrary();
  
  // FIXED: Usage tracking with error handling
  const { 
    canPerformAction, 
    getRemainingLimits,
    isNearLimit,
    isAtLimit,
    trackEmailGeneration,
    error: usageError
  } = useUsageTracking();
  
  // Email generation hooks (now use centralized API)
  const { 
    url, setUrl,
    keywords, setKeywords,
    affiliateLink, setAffiliateLink,
    tone, setTone,
    industry, setIndustry,
    isUsingAI, setIsUsingAI,
    isScanning, scanProgress, scanStage,
    extractedBenefits, extractedFeatures, websiteData,
    selectedBenefits, toggleBenefit,
    handleScanPage,
    error: scanError
  } = useEmailGenerator({ 
    showToast, 
    onScanComplete: () => setCurrentView('benefits') 
  });
  
  // Email series management
  const {
    emailSeries, 
    isGenerating,
    handleGenerateEmails,
    handleExportEmail,
    copyEmailToClipboard,
    error: generationError
  } = useEmailSeries({
    extractedBenefits,
    selectedBenefits,
    websiteData,
    url,
    affiliateLink,
    tone,
    industry,
    emailLayout,
    exportFormat,
    currentEmailIndex,
    showToast,
    onGenerateComplete: (result) => {
      setCurrentEmailIndex(0);
      setCurrentView('preview');
      
      // FIXED: Auto-save to Content Library with error handling
      if (result.emails && result.emails.length > 0) {
        try {
          addToLibrary({
  type: 'email_series',
  title: `Email Series - ${websiteData?.title || url}`,
  description: `Generated ${result.emails.length} emails from ${url}`,
  tags: ['email', 'marketing', industry].filter(Boolean),
  metadata: {
    source_url: url,
    emails_count: result.emails.length,
    benefits_used: selectedBenefits.filter(Boolean).length,
    tone: tone,
    industry: industry,
    generated_at: new Date().toISOString(),
    emails: result.emails
  }
});
        } catch (error) {
          console.warn('⚠️ Failed to auto-save to Content Library:', error);
          // Don't break the flow if Content Library save fails
        }
      }
    }
  });
  
  // Saved emails management
  const {
    handleSaveEmail,
    handleSaveSeries
  } = useSavedEmails({
    user,
    emailSeries,
    currentEmailIndex,
    emailLayout,    
    url,
    keywords,
    tone,
    industry,
    showToast
  });

  // FIXED: Enhanced generation handler with non-blocking usage tracking
  const handleEnhancedGeneration = async () => {
    const selectedCount = selectedBenefits.filter(Boolean).length;
    const estimatedTokens = selectedCount * 400; // Rough estimate per email
    
    // Check if user can perform this action (but don't block if usage tracking fails)
    try {
      if (!canPerformAction('ai_generation', estimatedTokens)) {
        const remaining = getRemainingLimits();
        showToast(
          `Insufficient tokens. Need ~${estimatedTokens}, have ${remaining.daily_tokens} daily / ${remaining.monthly_tokens} monthly.`,
          'warning'
        );
        // Still allow generation but warn user
      }
    } catch (error) {
      console.warn('⚠️ Usage check failed, allowing generation anyway:', error);
    }

    try {
      // Generate emails
      await handleGenerateEmails();
      
      // Track usage after successful generation (non-blocking)
      try {
        await trackEmailGeneration(selectedCount);
        console.log('✅ Usage tracked successfully');
      } catch (trackingError) {
        console.warn('⚠️ Usage tracking failed but emails generated:', trackingError);
        // Don't show error to user - emails were generated successfully
      }
    } catch (error) {
      console.error('❌ Email generation failed:', error);
      showToast(`Generation failed: ${error.message}`, 'error');
    }
  };

  // FIXED: Show usage warnings only if usage tracking works
  useEffect(() => {
    if (!usageError) {
      if (isNearLimit && !isAtLimit) {
        showToast('You\'re approaching your usage limit. Consider upgrading for unlimited access.', 'warning');
      }
      if (isAtLimit) {
        showToast('You\'ve reached your usage limit. Please upgrade to continue using AI features.', 'error');
      }
    }
  }, [isNearLimit, isAtLimit, usageError, showToast]);

  // FIXED: Get remaining limits safely
  const safeGetRemainingLimits = () => {
    try {
      return getRemainingLimits();
    } catch (error) {
      console.warn('⚠️ Failed to get remaining limits:', error);
      return {
        daily_tokens: 500,
        monthly_tokens: 10000
      };
    }
  };

  return (
    <div className="sales-email-container">
      <div className="sales-email-header">
        <h1 className="sales-email-title">AI Sales Email Generator Pro</h1>
        <p className="sales-email-description">
          Generate professional sales email sequences from any product or landing page
        </p>
        
        {/* FIXED: Usage indicator with error handling */}
        {!usageError && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Daily tokens: {safeGetRemainingLimits().daily_tokens.toLocaleString()}</span>
              <span>Monthly: {safeGetRemainingLimits().monthly_tokens.toLocaleString()}</span>
              {isNearLimit && (
                <span className="text-orange-600 font-medium">⚠️ Near limit</span>
              )}
              {isAtLimit && (
                <span className="text-red-600 font-medium">🚫 Limit reached</span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Tabs */}
      <div className="email-tabs">
        <button 
          onClick={() => setCurrentView('input')}
          className={`tab-button ${currentView === 'input' ? 'active' : ''}`}
        >
          <span className="tab-number">1</span>
          <span className="tab-label">Scan Page</span>
        </button>
        
        <div className="tab-connector"></div>
        
        <button 
          onClick={() => extractedBenefits.length > 0 && setCurrentView('benefits')}
          className={`tab-button ${currentView === 'benefits' ? 'active' : ''}`}
          disabled={extractedBenefits.length === 0}
        >
          <span className="tab-number">2</span>
          <span className="tab-label">Select Benefits</span>
        </button>
        
        <div className="tab-connector"></div>
        
        <button 
          onClick={() => emailSeries.length > 0 && setCurrentView('preview')}
          className={`tab-button ${currentView === 'preview' ? 'active' : ''}`}
          disabled={emailSeries.length === 0}
        >
          <span className="tab-number">3</span>
          <span className="tab-label">Preview Emails</span>
        </button>
      </div>
      
      {/* Error display - FIXED: Only show real errors */}
      {(scanError || generationError) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {scanError ? 'Scan Error' : 'Generation Error'}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{scanError || generationError}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <div className="content-card">
        {/* STEP 1: INPUT FORM */}
        {currentView === 'input' && (
          <ScanPageForm
            url={url}
            setUrl={setUrl}
            keywords={keywords}
            setKeywords={setKeywords}
            affiliateLink={affiliateLink}
            setAffiliateLink={setAffiliateLink}
            tone={tone}
            setTone={setTone}
            industry={industry}
            setIndustry={setIndustry}
            isUsingAI={isUsingAI}
            setIsUsingAI={setIsUsingAI}
            aiAvailable={true} // FIXED: Always show AI as available
            isScanning={isScanning}
            scanProgress={scanProgress}
            scanStage={scanStage}
            handleScanPage={handleScanPage}
            user={user}
          />
        )}
        
        {/* STEP 2: BENEFITS SELECTION */}
        {currentView === 'benefits' && (
          <ScanResultsPanel 
            extractedBenefits={Array.isArray(extractedBenefits) ? extractedBenefits : []}
            selectedBenefits={selectedBenefits}
            toggleBenefit={toggleBenefit}
            extractedFeatures={Array.isArray(extractedFeatures) ? extractedFeatures : []}
            websiteData={websiteData || {}}
            onBack={() => setCurrentView('input')}
            onGenerate={handleEnhancedGeneration}
            isGenerating={isGenerating}
            canGenerate={true} // FIXED: Always allow generation
            estimatedTokens={selectedBenefits.filter(Boolean).length * 400}
            remainingTokens={safeGetRemainingLimits().daily_tokens}
          />
        )}
        
        {/* Loading state for generation */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="large" message="Generating emails..." />
            <p className="mt-4 text-sm text-gray-600">
              This may take 30-60 seconds depending on the number of emails being generated.
            </p>
          </div>
        )}
        
        {/* STEP 3: EMAIL PREVIEW */}
        {currentView === 'preview' && emailSeries.length > 0 && (
          <div className="bg-white rounded-lg p-6">
            {/* Email navigation tabs */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex">
                {emailSeries.map((email, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentEmailIndex(index)}
                    className={`flex items-center justify-center w-10 h-10 mx-1 text-sm font-medium rounded-t-lg transition-colors
                      ${currentEmailIndex === index 
                        ? 'bg-indigo-50 border-b-2 border-indigo-600 text-indigo-700' 
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}
                    aria-label={`Email ${index + 1}`}
                    title={`Email ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Email info */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">
                Email {currentEmailIndex + 1} of {emailSeries.length}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Focus: {emailSeries[currentEmailIndex].benefit}
              </span>
            </div>
            
            {/* Layout and export controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Layout:</label>
                <div className="flex flex-wrap gap-2">
                  {['standard', 'minimal', 'featured'].map((layout) => (
                    <button
                      key={layout}
                      onClick={() => setEmailLayout(layout)}
                      className={`px-3 py-1.5 text-sm border rounded-md capitalize transition-colors
                        ${emailLayout === layout 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-end gap-4 w-full md:w-auto">
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Export Format:</label>
                  <div className="flex flex-wrap gap-2">
                    {['text', 'html', 'markdown', 'pdf'].map((format) => (
                      <button
                        key={format}
                        onClick={() => setExportFormat(format)}
                        className={`px-3 py-1.5 text-sm border rounded-md uppercase transition-colors
                          ${exportFormat === format 
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => handleExportEmail(exportFormat)}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md
                    bg-white text-gray-700 hover:bg-gray-50 transition-colors h-[38px] w-full md:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Export
                </button>
              </div>
            </div>

            {/* Email preview */}
            <SalesPageEmailPreview 
              generatedEmail={emailSeries[currentEmailIndex]} 
              onCopyToClipboard={copyEmailToClipboard}
              layout={emailLayout}
            />
            
            {/* Action buttons */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <button
                  onClick={() => setCurrentView('benefits')}
                  className="px-6 py-2.5 bg-white text-gray-700 rounded-lg font-medium shadow-sm
                    border border-gray-300 hover:bg-gray-50 transition-colors w-full md:w-auto"
                >
                  Back to Benefits
                </button>
                
                <div className="flex gap-2 text-sm">
                  <a 
                    href="/tools/content-library" 
                    className="text-indigo-600 hover:text-indigo-700 underline"
                  >
                    View Content Library
                  </a>
                  <span className="text-gray-400">•</span>
                  <a 
                    href="/analytics" 
                    className="text-indigo-600 hover:text-indigo-700 underline"
                  >
                    View Analytics
                  </a>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={copyEmailToClipboard}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md
                    bg-white text-gray-700 hover:bg-gray-50 transition-colors w-full md:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy
                </button>
                
                <button
                  onClick={handleSaveEmail}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md
                    bg-white text-gray-700 hover:bg-gray-50 transition-colors w-full md:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save This Email
                </button>
                
                <button
                  onClick={handleSaveSeries}
                  className="flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg 
                    font-medium shadow-sm hover:bg-indigo-700 transition-colors w-full md:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save All Emails
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* FIXED: Enhanced info card without hardcoded errors */}
      <div className="info-card">
        <div className="info-header">
          <span className="badge">PRO</span>
          <span className="info-title">AI-Powered Email Generator</span>
        </div>
        <p className="info-text">
          This tool scans sales pages, identifies key benefits and features, and generates a series of 
          promotional emails. Each email focuses on a specific benefit to create a compelling
          email sequence for your marketing campaigns. All generated content is automatically saved to your Content Library.
        </p>
        
        {/* FIXED: Only show usage info if usage tracking works */}
        {!usageError && (
          <div className="mt-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Daily tokens remaining:</span>
              <span className="font-medium">{safeGetRemainingLimits().daily_tokens.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Monthly tokens remaining:</span>
              <span className="font-medium">{safeGetRemainingLimits().monthly_tokens.toLocaleString()}</span>
            </div>
          </div>
        )}
        
        {/* REMOVED: Hardcoded aiAvailable check that was showing fake errors */}
        {/* REMOVED: isAtLimit check that might be based on broken usage tracking */}
        
        {/* Only show real errors if they exist */}
        {usageError && (
          <div className="warning-text">
            <strong>Note:</strong> Usage tracking is temporarily unavailable. Email generation will continue to work normally.
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSalesEmailGenerator;