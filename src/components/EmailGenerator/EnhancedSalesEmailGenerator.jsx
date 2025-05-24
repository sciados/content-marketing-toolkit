// src/components/EmailGenerator/EnhancedSalesEmailGenerator - Supabase Version
import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useEmailGenerator } from '../../hooks/useEmailGenerator';
import { useEmailSeries } from '../../hooks/useEmailSeries';
import { useSavedEmails } from '../../hooks/useSavedEmails';
import { useToast } from '../../hooks/useToast';
import ScanPageForm from './ScanPageForm';
import SalesPageEmailPreview from './SalesPageEmailPreview';
// import EmailSeriesPanel from './EmailSeriesPanel';
import ScanResultsPanel from './ScanResultsPanel';
import EmailAnalyticsPanel from './EmailAnalyticsPanel';
import SupabaseEmailDisplay from './SupabaseEmailDisplay';
import Toast from '../Common/Toast';
import '../../styles/salesEmailGenerator.css';

/**
 * Enhanced Sales Email Generator with Supabase integration, broken into smaller modules
 * for improved maintainability and separation of concerns
 */
const EnhancedSalesEmailGenerator = () => {

  // Auth state using custom hook
  const { user } = useSupabaseAuth();
  
  // UI state
  const [currentView, setCurrentView] = useState('input'); // 'input', 'benefits', 'preview', 'saved', 'analytics'
  const [emailLayout, setEmailLayout] = useState('standard'); // 'standard', 'minimal', 'featured'
  const [exportFormat, setExportFormat] = useState('text'); // 'text', 'html', 'markdown'
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  
  // Custom hooks
  const { toast, showToast } = useToast();
  
  // Email generation hooks
  const { 
    url, setUrl,
    keywords, setKeywords,
    affiliateLink, setAffiliateLink,
    tone, setTone,
    industry, setIndustry,
    isUsingAI, setIsUsingAI,
    aiAvailable,
    isScanning, scanProgress, scanStage,
    extractedBenefits, extractedFeatures, websiteData,
    selectedBenefits, toggleBenefit,
    handleScanPage
  } = useEmailGenerator({ showToast, onScanComplete: () => setCurrentView('benefits') });
  
  // Email series management
  const {
    emailSeries, 
    isGenerating,
    handleGenerateEmails,
    handleExportEmail,
    copyEmailToClipboard
  } = useEmailSeries({
    extractedBenefits,
    selectedBenefits,
    websiteData,
    url,
    affiliateLink,
    tone,
    industry,
    isUsingAI,
    aiAvailable,
    emailLayout,
    exportFormat,
    currentEmailIndex,
    showToast,
    onGenerateComplete: () => {
      setCurrentEmailIndex(0);
      setCurrentView('preview');
    }
  });
  
  // Saved emails management
  const {
    savedEmails,
    emailCollections,
    loadingEmails,
    emailLoadError,
    loadSavedEmails,
    handleSaveEmail,
    handleSaveSeries,
    handleDeleteEmail
  } = useSavedEmails({
    user,
    emailSeries,
    currentEmailIndex,
    emailLayout,
    isUsingAI,
    url,
    keywords,
    tone,
    industry,
    showToast
  });
  
  // Load saved emails when switching to saved tab
  useEffect(() => {
    if (currentView === 'saved') {
      loadSavedEmails();
    }
  }, [currentView, loadSavedEmails]);

  return (
    <div className="sales-email-container">
      <div className="sales-email-header">
        <h1 className="sales-email-title">AI Sales Email Generator Pro</h1>
        <p className="sales-email-description">
          Generate professional sales email sequences from any product or landing page
        </p>
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
        
        <div className="tab-connector"></div>
        
        <button 
          onClick={() => setCurrentView('saved')}
          className={`tab-button ${currentView === 'saved' ? 'active' : ''}`}
        >
          <span className="tab-label">Saved ({savedEmails.length})</span>
        </button>
        
        {user && (
          <>
            <div className="tab-connector"></div>
            
            <button 
              onClick={() => setCurrentView('analytics')}
              className={`tab-button ${currentView === 'analytics' ? 'active' : ''}`}
            >
              <span className="tab-label">Analytics</span>
            </button>
          </>
        )}
      </div>
      
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
            aiAvailable={aiAvailable}
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
            onGenerate={handleGenerateEmails}
            isGenerating={isGenerating}
          />
        )}
        
        {/* STEP 3: EMAIL PREVIEW */}
        {currentView === 'preview' && emailSeries.length > 0 && (
          <div className="bg-white rounded-lg p-6">
            {/* Horizontal numbered tabs for emails - numbers only */}
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
            
            {/* Email info showing current position and benefit focus */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">
                Email {currentEmailIndex + 1} of {emailSeries.length}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Focus: {emailSeries[currentEmailIndex].benefit}
              </span>
            </div>
            
            {/* Controls row with layout and export options */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
              {/* Layout selector */}
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
              
              {/* Export options with export button */}
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
              <button
                onClick={() => setCurrentView('benefits')}
                className="px-6 py-2.5 bg-white text-gray-700 rounded-lg font-medium shadow-sm
                  border border-gray-300 hover:bg-gray-50 transition-colors w-full md:w-auto"
              >
                Back to Benefits
              </button>
              
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
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
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
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save All Emails
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* SAVED EMAILS VIEW */}
        {currentView === 'saved' && (
          <>
            {/* Loading state */}
            {loadingEmails && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="spinner mb-4"></div>
                <p className="text-gray-600">Loading saved emails...</p>
              </div>
            )}
            
            {/* Error state */}
            {emailLoadError && !loadingEmails && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading saved emails</h3>
                    <p className="mt-2 text-sm text-red-700">{emailLoadError}</p>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={loadSavedEmails}
                        className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Display saved emails using the Supabase component */}
            {!loadingEmails && !emailLoadError && (
              <SupabaseEmailDisplay 
                emailCollections={emailCollections}
                savedEmails={savedEmails}
                onDeleteEmail={handleDeleteEmail}
                onCopyEmail={(email) => {
                  try {
                    const content = `Subject: ${email.subject || 'No subject'}\n\n${email.body || 'No content'}`;
                    navigator.clipboard.writeText(content);
                    showToast('Email copied to clipboard!', 'success');
                  // eslint-disable-next-line no-unused-vars
                  } catch (error) {
                    showToast('Failed to copy to clipboard', 'error');
                  }
                }}
                onRefresh={loadSavedEmails}
              />
            )}
          </>
        )}
        
        {/* ANALYTICS VIEW */}
        {currentView === 'analytics' && user && (
          <EmailAnalyticsPanel 
            savedEmails={savedEmails}
            emailCollections={emailCollections}
            onCreateNewEmail={() => setCurrentView('input')}
          />
        )}
      </div>
      
      <div className="info-card">
        <div className="info-header">
          <span className="badge">PRO</span>
          <span className="info-title">AI-Powered Email Generator</span>
        </div>
        <p className="info-text">
          This tool scans sales pages, identifies key benefits and features, and generates a series of 
          promotional emails. Each email focuses on a specific benefit to create a compelling
          email sequence for your marketing campaigns. AI-powered generation creates more personalized 
          and high-converting emails.
        </p>
        {!aiAvailable && (
          <div className="warning-text">
            <strong>Note:</strong> AI generation is currently unavailable. Using template-based generation.
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSalesEmailGenerator;