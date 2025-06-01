// src/services/video2promo/transcriptService.js - SUPABASE ONLY VERSION

class TranscriptService {
  constructor() {
    // Use your existing serverless API endpoint (no Firebase)
    this.serverlessEndpoint = import.meta.env.VITE_TRANSCRIPT_API_URL || 'https://content-marketing-toolkit-8w8d.vercel.app/api/transcript';
    this.youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    
    console.log('🎥 Transcript Service initialized (Supabase-only)');
    console.log('📡 Serverless endpoint:', this.serverlessEndpoint);
    console.log('🔑 YouTube API key:', this.youtubeApiKey ? 'Available' : 'Missing');
  }

  /**
   * Main method to get transcript for a YouTube video
   */
  async getTranscript(videoUrl) {
    try {
      const videoId = this.extractVideoId(videoUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please provide a valid YouTube video link.');
      }

      console.log('🎬 Extracting transcript for video:', videoId);
      
      // Method 1: Try your serverless API first (most reliable)
      try {
        console.log('📡 Trying serverless API...');
        const serverlessResult = await this.fetchTranscriptViaServerless(videoId);
        if (serverlessResult.success) {
          console.log('✅ Serverless API successful!');
          return serverlessResult;
        }
      } catch (serverlessError) {
        console.warn('⚠️ Serverless API failed:', serverlessError.message);
      }

      // Method 2: Try YouTube Data API (if available)
      if (this.youtubeApiKey) {
        try {
          console.log('📺 Trying YouTube Data API...');
          const youtubeResult = await this.fetchTranscriptViaYouTubeAPI(videoId);
          if (youtubeResult.success) {
            console.log('✅ YouTube Data API successful!');
            return youtubeResult;
          }
        } catch (youtubeError) {
          console.warn('⚠️ YouTube Data API failed:', youtubeError.message);
        }
      }

      // Method 3: Try direct transcript URLs (no proxy needed)
      try {
        console.log('🔗 Trying direct transcript access...');
        const directResult = await this.fetchTranscriptDirectly(videoId);
        if (directResult.success) {
          console.log('✅ Direct transcript access successful!');
          return directResult;
        }
      } catch (directError) {
        console.warn('⚠️ Direct transcript access failed:', directError.message);
      }

      // Method 4: Try alternative transcript APIs
      try {
        console.log('🌐 Trying alternative transcript services...');
        const altResult = await this.fetchTranscriptViaAlternatives(videoId);
        if (altResult.success) {
          console.log('✅ Alternative service successful!');
          return altResult;
        }
      } catch (altError) {
        console.warn('⚠️ Alternative services failed:', altError.message);
      }

      // All methods failed
      throw new Error('Unable to fetch transcript. This video may not have captions enabled or may be restricted.');

    } catch (error) {
      console.error('❌ Transcript extraction failed:', error);
      return {
        success: false,
        error: error.message,
        transcript: null
      };
    }
  }

  /**
   * Method 1: Use your existing serverless API
   */
  async fetchTranscriptViaServerless(videoId) {
    try {
      const response = await fetch(this.serverlessEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoId,
          method: 'transcript'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Serverless API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.transcript && Array.isArray(data.transcript) && data.transcript.length > 0) {
        return {
          success: true,
          transcript: data.transcript,
          source: 'serverless_api'
        };
      } else {
        throw new Error('No transcript data returned from serverless API');
      }

    } catch (error) {
      console.error('Serverless transcript fetch failed:', error);
      throw error;
    }
  }

  /**
   * Method 2: Use YouTube Data API for captions
   */
  async fetchTranscriptViaYouTubeAPI(videoId) {
    try {
      // First, get caption tracks
      const captionsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${this.youtubeApiKey}`
      );

      if (!captionsResponse.ok) {
        throw new Error(`YouTube API error: ${captionsResponse.status}`);
      }

      const captionsData = await captionsResponse.json();
      
      if (!captionsData.items || captionsData.items.length === 0) {
        throw new Error('No captions available for this video');
      }

      // Find English captions
      const englishCaption = captionsData.items.find(item => 
        item.snippet.language === 'en' || item.snippet.language === 'en-US'
      ) || captionsData.items[0];

      // Download the caption
      const captionResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/captions/${englishCaption.id}?key=${this.youtubeApiKey}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!captionResponse.ok) {
        throw new Error(`Caption download error: ${captionResponse.status}`);
      }

      const captionText = await captionResponse.text();
      
      // Parse caption text into segments
      const transcript = this.parseCaptionText(captionText);

      return {
        success: true,
        transcript: transcript,
        source: 'youtube_data_api'
      };

    } catch (error) {
      console.error('YouTube Data API transcript fetch failed:', error);
      throw error;
    }
  }

  /**
   * Method 3: Try direct transcript access (no proxy)
   */
  async fetchTranscriptDirectly(videoId) {
    const transcriptUrls = [
      `http://video.google.com/timedtext?lang=en&v=${videoId}&kind=asr`,
      `http://video.google.com/timedtext?v=${videoId}&lang=en&fmt=srv3`,
      `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`,
    ];

    for (const url of transcriptUrls) {
      try {
        console.log('🔗 Trying direct URL:', url);
        
        // Try direct fetch (might work from Vercel edge functions)
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (response.ok) {
          const xmlText = await response.text();
          const transcript = this.parseTranscriptXML(xmlText);
          
          if (transcript && transcript.length > 0) {
            return {
              success: true,
              transcript: transcript,
              source: 'direct_access'
            };
          }
        }
      } catch (error) {
        console.warn(`Direct access failed for ${url}:`, error.message);
        continue;
      }
    }

    throw new Error('All direct transcript URLs failed');
  }

  /**
   * Method 4: Try alternative transcript services
   */
  async fetchTranscriptViaAlternatives(videoId) {
    const alternatives = [
      {
        name: 'YouTube Transcript API',
        url: `https://youtubetranscript.com/?server_vid2=${videoId}`,
        parser: 'json'
      },
      {
        name: 'Transcript Fetcher',
        url: `https://api.scrapfly.io/scrape?url=https://www.youtube.com/watch?v=${videoId}&render_js=true&extract=%7B%22transcript%22%3A%22%23transcript%22%7D`,
        parser: 'scrapfly'
      }
    ];

    for (const alt of alternatives) {
      try {
        console.log(`🌐 Trying ${alt.name}...`);
        
        const response = await fetch(alt.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; TranscriptBot/1.0)'
          }
        });

        if (response.ok) {
          const data = await response.json();
          let transcript;

          if (alt.parser === 'json' && data.transcript) {
            transcript = Array.isArray(data.transcript) ? data.transcript : [data.transcript];
          } else if (alt.parser === 'scrapfly' && data.result && data.result.transcript) {
            transcript = this.parseTranscriptText(data.result.transcript);
          }

          if (transcript && transcript.length > 0) {
            return {
              success: true,
              transcript: transcript,
              source: alt.name
            };
          }
        }
      } catch (error) {
        console.warn(`${alt.name} failed:`, error.message);
        continue;
      }
    }

    throw new Error('All alternative transcript services failed');
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url) {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Parse XML transcript format
   */
  parseTranscriptXML(xmlText) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      const textElements = doc.querySelectorAll('text');
      
      const transcript = [];
      textElements.forEach((element, index) => {
        const text = element.textContent?.trim();
        const start = parseFloat(element.getAttribute('start') || '0');
        const duration = parseFloat(element.getAttribute('dur') || '3');
        
        if (text && text.length > 0) {
          transcript.push({
            text: text,
            start: start,
            duration: duration,
            index: index
          });
        }
      });

      return transcript;
    } catch (error) {
      console.error('XML parsing failed:', error);
      return [];
    }
  }

  /**
   * Parse caption text format
   */
  parseCaptionText(captionText) {
    try {
      // Handle different caption formats
      if (captionText.includes('<?xml')) {
        return this.parseTranscriptXML(captionText);
      }

      // Handle JSON format
      if (captionText.startsWith('{') || captionText.startsWith('[')) {
        const data = JSON.parse(captionText);
        return Array.isArray(data) ? data : [data];
      }

      // Handle plain text format
      return this.parseTranscriptText(captionText);
    } catch (error) {
      console.error('Caption text parsing failed:', error);
      return [];
    }
  }

  /**
   * Parse plain text transcript
   */
  parseTranscriptText(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.map((sentence, index) => ({
      text: sentence.trim(),
      start: index * 3, // Estimate timing
      duration: 3,
      index: index
    }));
  }

  /**
   * Test method to check if transcript service is working
   */
  async testTranscriptService() {
    const testVideos = [
      'dQw4w9WgXcQ', // Rick Roll (usually has captions)
      'jNQXAC9IVRw', // Another test video
      'M7lc1UVf-VE'  // Another test video
    ];

    console.log('🧪 Testing transcript service...');
    
    for (const videoId of testVideos) {
      try {
        const result = await this.getTranscript(`https://www.youtube.com/watch?v=${videoId}`);
        if (result.success) {
          console.log(`✅ Test successful for video ${videoId}:`, result.source);
          return { success: true, videoId: videoId, source: result.source };
        }
      } catch (error) {
        console.warn(`❌ Test failed for video ${videoId}:`, error.message);
      }
    }

    return { success: false, error: 'All test videos failed' };
  }
}

// Export singleton instance
export const transcriptService = new TranscriptService();
