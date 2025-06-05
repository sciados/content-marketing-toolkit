import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

// Status Banner Component
export const StatusBanner = () => (
  <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-xl">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <div className="font-semibold text-green-800">Webshare Rotating Proxies Active</div>
          <div className="text-sm text-green-600">95-100% Success Rate • Real-time Processing</div>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-700">AI Generation</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-green-600" />
          <span className="text-green-700">Usage Tracking</span>
        </div>
      </div>
    </div>
  </div>
);

// Processing Status Component
export const ProcessingStatus = ({ processingStage, isGeneratingAssets }) => {
  if (!processingStage && !isGeneratingAssets) return null;

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        <div>
          <div className="font-semibold text-blue-800 text-lg">
            {isGeneratingAssets ? 'Generating marketing assets...' : processingStage}
          </div>
          <div className="text-blue-600">Processing with AI backend • This may take 30-60 seconds</div>
        </div>
        <div className="ml-auto">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Backend API
          </span>
        </div>
      </div>
    </div>
  );
};

// Error Display Component
export const ErrorDisplay = ({ error, assetError, onReset }) => {
  if (!error && !assetError) return null;

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-red-100 rounded-xl">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-red-800 text-lg mb-2">Backend Processing Error</div>
          <p className="text-red-700 mb-4">{error || assetError}</p>
          <div className="flex space-x-3">
            <button
              onClick={onReset}
              className="px-4 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-colors font-medium"
            >
              🔄 Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Usage Stats Component
export const UsageStats = ({ userTier, usageData, remainingTokens }) => {
  if (!usageData) return null;

  return (
    <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{userTier}</div>
          <div className="text-sm text-gray-600">Current Plan</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{usageData.monthly_tokens_used.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Tokens Used</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{remainingTokens.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Tokens Remaining</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">4.0</div>
          <div className="text-sm text-gray-600">Backend Version</div>
        </div>
      </div>
    </div>
  );
};