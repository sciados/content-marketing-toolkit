// src/hooks/useContentLibrary.js - FIXED VERSION with proper React Router navigation
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // ADD THIS IMPORT
import { supabase } from '../services/supabase/supabaseClient';

// Backend API URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://aiworkers.onrender.com';

export const useContentLibrary = () => {
  const navigate = useNavigate(); // ADD THIS HOOK
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    content_type: 'all',
    favorited: false,
    tags: [],
    sortBy: 'created_desc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Get authentication headers
  const getAuthHeaders = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.access_token) {
        console.warn('No valid session for Content Library API calls');
        return {
          'Content-Type': 'application/json'
        };
      }
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      };
    } catch (error) {
      console.error('Failed to get auth headers:', error);
      return {
        'Content-Type': 'application/json'
      };
    }
  }, []);

  // Check if backend APIs are available
  const checkBackendAvailability = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        const hasContentLibrary = data.endpoints?.some(endpoint => 
          endpoint.includes('content-library')
        );
        setBackendAvailable(hasContentLibrary);
        return hasContentLibrary;
      }
      
      setBackendAvailable(false);
      return false;
    } catch (error) {
      console.warn('Backend availability check failed:', error);
      setBackendAvailable(false);
      return false;
    }
  }, []);

  // Demo data for fallback (matches your table structure)
  const getDemoData = () => [
    {
      id: 'demo-1',
      content_type: 'video_transcript',
      source_id: null,
      title: 'Marketing Strategy Video Transcript',
      description: 'Transcript from a 30-minute marketing strategy video discussing customer acquisition.',
      tags: ['marketing', 'strategy'],
      metadata: { 
        video_id: 'demo123',
        duration: '30:45', 
        extraction_method: 'webshare_rotating',
        word_count: 4500
      },
      is_favorited: true,
      usage_count: 3,
      created_at: '2025-05-20T10:00:00Z',
      last_used_at: '2025-05-20T14:30:00Z',
      updated_at: '2025-05-20T14:30:00Z'
    },
    {
      id: 'demo-2',
      content_type: 'scanned_page',
      source_id: null,
      title: 'ConvertKit Sales Page Analysis',
      description: 'Extracted benefits and features from ConvertKit landing page.',
      tags: ['email marketing', 'saas'],
      metadata: { 
        url: 'https://convertkit.com/pricing',
        benefits_count: 8, 
        features_count: 12,
        domain: 'convertkit.com'
      },
      is_favorited: false,
      usage_count: 1,
      created_at: '2025-05-19T15:30:00Z',
      last_used_at: '2025-05-19T16:00:00Z',
      updated_at: '2025-05-19T16:00:00Z'
    },
    {
      id: 'demo-3',
      content_type: 'generated_asset',
      source_id: null,
      title: 'Email Series: Product Launch',
      description: 'Generated 5-email sequence for product launch campaign.',
      tags: ['email series', 'product launch'],
      metadata: { 
        type: 'email_series',
        emails_count: 5, 
        tone: 'professional',
        industry: 'saas'
      },
      is_favorited: true,
      usage_count: 2,
      created_at: '2025-05-18T09:15:00Z',
      last_used_at: '2025-05-18T11:45:00Z',
      updated_at: '2025-05-18T11:45:00Z'
    }
  ];

  // Fetch items from backend API
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check backend availability first
      const isAvailable = await checkBackendAvailability();
      
      if (!isAvailable) {
        console.warn('Backend not available, using demo data');
        setItems(getDemoData());
        setLoading(false);
        return;
      }

      const headers = await getAuthHeaders();
      
      // Build query parameters
      const params = new URLSearchParams({
        type: filters.content_type || 'all',
        search: searchTerm || '',
        favorited: (filters.favorited || false).toString(),
        tags: Array.isArray(filters.tags) ? filters.tags.join(',') : '',
        sort: filters.sortBy || 'created_desc',
        limit: '50'
      });

      const response = await fetch(`${API_BASE}/api/content-library/items?${params}`, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setItems(data.items || []);
          console.log(`✅ Fetched ${data.items?.length || 0} Content Library items`);
        } else {
          throw new Error(data.error || 'API returned unsuccessful response');
        }
      } else if (response.status === 401) {
        setError('Authentication required. Please log in to access your Content Library.');
        setItems([]);
      } else if (response.status === 503) {
        console.warn('Backend database unavailable, using demo data');
        setItems(getDemoData());
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch content library:', error);
      setError(error.message);
      
      // Fallback to demo data for development/testing
      console.warn('Using demo data as fallback');
      setItems(getDemoData());
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, getAuthHeaders, checkBackendAvailability]);

  // Initial load
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (itemId, currentFavorited) => {
    try {
      // Optimistic update
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, is_favorited: !currentFavorited }
          : item
      ));

      if (!backendAvailable) {
        console.log('Backend not available - favorite change stored locally only');
        return;
      }

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/content-library/item/${itemId}/favorite`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          is_favorited: !currentFavorited
        })
      });

      if (!response.ok) {
        // Revert optimistic update on failure
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, is_favorited: currentFavorited }
            : item
        ));
        
        if (response.status === 401) {
          setError('Authentication required to save favorites');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
      } else {
        const result = await response.json();
        if (!result.success) {
          // Revert on API failure
          setItems(prev => prev.map(item => 
            item.id === itemId 
              ? { ...item, is_favorited: currentFavorited }
              : item
          ));
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert optimistic update
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, is_favorited: currentFavorited }
          : item
      ));
    }
  }, [backendAvailable, getAuthHeaders]);

  // FIXED: Use content item (track usage and redirect) - NO MORE LOGOUT!
  const useContentItem = useCallback(async (item) => {
    try {
      console.log('🔧 Using content item:', item.title, 'Type:', item.content_type);
      
      // Optimistic update for usage count
      setItems(prev => prev.map(prevItem => 
        prevItem.id === item.id 
          ? { 
              ...prevItem, 
              usage_count: (prevItem.usage_count || 0) + 1,
              last_used_at: new Date().toISOString()
            }
          : prevItem
      ));

      // Track usage in backend (optional)
      if (backendAvailable) {
        try {
          const headers = await getAuthHeaders();
          const response = await fetch(`${API_BASE}/api/content-library/item/${item.id}/use`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              content_type: item.content_type
            })
          });

          if (!response.ok) {
            console.warn('Failed to track usage on backend, but continuing with action');
          }
        } catch (trackingError) {
          console.warn('Usage tracking failed:', trackingError);
        }
      }

      // FIXED: Use React Router navigation instead of window.location
      // This prevents the page reload that was logging you out!
      if (item.content_type === 'video_transcript') {
        console.log('🔧 Navigating to Video2Promo with React Router');
        navigate('/tools/video2promo');
      } else if (item.content_type === 'scanned_page') {
        console.log('🔧 Navigating to Email Generator with React Router');
        navigate('/tools/email-generator');
      } else if (item.content_type === 'generated_asset') {
        console.log('🔧 Using generated asset:', item);
        
        // Try to copy content to clipboard if available in metadata
        if (navigator.clipboard && item.metadata?.content) {
          try {
            await navigator.clipboard.writeText(item.metadata.content);
            console.log('✅ Content copied to clipboard');
            // Could show a toast notification here
          } catch (clipboardError) {
            console.warn('Failed to copy to clipboard:', clipboardError);
          }
        }
        
        // For generated assets, might want to open in a modal or copy to clipboard
        // For now, navigate to email generator as a fallback
        navigate('/tools/email-generator');
      }
    } catch (error) {
      console.error('❌ Failed to use content item:', error);
      setError('Failed to use content item');
    }
  }, [backendAvailable, getAuthHeaders, navigate]); // Added navigate to dependencies

  // Delete item
  const deleteItem = useCallback(async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      // Optimistic removal
      const itemToDelete = items.find(item => item.id === itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));

      if (!backendAvailable) {
        console.log('Backend not available - item removed locally only');
        return;
      }

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/content-library/item/${itemId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        // Restore item on failure
        if (itemToDelete) {
          setItems(prev => [itemToDelete, ...prev]);
        }
        
        if (response.status === 401) {
          setError('Authentication required to delete items');
        } else if (response.status === 404) {
          console.log('Item already deleted or not found');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      setError('Failed to delete item');
      // Restore item on error
      const itemToDelete = items.find(item => item.id === itemId);
      if (itemToDelete) {
        setItems(prev => [itemToDelete, ...prev]);
      }
    }
  }, [items, backendAvailable, getAuthHeaders]);

  // Rest of the hook remains the same...
  const addToLibrary = useCallback(async (contentData) => {
    try {
      if (!backendAvailable) {
        console.warn('Backend not available - cannot add to library');
        setError('Backend not available. Cannot save to Content Library.');
        return null;
      }

      const headers = await getAuthHeaders();
      
      const mappedData = {
        content_type: contentData.type || contentData.content_type,
        title: contentData.title,
        description: contentData.description || '',
        tags: contentData.tags || [],
        metadata: {
          ...contentData.metadata,
          source_url: contentData.source_url,
          cost_saved: contentData.cost_saved || 0,
          word_count: contentData.word_count || 0
        }
      };

      const response = await fetch(`${API_BASE}/api/content-library/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(mappedData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.item) {
          setItems(prev => [result.item, ...prev]);
          console.log(`✅ Added to Content Library: ${contentData.title}`);
          return result.item;
        } else {
          throw new Error(result.error || 'Failed to add item');
        }
      } else if (response.status === 401) {
        setError('Authentication required to add items to library');
        return null;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to add to library:', error);
      setError(`Failed to add to library: ${error.message}`);
      return null;
    }
  }, [backendAvailable, getAuthHeaders]);

  // Helper functions
  const getItemsByType = useCallback((contentType) => {
    return items.filter(item => item.content_type === contentType);
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

  const getRecentlyUsedItems = useCallback((count = 5) => {
    return items
      .filter(item => item.last_used_at)
      .sort((a, b) => new Date(b.last_used_at) - new Date(a.last_used_at))
      .slice(0, count);
  }, [items]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refetch = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    // State
    items,
    loading,
    error,
    filters,
    searchTerm,
    backendAvailable,
    
    // Actions
    setFilters,
    setSearchTerm,
    toggleFavorite,
    useContentItem, // This is now FIXED!
    deleteItem,
    addToLibrary,
    refetch,
    clearError,
    
    // Computed values
    totalItems: items.length,
    favoriteCount: items.filter(item => item.is_favorited).length,
    isEmpty: items.length === 0,
    hasError: !!error,
    
    // Helper functions
    getItemsByType,
    getFavoriteItems,
    getRecentItems,
    getMostUsedItems,
    getRecentlyUsedItems,
    
    // Content type counts
    videoTranscriptCount: items.filter(item => item.content_type === 'video_transcript').length,
    scannedPageCount: items.filter(item => item.content_type === 'scanned_page').length,
    generatedAssetCount: items.filter(item => item.content_type === 'generated_asset').length,
    
    // Debug info
    debug: {
      backendUrl: API_BASE,
      backendAvailable,
      itemsCount: items.length,
      filtersActive: filters.content_type !== 'all' || filters.favorited || searchTerm.length > 0,
      isDemo: !backendAvailable || items.some(item => item.id?.startsWith('demo-')),
      tableStructure: 'updated_for_actual_schema'
    }
  };
};
