// api/transcript.js - Vercel Serverless Function for YouTube Transcripts
// This bypasses CORS by fetching transcripts server-side

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET.' 
    });
  }

  const { videoId } = req.query;
  
  if (!videoId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Video ID required. Usage: /api/transcript?videoId=YOUR_VIDEO_ID' 
    });
  }

  // Validate video ID format (YouTube video IDs are 11 characters)
  if (typeof videoId !== 'string' || videoId.length !== 11) {
    return res.status(400).json({
      success: false,
      error: 'Invalid video ID format. Must be 11 characters.'
    });
  }

  try {
    console.log('🎥 Fetching transcript for video:', videoId);
    
    // Try multiple YouTube transcript URLs (server-side, no CORS issues)
    const transcriptUrls = [
      // Auto-generated captions (most reliable)
      `http://video.google.com/timedtext?lang=en&v=${videoId}&kind=asr`,
      // Regular captions
      `http://video.google.com/timedtext?lang=en&v=${videoId}`,
      // US English variant
      `http://video.google.com/timedtext?lang=en-US&v=${videoId}`,
      // Alternative format
      `http://video.google.com/timedtext?v=${videoId}&lang=en&fmt=srv3`,
      // YouTube API endpoint
      `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`,
    ];

    let transcript = null;
    let method = 'unknown';
    let usedUrl = '';

    // Try each URL until one works
    for (const url of transcriptUrls) {
      try {
        console.log('Trying URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/xml, application/xml, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          timeout: 10000 // 10 second timeout
        });
        
        if (response.ok) {
          const xml = await response.text();
          
          // Check if we got valid transcript XML
          if (xml && xml.includes('<text') && xml.length > 100) {
            console.log('✅ Got transcript XML, length:', xml.length);
            
            transcript = parseTranscriptXml(xml);
            method = url.includes('kind=asr') ? 'auto-generated' : 
                     url.includes('api/timedtext') ? 'api' : 'manual';
            usedUrl = url;
            break;
          } else if (xml && xml.length > 0) {
            console.log('⚠️ Got response but no transcript data:', xml.substring(0, 200));
          }
        } else {
          console.log('❌ URL failed with status:', response.status);
        }
      } catch (urlError) {
        console.log('❌ URL error:', url, urlError.message);
      }
    }

    // If no transcript found, return helpful error
    if (!transcript || transcript.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No transcript found for this video',
        details: {
          videoId,
          reasons: [
            'Video may not have captions/subtitles enabled',
            'Video may be private or age-restricted', 
            'Captions may not be available in English',
            'Video may be region-blocked'
          ],
          suggestions: [
            'Try a different video with auto-generated captions',
            'Check if the video has captions on YouTube.com',
            'Try these known working video IDs: dQw4w9WgXcQ, jNQXAC9IVRw'
          ]
        }
      });
    }

    // Calculate transcript statistics
    const fullText = transcript.map(item => item.text).join(' ');
    const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
    const lastSegment = transcript[transcript.length - 1];
    const estimatedDuration = lastSegment ? 
      Math.round((lastSegment.offset + lastSegment.duration) / 1000) : 0;

    // Return successful response
    res.status(200).json({
      success: true,
      videoId,
      transcript,
      metadata: {
        method,
        usedUrl,
        fetchedAt: new Date().toISOString(),
        stats: {
          segments: transcript.length,
          wordCount,
          estimatedDuration,
          avgSegmentLength: Math.round(wordCount / transcript.length)
        }
      }
    });

  } catch (error) {
    console.error('❌ Transcript fetch failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching transcript',
      details: error.message,
      videoId
    });
  }
}

/**
 * Parse YouTube transcript XML into structured format
 * @param {string} xml - Raw XML from YouTube
 * @returns {Array} - Parsed transcript segments
 */
function parseTranscriptXml(xml) {
  const transcript = [];
  
  try {
    // Find all text elements in the XML
    const textMatches = xml.match(/<text[^>]*>.*?<\/text>/gs) || [];
    
    if (textMatches.length === 0) {
      console.log('No <text> elements found in XML');
      return [];
    }

    console.log(`Parsing ${textMatches.length} text segments`);
    
    textMatches.forEach((match, index) => {
      try {
        // Extract timing attributes
        const startMatch = match.match(/start="([^"]+)"/);
        const durMatch = match.match(/dur="([^"]+)"/);
        
        const start = startMatch ? parseFloat(startMatch[1]) : index * 3;
        const duration = durMatch ? parseFloat(durMatch[1]) : 3;
        
        // Extract and clean text content
        let text = match.replace(/<text[^>]*>/, '').replace(/<\/text>/, '');
        
        // Decode HTML entities
        text = decodeHtmlEntities(text);
        
        // Remove any remaining HTML tags
        text = text.replace(/<[^>]+>/g, '').trim();
        
        // Only add non-empty text segments
        if (text && text.length > 0) {
          transcript.push({
            text,
            offset: Math.round(start * 1000), // Convert to milliseconds
            duration: Math.round(duration * 1000)
          });
        }
      } catch (segmentError) {
        console.warn(`Failed to parse segment ${index}:`, segmentError.message);
      }
    });
    
    console.log(`✅ Successfully parsed ${transcript.length} segments`);
    
  } catch (error) {
    console.error('XML parsing failed:', error);
    throw new Error(`Failed to parse transcript XML: ${error.message}`);
  }
  
  return transcript;
}

/**
 * Decode HTML entities in text
 * @param {string} text - Text with HTML entities
 * @returns {string} - Decoded text
 */
function decodeHtmlEntities(text) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' '
  };
  
  // Replace named entities
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }
  
  // Replace numeric entities (&#123; and &#x1F;)
  decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
    try {
      return String.fromCharCode(parseInt(num, 10));
    } catch {
      return match;
    }
  });
  
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return match;
    }
  });
  
  return decoded;
}