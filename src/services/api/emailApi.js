import { apiClient } from './apiClient';

export const emailApi = {
  scanPage: async (pageData) => {
    return apiClient.post('/api/email-generator/scan-page', pageData);
  },
  generateEmails: async (emailData) => {
    return apiClient.post('/api/email-generator/generate', emailData);
  }
};
