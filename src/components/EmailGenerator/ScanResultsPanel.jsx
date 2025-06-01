import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component to display and manage scan results and benefit selection
 */
const ScanResultsPanel = ({
  extractedBenefits,
  selectedBenefits,
  toggleBenefit,
  extractedFeatures,
  websiteData,
  onBack,
  onGenerate,
  isGenerating
}) => {
  // Calculate the selected count safely
  const selectedCount = Array.isArray(selectedBenefits) 
    ? selectedBenefits.filter(Boolean).length 
    : 0;

  // Safe array checking
  const hasBenefits = Array.isArray(extractedBenefits) && extractedBenefits.length > 0;
  const hasFeatures = Array.isArray(extractedFeatures) && extractedFeatures.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-neutral-800 mb-2">Select Benefits for Email Series</h2>
      
      <p className="text-neutral-600 mb-6 border-b border-neutral-200 pb-4">
        We've identified the following benefits and features from the sales page. 
        Select the ones you want to focus on in your email series.
      </p>
      
      {websiteData && (
        <div className="bg-neutral-50 rounded-lg p-4 mb-6 border border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-neutral-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Extracted Website Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {websiteData.name && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-500">Product Name:</span>
                <span className="text-neutral-800">{websiteData.name}</span>
              </div>
            )}
            
            {websiteData.description && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-500">Description:</span>
                <span className="text-neutral-800">{websiteData.description}</span>
              </div>
            )}
            
            {websiteData.valueProposition && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-500">Value Proposition:</span>
                <span className="text-neutral-800">{websiteData.valueProposition}</span>
              </div>
            )}
            
            {websiteData.domain && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-500">Domain:</span>
                <span className="text-neutral-800">{websiteData.domain}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mb-6 bg-white border border-neutral-100 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-neutral-700 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 text-neutral-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Product Benefits 
          {selectedCount > 0 && <span className="ml-2 px-2 py-0.5 text-xs bg-brand-50 text-brand-700 rounded-full">{selectedCount} selected</span>}
        </h3>
        <p className="text-sm text-neutral-500 mb-4">Each selected benefit will become a focused email in your series</p>
        
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {hasBenefits ? (
            extractedBenefits.map((benefit, index) => (
              <div 
                key={index} 
                className={`flex items-start p-3 border rounded-md transition-all
                  ${selectedBenefits[index] ? 'bg-brand-50 border-brand-200' : 'border-neutral-100'}
                  hover:bg-neutral-50 hover:border-neutral-200 cursor-pointer`}
                onClick={() => toggleBenefit(index)}
              >
                <input
                  type="checkbox"
                  id={`benefit-${index}`}
                  checked={selectedBenefits[index]}
                  onChange={() => toggleBenefit(index)}
                  className="h-5 w-5 text-brand-600 rounded border-neutral-300 mr-3 mt-0.5 
                  focus:ring-brand-500 cursor-pointer transition-all"
                />
                <label htmlFor={`benefit-${index}`} className="text-neutral-700 cursor-pointer flex-1">
                  {benefit}
                </label>
              </div>
            ))
          ) : (
            <div className="py-6 px-4 bg-neutral-50 rounded-md border border-dashed border-neutral-200 
            flex flex-col items-center justify-center text-center">
              <p className="text-neutral-500 mb-2">No benefits found. Try scanning again with different keywords or try another URL.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-6 bg-white border border-neutral-100 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-neutral-700 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 text-neutral-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          Product Features
        </h3>
        <p className="text-sm text-neutral-500 mb-4">These features will be incorporated across all emails</p>
        
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
          {hasFeatures ? (
            extractedFeatures.map((feature, index) => (
              <div key={index} className="bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-full text-sm">
                {feature}
              </div>
            ))
          ) : (
            <div className="w-full py-6 px-4 bg-neutral-50 rounded-md border border-dashed border-neutral-200 
            flex flex-col items-center justify-center text-center">
              <p className="text-neutral-500 mb-0">No specific features identified.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap justify-between mt-8 gap-4 md:flex-row flex-col">
        <button
          onClick={onBack}
          className="secondary-button"
        >
          Back to Scan
        </button>
        
        <button
          onClick={onGenerate}
          disabled={isGenerating || selectedCount === 0}
          className="primary-button"
        >
          {isGenerating 
            ? 'Generating Emails...' 
            : `Generate ${selectedCount} Email${selectedCount !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
};

ScanResultsPanel.propTypes = {
  extractedBenefits: PropTypes.array,
  selectedBenefits: PropTypes.array,
  toggleBenefit: PropTypes.func.isRequired,
  extractedFeatures: PropTypes.array,
  websiteData: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
  isGenerating: PropTypes.bool
};

ScanResultsPanel.defaultProps = {
  extractedBenefits: [],
  selectedBenefits: [],
  extractedFeatures: [],
  websiteData: null,
  isGenerating: false
};

export default ScanResultsPanel;
