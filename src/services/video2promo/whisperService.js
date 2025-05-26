// src/services/video2promo/whisperService.js
class WhisperService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_WHISPER_API_URL;
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.enableLogging = import.meta.env.VITE_ENABLE_API_LOGGING === 'true';
  }

  /**
   * Transcribe video using OpenAI Whisper (fallback method)
   * Note: This would require server-side implementation for YouTube audio extraction
   * @param {string} youtubeUrl - YouTube video URL
   * @returns {Promise<Object>} - Transcribed text with metadata
   */
   
  async transcribeVideo(youtubeUrl) {
    // Log the request if logging is enabled
    if (this.enableLogging) {
      console.log('🎙️ Whisper fallback requested for:', youtubeUrl);
    }

    // YouTube to Whisper transcription requires server-side implementation
    // Browser cannot directly download YouTube audio due to CORS and legal restrictions
    throw new Error(`No captions available for video ${youtubeUrl}. Please try a video with captions/subtitles enabled.`);
  }

  /**
   * Transcribe audio file using Whisper API
   * @param {File|Blob} audioFile - Audio file to transcribe
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} - Transcription result
   */
  async transcribeAudioFile(audioFile, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Whisper service not configured');
    }

    const {
      language = 'en',
      prompt = '',
      temperature = 0,
      format = 'json'
    } = options;

    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      formData.append('language', language);
      formData.append('response_format', format);
      
      if (prompt) {
        formData.append('prompt', prompt);
      }
      if (temperature > 0) {
        formData.append('temperature', temperature.toString());
      }

      const response = await fetch(`${this.apiUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Whisper API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      if (this.enableLogging) {
        console.log('✅ Whisper transcription completed');
      }

      return {
        transcript: result.text,
        language: result.language || language,
        duration: result.duration,
        segments: result.segments || []
      };

    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Download YouTube video audio (placeholder)
   * Note: This would require server-side implementation
   * @param {string} youtubeUrl - YouTube video URL
   * @returns {Promise<Blob>} - Audio blob
   */
  // eslint-disable-next-line no-unused-vars
  async downloadYouTubeAudio(youtubeUrl) {
    // This would typically be done server-side using youtube-dl or similar
    // Browser-based YouTube audio extraction is complex due to CORS and legal restrictions
    
    throw new Error('YouTube audio download not implemented. This requires server-side processing with youtube-dl or similar tools.');
  }

  /**
   * Extract video ID from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {string|null} - Video ID
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
   * Check if Whisper service is available
   * @returns {boolean} - Whether service is configured
   */
  isAvailable() {
    return !!(this.apiUrl && this.apiKey);
  }

  /**
   * Get service configuration status
   * @returns {Object} - Configuration status
   */
  getServiceStatus() {
    return {
      available: this.isAvailable(),
      hasApiUrl: !!this.apiUrl,
      hasApiKey: !!this.apiKey,
      apiUrl: this.apiUrl ? `${this.apiUrl.substring(0, 30)}...` : 'Not set'
    };
  }

  /**
   * Estimate transcription cost
   * @param {number} durationMinutes - Audio duration in minutes
   * @returns {number} - Estimated cost in USD
   */
  estimateTranscriptionCost(durationMinutes) {
    // OpenAI Whisper pricing: $0.006 per minute
    const pricePerMinute = 0.006;
    return Math.ceil(durationMinutes * pricePerMinute * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get supported audio formats
   * @returns {Array} - Supported file formats
   */
  getSupportedFormats() {
    return [
      'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'
    ];
  }

  /**
   * Validate audio file
   * @param {File} file - Audio file to validate
   * @returns {Object} - Validation result
   */
  validateAudioFile(file) {
    const maxSize = 25 * 1024 * 1024; // 25MB limit
    const supportedFormats = this.getSupportedFormats();
    
    const errors = [];
    const warnings = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds 25MB limit`);
    }

    // Check file format
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!supportedFormats.includes(extension)) {
      errors.push(`Unsupported format: ${extension}. Supported formats: ${supportedFormats.join(', ')}`);
    }

    // File size warnings
    if (file.size > 10 * 1024 * 1024) {
      warnings.push('Large files may take longer to process');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      estimatedCost: this.estimateTranscriptionCost(file.size / (1024 * 1024 * 2)) // Rough duration estimate
    };
  }
}

export const whisperService = new WhisperService();