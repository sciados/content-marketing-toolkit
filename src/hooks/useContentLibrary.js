// src/hooks/useContentLibrary.js
import { useState, useEffect, useCallback } from 'react';

// Backend API URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const useContentLibrary = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'video_transcript', 'scanned_page', 'generated_asset'
    favorited: false,
    tags: [],
    sortBy: 'created_desc'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('supabase.auth.token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        type: filters.type,
        search: searchTerm,
        favorited: filters.favorited.toString(),
        tags: filters.tags.join(','),
        sort: filters.sortBy,
        limit: '50'
      });

      const response = await fetch(`${API_BASE}/api/content-library/items?${params}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch content library:', error);
      setError(error.message);
      
      // Fallback with mock data for development
      setItems([
        {
          id: '1',
          type: 'video_transcript',
          title: 'Marketing Strategy Video Transcript',
          description: 'Transcript from a 30-minute marketing strategy video discussing customer acquisition.',
          created_at: '2025-05-20T10:00:00Z',
          usage_count: 3,
          word_count: 4500,
          cost_saved: 0.18,
          is_favorited: true
        },
        {
          id: '2',
          type: 'scanned_page',
          title: 'ConvertKit Sales Page Analysis',
          description: 'Extracted benefits and features from ConvertKit landing page.',
          created_at: '2025-05-19T15:30:00Z',
          usage_count: 1,
          word_count: 1200,
          cost_saved: 0.06,
          is_favorited: false
        },
        {
          id: '3',
          type: 'generated_asset',
          title: 'Email Series: Product Launch',
          description: 'Generated 5-email sequence for product launch campaign.',
          created_at: '2025-05-18T09:15:00Z',
          usage_count: 2,
          word_count: 800,
          cost_saved: 0.12,
          is_favorited: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleFavorite = async (itemId, contentType, currentFavorited) => {
    try {
      const response = await fetch(`${API_BASE}/api/content-library/item/${itemId}/favorite`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          is_favorited: !currentFavorited,
          content_type: contentType
        })
      });

      if (response.ok) {
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, is_favorited: !currentFavorited }
            : item
        ));
      } else {
        // Fallback for development
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, is_favorited: !currentFavorited }
            : item
        ));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Still update optimistically
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, is_favorited: !currentFavorited }
          : item
      ));
    }
  };

  const useContentItem = async (item) => {
    try {
      const response = await fetch(`${API_BASE}/api/content-library/item/${item.id}/use`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content_type: item.type
        })
      });

      if (response.ok) {
        setItems(prev => prev.map(prevItem => 
          prevItem.id === item.id 
            ? { ...prevItem, usage_count: (prevItem.usage_count || 0) + 1 }
            : prevItem
        ));
      }

      // Redirect user to appropriate tool based on content type
      if (item.type === 'video_transcript') {
        window.location.href = '/tools/video2promo';
      } else if (item.type === 'scanned_page') {
        window.location.href = '/tools/email-generator';
      } else {
        // For generated assets, copy to clipboard or download
        console.log('Using generated asset:', item);
      }
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/content-library/item/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      setError('Failed to delete item');
    }
  };

  const addToLibrary = async (contentData) => {
    try {
      const response = await fetch(`${API_BASE}/api/content-library/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(contentData)
      });

      if (response.ok) {
        const newItem = await response.json();
        setItems(prev => [newItem, ...prev]);
        return newItem;
      } else {
        throw new Error('Failed to add to library');
      }
    } catch (error) {
      console.error('Failed to add to library:', error);
      setError('Failed to add to library');
      return null;
    }
  };

  const getItemsByType = useCallback((type) => {
    return items.filter(item => item.type === type);
  }, [items]);

  const getFavoriteItems = useCallback(() => {
    return items.filter(item => item.is_favorited);
  }, [items]);

  const getRecentItems = useCallback((count = 5) => {
    return items
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, count);
  }, [items]);

  const getMostUsedItems = useCallback((count = 5) => {
    return items
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
      .slice(0, count);
  }, [items]);

  return {
    // State
    items,
    loading,
    error,
    filters,
    searchTerm,
    
    // Actions
    setFilters,
    setSearchTerm,
    toggleFavorite,
    useContentItem,
    deleteItem,
    addToLibrary,
    refetch: fetchItems,
    
    // Computed values
    totalItems: items.length,
    favoriteCount: items.filter(item => item.is_favorited).length,
    
    // Helper functions
    getItemsByType,
    getFavoriteItems,
    getRecentItems,
    getMostUsedItems
  };
};