// src/services/emailGenerator/index.js

// Main exports
export { scanSalesPage } from './scannerService';
export { generateSimulatedData } from './simulatedDataGenerator';
export { cacheService } from './cacheService';

// Utility exports
export { 
  extractDomain, 
  normalizeString, 
  truncateText, 
  createSeriesNameFromDomain 
} from './utils';