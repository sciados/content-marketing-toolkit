// src/hooks/useErrorHandler.js - FIXED to use useSupabase instead of useAuth
import { useCallback } from 'react';
import { useToast } from './useToast';
import { useAuth } from './useAuth';  // Changed from useAuth

export const useErrorHandler = () => {
  const { showToast } = useToast();
  const { signOut } = useAuth();  // Changed from { logout } to { signOut }

  /**
   * Categorize error for analytics/logging
   */
  const getErrorCategory = useCallback((error) => {
    if (!navigator.onLine) return 'network';
    if (error.isTimeout) return 'timeout';
    if (error.status === 401) return 'auth_expired';
    if (error.status === 403) return 'auth_forbidden';
    if (error.status === 429) return 'rate_limit';
    if (error.status >= 500) return 'server_error';
    if (error.status >= 400) return 'client_error';
    if (error.message?.includes('fetch')) return 'network';
    return 'unknown';
  }, []);

  /**
   * Enhanced error handling with authentication and retry logic
   */
  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    // Determine user-friendly message and handle special cases
    let message = 'An unexpected error occurred';
    let shouldLogout = false;
    let shouldRetry = false;

    // Network and connectivity errors
    if (!navigator.onLine) {
      message = 'No internet connection. Please check your network and try again.';
      shouldRetry = true;
    } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
      message = 'Network error. Please check your connection and try again.';
      shouldRetry = true;
    } else if (error.message?.includes('timeout') || error.isTimeout) {
      message = 'Request timed out. Please try again.';
      shouldRetry = true;
    }
    
    // Authentication errors
    else if (error.message?.includes('401') || error.status === 401) {
      message = 'Your session has expired. Please log in again.';
      shouldLogout = true;
    } else if (error.message?.includes('403') || error.status === 403) {
      message = 'You do not have permission to perform this action.';
    }
    
    // Rate limiting and usage errors
    else if (error.message?.includes('429') || error.status === 429) {
      message = 'Too many requests. Please wait a moment before trying again.';
    } else if (error.message?.includes('insufficient_tokens')) {
      message = 'You don\'t have enough tokens for this action. Please upgrade your plan.';
    }
    
    // Server errors
    else if (error.message?.includes('503') || error.status === 503) {
      message = 'Service temporarily unavailable. We\'re working to restore it.';
      shouldRetry = true;
    } else if (error.status >= 500) {
      message = 'Our servers are experiencing issues. Please try again later.';
      shouldRetry = true;
    }
    
    // Client errors
    else if (error.status === 400) {
      message = error.message || 'Invalid request. Please check your input and try again.';
    } else if (error.status === 404) {
      message = 'The requested resource was not found.';
    }
    
    // API-specific errors
    else if (error.error === 'service_unavailable') {
      message = 'This feature is temporarily unavailable.';
    } else if (error.error === 'validation_failed') {
      message = error.message || 'Please check your input and try again.';
    }
    
    // Use provided message if available
    else if (error.message && !error.message.includes('Error:')) {
      message = error.message;
    }

    // Handle authentication logout
    if (shouldLogout) {
      setTimeout(async () => {
        try {
          await signOut();  // Changed from logout() to signOut()
          console.log('✅ User logged out due to auth error');
        } catch (logoutError) {
          console.error('❌ Error during automatic logout:', logoutError);
        }
      }, 1000); // Delay to allow toast to show
    }

    // Show appropriate toast
    const toastType = shouldLogout ? 'warning' : shouldRetry ? 'warning' : 'error';
    showToast(message, toastType);
    
    return {
      message,
      shouldRetry,
      shouldLogout,
      category: getErrorCategory(error)
    };
  }, [showToast, signOut, getErrorCategory]);  // Changed from logout to signOut

  /**
   * Enhanced async error handler with retry support
   */
  const handleAsyncError = useCallback(async (asyncFn, context = '') => {
    try {
      return await asyncFn();
    } catch (error) {
      const result = handleError(error, context);
      
      // Add error info to the thrown error
      error.errorInfo = result;
      throw error;
    }
  }, [handleError]);

  /**
   * Wrapper for API calls with automatic error handling
   */
  const withErrorHandling = useCallback((apiCall) => {
    return async (...args) => {
      try {
        const result = await apiCall(...args);
        
        // Check if result indicates an error
        if (result && !result.success && result.error) {
          const errorInfo = handleError(result);
          return {
            ...result,
            errorInfo
          };
        }
        
        return result;
        
      } catch (error) {
        const errorInfo = handleError(error);
        
        return {
          success: false,
          error: errorInfo.category,
          message: errorInfo.message,
          errorInfo
        };
      }
    };
  }, [handleError]);

  /**
   * Check if error is retryable
   */
  const isRetryableError = useCallback((error) => {
    const category = getErrorCategory(error);
    return ['network', 'timeout', 'server_error'].includes(category);
  }, [getErrorCategory]);

  return {
    handleError,
    handleAsyncError,
    withErrorHandling,
    isRetryableError,
    getErrorCategory
  };
};