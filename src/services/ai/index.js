// src/services/ai/index.js

import claudeAIService from './claudeAIService';

// Export individual services
export { claudeAIService };

// Export as a collection
const AIServices = {
  claude: claudeAIService,
  // Add other AI services here as they're implemented
};

export default AIServices;