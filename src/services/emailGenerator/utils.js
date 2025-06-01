// src/services/emailGenerator/utils.js

/**
 * Extract the domain name from a URL
 * 
 * @param {string} url - URL to extract domain from
 * @returns {string} - Domain name
 */
export const extractDomain = (url) => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = urlObj.hostname.replace('www.', '');
    
    // Extract the main domain name (without TLD)
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }
    return hostname;
  // eslint-disable-next-line no-unused-vars
  } catch(e) {
    // Use the input as-is if URL parsing fails
    return url;
  }
};

/**
 * Split a concatenated domain name into individual words and capitalize them
 * Uses a hybrid approach: known keywords first, then fallback guessing
 * Handles both hyphenated domains (make-it-for-life) and concatenated domains (shaunscoachingprogram)
 * 
 * @param {string} domain - Domain name (e.g., "make-it-for-life" or "shaunscoachingprogram")
 * @returns {string} - Capitalized words with spaces (e.g., "Make It For Life" or "Shauns Coaching Program")
 */
export const createSeriesNameFromDomain = (domain) => {
  if (!domain || typeof domain !== 'string') return domain;
  
  // Convert to lowercase for processing
  const cleanDomain = domain.toLowerCase().trim();
  
  // Handle hyphenated domains first (e.g., "make-it-for-life" → "Make It For Life")
  if (cleanDomain.includes('-')) {
    return cleanDomain
      .split('-')
      .filter(word => word.length > 0)
      .map(word => capitalizeFirstLetter(word))
      .join(' ');
  }
  
  // Handle domains with underscores (e.g., "make_it_for_life" → "Make It For Life")
  if (cleanDomain.includes('_')) {
    return cleanDomain
      .split('_')
      .filter(word => word.length > 0)
      .map(word => capitalizeFirstLetter(word))
      .join(' ');
  }
  
  // If it's already a single word or very short, just capitalize it
  if (cleanDomain.length <= 3) {
    return capitalizeFirstLetter(cleanDomain);
  }
  
  // Known keywords dictionary (ordered by length, longest first for greedy matching)
  const knownWords = [
    // Business/Marketing terms
    'coaching', 'program', 'academy', 'fitness', 'training', 'course', 'workshop',
    'marketing', 'business', 'startup', 'company', 'agency', 'studio', 'center',
    'institute', 'university', 'school', 'education', 'learning', 'bootcamp',
    
    // Tech/Digital terms
    'website', 'digital', 'online', 'software', 'platform', 'system', 'solution',
    'technology', 'development', 'design', 'creative', 'innovation', 'consulting',
    
    // Health/Wellness terms
    'health', 'wellness', 'nutrition', 'lifestyle', 'mindset', 'therapy', 'healing',
    'medical', 'clinic', 'practice', 'treatment', 'recovery', 'rehabilitation',
    
    // Content/Media terms
    'blog', 'podcast', 'video', 'media', 'content', 'publishing', 'magazine',
    'journal', 'newsletter', 'community', 'forum', 'network', 'social',
    
    // Personal names (common first names)
    'shauns', 'sarah', 'michael', 'david', 'john', 'jane', 'emily', 'chris',
    'alex', 'taylor', 'jordan', 'casey', 'jamie', 'morgan', 'riley', 'drew',
    
    // Common words
    'about', 'contact', 'services', 'products', 'shop', 'store', 'market',
    'home', 'main', 'best', 'top', 'pro', 'expert', 'master', 'advanced',
    'basic', 'simple', 'easy', 'quick', 'fast', 'smart', 'new', 'fresh'
  ].sort((a, b) => b.length - a.length); // Sort by length (longest first)
  
  // Step 1: Use known keywords to split the domain
  let remainingText = cleanDomain;
  let foundWords = [];
  
  while (remainingText.length > 0) {
    let wordFound = false;
    
    // Try to match known words (greedy approach - longest matches first)
    for (const word of knownWords) {
      if (remainingText.startsWith(word)) {
        foundWords.push(word);
        remainingText = remainingText.substring(word.length);
        wordFound = true;
        break;
      }
    }
    
    // Step 2: Fallback guessing if no known word is found
    if (!wordFound) {
      const guessedWord = guessNextWord(remainingText);
      foundWords.push(guessedWord);
      remainingText = remainingText.substring(guessedWord.length);
    }
  }
  
  // Step 3: Capitalize and join the words
  return foundWords
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => capitalizeFirstLetter(word))
    .join(' ');
};

/**
 * Attempt to guess the next word from remaining text using basic heuristics
 * 
 * @param {string} text - Remaining text to process
 * @returns {string} - Guessed word
 */
const guessNextWord = (text) => {
  if (!text) return '';
  
  // Common word patterns and their likely lengths
  const patterns = [
    // Look for common prefixes/suffixes that suggest word boundaries
    { pattern: /^(un|re|pre|dis|mis|over|under|out|up)/ },
    { pattern: /^.*(ing|tion|ness|ment|able|ible|ful|less)/ },
    
    // Vowel patterns - words often have vowel-consonant patterns
    { pattern: /^[bcdfghjklmnpqrstvwxyz]*[aeiou][bcdfghjklmnpqrstvwxyz]*[aeiou]/ },
    { pattern: /^[bcdfghjklmnpqrstvwxyz]*[aeiou][bcdfghjklmnpqrstvwxyz]+/ },
  ];
  
  // Try pattern matching
  for (const { pattern } of patterns) {
    const match = text.match(pattern);
    if (match && match[0].length >= 3 && match[0].length <= 8) {
      return match[0];
    }
  }
  
  // Fallback: Take 3-5 characters as a reasonable word length
  const fallbackLength = Math.min(
    text.length,
    text.length <= 4 ? text.length : Math.max(3, Math.min(5, Math.floor(text.length / 2)))
  );
  
  return text.substring(0, fallbackLength);
};

/**
 * Capitalize the first letter of a string
 * 
 * @param {string} str - String to capitalize
 * @returns {string} - String with first letter capitalized
 */
const capitalizeFirstLetter = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Create a safe, normalized version of a string
 * (For potential future use in filenames, IDs, etc.)
 * 
 * @param {string} str - String to normalize
 * @returns {string} - Normalized string
 */
export const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Truncate text to a specified length with ellipsis
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
