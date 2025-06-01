// src/components/EmailGenerator/SupabaseEmailDisplay.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createSeriesNameFromDomain } from '../../services/emailGenerator';
import { supabase } from '../../services/supabase/supabaseClient';
import useSupabase from '../../hooks/useSupabase';

/**
 * Component for displaying emails from Supabase
 * Handles domain-based grouping, sorting, and editing
 */
const SupabaseEmailDisplay = ({
  savedEmails,
  onDeleteEmail,
  onCopyEmail,
  onRefresh,
  showToast
}) => {
  const { user } = useSupabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('collections'); // 'collections' or 'list'
  const [expandedCollections, setExpandedCollections] = useState({});
  const [expandedEmails, setExpandedEmails] = useState({});
  const [editingEmail, setEditingEmail] = useState(null);
  const [editedBody, setEditedBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Group emails by domain instead of series
  const emailCollections = useMemo(() => {
    if (!savedEmails || !Array.isArray(savedEmails) || savedEmails.length === 0) {
      return [];
    }
    
    // Group by domain
    const domainGroups = {};
    
    savedEmails.forEach(email => {
      const domain = email.domain || 'Other';
      console.log('🔍 Domain input to createSeriesNameFromDomain:', domain);
      if (!domainGroups[domain]) {
        domainGroups[domain] = {
          id: domain,          
          name: createSeriesNameFromDomain(domain),
          domain: domain,
          emails: [],
          createdAt: email.createdAt || email.savedAt || new Date().toISOString()
        };
      }
      
      // Add email to domain group
      domainGroups[domain].emails.push(email);
      
      // Update collection date if this email is newer
      const emailDate = new Date(email.createdAt || email.savedAt || 0);
      const collectionDate = new Date(domainGroups[domain].createdAt || 0);
      
      if (emailDate > collectionDate) {
        domainGroups[domain].createdAt = email.createdAt || email.savedAt;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(domainGroups).sort((a, b) => {
      try {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Newest first
      } catch (error) {
        console.error('Error sorting domain collections:', error);
        return 0;
      }
    });
  }, [savedEmails]);
  
  // Filter emails based on search term
  const filteredEmails = useMemo(() => {
    return searchTerm
      ? savedEmails.filter(email => 
          email.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
          email.body.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : savedEmails;
  }, [savedEmails, searchTerm]);
  
  // Toggle collection expansion
  const toggleCollectionExpanded = useCallback((collectionId) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionId]: !prev[collectionId]
    }));
  }, []);
  
  // Toggle email expansion
  const toggleEmailExpanded = useCallback((emailId) => {
    setExpandedEmails(prev => {
      const newExpanded = {
        ...prev,
        [emailId]: !prev[emailId]
      };
      
      // If expanding, set up for editing
      if (newExpanded[emailId]) {
        const email = savedEmails.find(e => e.id === emailId);
        if (email) {
          setEditingEmail(email);
          setEditedBody(email.body);
        }
      }
      
      return newExpanded;
    });
  }, [savedEmails]);
  
  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }, []);
  
  // Get email preview (first X characters)
  const getEmailPreview = useCallback((body, length = 100) => {
    if (!body) return 'No content';
    const text = body.replace(/<[^>]*>/g, ''); // Remove HTML tags for preview
    const preview = text.substring(0, length);
    return preview.length < text.length ? `${preview}...` : preview;
  }, []);
  
  // Sort emails in a collection
  const sortEmails = useCallback((emails) => {
    return [...emails].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || b.savedAt || 0) - new Date(a.createdAt || a.savedAt || 0);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt || a.savedAt || 0) - new Date(b.createdAt || b.savedAt || 0);
      } else if (sortBy === 'alphabetical') {
        return a.subject.localeCompare(b.subject);
      }
      return 0;
    });
  }, [sortBy]);
  
  // Save edited email
  const saveEditedEmail = async () => {
    if (!editingEmail) return;
    
    setIsSaving(true);
    
    try {
      // Update in Supabase if user is authenticated
      if (user) {
        const { error } = await supabase
          .from('emails')
          .update({
            body: editedBody,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEmail.id);
        
        if (error) throw error;
      }
      
      // Update in local state
      const updatedEmails = savedEmails.map(email => {
        if (email.id === editingEmail.id) {
          return {
            ...email,
            body: editedBody,
            updatedAt: new Date().toISOString()
          };
        }
        return email;
      });
      
      // Close the editor
      setExpandedEmails(prev => ({
        ...prev,
        [editingEmail.id]: false
      }));
      
      // Reset editing state
      setEditingEmail(null);
      setEditedBody('');
      
      // Refresh the emails list
      if (onRefresh) {
        onRefresh(updatedEmails);
      }
      
      showToast('Email updated successfully', 'success');
    } catch (error) {
      console.error('Error updating email:', error);
      showToast(`Failed to update email: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    if (!editingEmail) return;
    
    setExpandedEmails(prev => ({
      ...prev,
      [editingEmail.id]: false
    }));
    
    setEditingEmail(null);
    setEditedBody('');
  };
  
  // Set initial expanded state for domain collections
  useEffect(() => {
    if (emailCollections.length > 0) {
      // Expand the first collection by default
      const initialExpanded = {};
      initialExpanded[emailCollections[0].id] = true;
      setExpandedCollections(initialExpanded);
    }
  }, [emailCollections]);
  
  return (
    <div className="saved-emails-container">
      {/* Header with search and view toggles */}
      <div className="saved-emails-header">
        <h2 className="saved-emails-title">Saved Emails ({savedEmails.length})</h2>
        
        <div className="saved-emails-actions">
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search emails..."
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search-button"
              >
                &times;
              </button>
            )}
          </div>
          
          <div className="view-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
            
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('collections')}
                className={`view-toggle-button ${viewMode === 'collections' ? 'active' : ''}`}
                title="Domain View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </button>
              
              <button
                onClick={() => setViewMode('list')}
                className={`view-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
                title="List View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <button
              onClick={onRefresh}
              className="refresh-button"
              title="Refresh Emails"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* No emails state */}
      {savedEmails.length === 0 && (
        <div className="no-emails-state">
          <div className="no-emails-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 13V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8"></path>
              <path d="M22 7l-10 5-10-5"></path>
              <path d="M16 19h6"></path>
              <path d="M19 16v6"></path>
            </svg>
          </div>
          <h3 className="no-emails-title">No Saved Emails</h3>
          <p className="no-emails-description">
            Once you generate and save emails, they will appear here.
          </p>
        </div>
      )}
      
      {/* Domain Collections View */}
      {viewMode === 'collections' && emailCollections.length > 0 && (
        <div className="collections-view">
          {emailCollections.map((domain) => (
            <div key={domain.id} className="domain-collection">
              <div 
                className="domain-header"
                onClick={() => toggleCollectionExpanded(domain.id)}
              >
                <h3 className="domain-name">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className={`chevron ${expandedCollections[domain.id] ? 'down' : 'right'}`}
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  {domain.name} ({domain.emails.length})
                </h3>
                <span className="domain-date">Last updated: {formatDate(domain.createdAt)}</span>
              </div>
              
              {expandedCollections[domain.id] && (
                <div className="domain-emails">
                  {sortEmails(domain.emails).map((email) => (
                    <div key={email.id} className="email-item">
                      <div 
                        className="email-header"
                        onClick={() => toggleEmailExpanded(email.id)}
                      >
                        <h4 className="email-subject">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className={`chevron ${expandedEmails[email.id] ? 'down' : 'right'}`}
                          >
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                          {email.subject}
                        </h4>
                        <div className="email-meta">
                          {email.emailNumber && (
                            <span className="email-number">Email #{email.emailNumber}</span>
                          )}
                          <span className="email-date">{formatDate(email.createdAt || email.savedAt)}</span>
                        </div>
                      </div>
                      
                      {!expandedEmails[email.id] && (
                        <div className="email-preview">
                          {getEmailPreview(email.body)}
                        </div>
                      )}
                      
                      {expandedEmails[email.id] && (
                        <div className="email-editor">
                          <textarea
                            className="email-edit-textarea"
                            value={editedBody}
                            onChange={(e) => setEditedBody(e.target.value)}
                            rows={12}
                          />
                          
                          <div className="email-edit-actions">
                            <button 
                              className="email-edit-save" 
                              onClick={saveEditedEmail}
                              disabled={isSaving}
                            >
                              {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                              className="email-edit-cancel" 
                              onClick={cancelEditing}
                              disabled={isSaving}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="email-actions">
                        <button
                          onClick={() => onCopyEmail(email)}
                          className="email-action-button"
                          title="Copy Email"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          Copy
                        </button>
                        
                        <button
                          onClick={() => onDeleteEmail(email.id, email.seriesId)}
                          className="email-action-button delete"
                          title="Delete Email"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* List View */}
      {viewMode === 'list' && (
        <div className="list-view">
          {searchTerm && (
            <div className="search-results-info">
              Found {filteredEmails.length} emails matching "{searchTerm}"
            </div>
          )}
          
          <div className="emails-list">
            {sortEmails(filteredEmails).map((email) => (
              <div key={email.id} className="list-email-item">
                <div 
                  className="list-email-header"
                  onClick={() => toggleEmailExpanded(email.id)}
                >
                  <div className="list-email-subject">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className={`chevron ${expandedEmails[email.id] ? 'down' : 'right'}`}
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    {email.subject}
                  </div>
                  
                  <div className="list-email-meta">
                    <span className="list-email-domain">{email.domain}</span>
                    <span className="list-email-date">{formatDate(email.createdAt || email.savedAt)}</span>
                  </div>
                </div>
                
                {!expandedEmails[email.id] && (
                  <div className="list-email-preview">
                    {getEmailPreview(email.body)}
                  </div>
                )}
                
                {expandedEmails[email.id] && (
                  <div className="email-editor">
                    <textarea
                      className="email-edit-textarea"
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      rows={12}
                    />
                    
                    <div className="email-edit-actions">
                      <button 
                        className="email-edit-save" 
                        onClick={saveEditedEmail}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        className="email-edit-cancel" 
                        onClick={cancelEditing}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="list-email-actions">
                  <button
                    onClick={() => onCopyEmail(email)}
                    className="list-email-action-button"
                    title="Copy Email"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => onDeleteEmail(email.id, email.seriesId)}
                    className="list-email-action-button delete"
                    title="Delete Email"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add additional CSS for styling the new components */}
      <style jsx>{`
        .domain-collection {
          margin-bottom: 1.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .domain-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background-color: #f7fafc;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .domain-header:hover {
          background-color: #edf2f7;
        }
        
        .domain-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
        }
        
        .domain-emails {
          padding: 0.5rem;
        }
        
        .email-item {
          margin-bottom: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          overflow: hidden;
          background-color: #fff;
        }
        
        .email-header {
          padding: 0.75rem 1rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.2s;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .email-header:hover {
          background-color: #f7fafc;
        }
        
        .email-subject {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
          display: flex;
          align-items: center;
        }
        
        .email-preview {
          padding: 0.75rem 1rem;
          color: #4a5568;
          font-size: 0.875rem;
        }
        
        .email-editor {
          padding: 1rem;
        }
        
        .email-edit-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #cbd5e0;
          border-radius: 0.375rem;
          font-family: inherit;
          font-size: 0.875rem;
          resize: vertical;
        }
        
        .email-edit-actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.5rem;
        }
        
        .email-edit-save,
        .email-edit-cancel {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .email-edit-save {
          background-color: #4299e1;
          color: white;
        }
        
        .email-edit-save:hover {
          background-color: #3182ce;
        }
        
        .email-edit-save:disabled {
          background-color: #a0aec0;
          cursor: not-allowed;
        }
        
        .email-edit-cancel {
          background-color: #e2e8f0;
          color: #4a5568;
        }
        
        .email-edit-cancel:hover {
          background-color: #cbd5e0;
        }
        
        .chevron {
          margin-right: 0.5rem;
          transition: transform 0.2s;
        }
        
        .chevron.down {
          transform: rotate(90deg);
        }
        
        .chevron.right {
          transform: rotate(0);
        }
        
        .list-email-item {
          margin-bottom: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          overflow: hidden;
        }
        
        .list-email-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background-color: #f7fafc;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .list-email-header:hover {
          background-color: #edf2f7;
        }
        
        .list-email-subject {
          font-weight: 500;
          display: flex;
          align-items: center;
        }
        
        .list-email-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.75rem;
          color: #718096;
        }
        
        .list-email-domain {
          background-color: #e2e8f0;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }
        
        .list-email-preview {
          padding: 0.75rem 1rem;
          color: #4a5568;
          font-size: 0.875rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .list-email-actions {
          display: flex;
          padding: 0.5rem;
          border-top: 1px solid #e2e8f0;
          justify-content: flex-end;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default SupabaseEmailDisplay;
