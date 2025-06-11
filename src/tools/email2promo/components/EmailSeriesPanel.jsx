// src/components/EmailGenerator/EmailSeriesPanel.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../../core/database/db';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useToast } from '../../../shared/hooks/useToast';  // Changed from useToastContext
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { Loader } from '../../../shared/components/ui/Loader';

/**
 * Panel for managing email series
 * Allows creating, editing, and deleting email series
 */
const EmailSeriesPanel = ({
  emailSeries,
  currentEmailIndex,
  onSaveEmail,
  onSaveSeries,
  onExportSeries,
  seriesName,
  setSeriesName,
  loading
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();  // Changed from useToastContext

  const [existingSeries, setExistingSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const [exportFormat, setExportFormat] = useState('text');
  const [seriesSchedule, setSeriesSchedule] = useState('daily');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing series from Supabase
  useEffect(() => {
    const loadExistingSeries = async () => {
      if (!user) return;
      
      try {
        setIsLoadingSeries(true);
        
        const { data, error } = await db.emailSeries.getAll(user.id);
        
        if (error) throw error;
        
        setExistingSeries(data || []);
      } catch (error) {
        console.error('Error loading email series:', error);
        showToast('Failed to load email series', 'error');
      } finally {
        setIsLoadingSeries(false);
      }
    };
    
    loadExistingSeries();
  }, [user, showToast]);

  // Handle selecting an existing series
  const handleSelectSeries = (seriesId) => {
    if (!seriesId) {
      setSelectedSeries(null);
      return;
    }
    
    const series = existingSeries.find(s => s.id === seriesId);
    setSelectedSeries(series);
    
    // Update series name
    if (series && setSeriesName) {
      setSeriesName(series.name);
    }
  };

  // Handle saving the series to an existing series
  const handleSaveToExistingSeries = async () => {
    if (!user) {
      showToast('Please log in to save email series', 'error');
      return;
    }
    
    if (!selectedSeries) {
      showToast('Please select a series', 'error');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Get the current email
      const currentEmail = emailSeries[currentEmailIndex];
      
      // Prepare the email data
      const emailData = {
        user_id: user.id,
        series_id: selectedSeries.id,
        subject: currentEmail.subject,
        body: currentEmail.body,
        benefit: currentEmail.benefit || '',
        email_number: existingSeries.filter(s => s.id === selectedSeries.id).length + 1,
        domain: currentEmail.domain || '',
        layout: currentEmail.layout || 'standard',
        generated_with_ai: currentEmail.generatedWithAI || false
      };
      
      // Save the email
      const { data, error } = await db.emails.create(user.id, emailData);
      
      if (error) throw error;
      
      showToast('Email added to series successfully!', 'success');
      
      // If onSaveEmail is provided, call it with the new email
      if (onSaveEmail) {
        onSaveEmail({
          ...currentEmail,
          id: data[0].id,
          seriesId: selectedSeries.id,
          seriesName: selectedSeries.name
        });
      }
    } catch (error) {
      console.error('Error saving email to series:', error);
      showToast(`Failed to save email to series: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle creating a new series
  const handleCreateNewSeries = async () => {
    if (!user) {
      showToast('Please log in to create email series', 'error');
      return;
    }
    
    if (!seriesName) {
      showToast('Please enter a series name', 'error');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Create the series first
      const series = {
        user_id: user.id,
        name: seriesName,
        domain: emailSeries[0]?.domain || '',
        tone: emailSeries[0]?.tone || 'neutral',
        email_count: emailSeries.length
      };
      
      const { data: seriesData, error: seriesError } = await db.emailSeries.create(user.id, series);
      
      if (seriesError) throw seriesError;
      
      const seriesId = seriesData[0].id;
      
      // Then add all emails to the series
      const emailsToAdd = emailSeries.map((email, index) => ({
        user_id: user.id,
        series_id: seriesId,
        subject: email.subject,
        body: email.body,
        benefit: email.benefit || '',
        email_number: index + 1,
        domain: email.domain || '',
        layout: email.layout || 'standard',
        generated_with_ai: email.generatedWithAI || false
      }));
      
      // Insert all emails
      for (const email of emailsToAdd) {
        const { error: emailError } = await db.emails.create(user.id, email);
        if (emailError) throw emailError;
      }
      
      showToast(`Created ${emailSeries.length} emails in series "${seriesName}"!`, 'success');
      
      // Refresh the existing series list
      const { data: refreshedSeries, error: refreshError } = await db.emailSeries.getAll(user.id);
      
      if (refreshError) throw refreshError;
      
      setExistingSeries(refreshedSeries || []);
      
      // If onSaveSeries is provided, call it
      if (onSaveSeries) {
        onSaveSeries(seriesData[0], emailsToAdd);
      }
    } catch (error) {
      console.error('Error creating email series:', error);
      showToast(`Failed to create email series: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle exporting the series
  const handleExportSeries = () => {
    if (onExportSeries) {
      onExportSeries(exportFormat);
    } else {
      // Simple export implementation if onExportSeries is not provided
      try {
        let content = '';
        let fileName = `email-series-${Date.now()}`;
        let mimeType = 'text/plain';
        
        if (exportFormat === 'text') {
          content = emailSeries.map((email, index) => 
            `Email ${index + 1}: ${email.subject}\n\n${email.body}\n\n---\n\n`
          ).join('');
          fileName += '.txt';
          mimeType = 'text/plain';
        } else if (exportFormat === 'html') {
          content = `<!DOCTYPE html>
<html>
<head>
  <title>Email Series: ${seriesName || 'Untitled Series'}</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 30px; }
    .email { margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
    .email-body { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>Email Series: ${seriesName || 'Untitled Series'}</h1>
  ${emailSeries.map((email, index) => `
  <div class="email">
    <h2>Email ${index + 1}: ${email.subject}</h2>
    <div class="email-body">${email.body.replace(/\n/g, '<br>')}</div>
  </div>
  `).join('')}
</body>
</html>`;
          fileName += '.html';
          mimeType = 'text/html';
        } else if (exportFormat === 'markdown') {
          content = `# Email Series: ${seriesName || 'Untitled Series'}\n\n`;
          content += emailSeries.map((email, index) => 
            `## Email ${index + 1}: ${email.subject}\n\n${email.body}\n\n---\n\n`
          ).join('');
          fileName += '.md';
          mimeType = 'text/markdown';
        } else if (exportFormat === 'csv') {
          content = 'Email Number,Subject,Body\n';
          content += emailSeries.map((email, index) => 
            `${index + 1},"${email.subject.replace(/"/g, '""')}","${email.body.replace(/"/g, '""')}"`
          ).join('\n');
          fileName += '.csv';
          mimeType = 'text/csv';
        }
        
        // Create and download file
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast(`Series exported as ${exportFormat.toUpperCase()}!`, 'success');
      } catch (error) {
        console.error(`Error exporting as ${exportFormat}:`, error);
        showToast(`Failed to export as ${exportFormat}`, 'error');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800">Email Series Management</h3>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            {emailSeries.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">No emails have been generated yet.</p>
                <p className="text-gray-500 text-sm">
                  Generate emails first to create an email series.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-700 mb-2">
                    You have generated <span className="font-semibold">{emailSeries.length}</span> emails.
                  </p>
                  <p className="text-gray-600 text-sm">
                    You can save them as a series, add to an existing series, or export them.
                  </p>
                </div>
                
                {/* Series Name Input */}
                <div className="mb-6">
                  <label htmlFor="series-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Series Name
                  </label>
                  <Input
                    id="series-name"
                    value={seriesName}
                    onChange={(e) => setSeriesName(e.target.value)}
                    placeholder="Enter a name for this email series"
                    disabled={isSaving}
                  />
                </div>
                
                {/* Create New Series Button */}
                <div className="mb-6">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleCreateNewSeries}
                    disabled={!seriesName || isSaving}
                  >
                    {isSaving ? 'Saving...' : `Save All ${emailSeries.length} Emails as a Series`}
                  </Button>
                </div>
                
                <div className="border-t border-gray-200 py-4 my-4"></div>
                
                {/* Existing Series */}
                <div className="mb-6">
                  <label htmlFor="existing-series" className="block text-sm font-medium text-gray-700 mb-1">
                    Add to Existing Series
                  </label>
                  
                  {isLoadingSeries ? (
                    <div className="flex items-center justify-center h-10">
                      <Loader size="sm" />
                    </div>
                  ) : existingSeries.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No existing series found. Create your first series above.
                    </p>
                  ) : (
                    <>
                      <Select
                        id="existing-series"
                        value={selectedSeries?.id || ''}
                        onChange={(e) => handleSelectSeries(e.target.value)}
                        disabled={isSaving}
                      >
                        <option value="">Select a series</option>
                        {existingSeries.map((series) => (
                          <option key={series.id} value={series.id}>
                            {series.name} ({series.email_count} emails)
                          </option>
                        ))}
                      </Select>
                      
                      <div className="mt-3">
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={handleSaveToExistingSeries}
                          disabled={!selectedSeries || isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Add Current Email to Selected Series'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="border-t border-gray-200 py-4 my-4"></div>
                
                {/* Export Options */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Export Options</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="export-format" className="block text-sm text-gray-600 mb-1">
                        Export Format
                      </label>
                      <Select
                        id="export-format"
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                      >
                        <option value="text">Plain Text (.txt)</option>
                        <option value="html">HTML (.html)</option>
                        <option value="markdown">Markdown (.md)</option>
                        <option value="csv">CSV (.csv)</option>
                      </Select>
                    </div>
                    
                    <div>
                      <label htmlFor="series-schedule" className="block text-sm text-gray-600 mb-1">
                        Sending Schedule
                      </label>
                      <Select
                        id="series-schedule"
                        value={seriesSchedule}
                        onChange={(e) => setSeriesSchedule(e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="every-other-day">Every Other Day</option>
                        <option value="weekly">Weekly</option>
                        <option value="custom">Custom</option>
                      </Select>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleExportSeries}
                  >
                    Export Email Series
                  </Button>
                </div>
                
                {/* Usage Tips */}
                <Card className="bg-blue-50 border border-blue-100">
                  <div className="p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Tips for Email Series</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Send emails consistently to maintain engagement</li>
                      <li>• Alternate between educational and promotional content</li>
                      <li>• Include a clear call-to-action in each email</li>
                      <li>• Personalize emails based on subscriber behavior</li>
                      <li>• Test different subject lines for better open rates</li>
                    </ul>
                  </div>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmailSeriesPanel;
