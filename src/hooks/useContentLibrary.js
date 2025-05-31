// src/hooks/useContentLibrary.js
import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const useContentLibrary = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'video_transcript', 'scanned_page'
    favorited: false,
    tags: []
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
    try {
      const params = new URLSearchParams({
        type: filters.type,
        search: searchTerm,
        favorited: filters.favorited.toString(),
        tags: filters.tags.join(','),
        limit: '50'
      });

      const response = await fetch(`${API_BASE}/api/content-library/items?${params}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch content library:', error);
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
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const useContentItem = async (itemId, contentType) => {
    try {
      const response = await fetch(`${API_BASE}/api/content-library/item/${itemId}/use`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content_type: contentType
        })
      });

      if (response.ok) {
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, usage_count: (item.usage_count || 0) + 1 }
            : item
        ));
      }
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  };

  return {
    items,
    loading,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    toggleFavorite,
    useContentItem,
    refetch: fetchItems
  };
};