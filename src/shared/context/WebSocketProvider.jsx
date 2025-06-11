// src/context/WebSocketProvider.jsx - FIXED to work with existing files
import React, { useEffect, useState, useCallback } from 'react';
import { WebSocketContext } from './webSocketContext';
import { wsService } from '../../core/services/websocket';
import { useAuth } from '../hooks/useAuth';

// WebSocket Provider component - Compatible with existing websocket.js
export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    lastConnected: null,
    lastError: null
  });
  
  // Real-time data states
  const [realtimeUsage, setRealtimeUsage] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [contentLibraryUpdates, setContentLibraryUpdates] = useState([]);

  // Update connection status from wsService
  const updateConnectionStatus = useCallback(() => {
    const status = wsService.getStatus();
    setConnectionStatus(prev => ({
      ...prev,
      isConnected: status.isConnected,
      isConnecting: status.isConnecting,
      reconnectAttempts: status.reconnectAttempts,
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  // Handle connection events
  useEffect(() => {
    const handleConnected = (data) => {
      console.log('🟢 WebSocket connected at:', data.timestamp);
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        lastConnected: data.timestamp,
        lastError: null
      }));
    };

    const handleDisconnected = (data) => {
      console.log('🔴 WebSocket disconnected:', data.reason);
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        lastError: data.reason
      }));
    };

    const handleError = (error) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus(prev => ({
        ...prev,
        lastError: error.message || 'Connection error'
      }));
    };

    const handleMaxReconnects = () => {
      console.error('❌ WebSocket max reconnection attempts reached');
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        lastError: 'Max reconnection attempts reached'
      }));
    };

    // Register event listeners
    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);
    wsService.on('error', handleError);
    wsService.on('max_reconnects_reached', handleMaxReconnects);

    // Cleanup on unmount
    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
      wsService.off('error', handleError);
      wsService.off('max_reconnects_reached', handleMaxReconnects);
    };
  }, []);

  // Handle real-time data updates
  useEffect(() => {
    const handleUsageUpdate = (usage) => {
      console.log('📊 Real-time usage update:', usage);
      setRealtimeUsage({
        ...usage,
        lastUpdated: new Date().toISOString()
      });
    };

    const handleSystemStatus = (status) => {
      console.log('🔧 System status update:', status);
      setSystemStatus({
        ...status,
        lastUpdated: new Date().toISOString()
      });
    };

    const handleNotification = (notification) => {
      console.log('🔔 New notification:', notification);
      setNotifications(prev => [
        {
          ...notification,
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString()
        },
        ...prev.slice(0, 9) // Keep only 10 most recent
      ]);
    };

    const handleContentLibraryUpdate = (update) => {
      console.log('📚 Content Library update:', update);
      setContentLibraryUpdates(prev => [
        {
          ...update,
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString()
        },
        ...prev.slice(0, 19) // Keep only 20 most recent
      ]);
    };

    // Register data event listeners
    wsService.on('usage_update', handleUsageUpdate);
    wsService.on('system_status', handleSystemStatus);
    wsService.on('notification', handleNotification);
    wsService.on('content_library_update', handleContentLibraryUpdate);

    // Cleanup on unmount
    return () => {
      wsService.off('usage_update', handleUsageUpdate);
      wsService.off('system_status', handleSystemStatus);
      wsService.off('notification', handleNotification);
      wsService.off('content_library_update', handleContentLibraryUpdate);
    };
  }, []);

  // Update authentication when user changes
  useEffect(() => {
    if (user) {
      wsService.updateAuth(user.id);
      console.log('🔐 WebSocket auth updated for user:', user.id);
    } else {
      wsService.clearAuth();
      console.log('🔐 WebSocket auth cleared');
    }
  }, [user]);

  // Periodically update connection status from service
  useEffect(() => {
    // Update immediately and then every 5 seconds
    updateConnectionStatus();
    const interval = setInterval(updateConnectionStatus, 5000);

    return () => clearInterval(interval);
  }, [updateConnectionStatus]);

  // Utility functions for components
  const sendMessage = useCallback((message) => {
    return wsService.send(message);
  }, []);

  const trackUsage = useCallback((tokens, feature) => {
    wsService.trackUsage(tokens, feature);
  }, []);

  const connect = useCallback(() => {
    wsService.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsService.disconnect();
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const getConnectionStatusText = useCallback(() => {
    if (connectionStatus.isConnected) return 'Connected';
    if (connectionStatus.isConnecting) return 'Connecting...';
    if (connectionStatus.reconnectAttempts > 0) {
      return `Reconnecting (${connectionStatus.reconnectAttempts})`;
    }
    return 'Disconnected';
  }, [connectionStatus]);

  const getConnectionStatusColor = useCallback(() => {
    if (connectionStatus.isConnected) return 'green';
    if (connectionStatus.isConnecting || connectionStatus.reconnectAttempts > 0) return 'yellow';
    return 'red';
  }, [connectionStatus]);

  // Context value - compatible with simple context definition
  const contextValue = {
    // Connection status
    connectionStatus,
    isConnected: connectionStatus.isConnected,
    isConnecting: connectionStatus.isConnecting,
    getConnectionStatusText,
    getConnectionStatusColor,
    
    // Real-time data
    realtimeUsage,
    systemStatus,
    notifications,
    contentLibraryUpdates,
    
    // Actions
    sendMessage,
    trackUsage,
    connect,
    disconnect,
    clearNotifications,
    removeNotification,
    
    // Utilities
    hasNewNotifications: notifications.length > 0,
    hasSystemStatus: systemStatus !== null,
    hasUsageData: realtimeUsage !== null
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Export the context as well for compatibility
export { WebSocketContext } from './webSocketContext';
export default WebSocketProvider;