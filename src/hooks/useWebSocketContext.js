// src/hooks/useWebSocketContext.js - WebSocket hooks only
import { useContext } from 'react';
import { WebSocketContext } from '../context/webSocketContext';

// Main WebSocket hook
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  
  return context;
};

// Convenience hooks for specific data types
export const useRealtimeUsage = () => {
  const { realtimeUsage, trackUsage } = useWebSocketContext();
  return { realtimeUsage, trackUsage };
};

export const useSystemStatus = () => {
  const { systemStatus, isConnected } = useWebSocketContext();
  return { systemStatus, isConnected };
};

export const useNotifications = () => {
  const { 
    notifications, 
    clearNotifications, 
    removeNotification, 
    hasNewNotifications 
  } = useWebSocketContext();
  
  return { 
    notifications, 
    clearNotifications, 
    removeNotification, 
    hasNewNotifications,
    notificationCount: notifications.length
  };
};

export const useContentLibraryUpdates = () => {
  const { contentLibraryUpdates } = useWebSocketContext();
  return { 
    updates: contentLibraryUpdates,
    hasUpdates: contentLibraryUpdates.length > 0,
    updateCount: contentLibraryUpdates.length
  };
};

// Connection status hook
export const useConnectionStatus = () => {
  const { 
    connectionStatus, 
    isConnected, 
    isConnecting, 
    getConnectionStatusText, 
    getConnectionStatusColor,
    connect,
    disconnect
  } = useWebSocketContext();
  
  return { 
    connectionStatus, 
    isConnected, 
    isConnecting, 
    statusText: getConnectionStatusText(),
    statusColor: getConnectionStatusColor(),
    connect,
    disconnect
  };
};