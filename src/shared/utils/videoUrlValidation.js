// src/utils/videoUrlValidation.js
// Multi-platform video URL validation utility

export const SUPPORTED_PLATFORMS = [
  {
    name: 'YouTube',
    patterns: ['youtube.com', 'youtu.be', 'youtube-nocookie.com'],
    examples: ['https://www.youtube.com/watch?v=...', 'https://youtu.be/...']
  },
  {
    name: 'Vimeo',
    patterns: ['vimeo.com'],
    examples: ['https://vimeo.com/123456789', 'https://player.vimeo.com/video/...']
  },
  {
    name: 'TikTok',
    patterns: ['tiktok.com'],
    examples: ['https://www.tiktok.com/@user/video/...']
  },
  {
    name: 'Dailymotion',
    patterns: ['dailymotion.com'],
    examples: ['https://www.dailymotion.com/video/...']
  },
  {
    name: 'Twitch',
    patterns: ['twitch.tv'],
    examples: ['https://www.twitch.tv/videos/...']
  }
];

/**
 * Validates if a URL is from a supported video platform
 * @param {string} url - The video URL to validate
 * @returns {object} - Validation result with platform info
 */
export const validateVideoUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a valid video URL',
      platform: null
    };
  }

  const cleanUrl = url.trim().toLowerCase();
  
  // Check if it looks like a URL
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return {
      isValid: false,
      error: 'URL must start with http:// or https://',
      platform: null
    };
  }

  // Find matching platform
  const platform = SUPPORTED_PLATFORMS.find(platform => 
    platform.patterns.some(pattern => cleanUrl.includes(pattern))
  );

  if (!platform) {
    const supportedNames = SUPPORTED_PLATFORMS.map(p => p.name).join(', ');
    return {
      isValid: false,
      error: `Unsupported platform. We support: ${supportedNames}`,
      platform: null,
      supportedPlatforms: SUPPORTED_PLATFORMS
    };
  }

  return {
    isValid: true,
    error: null,
    platform: platform.name,
    platformInfo: platform
  };
};

/**
 * Gets user-friendly platform examples for display
 * @returns {string} - Formatted examples string
 */
export const getPlatformExamples = () => {
  return SUPPORTED_PLATFORMS
    .map(platform => `${platform.name}: ${platform.examples[0]}`)
    .join('\n');
};

/**
 * Checks if URL is specifically YouTube (for backward compatibility)
 * @param {string} url - The video URL
 * @returns {boolean} - True if YouTube URL
 */
export const isYouTubeUrl = (url) => {
  if (!url) return false;
  const cleanUrl = url.toLowerCase();
  return cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');
};

/**
 * Gets platform-specific processing info for user display
 * @param {string} platformName - Name of the platform
 * @returns {object} - Platform processing information
 */
export const getPlatformProcessingInfo = (platformName) => {
  const processingInfo = {
    'YouTube': {
      description: 'Professional-grade transcription with high accuracy',
      avgTime: '30-60 seconds',
      notes: ['Works with public and unlisted videos', 'Best quality for clear audio']
    },
    'Vimeo': {
      description: 'High-quality transcription for creative content',
      avgTime: '30-60 seconds', 
      notes: ['Works with public videos', 'Great for educational content']
    },
    'TikTok': {
      description: 'Optimized for short-form content',
      avgTime: '15-30 seconds',
      notes: ['Best for videos under 10 minutes', 'May vary with audio quality']
    },
    'Dailymotion': {
      description: 'Reliable transcription for diverse content',
      avgTime: '30-60 seconds',
      notes: ['Works with public videos', 'Good for international content']
    },
    'Twitch': {
      description: 'Gaming and live content transcription',
      avgTime: '45-90 seconds',
      notes: ['Works with VODs', 'May have background noise challenges']
    }
  };

  return processingInfo[platformName] || {
    description: 'Standard video transcription',
    avgTime: '30-60 seconds',
    notes: ['Processing time may vary with content length and quality']
  };
};