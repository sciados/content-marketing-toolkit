// src/pages/EmailSeriesDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../core/database/supabaseClient';
// import { useAuth } from '../shared/hooks/useAuth';
import { useToast } from '../shared/hooks/useToast';

// Import components
import Loader from '../shared/components/ui/Loader';
import Button from '../shared/components/ui/Button';

const EmailSeriesDetailPage = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { user } = supabase();
  const { showToast } = useToast();
  
  const [series, setSeries] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For editing
  const [editingEmailId, setEditingEmailId] = useState(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Fetch the series and its emails
  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        setLoading(true);
        
        // Debug info
        console.log("EmailSeriesDetailPage - Component mounted");
        console.log("Series ID:", seriesId);
        console.log("User:", user?.id);
        
        if (!seriesId) {
          console.error("No series ID provided");
          setError("Missing series ID parameter");
          setLoading(false);
          return;
        }
        
        if (!user) {
          console.warn("No authenticated user found");
          setError("Authentication required");
          setLoading(false);
          return;
        }
        
        // Fetch the series
        console.log("Fetching series with ID:", seriesId);
        const { data: seriesData, error: seriesError } = await supabase
          .from('email_series')
          .select('*')
          .eq('id', seriesId)
          .single();
        
        if (seriesError) {
          console.error("Series fetch error:", seriesError);
          throw seriesError;
        }
        
        if (!seriesData) {
          console.error("No series data found with ID:", seriesId);
          throw new Error('Series not found');
        }
        
        console.log("Series data retrieved:", seriesData);
        setSeries(seriesData);
        
        // Fetch the emails in the series
        console.log("Fetching emails for series:", seriesId);
        const { data: emailsData, error: emailsError } = await supabase
          .from('emails')
          .select('*')
          .eq('series_id', seriesId)
          .order('email_number', { ascending: true });
        
        if (emailsError) {
          console.error("Emails fetch error:", emailsError);
          throw emailsError;
        }
        
        console.log(`Retrieved ${emailsData?.length || 0} emails`);
        setEmails(emailsData);
      } catch (err) {
        console.error('Error fetching series data:', err);
        setError(err.message || 'Failed to load series data');
        // Use showToast directly here instead of in dependency
        if (showToast) {
          showToast(`Error: ${err.message || 'Failed to load series data'}`, 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSeriesData();
  }, [showToast, seriesId, user]); // Removed showToast from dependencies
  
  // Start editing an email
  const handleEditEmail = useCallback((email) => {
    console.log("Starting edit for email:", email.id);
    setEditingEmailId(email.id);
    setEditedSubject(email.subject);
    setEditedBody(email.body);
  }, []);
  
  // Save the edited email
  const handleSaveEmail = useCallback(async () => {
    if (!editingEmailId) return;
    
    try {
      setSaving(true);
      console.log("Saving email with ID:", editingEmailId);
      
      const { error } = await supabase
        .from('emails')
        .update({
          subject: editedSubject,
          body: editedBody,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingEmailId);
      
      if (error) throw error;
      
      console.log("Email saved successfully");
      
      // Update local state without triggering re-fetch
      setEmails(prevEmails => prevEmails.map(email => {
        if (email.id === editingEmailId) {
          return {
            ...email,
            subject: editedSubject,
            body: editedBody,
            updated_at: new Date().toISOString()
          };
        }
        return email;
      }));
      
      // Reset editing state
      setEditingEmailId(null);
      setEditedSubject('');
      setEditedBody('');
      
      if (showToast) {
        showToast('Email updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      if (showToast) {
        showToast(`Failed to update email: ${error.message}`, 'error');
      }
    } finally {
      setSaving(false);
    }
  }, [editingEmailId, editedSubject, editedBody, showToast]);
  
  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    console.log("Cancelling edit");
    setEditingEmailId(null);
    setEditedSubject('');
    setEditedBody('');
  }, []);
  
  // Delete an email
  const handleDeleteEmail = useCallback(async (emailId) => {
    if (!confirm('Are you sure you want to delete this email?')) {
      return;
    }
    
    try {
      console.log("Deleting email with ID:", emailId);
      const { error } = await supabase
        .from('emails')
        .delete()
        .eq('id', emailId);
      
      if (error) throw error;
      
      // Update local state
      setEmails(prevEmails => prevEmails.filter(email => email.id !== emailId));
      
      if (showToast) {
        showToast('Email deleted successfully', 'success');
      }
      
      // Update profile statistics
      if (user?.id) {
        await supabase.rpc('update_profile_stats', { 
          uid: user.id, 
          emails_saved_delta: -1 
        });
      }
      
    } catch (error) {
      console.error('Error deleting email:', error);
      if (showToast) {
        showToast(`Failed to delete email: ${error.message}`, 'error');
      }
    }
  }, [user, showToast]);
  
  // Copy email to clipboard
  const handleCopyEmail = useCallback((email) => {
    try {
      const content = `Subject: ${email.subject}\n\n${email.body}`;
      navigator.clipboard.writeText(content);
      if (showToast) {
        showToast('Email copied to clipboard', 'success');
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      if (showToast) {
        showToast('Failed to copy to clipboard', 'error');
      }
    }
  }, [showToast]);
  
  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }, []);
  
  if (loading) {
    return (
      <div className="loading-container">
        <Loader />
        <p>Loading series data...</p>
        <p className="debug-info">Series ID: {seriesId}</p>
      </div>
    );
  }
  
  if (error) {
    // Determine the correct back path based on current URL
    const backPath = window.location.pathname.includes('/tools/') 
      ? '/tools/email-series' 
      : '/email-series';
      
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p className="error-message">{error}</p>
        <p className="debug-info">Series ID: {seriesId}</p>
        <Button onClick={() => navigate(backPath)}>Back to Series List</Button>
      </div>
    );
  }
  
  if (!series) {
    // Determine the correct back path based on current URL
    const backPath = window.location.pathname.includes('/tools/') 
      ? '/tools/email-series' 
      : '/email-series';
      
    return (
      <div className="not-found-container">
        <h2>Series Not Found</h2>
        <p>The email series you're looking for doesn't exist or you don't have access to it.</p>
        <p className="debug-info">Series ID: {seriesId}</p>
        <Button onClick={() => navigate(backPath)}>Back to Series List</Button>
      </div>
    );
  }
  
  return (
    <div className="series-detail-page">
      <div className="page-header">
        <div className="header-content">
          <h1>{series.name}</h1>
          <div className="series-meta">
            <span className="series-domain">{series.domain}</span>
            <span className="series-date">Created on {formatDate(series.created_at)}</span>
          </div>
        </div>
        
        <div className="header-actions">
          {/* Use window.location to determine the correct back path */}
          <Link to={window.location.pathname.includes('/tools/') ? '/tools/email-series' : '/email-series'}>
            <Button variant="outline">Back to Series List</Button>
          </Link>
        </div>
      </div>
      
      {/* Series details */}
      <div className="series-info-card">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Domain</span>
            <span className="info-value">{series.domain}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Total Emails</span>
            <span className="info-value">{emails.length}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Tone</span>
            <span className="info-value">{series.tone || 'Neutral'}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Industry</span>
            <span className="info-value">{series.industry || 'General'}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">AI Generated</span>
            <span className="info-value">{series.generated_with_ai ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Last Updated</span>
            <span className="info-value">{formatDate(series.updated_at)}</span>
          </div>
        </div>
        
        {series.url && (
          <div className="series-url">
            <span className="url-label">Sales Page URL:</span>
            <a 
              href={series.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="url-link"
            >
              {series.url}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        )}
      </div>
      
      {/* Email list */}
      <div className="emails-section">
        <h2>Emails in This Series</h2>
        
        {emails.length === 0 ? (
          <div className="no-emails">
            <p>No emails found in this series.</p>
          </div>
        ) : (
          <div className="emails-list">
            {emails.map((email) => (
              <div key={email.id} className="email-card">
                {editingEmailId === email.id ? (
                  /* Editing Mode */
                  <div className="email-edit-mode">
                    <div className="edit-form">
                      <div className="form-field">
                        <label htmlFor="email-subject">Subject</label>
                        <input
                          id="email-subject"
                          type="text"
                          value={editedSubject}
                          onChange={(e) => setEditedSubject(e.target.value)}
                          className="edit-subject"
                        />
                      </div>
                      
                      <div className="form-field">
                        <label htmlFor="email-body">Body</label>
                        <textarea
                          id="email-body"
                          value={editedBody}
                          onChange={(e) => setEditedBody(e.target.value)}
                          className="edit-body"
                          rows={12}
                        />
                      </div>
                      
                      <div className="edit-actions">
                        <Button 
                          onClick={handleSaveEmail}
                          disabled={saving}
                          variant="primary"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button 
                          onClick={handleCancelEdit}
                          variant="outline"
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    <div className="email-header">
                      <div className="email-info">
                        <div className="email-number">Email #{email.email_number}</div>
                        <h3 className="email-subject">{email.subject}</h3>
                        <div className="email-dates">
                          <span>Created: {formatDate(email.created_at)}</span>
                          {email.updated_at && email.updated_at !== email.created_at && (
                            <span>Updated: {formatDate(email.updated_at)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="email-body">
                      {email.body.split('\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                    
                    <div className="email-actions">
                      <Button 
                        onClick={() => handleEditEmail(email)}
                        variant="outline"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                      </Button>
                      
                      <Button 
                        onClick={() => handleCopyEmail(email)}
                        variant="outline"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                      </Button>
                      
                      <Button 
                        onClick={() => handleDeleteEmail(email.id)}
                        variant="danger"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx="true">{`
        .series-detail-page {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .page-header h1 {
          font-size: 1.875rem;
          margin: 0 0 0.5rem 0;
        }
        
        .series-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .series-domain {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }
        
        .series-info-card {
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        
        .info-value {
          font-weight: 500;
        }
        
        .series-url {
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .url-label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        
        .url-link {
          color: #3b82f6;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          word-break: break-all;
        }
        
        .url-link:hover {
          text-decoration: underline;
        }
        
        .emails-section {
          margin-top: 2rem;
        }
        
        .emails-section h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .no-emails {
          text-align: center;
          padding: 2rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
          color: #6b7280;
        }
        
        .emails-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .email-card {
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .email-header {
          padding: 1.25rem;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f9fafb;
        }
        
        .email-number {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        
        .email-subject {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }
        
        .email-dates {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .email-body {
          padding: 1.25rem;
          white-space: pre-wrap;
        }
        
        .email-body p {
          margin-bottom: 1rem;
        }
        
        .email-actions {
          display: flex;
          gap: 0.5rem;
          padding: 1.25rem;
          border-top: 1px solid #e2e8f0;
          background-color: #f9fafb;
        }
        
        .email-edit-mode {
          padding: 1.25rem;
        }
        
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-field label {
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .edit-subject {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 1rem;
        }
        
        .edit-body {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-family: inherit;
          font-size: 0.875rem;
          resize: vertical;
        }
        
        .edit-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 0;
          color: #6b7280;
        }
        
        .error-container, .not-found-container {
          text-align: center;
          padding: 2rem;
          margin: 2rem auto;
          max-width: 600px;
        }
        
        .error-message {
          color: #B91C1C;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
};

export default EmailSeriesDetailPage;
