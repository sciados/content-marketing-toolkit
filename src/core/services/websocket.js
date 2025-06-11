// src/services/websocket.js - Complete WebSocket service for real-time features
import { supabase } from '../database/supabaseClient';

const WS_URL = import.meta.env.VITE_WS_URL || 'wss://aiworkers.onrender.com/ws';
const RECONNECT_ATTEMPTS = parseInt(import.meta.env.VITE_WEBSOCKET_RECONNECT_ATTEMPTS) || 5;
const RECONNECT_INTERVAL = 3000; // 3 seconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = RECONNECT_ATTEMPTS;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.messageQueue = [];
    this.eventHandlers = new Map();
    this.userId = null;
    
    // Bind methods to preserve context
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  /**
   * Initialize connection with authentication
   */
  async initialize() {
    try {
      // Get current user session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        this.userId = session.user.id;
      }
      
      // Auto-connect if WebSocket is enabled
      if (import.meta.env.VITE_ENABLE_WEBSOCKET === 'true') {
        this.connect();
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket service:', error);
    }
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.isConnected || this.isConnecting) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    try {
      this.isConnecting = true;
      console.log(`🔌 Connecting to WebSocket: ${WS_URL}`);

      // Create WebSocket connection with auth token
      const wsUrl = this.userId ? `${WS_URL}?userId=${this.userId}` : WS_URL;
      this.ws = new WebSocket(wsUrl);

      // Set up event handlers
      this.ws.onopen = this.handleOpen;
      this.ws.onmessage = this.handleMessage;
      this.ws.onerror = this.handleError;
      this.ws.onclose = this.handleClose;

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Handle connection open
   */
  handleOpen(event) { // eslint-disable-line no-unused-vars
    console.log('✅ WebSocket connected successfully');
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;

    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Start heartbeat
    this.startHeartbeat();

    // Send queued messages
    this.processMessageQueue();

    // Send authentication if we have a user
    if (this.userId) {
      this.send({
        type: 'authenticate',
        userId: this.userId,
        timestamp: new Date().toISOString()
      });
    }

    // Emit connection event
    this.emit('connected', { timestamp: new Date().toISOString() });
  }

  /**
   * Handle incoming messages
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 WebSocket message received:', data.type);

      // Handle different message types
      switch (data.type) {
        case 'usage_update':
          this.emit('usage_update', data.usage);
          break;
        
        case 'system_status':
          this.emit('system_status', data.status);
          break;
        
        case 'content_library_update':
          this.emit('content_library_update', data.update);
          break;
        
        case 'notification':
          this.emit('notification', data.notification);
          break;
        
        case 'heartbeat_response':
          // Heartbeat acknowledged - connection is alive
          break;
        
        case 'error':
          console.error('WebSocket server error:', data.error);
          this.emit('error', data.error);
          break;
        
        default:
          // Emit unknown message types for custom handling
          this.emit('message', data);
          break;
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle connection errors
   */
  handleError(error) {
    console.error('❌ WebSocket error:', error);
    this.emit('error', error);
  }

  /**
   * Handle connection close
   */
  handleClose(event) {
    console.log(`🔌 WebSocket disconnected: ${event.code} - ${event.reason}`);
    this.isConnected = false;
    this.isConnecting = false;

    // Stop heartbeat
    this.stopHeartbeat();

    // Emit disconnection event
    this.emit('disconnected', { 
      code: event.code, 
      reason: event.reason,
      timestamp: new Date().toISOString() 
    });

    // Attempt to reconnect if not manually closed
    if (event.code !== 1000) { // 1000 = normal closure
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('max_reconnects_reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(RECONNECT_INTERVAL * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        });
      }
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Send message to server
   */
  send(message) {
    if (!this.isConnected) {
      console.log('📤 Queueing message (not connected):', message.type);
      this.messageQueue.push(message);
      return false;
    }

    try {
      const messageStr = JSON.stringify(message);
      this.ws.send(messageStr);
      console.log('📤 WebSocket message sent:', message.type);
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    console.log('🔌 Disconnecting WebSocket...');
    
    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();

    // Close connection
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect'); // Normal closure
      this.ws = null;
    }

    // Reset state
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
  }

  /**
   * Add event listener
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
  }

  /**
   * Remove event listener
   */
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      queuedMessages: this.messageQueue.length,
      userId: this.userId
    };
  }

  /**
   * Track usage update (convenience method)
   */
  trackUsage(tokens, feature) {
    this.send({
      type: 'usage_track',
      tokens,
      feature,
      userId: this.userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update user authentication
   */
  updateAuth(userId) {
    this.userId = userId;
    if (this.isConnected) {
      this.send({
        type: 'authenticate',
        userId: this.userId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Clear authentication
   */
  clearAuth() {
    this.userId = null;
  }
}

// Create singleton instance
export const wsService = new WebSocketService();

// Initialize when module loads
if (typeof window !== 'undefined') {
  wsService.initialize();
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    wsService.disconnect();
  });
}

export default wsService;