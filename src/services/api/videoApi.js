import { apiClient } from './apiClient';

export const videoApi = {
  extractTranscript: async (videoData) => {
    return apiClient.post('/api/video2promo/extract-transcript', videoData);
  },
  analyzeBenefits: async (transcriptData) => {
    return apiClient.post('/api/video2promo/analyze-benefits', transcriptData);
  },
  generateAssets: async (assetData) => {
    return apiClient.post('/api/video2promo/generate-assets', assetData);
  }
};
