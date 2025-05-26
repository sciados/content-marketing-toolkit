// api/transcript.js - Vercel Serverless Function for YouTube Transcripts
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

  if (typeof videoId !== 'string' || videoId.length !== 11) {
    return res.status(400).json({
      success: false,
      error: 'Invalid video ID format. Must be 11 characters.'
    });
  }

  try {
    console.log('🎥 Fetching transcript for video:', videoId);
    
    // Try multiple YouTube transcript URLs
    const transcriptUrls = [
      `http://video.google.com/timedtext?lang=en&v=${videoId}&kind=asr`,
      `http://video.google.com/timedtext?lang=en&v=${videoId}`,
      `http://video.google.com/timedtext?lang=en-US&v=${videoId}`,
    ];

    let transcript = null;
    let method = 'unknown';

    for (const url of transcriptUrls) {
      try {
        console.log('Trying URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/xml, application/xml',
          },
          timeout: 10000
        });
        
        if (response.ok) {
          const xml = await response.text();
          
          if (xml && xml.includes('<text') && xml.length > 100) {
            console.log('✅ Got transcript XML, length:', xml.length);
            transcript = parseTranscriptXml(xml);
            method = url.includes('kind=asr') ? 'auto-generated' : 'manual';
            break;
          }
        }
      } catch (urlError) {
        console.log('URL failed:', url, urlError.message);
      }
    }

    if (!transcript || transcript.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No transcript found for this video',
        videoId,
        suggestions: [
          'Video may not have captions/subtitles enabled',
          'Try a video with auto-generated captions',
          'Test with: dQw4w9WgXcQ, jNQXAC9IVRw'
        ]
      });
    }

    const fullText = transcript.map(item => item.text).join(' ');
    const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
    const lastSegment = transcript[transcript.length - 1];
    const estimatedDuration = lastSegment ? 
      Math.round((lastSegment.offset + lastSegment.duration) / 1000) : 0;

    res.status(200).json({
      success: true,
      videoId,
      transcript,
      metadata: {
        method,
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

function parseTranscriptXml(xml) {
  const transcript = [];
  
  try {
    const textMatches = xml.match(/<text[^>]*>.*?<\/text>/gs) || [];
    
    if (textMatches.length === 0) {
      return [];
    }

    textMatches.forEach((match, index) => {
      try {
        const startMatch = match.match(/start="([^"]+)"/);
        const durMatch = match.match(/dur="([^"]+)"/);
        
        const start = startMatch ? parseFloat(startMatch[1]) : index * 3;
        const duration = durMatch ? parseFloat(durMatch[1]) : 3;
        
        let text = match.replace(/<text[^>]*>/, '').replace(/<\/text>/, '');
        
        // Decode HTML entities
        text = text
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/<[^>]+>/g, '')
          .trim();
        
        if (text && text.length > 0) {
          transcript.push({
            text,
            offset: Math.round(start * 1000),
            duration: Math.round(duration * 1000)
          });
        }
      } catch (segmentError) {
        console.warn(`Failed to parse segment ${index}:`, segmentError.message);
      }
    });
    
  } catch (error) {
    console.error('XML parsing failed:', error);
    throw new Error(`Failed to parse transcript XML: ${error.message}`);
  }
  
  return transcript;
}