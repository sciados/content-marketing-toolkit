// src/hooks/useApiQuery.js - NEW (React Query-like functionality)
import { useState, useEffect, useCallback, useRef } from 'react';

export const useApiQuery = (queryKey, queryFn, options = {}) => {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
    // cacheTime = 10 * 60 * 1000, // 10 minutes
    retry = 3,
    retryDelay = (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);

  // Create cache key
  const cacheKey = Array.isArray(queryKey) ? queryKey.join('-') : queryKey;

  // Check cache
  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(`query-${cacheKey}`);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < staleTime) {
          return cachedData;
        }
      }
    } catch (e) {
      console.warn('Failed to get cached data:', e);
    }
    return null;
  }, [cacheKey, staleTime]);

  // Set cache
  const setCachedData = useCallback((data) => {
    try {
      localStorage.setItem(`query-${cacheKey}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to cache data:', e);
    }
  }, [cacheKey]);

  // Execute query
  const executeQuery = useCallback(async (isRefetch = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    if (!isRefetch) {
      setIsLoading(true);
    }
    setIsFetching(true);
    setError(null);

    try {
      const result = await queryFn({
        signal: abortControllerRef.current.signal
      });

      setData(result);
      setCachedData(result);
      retryCountRef.current = 0;
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Ignore aborted requests
      }

      setError(err);

      // Retry logic
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        const delay = retryDelay(retryCountRef.current - 1);
        setTimeout(() => {
          executeQuery(isRefetch);
        }, delay);
        return;
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [queryFn, retry, retryDelay, setCachedData]);

  // Refetch function
  const refetch = useCallback(() => {
    return executeQuery(true);
  }, [executeQuery]);

  // Initial load
  useEffect(() => {
    if (!enabled) return;

    // Check cache first
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
    }

    // Always fetch fresh data
    executeQuery();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, getCachedData, executeQuery]);

  // Window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, refetch]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    isSuccess: !error && data !== null,
    isError: !!error
  };
};