// src/hooks/useContentLibrary.js - TEMPORARY: Disable API calls, use demo data
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentLibraryApi } from '../services/api';
import { useErrorHandler } from './useErrorHandler';

export const useContentLibrary = () => {
  const navigate = useNavigate();
  const { withErrorHandling } = useErrorHandler();
  
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
  const [backendAvailable, setBackendAvailable] = useState(true); // CHANGED: Re-enable API

  // Check if backend APIs are available - RE-ENABLED
  const checkBackendAvailability = useCallback(async () => {
    try {
      const result = await contentLibraryApi.getHealth();
      const available = result.success;
      setBackendAvailable(available);
      console.log('✅ Content Library API health:', { available });
      return available;
    } catch (error) {
      console.warn('⚠️ Content Library backend unavailable:', error);
      setBackendAvailable(false);
      return false;
    }
  }, []);

  // Demo data for fallback (enhanced with more items)
  const getDemoData = () => [
    {
      id: 'demo-1',
      content_type: 'video_transcript',
      title: 'Marketing Strategy Video Transcript',
      description: 'Transcript from a 30-minute marketing strategy video covering customer acquisition and retention strategies.',
      tags: ['marketing', 'strategy', 'customer-acquisition'],
      metadata: { video_id: 'demo123', duration: '30:45', word_count: 4500, source: 'YouTube' },
      is_favorited: true,
      usage_count: 3,
      created_at: '2025-05-20T10:00:00Z',
      last_used_at: '2025-05-20T14:30:00Z'
    },
    {
      id: 'demo-2',
      content_type: 'scanned_page',
      title: 'ConvertKit Sales Page Analysis',
      description: 'Extracted benefits and features from ConvertKit pricing page for email marketing insights.',
      tags: ['email-marketing', 'saas', 'pricing'],
      metadata: { url: 'https://convertkit.com/pricing', benefits_count: 8, features_count: 12 },
      is_favorited: false,
      usage_count: 1,
      created_at: '2025-05-19T15:30:00Z',
      last_used_at: '2025-05-19T16:00:00Z'
    },
    {
      id: 'demo-3',
      content_type: 'generated_asset',
      title: 'Email Series: Product Launch',
      description: 'Complete 5-email sequence for product launch campaign with subject lines and CTAs.',
      tags: ['email-series', 'product-launch', 'campaigns'],
      metadata: { 
        email_count: 5, 
        estimated_open_rate: '25%',
        content: 'Email 1: Welcome to our new product...\nEmail 2: Key benefits you need to know...'
      },
      is_favorited: true,
      usage_count: 5,
      created_at: '2025-05-18T09:15:00Z',
      last_used_at: '2025-05-21T11:20:00Z'
    },
    {
      id: 'demo-4',
      content_type: 'video_transcript',
      title: 'SaaS Onboarding Best Practices',
      description: 'Expert interview about user onboarding strategies for SaaS products.',
      tags: ['saas', 'onboarding', 'user-experience'],
      metadata: { video_id: 'demo456', duration: '45:20', word_count: 6800, source: 'Webinar' },
      is_favorited: false,
      usage_count: 2,
      created_at: '2025-05-17T14:00:00Z',
      last_used_at: '2025-05-18T10:30:00Z'
    }
  ];

  // Fetch items using centralized API
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const isAvailable = await checkBackendAvailability();
      
      if (!isAvailable) {
        console.warn('⚠️ Backend not available, using demo data');
        setItems(getDemoData());
        setLoading(false);
        return;
      }

      // Use centralized API service with error handling
      const safeApiCall = withErrorHandling(contentLibraryApi.getItems);
      const result = await safeApiCall({
        type: filters.content_type || 'all',
        search: searchTerm || '',
        favorited: (filters.favorited || false).toString(),
        tags: Array.isArray(filters.tags) ? filters.tags.join(',') : '',
        sort: filters.sortBy || 'created_desc',
        limit: '50'
      });

      if (result.success) {
        setItems(result.items || []);
        console.log(`✅ Fetched ${result.items?.length || 0} Content Library items`);
      } else {
        throw new Error(result.message || result.error || 'API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Failed to fetch content library:', error);
      setError(error.message);
      
      // Fallback to demo data
      console.warn('⚠️ Using demo data as fallback');
      setItems(getDemoData());
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, checkBackendAvailability, withErrorHandling]);

  // Initial load
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Toggle favorite using centralized API
  const toggleFavorite = useCallback(async (itemId, currentFavorited) => {
    try {
      // Optimistic update
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, is_favorited: !currentFavorited }
          : item
      ));

      if (!backendAvailable) {
        console.log('⚠️ Backend not available - favorite change stored locally only');
        return;
      }

      // Use centralized API service with error handling
      const safeApiCall = withErrorHandling(contentLibraryApi.toggleFavorite);
      const result = await safeApiCall(itemId, !currentFavorited);

      if (!result.success) {
        // Revert optimistic update on failure
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, is_favorited: currentFavorited }
            : item
        ));
      }
    } catch (error) {
      console.error('❌ Failed to toggle favorite:', error);
      // Revert optimistic update
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, is_favorited: currentFavorited }
          : item
      ));
    }
  }, [backendAvailable, withErrorHandling]);

  // Use content item with centralized API
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

      // Track usage using centralized API
      if (backendAvailable) {
        try {
          const safeApiCall = withErrorHandling(contentLibraryApi.trackUsage);
          await safeApiCall(item.id, item.content_type);
        } catch (trackingError) {
          console.warn('⚠️ Usage tracking failed:', trackingError);
        }
      }

      // Navigate using React Router (prevents logout issue)
      if (item.content_type === 'video_transcript') {
        console.log('🔧 Navigating to Video2Promo with React Router');
        navigate('/tools/video2promo');
      } else if (item.content_type === 'scanned_page') {
        console.log('🔧 Navigating to Email Generator with React Router');
        navigate('/tools/email-generator');
      } else if (item.content_type === 'generated_asset') {
        console.log('🔧 Using generated asset:', item);
        
        // Try to copy content to clipboard if available
        if (navigator.clipboard && item.metadata?.content) {
          try {
            await navigator.clipboard.writeText(item.metadata.content);
            console.log('✅ Content copied to clipboard');
          } catch (clipboardError) {
            console.warn('⚠️ Failed to copy to clipboard:', clipboardError);
          }
        }
        
        navigate('/tools/email-generator');
      }
    } catch (error) {
      console.error('❌ Failed to use content item:', error);
      setError('Failed to use content item');
    }
  }, [backendAvailable, navigate, withErrorHandling]);

  // Delete item using centralized API
  const deleteItem = useCallback(async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    // Store the item to delete BEFORE removing it (for potential restoration)
    const itemToDelete = items.find(item => item.id === itemId);
    
    if (!itemToDelete) {
      console.warn('⚠️ Item not found for deletion:', itemId);
      return;
    }

    try {
      // Optimistic removal
      setItems(prev => prev.filter(item => item.id !== itemId));

      if (!backendAvailable) {
        console.log('⚠️ Backend not available - item removed locally only');
        return;
      }

      // Use centralized API service with error handling
      const safeApiCall = withErrorHandling(contentLibraryApi.deleteItem);
      const result = await safeApiCall(itemId);
      
      if (result.success) {
        console.log('✅ Item deleted successfully:', itemId);
      } else {
        // Restore item on API failure
        setItems(prev => [itemToDelete, ...prev]);
      }

    } catch (error) {
      console.error('❌ Failed to delete item:', error);
      setError('Failed to delete item');
      
      // Restore item on error using the stored reference
      setItems(prev => [itemToDelete, ...prev]);
    }
  }, [items, backendAvailable, withErrorHandling]);

  // Add to library using centralized API
  const addToLibrary = useCallback(async (contentData) => {
    try {
      if (!backendAvailable) {
        console.warn('⚠️ Backend not available - cannot add to library');
        setError('Backend not available. Cannot save to Content Library.');
        return null;
      }

      const mappedData = {
        content_type: contentData.type || contentData.content_type,
        title: contentData.title,
        description: contentData.description || '',
        tags: contentData.tags || [],
        source_url: contentData.source_url,
        metadata: {
          ...contentData.metadata,
          cost_saved: contentData.cost_saved || 0,
          word_count: contentData.word_count || 0
        }
      };

      // Use centralized API service with error handling
      const safeApiCall = withErrorHandling(contentLibraryApi.createItem);
      const result = await safeApiCall(mappedData);

      if (result.success && result.item) {
        setItems(prev => [result.item, ...prev]);
        console.log(`✅ Added to Content Library: ${contentData.title}`);
        return result.item;
      } else {
        throw new Error(result.message || result.error || 'Failed to add item');
      }
    } catch (error) {
      console.error('❌ Failed to add to library:', error);
      setError(`Failed to add to library: ${error.message}`);
      return null;
    }
  }, [backendAvailable, withErrorHandling]);

  // Search items using centralized API
  const searchItems = useCallback(async (query) => {
    if (!backendAvailable) {
      console.warn('⚠️ Backend not available - using local search');
      // Local search fallback
      const filtered = items.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
      return filtered;
    }

    try {
      const safeApiCall = withErrorHandling(contentLibraryApi.search);
      const result = await safeApiCall({
        query: query,
        type: filters.content_type || 'all',
        limit: '20'
      });

      if (result.success) {
        return result.items || [];
      } else {
        throw new Error(result.message || 'Search failed');
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
      return [];
    }
  }, [backendAvailable, items, filters.content_type, withErrorHandling]);

  // Get library stats using centralized API
  const getLibraryStats = useCallback(async () => {
    if (!backendAvailable) {
      // Return local stats
      return {
        total_items: items.length,
        favorites_count: items.filter(item => item.is_favorited).length,
        recent_items_week: items.filter(item => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(item.created_at) > weekAgo;
        }).length,
        items_by_type: items.reduce((acc, item) => {
          acc[item.content_type] = (acc[item.content_type] || 0) + 1;
          return acc;
        }, {})
      };
    }

    try {
      const safeApiCall = withErrorHandling(contentLibraryApi.getStats);
      const result = await safeApiCall();

      if (result.success) {
        return result.data || {};
      } else {
        throw new Error(result.message || 'Failed to get stats');
      }
    } catch (error) {
      console.error('❌ Failed to get library stats:', error);
      return {};
    }
  }, [backendAvailable, items, withErrorHandling]);

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
    useContentItem,
    deleteItem,
    addToLibrary,
    refetch,
    clearError,
    
    // Advanced functions
    searchItems,
    getLibraryStats,
    
    // Computed values
    totalItems: items.length,
    favoriteCount: items.filter(item => item.is_favorited).length,
    isEmpty: items.length === 0,
    hasError: !!error,
    
    // Helper functions
    getItemsByType,
    getFavoriteItems,
    getRecentItems,
    
    // Content type counts
    videoTranscriptCount: items.filter(item => item.content_type === 'video_transcript').length,
    scannedPageCount: items.filter(item => item.content_type === 'scanned_page').length,
    generatedAssetCount: items.filter(item => item.content_type === 'generated_asset').length
  };
};