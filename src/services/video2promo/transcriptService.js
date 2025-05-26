// src/services/video2promo/transcriptService.js - UPDATED with serverless function integration

class TranscriptService {
  constructor() {
    this.enableLogging = import.meta.env.VITE_ENABLE_API_LOGGING === 'true';
    this.youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    
    // Multiple CORS proxies for better reliability
    this.corsProxies = [
      import.meta.env.VITE_CORS_PROXY_URL, // Your current proxy
      'https://api.allorigins.win/raw?url=', // Backup 1
      'https://thingproxy.freeboard.io/fetch/', // Backup 2
      'https://api.codetabs.com/v1/proxy?quest=', // Backup 3
    ].filter(Boolean); // Remove any undefined proxies
    
    // Test videos known to have working transcripts
    this.WORKING_TEST_VIDEOS = [
      'dQw4w9WgXcQ', // Rick Roll - has auto-generated captions
      'jNQXAC9IVRw', // Me at the zoo - first YouTube video
      'kJQP7kiw5Fk', // Despacito - popular video with captions
      'YQHsXMglC9A', // Hello - Adele (music video with captions)
      'ScMzIvxBSi4', // That's What Friends Are For (has captions)
    ];
  }

  /**
   * Get transcript from YouTube video - UPDATED with serverless priority
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

      // First get video metadata
      const metadata = await this.getVideoMetadata(videoId);
      
      let transcript;
      let method = 'unknown';
      
      try {
        // Method 0: Serverless function (NEW - highest priority!)
        transcript = await this.fetchTranscriptViaServerless(videoId);
        method = 'serverless';
      } catch (serverlessError) {
        if (this.enableLogging) {
          console.warn('Serverless method failed:', serverlessError.message);
        }
        
        try {
          // Method 1: Direct YouTube timedtext API with multiple proxies
          transcript = await this.fetchTranscriptViaDirect(videoId);
          method = 'direct';
        } catch (directError) {
          if (this.enableLogging) {
            console.warn('Direct method failed:', directError.message);
          }
          
          try {
            // Method 2: Third-party services
            transcript = await this.fetchTranscriptViaThirdParty(videoId);
            method = 'third-party';
          } catch (thirdPartyError) {
            if (this.enableLogging) {
              console.warn('Third-party method failed:', thirdPartyError.message);
            }
            
            try {
              // Method 3: Page scraping (fallback)
              transcript = await this.fetchTranscriptViaScraping(videoId);
              method = 'scraping';
            } catch (scrapeError) {
              if (this.enableLogging) {
                console.warn('Scraping method failed:', scrapeError.message);
              }
              
              // Final error with helpful message
              throw new Error(`Unable to fetch transcript for video ${videoId}. 

🔍 All methods failed:
- Serverless: ${serverlessError.message}
- Direct: ${directError.message}
- Third-party: ${thirdPartyError.message}
- Scraping: ${scrapeError.message}

💡 Possible solutions:
1. Video may not have captions/subtitles enabled
2. Video may be private, age-restricted, or region-blocked
3. Try a video with auto-generated captions
4. Test with known working videos: ${this.WORKING_TEST_VIDEOS.slice(0, 2).join(', ')}
5. Check your serverless function deployment
6. Verify CORS proxy setup: ${this.corsProxies[0]}

🧪 For immediate testing, try the browser CORS extension method.`);
            }
          }
        }
      }

      const cleanedTranscript = this.cleanTranscript(transcript);

      if (this.enableLogging) {
        console.log('✅ Transcript fetched successfully:', {
          videoId,
          method,
          transcriptLength: cleanedTranscript.length,
          wordCount: this.countWords(cleanedTranscript),
          segments: transcript.length
        });
      }

      return {
        videoId,
        transcript: cleanedTranscript,
        rawTranscript: transcript,
        metadata: {
          ...metadata,
          fetchMethod: method
        },
        wordCount: this.countWords(cleanedTranscript),
        duration: this.calculateDuration(transcript)
      };

    } catch (error) {
      console.error('Error fetching transcript:', error);
      throw error;
    }
  }

  /**
   * Method 0: Fetch via serverless function (NEW - highest priority)
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Array>} - Transcript items
   */
  async fetchTranscriptViaServerless(videoId) {
    try {
      if (this.enableLogging) {
        console.log('🚀 Using serverless function for:', videoId);
      }

      // Get serverless function URL
      const serverlessUrl = import.meta.env.VITE_TRANSCRIPT_API_URL || 
                           `${window.location.origin}/api/transcript`;
      
      if (this.enableLogging) {
        console.log('Serverless URL:', serverlessUrl);
      }

      const response = await fetch(`${serverlessUrl}?videoId=${videoId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `${errorMessage} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Serverless function returned unsuccessful response');
      }
      
      if (!data.transcript || !Array.isArray(data.transcript)) {
        throw new Error('Invalid transcript format returned from serverless function');
      }
      
      if (this.enableLogging) {
        console.log('✅ Serverless success:', {
          method: data.metadata?.method,
          segments: data.metadata?.stats?.segments,
          wordCount: data.metadata?.stats?.wordCount,
          duration: data.metadata?.stats?.estimatedDuration
        });
      }
      
      return data.transcript;
      
    } catch (error) {
      console.error('Serverless function failed:', error);
      throw new Error(`Serverless transcript fetch failed: ${error.message}`);
    }
  }

  /**
   * Method 1: Direct YouTube timedtext API with multiple proxies - UPDATED
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Array>} - Transcript items
   */
  async fetchTranscriptViaDirect(videoId) {
    try {
      if (this.enableLogging) {
        console.log('🎯 Trying direct YouTube timedtext API for:', videoId);
      }

      // Test URLs that should work
      const transcriptUrls = [
        `http://video.google.com/timedtext?lang=en&v=${videoId}&kind=asr`,
        `http://video.google.com/timedtext?lang=en&v=${videoId}`,
        `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`,
        `http://video.google.com/timedtext?v=${videoId}&lang=en&fmt=srv3`,
      ];

      // Try each URL with each available proxy
      for (const transcriptUrl of transcriptUrls) {
        for (const proxy of this.corsProxies) {
          try {
            const proxyUrl = `${proxy}${encodeURIComponent(transcriptUrl)}`;
            
            if (this.enableLogging) {
              console.log('Trying:', proxy.split('/')[2], 'with', transcriptUrl.split('?')[1]);
            }

            const response = await fetch(proxyUrl, {
              method: 'GET',
              headers: {
                'Accept': 'text/xml, application/xml, text/plain',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
            
            if (response.ok) {
              const xml = await response.text();
              
              if (xml && xml.includes('<text') && xml.length > 50) {
                console.log(`✅ Success! Got ${xml.length} chars from ${proxy.split('/')[2]}`);
                return this.parseCaptionXml(xml);
              }
            }
          } catch (proxyError) {
            if (this.enableLogging) {
              console.log('Proxy failed:', proxy.split('/')[2], proxyError.message);
            }
          }
        }
      }

      throw new Error('All proxy + URL combinations failed');
      
    } catch (error) {
      console.error('Direct method with proxies failed:', error);
      throw error;
    }
  }

  /**
   * Method 2: Third-party transcript services
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Array>} - Transcript items
   */
  async fetchTranscriptViaThirdParty(videoId) {
    try {
      if (this.enableLogging) {
        console.log('🌐 Trying third-party transcript services for:', videoId);
      }

      // Option A: Try RapidAPI if key is available
      if (import.meta.env.VITE_RAPIDAPI_KEY) {
        try {
          const rapidApiUrl = `https://youtube-transcript1.p.rapidapi.com/transcript`;
          const response = await fetch(rapidApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'youtube-transcript1.p.rapidapi.com'
            },
            body: JSON.stringify({
              video_id: videoId,
              language: 'en'
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.transcript && Array.isArray(data.transcript)) {
              console.log('✅ Got transcript from RapidAPI');
              return data.transcript.map(item => ({
                text: item.text,
                offset: Math.round((item.start || 0) * 1000),
                duration: Math.round((item.duration || 3) * 1000)
              }));
            }
          }
        } catch (rapidApiError) {
          console.log('RapidAPI failed:', rapidApiError.message);
        }
      }

      // Option B: Custom API endpoint if available
      if (import.meta.env.VITE_CUSTOM_TRANSCRIPT_API) {
        try {
          const customApiUrl = `${import.meta.env.VITE_CUSTOM_TRANSCRIPT_API}/transcript/${videoId}`;
          const response = await fetch(customApiUrl);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.transcript) {
              console.log('✅ Got transcript from custom API');
              return data.transcript;
            }
          }
        } catch (customApiError) {
          console.log('Custom API failed:', customApiError.message);
        }
      }

      throw new Error('All third-party services failed or unavailable');
      
    } catch (error) {
      console.error('Third-party transcript services failed:', error);
      throw error;
    }
  }

  /**
   * Method 3: Page scraping (last resort)
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Array>} - Transcript items
   */
  async fetchTranscriptViaScraping(videoId) {
    try {
      if (this.enableLogging) {
        console.log('🕷️ Trying page scraping for:', videoId);
      }

      // Only try scraping if we have working proxies
      if (this.corsProxies.length === 0) {
        throw new Error('No CORS proxies available for scraping');
      }

      // Get the YouTube video page
      const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      for (const proxy of this.corsProxies) {
        try {
          const response = await fetch(`${proxy}${encodeURIComponent(videoPageUrl)}`);
          
          if (response.ok) {
            const html = await response.text();
            
            // Try to extract captions from the page HTML
            const captionTracks = this.extractCaptionTracks(html);
            if (captionTracks.length > 0) {
              // Find the best caption track
              let bestTrack = captionTracks.find(track => 
                track.languageCode === 'en' && track.isAutoGenerated
              ) || captionTracks.find(track => 
                track.languageCode === 'en' || track.languageCode.startsWith('en')
              ) || captionTracks[0];
              
              // Fetch the caption XML
              const captionResponse = await fetch(`${proxy}${encodeURIComponent(bestTrack.baseUrl)}`);
              if (captionResponse.ok) {
                const captionXml = await captionResponse.text();
                return this.parseCaptionXml(captionXml);
              }
            }
          }
        } catch (proxyError) {
          console.log('Scraping proxy failed:', proxy, proxyError.message);
        }
      }
      
      throw new Error('Page scraping failed with all proxies');
      
    } catch (error) {
      console.error('Page scraping failed:', error);
      throw error;
    }
  }

  /**
   * Debug method to test all available methods
   * @param {string} videoId - Video ID to test
   * @returns {Promise<Object>} - Test results
   */
  async debugAllMethods(videoId = 'dQw4w9WgXcQ') {
    const results = {
      videoId,
      timestamp: new Date().toISOString(),
      methods: {}
    };

    console.log('🔍 Testing all transcript methods for:', videoId);

    // Test serverless function
    try {
      const transcript = await this.fetchTranscriptViaServerless(videoId);
      results.methods.serverless = {
        success: true,
        segments: transcript.length,
        wordCount: transcript.reduce((count, item) => count + item.text.split(' ').length, 0)
      };
    } catch (error) {
      results.methods.serverless = {
        success: false,
        error: error.message
      };
    }

    // Test direct method
    try {
      const transcript = await this.fetchTranscriptViaDirect(videoId);
      results.methods.direct = {
        success: true,
        segments: transcript.length
      };
    } catch (error) {
      results.methods.direct = {
        success: false,
        error: error.message
      };
    }

    // Test third-party
    try {
      const transcript = await this.fetchTranscriptViaThirdParty(videoId);
      results.methods.thirdParty = {
        success: true,
        segments: transcript.length
      };
    } catch (error) {
      results.methods.thirdParty = {
        success: false,
        error: error.message
      };
    }

    console.log('🔍 Debug results:', results);
    return results;
  }

  /**
   * Test with a known working video
   * @returns {Promise<Object>} - Test result
   */
  async testWithKnownVideo() {
    const testVideoId = this.WORKING_TEST_VIDEOS[0]; // Rick Roll
    try {
      console.log('🧪 Testing with known working video:', testVideoId);
      const result = await this.getTranscript(`https://www.youtube.com/watch?v=${testVideoId}`);
      console.log('✅ Test successful!', {
        videoId: result.videoId,
        method: result.metadata.fetchMethod,
        transcriptLength: result.transcript.length,
        wordCount: result.wordCount,
        duration: result.duration
      });
      return result;
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  /**
   * Extract caption tracks from YouTube video page HTML
   * @param {string} html - YouTube video page HTML
   * @returns {Array} - Caption track information
   */
  extractCaptionTracks(html) {
    const tracks = [];
    try {
      const patterns = [
        /"captionTracks":\[(.*?)\]/,
        /"captions".*?"captionTracks":\[(.*?)\]/,
        /playerCaptionsTracklistRenderer.*?captionTracks":\[(.*?)\]/
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          try {
            const trackData = JSON.parse(`[${match[1]}]`);
            trackData.forEach(track => {
              if (track.baseUrl && track.languageCode) {
                tracks.push({
                  baseUrl: track.baseUrl,
                  languageCode: track.languageCode,
                  name: track.name?.simpleText || track.languageCode,
                  isAutoGenerated: track.kind === 'asr'
                });
              }
            });
            break;
          } catch (parseError) {
            console.warn('Failed to parse caption tracks:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Error extracting caption tracks:', error);
    }
    
    return tracks;
  }

  /**
   * Parse caption XML to transcript format - IMPROVED
   * @param {string} xml - Caption XML content
   * @returns {Array} - Transcript items
   */
  parseCaptionXml(xml) {
    const transcript = [];
    try {
      if (this.enableLogging) {
        console.log('📝 Parsing caption XML, length:', xml.length);
      }
      
      const textMatches = xml.match(/<text[^>]*>.*?<\/text>/gs) || [];
      
      if (textMatches.length === 0) {
        throw new Error('No text elements found in caption XML');
      }
      
      textMatches.forEach((match, index) => {
        try {
          const startMatch = match.match(/start="([^"]+)"/);
          const durMatch = match.match(/dur="([^"]+)"/);
          
          const start = startMatch ? parseFloat(startMatch[1]) : index * 3;
          const duration = durMatch ? parseFloat(durMatch[1]) : 3;
          
          const text = this.extractTextFromHtml(match);
          
          if (text && text.length > 0) {
            transcript.push({
              text,
              offset: Math.round(start * 1000),
              duration: Math.round(duration * 1000)
            });
          }
        } catch (parseError) {
          if (this.enableLogging) {
            console.warn(`Failed to parse caption segment ${index}:`, parseError);
          }
        }
      });
      
      if (transcript.length === 0) {
        throw new Error('No valid transcript segments found after parsing');
      }
      
      if (this.enableLogging) {
        console.log(`✅ Parsed ${transcript.length} transcript segments`);
      }
      
    } catch (error) {
      console.error('Error parsing caption XML:', error);
      throw new Error(`Failed to parse transcript: ${error.message}`);
    }
    
    return transcript;
  }

  /**
   * Extract clean text from HTML element
   * @param {string} html - HTML string
   * @returns {string} - Clean text
   */
  extractTextFromHtml(html) {
    let text = html.replace(/<text[^>]*>/, '').replace(/<\/text>/, '');
    
    // Decode HTML entities
    text = text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (match, num) => {
        try {
          return String.fromCharCode(parseInt(num, 10));
        } catch {
          return match;
        }
      })
      .replace(/<[^>]+>/g, '')
      .trim();
    
    return text;
  }

  /**
   * Get video metadata using YouTube Data API - IMPROVED
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Object>} - Video metadata
   */
  async getVideoMetadata(videoId) {
    try {
      if (!this.youtubeApiKey || this.youtubeApiKey.includes('your-youtube-api-key')) {
        if (this.enableLogging) {
          console.warn('No YouTube API key configured, using basic metadata');
        }
        return this.getBasicMetadata(videoId);
      }

      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${this.youtubeApiKey}&part=snippet,contentDetails,statistics`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found or not accessible via YouTube API');
      }
      
      const video = data.items[0];
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;
      
      return {
        videoId,
        title: snippet.title,
        description: snippet.description,
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        duration: this.parseYouTubeDuration(contentDetails.duration),
        thumbnails: snippet.thumbnails,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount
      };
      
    } catch (error) {
      if (this.enableLogging) {
        console.warn('Failed to get metadata from API:', error.message);
      }
      return this.getBasicMetadata(videoId);
    }
  }

  /**
   * Get basic metadata without API
   * @param {string} videoId - YouTube video ID
   * @returns {Object} - Basic metadata
   */
  getBasicMetadata(videoId) {
    return {
      videoId,
      title: `YouTube Video ${videoId}`,
      description: '',
      channelTitle: 'Unknown Channel',
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnails: {
        maxres: { url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
        high: { url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
        medium: { url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
        default: { url: `https://img.youtube.com/vi/${videoId}/default.jpg` }
      }
    };
  }

  /**
   * Parse YouTube duration format (PT1M30S) to seconds
   * @param {string} duration - YouTube duration string
   * @returns {number} - Duration in seconds
   */
  parseYouTubeDuration(duration) {
    if (!duration) return 0;
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Extract video ID from YouTube URL - IMPROVED
   * @param {string} url - YouTube URL
   * @returns {string|null} - Video ID or null if invalid
   */
  extractVideoId(url) {
    if (!url || typeof url !== 'string') {
      return null;
    }

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Clean and format transcript text - IMPROVED
   * @param {Array} rawTranscript - Raw transcript from YouTube
   * @returns {string} - Cleaned transcript text
   */
  cleanTranscript(rawTranscript) {
    if (!Array.isArray(rawTranscript) || rawTranscript.length === 0) {
      return '';
    }

    return rawTranscript
      .map(item => item.text || '')
      .join(' ')
      .replace(/\[Music\]/gi, '')
      .replace(/\[Applause\]/gi, '')
      .replace(/\[Laughter\]/gi, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s*([a-z])/g, '$1 $2')
      .replace(/([a-z])([A-Z])/g, '$1. $2')
      .trim();
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
   * Calculate duration from transcript
   * @param {Array} rawTranscript - Raw transcript with timestamps
   * @returns {number} - Duration in seconds
   */
  calculateDuration(rawTranscript) {
    if (!Array.isArray(rawTranscript) || rawTranscript.length === 0) {
      return 0;
    }

    const lastItem = rawTranscript[rawTranscript.length - 1];
    if (lastItem && lastItem.offset !== undefined && lastItem.duration !== undefined) {
      return Math.ceil((lastItem.offset + lastItem.duration) / 1000);
    }

    const totalWords = rawTranscript.reduce((count, item) => {
      return count + (item.text ? this.countWords(item.text) : 0);
    }, 0);

    return Math.ceil((totalWords / 150) * 60);
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