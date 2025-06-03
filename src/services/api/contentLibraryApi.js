import { apiClient } from './apiClient';

export const contentLibraryApi = {
  getItems: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/content-library/items${query ? '?' + query : ''}`);
  },
  createItem: async (itemData) => {
    return apiClient.post('/api/content-library/items', itemData);
  },
  deleteItem: async (itemId) => {
    return apiClient.delete(`/api/content-library/item/${itemId}`);
  },
  toggleFavorite: async (itemId, isFavorited) => {
    return apiClient.post(`/api/content-library/item/${itemId}/favorite`, {
      is_favorited: isFavorited
    });
  }
};
