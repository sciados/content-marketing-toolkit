import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Grid3X3, 
  User, 
  Settings, 
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

export const ToolLayout = ({ toolConfig, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const availableTools = [
    {
      id: 'video2promo',
      name: 'Video2Promo',
      description: 'Transform videos into marketing content',
      path: '/tools/video2promo',
      icon: '🎥',
      status: 'active',
      color: 'red'
    },
    {
      id: 'document2promo',
      name: 'Document2Promo',
      description: 'Extract insights from PDFs and documents',
      path: '/tools/document2promo',
      icon: '📄',
      status: 'development',
      color: 'blue'
    },
    {
      id: 'webpage2promo',
      name: 'Webpage2Promo',
      description: 'Analyze webpages and salespages',
      path: '/tools/webpage2promo',
      icon: '🌐',
      status: 'development',
      color: 'green'
    },
    {
      id: 'email2promo',
      name: 'Email2Promo',
      description: 'Extract content from emails',
      path: '/tools/email2promo',
      icon: '📧',
      status: 'planning',
      color: 'purple'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      development: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Beta' },
      planning: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Coming Soon' }
    };
    
    const config = statusConfig[status] || statusConfig.planning;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Content Marketing Toolkit</h2>
            <p className="text-sm text-gray-600">Choose your tool</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tools List */}
      <div className="flex-1 p-6 space-y-4">
        <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
          Available Tools
        </h3>
        
        {availableTools.map((tool) => (
          <div 
            key={tool.id} 
            className={`p-4 rounded-lg border-2 transition-all ${
              tool.id === toolConfig.id 
                ? 'border-blue-500 bg-blue-50' 
                : tool.status === 'active' 
                  ? 'border-gray-200 hover:border-gray-300 cursor-pointer' 
                  : 'border-gray-100 bg-gray-50'
            }`}
            onClick={() => {
              if (tool.status === 'active' && tool.id !== toolConfig.id) {
                window.location.href = tool.path;
              }
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{tool.icon}</div>
                <div>
                  <h4 className={`font-medium ${
                    tool.status === 'active' ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {tool.name}
                  </h4>
                  <p className={`text-sm ${
                    tool.status === 'active' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {tool.description}
                  </p>
                </div>
              </div>
              {getStatusBadge(tool.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="p-6 border-t border-gray-200 space-y-2">
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          <Grid3X3 className="h-4 w-4" />
          <span className="text-sm">Dashboard</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          <User className="h-4 w-4" />
          <span className="text-sm">Profile</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          <Settings className="h-4 w-4" />
          <span className="text-sm">Settings</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          <HelpCircle className="h-4 w-4" />
          <span className="text-sm">Help</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:w-80 lg:bg-white lg:border-r lg:border-gray-200">
        <SidebarContent />
      </div>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-80 bg-white">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Dashboard</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Current Tool Badge */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-${toolConfig.color}-100`}>
                <span className="text-lg">{availableTools.find(t => t.id === toolConfig.id)?.icon}</span>
                <span className={`text-sm font-medium text-${toolConfig.color}-800`}>
                  {toolConfig.name}
                </span>
                {getStatusBadge(toolConfig.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Tool Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ToolLayout;