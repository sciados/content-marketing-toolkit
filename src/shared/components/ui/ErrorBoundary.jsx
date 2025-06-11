// src/components/ui/ErrorBoundary.jsx - DEBUG VERSION
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error Boundary caught an error:', error);
    console.error('🚨 Error message:', error.message);
    console.error('🚨 Error stack:', error.stack);
    console.error('🚨 Component stack:', errorInfo.componentStack);
    
    // Store error info in state for display
    this.setState({
      error,
      errorInfo
    });
    
    // Optional: Send error to monitoring service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-12 w-12 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
                <p className="text-sm text-gray-500">
                  We encountered an unexpected error. Please try refreshing the page.
                </p>
              </div>
            </div>
            
            {/* DEBUG: Show actual error details */}
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <h4 className="text-sm font-medium text-red-800 mb-2">Error Details (Debug Mode):</h4>
              <p className="text-xs text-red-700 mb-2">
                <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
              </p>
              {this.state.error?.stack && (
                <details className="text-xs text-red-600">
                  <summary className="cursor-pointer font-medium">Stack Trace</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-all">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              {this.state.errorInfo?.componentStack && (
                <details className="text-xs text-red-600 mt-2">
                  <summary className="cursor-pointer font-medium">Component Stack</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-all">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;