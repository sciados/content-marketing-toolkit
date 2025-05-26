// src/services/video2promo/transcriptService.js

class TranscriptService {
  constructor() {
    this.enableLogging = import.meta.env.VITE_ENABLE_API_LOGGING === 'true';
  }

  /**
   * Get transcript from YouTube video
   * @param {string} youtubeUrl - YouTube video URL
   * @returns {Promise<Object>} - Transcript data with metadata
   */
  async getTranscript(youtubeUrl) {
    try {
      const videoId = this.extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL format');
      }

      if (this.enableLogging) {
        console.log('🎥 Fetching transcript for video:', videoId);
      }

      // Try to get transcript using dynamic import to handle SSR/build issues
      let transcript;
      try {
        const { YoutubeTranscript } = await import('youtube-transcript');
        transcript = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: 'en',
          country: 'US'
        });
      // eslint-disable-next-line no-unused-vars
      } catch (importError) {
        if (this.enableLogging) {
          console.warn('youtube-transcript not available, checking fallback options');
        }
        // Try Whisper service as fallback
        try {
          const { whisperService } = await import('./whisperService.js');
          return await whisperService.transcribeVideo(youtubeUrl);
        // eslint-disable-next-line no-unused-vars
        } catch (whisperError) {
          throw new Error('YouTube transcript service unavailable and Whisper fallback failed. Please ensure the video has captions enabled.');
        }
      }

      const cleanedTranscript = this.cleanTranscript(transcript);
      const metadata = await this.getVideoMetadata(videoId);

      if (this.enableLogging) {
        console.log('✅ Transcript fetched successfully:', {
          videoId,
          transcriptLength: cleanedTranscript.length,
          wordCount: this.countWords(cleanedTranscript)
        });
      }

      return {
        videoId,
        transcript: cleanedTranscript,
        rawTranscript: transcript,
        metadata,
        wordCount: this.countWords(cleanedTranscript),
        duration: this.calculateDuration(transcript)
      };

    } catch (error) {
      console.error('Error fetching transcript:', error);
      
      // If transcript is not available, we could fallback to Whisper here
      // For now, throw an error with helpful message
      if (error.message.includes('Transcript is disabled')) {
        throw new Error('Transcript is disabled for this video. Please try a different video or enable captions.');
      } else if (error.message.includes('No transcript found')) {
        throw new Error('No transcript available for this video. The video may not have captions.');
      } else {
        throw new Error(`Failed to fetch transcript: ${error.message}`);
      }
    }
  }

  /**
   * Extract video ID from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {string|null} - Video ID or null if invalid
   */
  extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Clean and format transcript text
   * @param {Array} rawTranscript - Raw transcript from YouTube
   * @returns {string} - Cleaned transcript text
   */
  cleanTranscript(rawTranscript) {
    if (!Array.isArray(rawTranscript)) {
      return '';
    }

    return rawTranscript
      .map(item => item.text || '')
      .join(' ')
      // Remove common YouTube auto-caption artifacts
      .replace(/\[Music\]/gi, '')
      .replace(/\[Applause\]/gi, '')
      .replace(/\[Laughter\]/gi, '')
      .replace(/\[.*?\]/g, '') // Remove any other bracketed content
      // Clean up filler words and repetitions
      .replace(/\b(um|uh|like|you know|so|actually)\b/gi, '')
      // Fix spacing and punctuation
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s*([a-z])/g, '$1 $2')
      .trim();
  }

  /**
   * Get basic video metadata
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Object>} - Video metadata
   */
  async getVideoMetadata(videoId) {
    try {
      // For now, return basic metadata
      // In a full implementation, you'd use YouTube Data API
      return {
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      };
    } catch (error) {
      console.warn('Could not fetch video metadata:', error);
      return {
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      };
    }
  }

  /**
   * Count words in text
   * @param {string} text - Text to count
   * @returns {number} - Word count
   */
  countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate approximate duration from transcript
   * @param {Array} rawTranscript - Raw transcript with timestamps
   * @returns {number} - Duration in seconds
   */
  calculateDuration(rawTranscript) {
    if (!Array.isArray(rawTranscript) || rawTranscript.length === 0) {
      return 0;
    }

    // Get the last timestamp + offset as approximate duration
    const lastItem = rawTranscript[rawTranscript.length - 1];
    if (lastItem && lastItem.offset && lastItem.duration) {
      return Math.ceil((lastItem.offset + lastItem.duration) / 1000);
    }

    // If no timing info, estimate based on word count (average 150 words per minute)
    const wordCount = rawTranscript.reduce((count, item) => {
      return count + (item.text ? item.text.split(' ').length : 0);
    }, 0);

    return Math.ceil((wordCount / 150) * 60);
  }

  /**
   * Alternative method to get transcript using YouTube's internal API
   * This is a fallback when youtube-transcript library isn't available
   */
  async getTranscriptFallback() {
    try {
      // This is a simplified version - in production you might want to use YouTube Data API
      // For now, this is just a placeholder that throws an error
      throw new Error('Fallback transcript method not fully implemented. Please ensure youtube-transcript package is available.');
    } catch (error) {
      throw new Error('Unable to fetch transcript using fallback method: ' + error.message);
    }
  }

  /**
   * Check if transcript service is available
   */
  async isServiceAvailable() {
    try {
      await import('youtube-transcript');
      return true;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      if (this.enableLogging) {
        console.warn('youtube-transcript package not available');
      }
      return false;
    }
  }

  /**
   * Validate YouTube URL
   * @param {string} url - URL to validate
   * @returns {boolean} - Whether URL is valid YouTube URL
   */
  isValidYouTubeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return this.extractVideoId(url) !== null;
  }
}

export const transcriptService = new TranscriptService();