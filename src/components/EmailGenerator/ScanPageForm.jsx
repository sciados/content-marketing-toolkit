// src/components/EmailGenerator/ScanPageForm.jsx
import React from 'react';

/**
 * Form for scanning sales pages
 * Step 1 of the email generation process
 */
const ScanPageForm = ({
  url,
  setUrl,
  keywords,
  setKeywords,
  affiliateLink,
  setAffiliateLink,
  tone,
  setTone,
  industry,
  setIndustry,
  isUsingAI,
  setIsUsingAI,
  aiAvailable,
  isScanning,
  scanProgress,
  scanStage,
  handleScanPage,
  testSupabaseConnection,
  user
}) => {
  return (
    <form onSubmit={handleScanPage} className="scan-form">
      <div className="form-group">
        <label className="form-label">Sales Page URL</label>
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/product"
          className="form-input"
          disabled={isScanning}
        />
        <p className="info-text">Enter the URL of the sales page you want to scan</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Keywords (Optional)</label>
          <input 
            type="text" 
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="weight loss, metabolism, energy, etc."
            className="form-input"
            disabled={isScanning}
          />
          <p className="info-text">Enter comma-separated keywords to help focus the scan</p>
        </div>
        
        <div className="form-group">
          <label className="form-label">Industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="form-select"
            disabled={isScanning}
          >
            <option value="general">General</option>
            <option value="health">Health & Wellness</option>
            <option value="finance">Finance & Investing</option>
            <option value="technology">Technology</option>
            <option value="ecommerce">E-commerce</option>
            <option value="education">Education</option>
            <option value="travel">Travel</option>
            <option value="fitness">Fitness</option>
            <option value="marketing">Marketing</option>
            <option value="saas">SaaS & Software</option>
          </select>
        </div>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Affiliate Link (Optional)</label>
          <input 
            type="text" 
            value={affiliateLink}
            onChange={(e) => setAffiliateLink(e.target.value)}
            placeholder="https://click.example.com/aff=123"
            className="form-input"
            disabled={isScanning}
          />
          <p className="info-text">Your affiliate or promotional link to include in the emails</p>
        </div>
        <div className="form-group">
          <label className="form-label">Email Tone</label>
          <div className="tone-buttons">
            {['persuasive', 'urgent', 'professional', 'friendly', 'educational'].map((toneOption) => (
              <button
                key={toneOption}
                type="button"
                onClick={() => setTone(toneOption)}
                className={`tone-button ${tone === toneOption ? 'active' : ''}`}
                disabled={isScanning}
              >
                {toneOption}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {aiAvailable && (
        <div className="form-group ai-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isUsingAI}
              onChange={() => setIsUsingAI(!isUsingAI)}
              className="toggle-checkbox"
              disabled={isScanning}
            />
            <div className="toggle-switch"></div>
            <span>Use AI-powered email generation (Claude AI)</span>
          </label>
          <p className="info-text">
            {isUsingAI 
              ? 'AI generation creates more personalized, high-quality emails (recommended)' 
              : 'Using template-based generation for faster results'}
          </p>
        </div>
      )}
      
      <button 
        type="submit"
        disabled={isScanning || !url}
        className="primary-button"
      >
        {isScanning ? 'Scanning Page...' : 'Scan Sales Page'}
      </button>
      
      {user && (
        <button 
          type="button" 
          onClick={testSupabaseConnection} 
          className="secondary-button mt-2"
        >
          Test Supabase Connection
        </button>
      )}
      
      {isScanning && (
        <div className="scan-progress">
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
          <div className="scanning-status">{scanStage}</div>
        </div>
      )}
    </form>
  );
};

export default ScanPageForm;
