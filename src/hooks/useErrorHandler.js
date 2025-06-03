// src/hooks/useErrorHandler.js - NEW
import { useCallback } from 'react';
import { useToast } from './useToast';

export const useErrorHandler = () => {
  const { showToast } = useToast();

  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    // Determine user-friendly message
    let message = 'An unexpected error occurred';
    
    if (error.message?.includes('401')) {
      message = 'Please log in to continue';
    } else if (error.message?.includes('403')) {
      message = 'You do not have permission to perform this action';
    } else if (error.message?.includes('429')) {
      message = 'Too many requests. Please try again later';
    } else if (error.message?.includes('503')) {
      message = 'Service temporarily unavailable';
    } else if (error.message?.includes('timeout')) {
      message = 'Request timed out. Please try again';
    } else if (error.message?.includes('network')) {
      message = 'Network error. Please check your connection';
    } else if (error.message) {
      message = error.message;
    }

    showToast(message, 'error');
    
    return message;
  }, [showToast]);

  const handleAsyncError = useCallback(async (asyncFn, context = '') => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
};