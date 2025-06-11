// src/pages/SalesPageEmailGenerator.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EnhancedSalesEmailGenerator from '../components/EmailGenerator/EnhancedSalesEmailGenerator';
import useAuth from '../shared/hooks/useAuth';
import Loader from '../components/ui/Loader';
// Add these imports at the top of your file
import RenderAuthDiagnostic from '../components/Debug/RenderAuthDiagnostic';
import AuthDebugComponent from '../components/Debug/AuthDebugComponent';

/**
 * Container component for the Email Generator tool
 * Handles URL parameters and passes them to the generator component
 * Includes authentication protection
 */
const SalesPageEmailGenerator = () => {
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      console.log("Email Generator: User not authenticated, redirecting to login");
      navigate('/auth/login', { 
        state: { from: '/tools/email-generator' + window.location.search }
      });
    }
  }, [user, loading, navigate]);
  
  // Extract parameters from URL
  const urlToScan = searchParams.get('url') || '';
  const keywords = searchParams.get('keywords') || '';
  const activeTab = searchParams.get('tab') || 'input';
  const emailId = searchParams.get('email') || '';
  const seriesId = searchParams.get('series') || '';
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600">Loading Email Generator...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, don't render anything (will redirect in useEffect)
  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <RenderAuthDiagnostic />
      <AuthDebugComponent />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">AI Sales Email Generator</h1>
        <p className="text-gray-600">
          Generate professional sales email sequences from any product or landing page.
        </p>
      </div>
      
      <EnhancedSalesEmailGenerator 
        initialUrl={urlToScan}
        initialKeywords={keywords}
        initialTab={activeTab}
        emailIdToLoad={emailId}
        seriesIdToLoad={seriesId}
      />
    </div>
  );
};

export default SalesPageEmailGenerator;
