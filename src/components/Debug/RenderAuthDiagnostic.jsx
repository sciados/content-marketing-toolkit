// RenderAuthDiagnostic.jsx - Specific diagnostic for Render backend issues
import React, { useState } from 'react';

const RenderAuthDiagnostic = () => {
  const [diagnosticResults, setDiagnosticResults] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const runRenderDiagnostic = async () => {
    setIsRunning(true);
    setDiagnosticResults('🔍 RENDER BACKEND AUTH DIAGNOSTIC\n\n');
    
    try {
      // Step 1: Check environment
      setDiagnosticResults(prev => prev + `📋 Environment Check:\n`);
      setDiagnosticResults(prev => prev + `   Frontend: Vercel (${window.location.origin})\n`);
      setDiagnosticResults(prev => prev + `   Backend: ${API_BASE}\n`);
      setDiagnosticResults(prev => prev + `   Cross-Origin: ${window.location.origin !== API_BASE}\n\n`);
      
      // Step 2: Get auth token
      setDiagnosticResults(prev => prev + `🔑 Auth Token Analysis:\n`);
      const storedAuth = localStorage.getItem('sb-gjqpyfrdxvecxwfsmory-auth-token');
      
      if (!storedAuth) {
        setDiagnosticResults(prev => prev + `   ❌ CRITICAL: No auth token found in localStorage\n`);
        setDiagnosticResults(prev => prev + `   💡 Solution: User needs to login again\n\n`);
        return;
      }
      
      let authData;
      try {
        authData = JSON.parse(storedAuth);
        setDiagnosticResults(prev => prev + `   ✅ Token exists and is valid JSON\n`);
        setDiagnosticResults(prev => prev + `   📊 Token structure: ${Object.keys(authData).join(', ')}\n`);
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        setDiagnosticResults(prev => prev + `   ❌ CRITICAL: Token is malformed JSON\n`);
        setDiagnosticResults(prev => prev + `   💡 Solution: Clear localStorage and re-login\n\n`);
        return;
      }
      
      if (!authData.access_token) {
        setDiagnosticResults(prev => prev + `   ❌ CRITICAL: No access_token in auth data\n`);
        setDiagnosticResults(prev => prev + `   💡 Solution: User needs to login again\n\n`);
        return;
      }
      
      setDiagnosticResults(prev => prev + `   ✅ Access token found (${authData.access_token.length} chars)\n`);
      
      // Step 3: Decode JWT to check expiration
      try {
        const payload = JSON.parse(atob(authData.access_token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        const expired = payload.exp < now;
        
        setDiagnosticResults(prev => prev + `   📅 Token expiry: ${new Date(payload.exp * 1000).toISOString()}\n`);
        setDiagnosticResults(prev => prev + `   ⏰ Token expired: ${expired}\n`);
        
        if (expired) {
          setDiagnosticResults(prev => prev + `   ❌ CRITICAL: Token has expired\n`);
          setDiagnosticResults(prev => prev + `   💡 Solution: User needs to login again\n\n`);
          return;
        }
        
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        setDiagnosticResults(prev => prev + `   ⚠️ Could not decode JWT payload\n`);
      }
      
      setDiagnosticResults(prev => prev + `\n`);
      
      // Step 4: Test backend health
      setDiagnosticResults(prev => prev + `🏥 Backend Health Check:\n`);
      
      try {
        const healthResponse = await fetch(`${API_BASE}/`, {
          method: 'GET',
          mode: 'cors'
        });
        
        setDiagnosticResults(prev => prev + `   ✅ Backend reachable (${healthResponse.status})\n`);
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          setDiagnosticResults(prev => prev + `   ✅ Supabase available: ${healthData.services?.supabase}\n`);
          setDiagnosticResults(prev => prev + `   ✅ Backend version: ${healthData.version}\n`);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        setDiagnosticResults(prev => prev + `   ❌ CRITICAL: Backend unreachable\n`);
        setDiagnosticResults(prev => prev + `   💡 Check if Render service is running\n`);
        return;
      }
      
      setDiagnosticResults(prev => prev + `\n`);
      
      // Step 5: Test CORS preflight
      setDiagnosticResults(prev => prev + `🌐 CORS Preflight Test:\n`);
      
      try {
        // This will trigger a preflight request
        const preflightResponse = await fetch(`${API_BASE}/api/usage/limits`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer test-token`
          },
          mode: 'cors'
        });
        
        setDiagnosticResults(prev => prev + `   📡 Preflight completed\n`);
        setDiagnosticResults(prev => prev + `   📊 Response status: ${preflightResponse.status}\n`);
        
        // Check CORS headers
        const corsHeaders = {
          'access-control-allow-origin': preflightResponse.headers.get('access-control-allow-origin'),
          'access-control-allow-headers': preflightResponse.headers.get('access-control-allow-headers'),
          'access-control-allow-methods': preflightResponse.headers.get('access-control-allow-methods')
        };
        
        setDiagnosticResults(prev => prev + `   🔍 CORS headers:\n`);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          setDiagnosticResults(prev => prev + `      ${key}: ${value || 'MISSING'}\n`);
        });
        
      } catch (e) {
        setDiagnosticResults(prev => prev + `   ❌ CORS preflight failed: ${e.message}\n`);
      }
      
      setDiagnosticResults(prev => prev + `\n`);
      
      // Step 6: Test actual auth request
      setDiagnosticResults(prev => prev + `🔐 Authentication Test:\n`);
      
      const authHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
        'Origin': window.location.origin
      };
      
      try {
        const authResponse = await fetch(`${API_BASE}/api/usage/limits`, {
          method: 'GET',
          headers: authHeaders,
          mode: 'cors',
          credentials: 'omit'
        });
        
        setDiagnosticResults(prev => prev + `   📊 Auth request status: ${authResponse.status}\n`);
        setDiagnosticResults(prev => prev + `   📊 Auth request ok: ${authResponse.ok}\n`);
        
        const responseText = await authResponse.text();
        
        if (authResponse.ok) {
          setDiagnosticResults(prev => prev + `   ✅ SUCCESS: Authentication working!\n`);
          setDiagnosticResults(prev => prev + `   📄 Response preview: ${responseText.substring(0, 100)}...\n`);
        } else {
          setDiagnosticResults(prev => prev + `   ❌ FAILURE: Authentication failed\n`);
          setDiagnosticResults(prev => prev + `   📄 Error response: ${responseText}\n`);
          
          // Specific error analysis
          if (authResponse.status === 401) {
            setDiagnosticResults(prev => prev + `\n   🎯 401 UNAUTHORIZED ANALYSIS:\n`);
            
            if (responseText.includes('No token provided')) {
              setDiagnosticResults(prev => prev + `   ❌ Backend is not receiving Authorization header\n`);
              setDiagnosticResults(prev => prev + `   💡 This is likely a CORS issue\n`);
            } else if (responseText.includes('Invalid token')) {
              setDiagnosticResults(prev => prev + `   ❌ Backend received token but Supabase rejected it\n`);
              setDiagnosticResults(prev => prev + `   💡 Check Supabase service role key in Render\n`);
            } else if (responseText.includes('Authentication failed')) {
              setDiagnosticResults(prev => prev + `   ❌ Backend auth function crashed\n`);
              setDiagnosticResults(prev => prev + `   💡 Check Render logs for Python errors\n`);
            }
          }
        }
        
      } catch (e) {
        setDiagnosticResults(prev => prev + `   ❌ Auth request failed: ${e.message}\n`);
      }
      
      setDiagnosticResults(prev => prev + `\n`);
      
      // Step 7: Specific recommendations
      setDiagnosticResults(prev => prev + `💡 NEXT STEPS:\n`);
      setDiagnosticResults(prev => prev + `\n1. Check Render Logs:\n`);
      setDiagnosticResults(prev => prev + `   - Go to Render dashboard\n`);
      setDiagnosticResults(prev => prev + `   - Open your Python service\n`);
      setDiagnosticResults(prev => prev + `   - Check logs during failed request\n`);
      setDiagnosticResults(prev => prev + `\n2. Verify CORS Origins:\n`);
      setDiagnosticResults(prev => prev + `   - Backend should include: ${window.location.origin}\n`);
      setDiagnosticResults(prev => prev + `   - Check allowed_origins in app.py\n`);
      setDiagnosticResults(prev => prev + `\n3. Verify Environment Variables:\n`);
      setDiagnosticResults(prev => prev + `   - SUPABASE_URL in Render\n`);
      setDiagnosticResults(prev => prev + `   - SUPABASE_SERVICE_ROLE_KEY in Render\n`);
      setDiagnosticResults(prev => prev + `\n4. Test Manually:\n`);
      setDiagnosticResults(prev => prev + `   - Copy auth token from above\n`);
      setDiagnosticResults(prev => prev + `   - Test in Postman with: Authorization: Bearer <token>\n`);
      setDiagnosticResults(prev => prev + `   - URL: ${API_BASE}/api/usage/limits\n\n`);
      
    } catch (error) {
      setDiagnosticResults(prev => prev + `❌ Diagnostic failed: ${error.message}\n`);
      setDiagnosticResults(prev => prev + `Stack: ${error.stack}\n`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ 
      border: '2px solid #dc2626', 
      borderRadius: '8px', 
      padding: '20px', 
      margin: '20px 0',
      backgroundColor: '#fef2f2'
    }}>
      <h3 style={{ color: '#dc2626', margin: '0 0 16px 0', fontSize: '18px' }}>
        🔍 RENDER BACKEND AUTH DIAGNOSTIC
      </h3>
      
      <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
        Comprehensive diagnostic for Vercel → Render authentication issues.
        This will test every step of the auth flow and identify the exact problem.
      </p>
      
      <button
        onClick={runRenderDiagnostic}
        disabled={isRunning}
        style={{
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '20px'
        }}
      >
        {isRunning ? '🔍 Running Diagnostic...' : '🚀 Run Complete Render Diagnostic'}
      </button>
      
      {diagnosticResults && (
        <div>
          <h4 style={{ color: '#374151', margin: '0 0 12px 0' }}>Diagnostic Results:</h4>
          <pre style={{
            backgroundColor: '#111827',
            color: '#f9fafb',
            padding: '16px',
            borderRadius: '6px',
            fontSize: '11px',
            overflow: 'auto',
            maxHeight: '500px',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.4'
          }}>
            {diagnosticResults}
          </pre>
        </div>
      )}
      
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        backgroundColor: '#fbbf24', 
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <strong>⚠️ Temporary Component:</strong> Remove this diagnostic component once auth is working.
        This provides detailed analysis of the Vercel → Render authentication flow.
      </div>
    </div>
  );
};

export default RenderAuthDiagnostic;