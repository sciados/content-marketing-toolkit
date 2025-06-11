// src/components/ui/SystemStatus.jsx - FIXED method name
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../core/api';

const SystemStatus = ({ className = '' }) => {
  const [status, setStatus] = useState({
    backend: 'checking',
    ai_services: 'checking',
    database: 'checking',
    websocket: 'checking'
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // FIXED: Use correct method name
        const health = await apiClient.healthCheck();
        
        if (health && health.success !== false) {
          setStatus({
            backend: 'operational',
            ai_services: health.services?.claude ? 'operational' : 'degraded',
            database: health.services?.supabase ? 'operational' : 'degraded',
            websocket: health.websocket ? 'operational' : 'degraded'
          });
        } else {
          setStatus({
            backend: 'degraded',
            ai_services: 'unknown',
            database: 'unknown',
            websocket: 'unknown'
          });
        }
      } catch (error) {
        console.error('Status check failed:', error);
        setStatus({
          backend: 'down',
          ai_services: 'unknown',
          database: 'unknown',
          websocket: 'unknown'
        });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (serviceStatus) => {
    switch (serviceStatus) {
      case 'operational': return 'bg-green-400';
      case 'degraded': return 'bg-yellow-400';
      case 'down': return 'bg-red-400';
      case 'checking': return 'bg-gray-400 animate-pulse';
      default: return 'bg-gray-300';
    }
  };

  const getStatusText = (serviceStatus) => {
    switch (serviceStatus) {
      case 'operational': return 'Operational';
      case 'degraded': return 'Degraded';
      case 'down': return 'Down';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  const services = [
    { key: 'backend', label: 'Backend API' },
    { key: 'ai_services', label: 'AI Services' },
    { key: 'database', label: 'Database' },
    { key: 'websocket', label: 'Real-time' }
  ];

  const overallStatus = Object.values(status).every(s => s === 'operational') ? 'operational' :
                      Object.values(status).some(s => s === 'down') ? 'down' : 'degraded';

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">System Status</h3>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(overallStatus)}`}></div>
          <span className="text-xs text-gray-600">{getStatusText(overallStatus)}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {services.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{label}</span>
            <div className="flex items-center">
              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusColor(status[key])}`}></div>
              <span className="text-xs text-gray-500">{getStatusText(status[key])}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemStatus;