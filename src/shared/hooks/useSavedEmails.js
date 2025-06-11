// src/hooks/useSavedEmails.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import { useUsageTracking } from './useUsageTracking';

// Helper functions moved from legacy emailGenerator
const extractDomain = (url) => {
  try {
    const domain = url.replace(/(^\w+:|^)\/\//, '').split('/')[0];
    return domain.split('.').slice(-2, -1)[0] || domain;
  } catch {
    return 'website';
  }
};

const createSeriesNameFromDomain = (domain) => {
  return `${domain.charAt(0).toUpperCase() + domain.slice(1)} Email Series`;
};

/**
 * Custom hook for saved emails management
 * Handles loading, saving, deleting emails with useAuth
 */
export const useSavedEmails = ({
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
}) => {
  const [savedEmails, setSavedEmails] = useState([]);
  const [emailCollections, setEmailCollections] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [emailLoadError, setEmailLoadError] = useState(null);
  
  // Add usage tracking hook
  const { trackEmailSaved } = useUsageTracking();
  
  // Update profile statistics function
  const updateProfileStats = useCallback(async (statsToUpdate) => {
    if (!user) return;
    
    try {
      // First get current profile stats
      const { data: profile, error: profileError } = await useAuth
        .from('profiles')
        .select('emails_saved, series_count')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile stats:', profileError);
        return;
      }
      
      // Calculate new values
      const updates = {};
      
      if (statsToUpdate.emailsSaved !== undefined) {
        updates.emails_saved = Math.max(0, (profile?.emails_saved || 0) + statsToUpdate.emailsSaved);
      }
      
      if (statsToUpdate.seriesCount !== undefined) {
        updates.series_count = Math.max(0, (profile?.series_count || 0) + statsToUpdate.seriesCount);
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        console.log('Updating profile stats:', updates);
        
        const { error: updateError } = await useAuth
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Error updating profile stats:', updateError);
        }
      }
    } catch (error) {
      console.error('Error in updateProfileStats:', error);
    }
  }, [user]);
  
  // Group emails into collections based on series
  const groupEmailsIntoCollections = useCallback((emails, seriesData = []) => {
    if (!emails || !Array.isArray(emails)) {
      console.warn('groupEmailsIntoCollections received invalid input:', emails);
      return [];
    }
    
    // Handle the case where emails array is empty
    if (emails.length === 0) {
      return [];
    }
    
    const collections = {};
    
    // First, create collections from series data
    if (seriesData && Array.isArray(seriesData)) {
      seriesData.forEach(series => {
        collections[series.id] = {
          id: series.id,
          name: series.name,
          emails: [],
          createdAt: series.created_at,
          domain: series.domain,
          url: series.url
        };
      });
    }
    
    // Then add emails to their collections
    emails.forEach(email => {
      try {
        // Make sure email is a valid object
        if (!email || typeof email !== 'object') {
          console.warn('Invalid email object:', email);
          return; // Skip this email
        }
        
        // Use a default collection name if none is provided
        const collectionId = email.seriesId || 'unsorted';
        const collectionName = email.seriesName || 'Unsorted Emails';
        
        // Initialize the collection if it doesn't exist
        if (!collections[collectionId]) {
          collections[collectionId] = {
            id: collectionId,
            name: collectionName,
            emails: [],
            createdAt: email.createdAt || email.savedAt || new Date().toISOString(),
            domain: email.domain
          };
        }
        
        // Add the email to the collection
        collections[collectionId].emails.push(email);
      } catch (error) {
        console.error('Error processing email in groupEmailsIntoCollections:', error);
      }
    });
    
    // Convert to array and sort by date
    const result = Object.values(collections).sort((a, b) => {
      try {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Newest first
      } catch (error) {
        console.error('Error sorting collections:', error);
        return 0;
      }
    });
    
    return result;
  }, []);
  
  // Load saved emails
const loadSavedEmails = useCallback(async () => {
  setLoadingEmails(true);
  setEmailLoadError(null);
  
  try {
    // For non-authenticated users, use localStorage
    if (!user) {
      console.log('No user authenticated, using localStorage');
      const saved = localStorage.getItem('savedEmails');
      if (saved) {
        const parsedEmails = JSON.parse(saved);
        setSavedEmails(parsedEmails);
        
        // Group emails into collections
        const collections = groupEmailsIntoCollections(parsedEmails);
        setEmailCollections(collections);
      } else {
        setSavedEmails([]);
        setEmailCollections([]);
      }
      setLoadingEmails(false);
      return;
    }
    
    // For authenticated users, fetch emails from useAuth
    try {
      console.log('Fetching saved emails from useAuth...');
      
      // First, get all email series data
      const { data: seriesData, error: seriesError } = await useAuth
        .from('email_series')
        .select('*')
        .eq('user_id', user.id);
      
      if (seriesError) throw seriesError;
      
      // Then, get all saved emails - make sure this is BEFORE any references to emailsData
      const { data: emailsData, error: emailsError } = await useAuth
        .from('emails')
        .select(`
          id, 
          subject,
          body,
          benefit,
          email_number,
          created_at,
          updated_at,
          layout,
          series_id,
          domain,
          generated_with_ai,
          user_id,
          email_series(id, name)
        `)
        .eq('user_id', user.id);
      
      if (emailsError) throw emailsError;
      
      // Now you can log or use emailsData
      console.log(`Retrieved ${emailsData?.length || 0} emails`);
      
      // Process emails to match our expected format
      const processedEmails = emailsData.map(email => ({
        id: email.id,
        subject: email.subject,
        body: email.body, // This should contain the full body text
        benefit: email.benefit,
        emailNumber: email.email_number,
        createdAt: email.created_at,
        updatedAt: email.updated_at,
        layout: email.layout,
        seriesId: email.series_id,
        seriesName: email.email_series?.name || 'Unsorted Emails',
        domain: email.domain,
        savedAt: email.created_at
      }));
      
      // Log one email's body length to debug truncation
      if (processedEmails.length > 0) {
        const sampleEmail = processedEmails[0];
        console.log(`Sample email body length: ${sampleEmail.body?.length || 0} characters`);
        console.log(`First 150 chars: ${sampleEmail.body?.substring(0, 150)}`);
      }
      
      setSavedEmails(processedEmails);
      
      // Group emails into collections
      const collections = groupEmailsIntoCollections(processedEmails, seriesData);
      setEmailCollections(collections);
      
      console.log(`Grouped into ${collections.length} collections`);
      
    } catch (error) {
      console.error('Error loading saved emails:', error);
      setEmailLoadError(`Failed to load emails: ${error.message}`);
      throw error;
    }
  } catch (error) {
    console.error('Unexpected error in loadSavedEmails:', error);
    setEmailLoadError(`Error: ${error.message}`);
  } finally {
    setLoadingEmails(false);
  }
}, [user, groupEmailsIntoCollections]);
  
  // Save emails to localStorage when they change (fallback for non-authenticated users)
  useEffect(() => {
    if (!user && savedEmails.length > 0) {
      try {
        localStorage.setItem('savedEmails', JSON.stringify(savedEmails));
      } catch (e) {
        console.error('Error saving emails to localStorage:', e);
      }
    }
  }, [savedEmails, user]);
  
  // Save the current email
  const handleSaveEmail = useCallback(async () => {
    if (!emailSeries || emailSeries.length === 0) return;
    
    const emailToSave = emailSeries[currentEmailIndex];
    
    // Check if this email is already saved
    const isDuplicate = savedEmails.some(
      saved => saved.subject === emailToSave.subject && saved.body === (emailToSave.body || emailToSave.content)
    );
    
    if (isDuplicate) {
      showToast('This email is already saved', 'info');
      return;
    }
    
    try {
      const emailWithMetadata = {
        ...emailToSave,
        id: crypto.randomUUID(), // Generate a unique ID
        savedAt: new Date().toISOString(),
        layout: emailLayout
      };
      
      if (user) {
        // Save to useAuth
        showToast('Saving email...', 'info');
        
        // Insert into emails table
        const { data, error } = await useAuth
          .from('emails')
          .insert({
            user_id: user.id,
            subject: emailWithMetadata.subject,
            body: emailWithMetadata.body || emailWithMetadata.content,
            benefit: emailWithMetadata.benefit,
            email_number: emailWithMetadata.emailNumber || 1,
            domain: emailWithMetadata.domain,
            layout: emailWithMetadata.layout,
            generated_with_ai: isUsingAI
          })
          .select();
        
        if (error) throw error;
        
        // Update the email id with the one from useAuth
        if (data && data.length > 0) {
          emailWithMetadata.id = data[0].id;
        }
        
        // 🎯 TRACK USAGE: Email saved
        try {
          await trackEmailSaved(1);
          console.log('✅ Usage tracked: 1 email saved');
        } catch (trackingError) {
          console.error('Error tracking email save:', trackingError);
          // Don't fail the whole operation if tracking fails
        }
        
        // Update profile statistics
        await updateProfileStats({ emailsSaved: 1 });
      }
      
      // Add to local state
      setSavedEmails(prev => [...prev, emailWithMetadata]);
      
      // Update collections
      const updatedCollections = groupEmailsIntoCollections([...savedEmails, emailWithMetadata]);
      setEmailCollections(updatedCollections);
      
      showToast('Email saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving email:', error);
      showToast('Failed to save email', 'error');
    }
  }, [
    emailSeries, 
    currentEmailIndex, 
    savedEmails, 
    emailLayout, 
    user, 
    isUsingAI, 
    showToast, 
    groupEmailsIntoCollections,
    updateProfileStats,
    trackEmailSaved // Add to dependencies
  ]);
  
  // Save the entire series
  const handleSaveSeries = useCallback(async () => {
    if (!emailSeries || emailSeries.length === 0) {
      showToast('No emails to save', 'info');
      return;
    }
    
    showToast(`Preparing to save ${emailSeries.length} emails...`, 'info');
    
    try {
      // Filter out any emails that are already saved
      const newEmails = emailSeries.filter(email => 
        !savedEmails.some(saved => 
          saved.subject === email.subject && saved.body === (email.body || email.content)
        )
      );
      
      if (newEmails.length === 0) {
        showToast('All emails in this series are already saved', 'info');
        return;
      }
      
      // Prepare series metadata
      const domain = extractDomain(url) || 'Unknown Domain';
      console.log('🔍 Original URL:', url);
      console.log('🔍 Extracted domain:', domain);
      console.log('🔍 Domain type:', typeof domain);
      
      console.log('🔍 Domain input to createSeriesNameFromDomain:', domain);
      const seriesName = createSeriesNameFromDomain(domain);
      console.log('🔍 Generated series name:', seriesName);
      
      if (user) {
        // Save to useAuth
        try {
          // Create the email series first
          const { data: seriesData, error: seriesError } = await useAuth
            .from('email_series')
            .insert({
              user_id: user.id,
              name: seriesName,
              domain: domain,
              url: url || '',
              tone: tone || 'neutral',
              industry: industry || 'general',
              generated_with_ai: isUsingAI,
              keywords: keywords || '',
              email_count: newEmails.length
            })
            .select();
          
          if (seriesError) throw seriesError;
          
          // Get the series ID
          const seriesId = seriesData[0].id;
          
          // Prepare emails with metadata
          const emailsToInsert = newEmails.map((email, index) => ({
            user_id: user.id,
            series_id: seriesId,
            subject: email.subject || 'Untitled Email',
            body: email.body || email.content || '',
            benefit: email.benefit || '',
            email_number: index + 1,
            layout: emailLayout || 'standard',
            generated_with_ai: isUsingAI,
            domain: domain
          }));
          
          // Insert all emails
          const { data: emailsData, error: emailsError } = await useAuth
            .from('emails')
            .insert(emailsToInsert)
            .select();
          
          if (emailsError) throw emailsError;
          
          // 🎯 TRACK USAGE: Multiple emails saved
          try {
            await trackEmailSaved(newEmails.length);
            console.log(`✅ Usage tracked: ${newEmails.length} emails saved`);
          } catch (trackingError) {
            console.error('Error tracking email series save:', trackingError);
            // Don't fail the whole operation if tracking fails
          }
          
          // Update profile statistics
          await updateProfileStats({
            emailsSaved: newEmails.length,
            seriesCount: 1
          });
          
          showToast(`Saved ${newEmails.length} emails as a series!`, 'success');
          
          // Add series emails to local state
          const seriesEmails = emailsData.map(email => ({
            id: email.id,
            subject: email.subject,
            body: email.body,
            benefit: email.benefit,
            emailNumber: email.email_number,
            createdAt: email.created_at,
            layout: email.layout,
            seriesId: email.series_id,
            seriesName: seriesName,
            domain: domain,
            savedAt: email.created_at
          }));
          
          // Update local state
          setSavedEmails(prev => [...prev, ...seriesEmails]);
          
          // Update collections
          const updatedCollections = groupEmailsIntoCollections([...savedEmails, ...seriesEmails]);
          setEmailCollections(updatedCollections);
        } catch (useAuthError) {
          console.error('useAuth error details:', useAuthError);
          
          // Provide a more helpful error message based on the error
          let errorMessage = 'Failed to save email series';
          
          if (useAuthError.message) {
            errorMessage += `: ${useAuthError.message}`;
          }
          
          showToast(errorMessage, 'error');
          throw useAuthError;
        }
      } else {
        // For non-authenticated users, save to localStorage with generated IDs
        const seriesId = `series-${Date.now()}`;
        const seriesEmails = newEmails.map((email) => ({
          ...email,
          id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          seriesId,
          seriesName,
          savedAt: new Date().toISOString()
        }));
        
        // Update local state
        setSavedEmails(prev => [...prev, ...seriesEmails]);
        
        // Update collections
        const updatedCollections = groupEmailsIntoCollections([...savedEmails, ...seriesEmails]);
        setEmailCollections(updatedCollections);
        
        showToast(`Saved ${newEmails.length} emails to your collection!`, 'success');
      }
    } catch (error) {
      console.error('Error saving email series:', error);
      showToast(`Failed to save series: ${error.message || 'Unknown error'}`, 'error');
    }
  }, [
    emailSeries, 
    savedEmails, 
    url, 
    user, 
    tone, 
    industry, 
    isUsingAI, 
    keywords, 
    emailLayout, 
    showToast, 
    groupEmailsIntoCollections,
    updateProfileStats,
    trackEmailSaved // Add to dependencies
  ]);
  
  // Delete a saved email
  const handleDeleteEmail = useCallback(async (emailId) => {
    try {
      if (user) {
        // Delete from useAuth
        const { error } = await useAuth
          .from('emails')
          .delete()
          .eq('id', emailId);
        
        if (error) throw error;
        
        // Update profile statistics
        await updateProfileStats({ emailsSaved: -1 });
      }
      
      // Update local state
      const newSavedEmails = savedEmails.filter(email => email.id !== emailId);
      setSavedEmails(newSavedEmails);
      
      // Update collections
      const updatedCollections = groupEmailsIntoCollections(newSavedEmails);
      setEmailCollections(updatedCollections);
      
      showToast('Email deleted', 'success');
    } catch (error) {
      console.error('Error deleting email:', error);
      showToast('Failed to delete email', 'error');
    }
  }, [user, savedEmails, showToast, groupEmailsIntoCollections, updateProfileStats]);
  
  // Test useAuth connection - for debugging
const testuseAuthConnection = useCallback(async () => {
  try {
    // Change this line to not declare the unused variable
    const { error } = await useAuth.from('email_series').select('count');
    
    if (error) throw error;
    
    showToast('useAuth connection successful!', 'success');
    
    // If connection succeeded, try to refresh saved emails
    loadSavedEmails();
  } catch (error) {
    showToast(`useAuth connection failed: ${error.message}`, 'error');
    console.error('useAuth connection error:', error);
  }
}, [loadSavedEmails, showToast]);

  return {
    savedEmails,
    emailCollections,
    loadingEmails,
    emailLoadError,
    loadSavedEmails,
    handleSaveEmail,
    handleSaveSeries,
    handleDeleteEmail,
    testuseAuthConnection
  };
};