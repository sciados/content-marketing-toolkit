// src/hooks/useTranscript.js
import { useState, useCallback } from 'react';
import { transcriptService } from '../services/video2promo';

export function useTranscript() {
  const [transcript, setTranscript] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch transcript from YouTube URL
   */
  const fetchTranscript = useCallback(async (youtubeUrl) => {
    if (!youtubeUrl) {
      setError('YouTube URL is required');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transcriptData = await transcriptService.getTranscript(youtubeUrl);
      setTranscript(transcriptData);
      return transcriptData;
    } catch (err) {
      console.error('Error fetching transcript:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear current transcript
   */
  const clearTranscript = useCallback(() => {
    setTranscript(null);
    setError(null);
  }, []);

  /**
   * Validate YouTube URL
   */
  const validateUrl = useCallback((url) => {
    return transcriptService.isValidYouTubeUrl(url);
  }, []);

  return {
    transcript,
    isLoading,
    error,
    fetchTranscript,
    clearTranscript,
    validateUrl
  };
}