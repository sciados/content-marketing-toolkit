// src/pages/EmailSeriesListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { supabase } from '../core/database/supabaseClient';
import useAuth from '../shared/hooks/useAuth';
import { useToast } from '../shared/hooks/useToast';

// Import common components
import Card from '../shared/components/ui/Card';
import Button from '../shared/components/ui/Button';
import Loader from '../shared/components/ui/Loader';

const EmailSeriesListPage = () => {
  const { user, from, supabase } = useAuth();
  const { showToast } = useToast();
  
  const [emailSeries, setEmailSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch all email series for the current user
  useEffect(() => {
    const fetchEmailSeries = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch series with counts of emails in each series
        const { data, error } = await from('email_series')
          .select(`
            *,
            emails:emails(count)
          `)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Process the data to include the email count
        const processedSeries = data.map(series => ({
          ...series,
          emailCount: series.emails && series.emails.length > 0 ? series.emails[0].count : 0
        }));
        
        setEmailSeries(processedSeries);
      } catch (err) {
        console.error('Error fetching email series:', err);
        setError('Failed to load email series. Please try again later.');
        showToast('Failed to load email series', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmailSeries();
  }, [user, showToast]);
  
  // Filter series based on search term
  const filteredSeries = searchTerm
    ? emailSeries.filter(series => 
        series.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        series.domain.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : emailSeries;
  
  // Sort series based on sorting option
  const sortedSeries = [...filteredSeries].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    } else if (sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'domain') {
      return a.domain.localeCompare(b.domain);
    } else if (sortBy === 'most_emails') {
      return b.emailCount - a.emailCount;
    }
    return 0;
  });
  
  // Format date
  const formatDate = (dateString) => {
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
  };
  
  // Handle deleting a series
  const handleDeleteSeries = async (seriesId) => {
    if (!confirm('Are you sure you want to delete this email series? This will also delete all emails in the series.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete emails in this series first (due to foreign key constraints)
      const { error: emailsError } = await from('emails')
        .delete()
        .eq('series_id', seriesId);
      
      if (emailsError) throw emailsError;
      
      // Then delete the series
      const { error: seriesError } = await from('email_series')
  .delete()
  .eq('id', seriesId);
      
      if (seriesError) throw seriesError;
      
      // Update local state
      setEmailSeries(prev => prev.filter(series => series.id !== seriesId));
      showToast('Email series deleted successfully', 'success');
      
      // Update profile statistics with RPC call
      await supabase.rpc('update_profile_stats', { 
        uid: user.id, 
        series_count_delta: -1 
      });
      
    } catch (error) {
      console.error('Error deleting series:', error);
      showToast('Failed to delete email series', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="email-series-page">
      <div className="page-header">
        <h1>Email Series Library</h1>
        <p>Browse and manage your saved email series</p>
      </div>
      
      {/* Search and filter controls */}
      <div className="control-panel">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="clear-search"
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
        
        <div className="sort-container">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="domain">Domain</option>
            <option value="most_emails">Most Emails</option>
          </select>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="loading-container">
          <Loader />
          <p>Loading email series...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && emailSeries.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <h2>No Email Series Found</h2>
          <p>You haven't created any email series yet.</p>
          <Link to="/email-generator">
            <Button>Create Your First Email Series</Button>
          </Link>
        </div>
      )}
      
      {/* Series list */}
      {!loading && !error && sortedSeries.length > 0 && (
        <div className="series-grid">
          {sortedSeries.map(series => (
            <Card key={series.id} className="series-card">
              <div className="series-card-header">
                <h2 className="series-name">{series.name}</h2>
                <span className="series-domain">{series.domain}</span>
              </div>
              
              <div className="series-meta">
                <div className="series-stat">
                  <span className="stat-label">Created</span>
                  <span className="stat-value">{formatDate(series.created_at)}</span>
                </div>
                
                <div className="series-stat">
                  <span className="stat-label">Emails</span>
                  <span className="stat-value">{series.emailCount}</span>
                </div>
                
                <div className="series-stat">
                  <span className="stat-label">Tone</span>
                  <span className="stat-value">{series.tone || 'Neutral'}</span>
                </div>
                
                <div className="series-stat">
                  <span className="stat-label">Generated with AI</span>
                  <span className="stat-value">{series.generated_with_ai ? 'Yes' : 'No'}</span>
                </div>
              </div>
              
              {series.url && (
                <div className="series-url">
                  <span className="url-label">Page URL:</span>
                  <a 
                    href={series.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="url-link"
                  >
                    {series.url.length > 40 ? series.url.substring(0, 40) + '...' : series.url}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>
              )}
              
              <div className="series-actions">
                <Link to={`/tools/email-series/${series.id}`} className="view-action">
                  <Button>
                    View Emails
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </Button>
                </Link>
                
                <button 
                  onClick={() => handleDeleteSeries(series.id)}
                  className="delete-action"
                  title="Delete Series"
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
            </Card>
          ))}
        </div>
      )}
      
      <style jsx="true">{`
        .email-series-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .page-header p {
          color: #6b7280;
        }
        
        .control-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .search-container {
          position: relative;
          flex: 1;
          min-width: 250px;
        }
        
        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          padding-right: 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .clear-search {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.25rem;
          color: #718096;
          cursor: pointer;
        }
        
        .sort-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .sort-select {
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 0;
          color: #6b7280;
        }
        
        .error-container {
          text-align: center;
          padding: 2rem;
          background-color: #FEF2F2;
          border-radius: 0.5rem;
          margin: 2rem 0;
        }
        
        .error-message {
          color: #B91C1C;
          margin-bottom: 1rem;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 0;
          text-align: center;
        }
        
        .empty-icon {
          color: #CBD5E0;
          margin-bottom: 1.5rem;
        }
        
        .series-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .series-card {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1.25rem;
          background-color: white;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .series-card-header {
          margin-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1rem;
        }
        
        .series-name {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }
        
        .series-domain {
          display: inline-block;
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: #4b5563;
        }
        
        .series-meta {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        
        .series-stat {
          display: flex;
          flex-direction: column;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        
        .stat-value {
          font-weight: 500;
        }
        
        .series-url {
          display: flex;
          flex-direction: column;
          font-size: 0.875rem;
          margin-bottom: 1.25rem;
          overflow: hidden;
        }
        
        .url-label {
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
        
        .series-actions {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .view-action {
          text-decoration: none;
        }
        
        .delete-action {
          background-color: transparent;
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 0.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .delete-action:hover {
          background-color: #fef2f2;
        }
      `}</style>
    </div>
  );
};

export default EmailSeriesListPage;
