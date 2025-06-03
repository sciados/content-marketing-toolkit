import { apiClient } from './apiClient';

export const usageApi = {
  getLimits: async () => {
    return apiClient.get('/api/usage/limits');
  },
  trackUsage: async (usageData) => {
    return apiClient.post('/api/usage/track', usageData);
  },
  getHistory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/usage/history${query ? '?' + query : ''}`);
  }
};
