// AuthDebugComponent.jsx - Temporary debug component - FIXED VERSION
import React, { useState } from 'react';

const AuthDebugComponent = () => {
  const [testResults, setTestResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const runCompleteAuthTest = async () => {
    setIsLoading(true);
    setTestResults('Starting comprehensive auth test...\n\n');
    
    try {
      // Step 1: Check localStorage
      const storedAuth = localStorage.getItem('sb-gjqpyfrdxvecxwfsmory-auth-token');
      setTestResults(prev => prev + `✅ Step 1: localStorage token exists: ${!!storedAuth}\n`);
      setTestResults(prev => prev + `   Token length: ${storedAuth?.length || 0}\n\n`);
      
      if (!storedAuth) {
        setTestResults(prev => prev + '❌ STOP: No auth token found in localStorage\n');
        return;
      }
      
      // Step 2: Parse token
      let authData;
      try {
        authData = JSON.parse(storedAuth);
        setTestResults(prev => prev + `✅ Step 2: Token parsed successfully\n`);
        setTestResults(prev => prev + `   Has access_token: ${!!authData.access_token}\n`);
        setTestResults(prev => prev + `   Access token length: ${authData.access_token?.length || 0}\n\n`);
      } catch (e) {
        setTestResults(prev => prev + `❌ Step 2: Failed to parse token: ${e.message}\n`);
        return;
      }
      
      if (!authData.access_token) {
        setTestResults(prev => prev + '❌ STOP: No access_token in parsed data\n');
        return;
      }
      
      // Step 3: Build headers (Vercel→Render optimized)
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
        'Origin': window.location.origin
      };
      
      setTestResults(prev => prev + `✅ Step 3: Headers built (Vercel→Render)\n`);
      setTestResults(prev => prev + `   Authorization header length: ${headers.Authorization.length}\n`);
      setTestResults(prev => prev + `   Origin: ${headers.Origin}\n`);
      setTestResults(prev => prev + `   API_BASE: ${API_BASE}\n\n`);
      
      // Step 4: Test with simple endpoint
      setTestResults(prev => prev + `🧪 Step 4: Testing with usage/limits endpoint...\n`);
      
      const response1 = await fetch(`${API_BASE}/api/usage/limits`, {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        credentials: 'omit'
      });
      
      setTestResults(prev => prev + `   Response status: ${response1.status}\n`);
      setTestResults(prev => prev + `   Response ok: ${response1.ok}\n`);
      
      if (response1.ok) {
        const data1 = await response1.json();
        setTestResults(prev => prev + `   ✅ Usage limits test PASSED\n`);
        setTestResults(prev => prev + `   Response: ${JSON.stringify(data1, null, 2)}\n\n`);
      } else {
        const error1 = await response1.text();
        setTestResults(prev => prev + `   ❌ Usage limits test FAILED\n`);
        setTestResults(prev => prev + `   Error: ${error1}\n\n`);
      }
      
      // Step 5: Test with email generator endpoint
      setTestResults(prev => prev + `🧪 Step 5: Testing email generator endpoint...\n`);
      
      // ✅ FIXED: Clean test request data that matches backend schema
      const testRequestData = {
        benefits: ['Test benefit'],
        selectedBenefits: [true],
        websiteData: { title: 'Test' },
        tone: 'persuasive',
        industry: 'general',
        affiliateLink: '',
        autoSave: true
        // ❌ REMOVED: isUsingAI and aiAvailable (these caused validation errors)
      };
      
      const response2 = await fetch(`${API_BASE}/api/email-generator/generate`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(testRequestData),
        mode: 'cors',
        credentials: 'omit'
      });
      
      setTestResults(prev => prev + `   Response status: ${response2.status}\n`);
      setTestResults(prev => prev + `   Response ok: ${response2.ok}\n`);
      
      if (response2.ok) {
        const data2 = await response2.json();
        setTestResults(prev => prev + `   ✅ Email generator test PASSED\n`);
        setTestResults(prev => prev + `   Response preview: ${JSON.stringify(data2, null, 2).substring(0, 200)}...\n\n`);
      } else {
        const error2 = await response2.text();
        setTestResults(prev => prev + `   ❌ Email generator test FAILED\n`);
        setTestResults(prev => prev + `   Error: ${error2}\n\n`);
      }
      
      // Step 6: Vercel→Render specific checks
      setTestResults(prev => prev + `📋 Step 6: Vercel→Render specific checks:\n`);
      setTestResults(prev => prev + `   1. Open Browser DevTools → Network tab\n`);
      setTestResults(prev => prev + `   2. Try the email generation again\n`);
      setTestResults(prev => prev + `   3. Look for OPTIONS preflight requests before POST\n`);
      setTestResults(prev => prev + `   4. Check if Authorization header survives preflight\n`);
      setTestResults(prev => prev + `   5. Verify CORS headers in response:\n`);
      setTestResults(prev => prev + `      - Access-Control-Allow-Origin\n`);
      setTestResults(prev => prev + `      - Access-Control-Allow-Headers\n`);
      setTestResults(prev => prev + `   6. Check if backend is receiving the auth header\n\n`);
      
      setTestResults(prev => prev + `🎯 Common Vercel→Render Issues:\n`);
      setTestResults(prev => prev + `   ❌ CORS preflight strips Authorization header\n`);
      setTestResults(prev => prev + `   ❌ Backend authenticate_user function failing\n`);
      setTestResults(prev => prev + `   ❌ Supabase auth.get_user() rejecting token\n`);
      setTestResults(prev => prev + `   ❌ Token format/encoding issues\n`);
      setTestResults(prev => prev + `   ❌ Missing 'Bearer ' prefix in auth header\n`);
      setTestResults(prev => prev + `   ❌ CORS origins mismatch between Vercel and Render\n\n`);
      
      setTestResults(prev => prev + `💡 Next Debugging Steps:\n`);
      setTestResults(prev => prev + `   1. Check if your Vercel URL is in backend CORS origins\n`);
      setTestResults(prev => prev + `   2. Verify Supabase service role key in Render environment\n`);
      setTestResults(prev => prev + `   3. Check Render logs during failed request\n`);
      setTestResults(prev => prev + `   4. Test if token works in Postman/Insomnia\n`);
      setTestResults(prev => prev + `   5. Verify token is not expired (check JWT payload)\n\n`);
      
      setTestResults(prev => prev + `🎯 Summary: Check the results above to identify the auth issue!\n`);
      
    } catch (error) {
      setTestResults(prev => prev + `❌ Test failed with error: ${error.message}\n`);
      setTestResults(prev => prev + `Stack: ${error.stack}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      border: '2px solid #f59e0b', 
      borderRadius: '8px', 
      padding: '16px', 
      margin: '16px 0',
      backgroundColor: '#fffbeb'
    }}>
      <h3 style={{ color: '#d97706', margin: '0 0 16px 0' }}>
        🔧 AUTH DEBUG PANEL
      </h3>
      
      <button
        onClick={runCompleteAuthTest}
        disabled={isLoading}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: '16px'
        }}
      >
        {isLoading ? 'Running Tests...' : 'Run Complete Auth Test'}
      </button>
      
      {testResults && (
        <pre style={{
          backgroundColor: '#1f2937',
          color: '#f3f4f6',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto',
          maxHeight: '400px',
          whiteSpace: 'pre-wrap'
        }}>
          {testResults}
        </pre>
      )}
      
      <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
        💡 This debug panel will help identify exactly where the auth is failing.
        Remove this component once the issue is resolved.
      </p>
    </div>
  );
};

export default AuthDebugComponent;