// src/components/EmailGenerator/SalesPageEmailPreview.jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced component for displaying the generated sales email
 * with layout options and improved styling
 */
const SalesPageEmailPreview = ({ generatedEmail, onCopyToClipboard, layout = 'standard' }) => {
  // Check if generatedEmail exists and has the expected properties
  const hasContent = generatedEmail && generatedEmail.subject && generatedEmail.body;

  // Format email body with appropriate HTML
  const formatEmailContent = (content) => {
    if (!content) return '';
    
    // Convert line breaks to <br> tags for proper HTML display
    let formatted = content.replace(/\n/g, '<br>');
    
    // Convert markdown-style links to HTML links
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Convert **text** to <strong>text</strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle bullet lists
    formatted = formatted.replace(/^- (.*?)$/gm, '<li>$1</li>').replace(/<li>.*?<\/li>/gs, match => `<ul>${match}</ul>`);
    
    // Fix any duplicate <ul> tags (in case multiple bullet lists got wrapped individually)
    formatted = formatted.replace(/<\/ul>\s*<ul>/g, '');
    
    return formatted;
  };

  // Get layout class based on selected layout
  const getLayoutClass = () => {
    switch (layout) {
      case 'minimal':
        return 'email-layout-minimal';
      case 'featured':
        return 'email-layout-featured';
      default:
        return 'email-layout-standard';
    }
  };

  return (
    <div className={`email-preview-container ${getLayoutClass()}`}>
      <div className="email-preview-header">
        <h2 className="preview-title">
          Ai
          {generatedEmail?.generatedWithAI && (
            <span className="ai-badge"> Generated Email</span>
          )}
        </h2>
        
        {hasContent && (
          <div className="preview-controls">
            <button
              onClick={onCopyToClipboard}
              className="control-button"
            >
              <i className="icon-copy"></i> Copy
            </button>
          </div>
        )}
      </div>
      
      {!hasContent ? (
        <div className="empty-preview"> 
          <div className="empty-preview-content">
            <i className="icon-email-large"></i>
            <p>Enter a sales page URL and select your options, then click "Generate Email" to create your email.</p>
          </div>
        </div>
      ) : (
        <div className="email-preview-content">
          <div className="email-header">
            <div className="email-meta">
              <div><strong>From:</strong> Your Name &lt;you@example.com&gt;</div>
              <div><strong>To:</strong> Recipient &lt;recipient@example.com&gt;</div>
              {layout === 'featured' && generatedEmail.benefit && (
                <div className="email-tag">Focus: {generatedEmail.benefit}</div>
              )}
            </div>
            
            <div className="email-subject-container">
              <div className="email-subject-label">Subject:</div>
              <div className="email-subject-text">{generatedEmail.subject}</div>
            </div>
          </div>
          
          <div className={`email-body ${layout === 'featured' ? 'email-body-featured' : ''}`}>
            {layout === 'featured' && generatedEmail.domain && (
              <div className="email-branding">
                <div className="company-logo">
                  <span>{generatedEmail.domain.charAt(0).toUpperCase()}</span>
                </div>
                <div className="company-name">{generatedEmail.domain}</div>
              </div>
            )}
            
            <div 
              className="email-content"
              dangerouslySetInnerHTML={{ 
                __html: formatEmailContent(generatedEmail.body) 
              }}
            />
            
            {layout === 'featured' && (
              <div className="email-footer">
                <div className="footer-links">
                  <a href="#">Unsubscribe</a> | 
                  <a href="#">View in browser</a> | 
                  <a href="#">Privacy Policy</a>
                </div>
                <div className="footer-address">
                  Your Company, Inc. • 123 Main St • City, ST 12345
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

SalesPageEmailPreview.propTypes = {
  generatedEmail: PropTypes.shape({
    subject: PropTypes.string,
    body: PropTypes.string,
    benefit: PropTypes.string,
    generatedWithAI: PropTypes.bool,
    domain: PropTypes.string
  }),
  onCopyToClipboard: PropTypes.func,
  layout: PropTypes.oneOf(['standard', 'minimal', 'featured'])
};

SalesPageEmailPreview.defaultProps = {
  generatedEmail: null,
  onCopyToClipboard: () => {},
  layout: 'standard'
};

export default SalesPageEmailPreview;
