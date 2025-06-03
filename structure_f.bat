@echo off
cls
echo ========================================
echo  Content Marketing Toolkit Frontend
echo  COMPLETE SRC STRUCTURE CREATOR v8.1
echo  FIXED VERSION - Clean and Working
echo ========================================
echo.
echo This will create a COMPLETE new src/ folder structure.
echo You can then move your existing files to replace the placeholder files.
echo.
echo WARNING: This will create a new src_new/ folder to avoid conflicts.
echo.

set /p confirm=Do you want to proceed? (y/n): 
if /i not "%confirm%"=="y" (
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo ✅ Creating complete fresh src structure as 'src_new'...

REM Create the new src directory
if exist "src_new" (
    echo Removing existing src_new folder...
    rmdir /s /q "src_new"
)

mkdir "src_new"
cd "src_new"

echo ✅ Creating ALL directory structure...

REM Create all directories
mkdir "services"
mkdir "services\api"
mkdir "services\supabase"
mkdir "hooks"
mkdir "components"
mkdir "components\Common"
mkdir "components\Layout"
mkdir "components\Auth"
mkdir "components\Admin"
mkdir "components\EmailGenerator"
mkdir "components\Video2Promo"
mkdir "components\ContentLibrary"
mkdir "pages"
mkdir "pages\Auth"
mkdir "pages\Admin"
mkdir "context"
mkdir "utils"
mkdir "routes"
mkdir "styles"

echo   📁 All directories created!

echo.
echo ✅ Creating API Service Layer...

REM API Client (CRITICAL)
(
echo import { supabase } from '../supabase/supabaseClient';
echo.
echo // Backend API URL
echo const API_BASE = import.meta.env.VITE_API_BASE_URL ^|^| 'https://aiworkers.onrender.com';
echo.
echo /**
echo  * Centralized API client with consistent auth and error handling
echo  */
echo class ApiClient {
echo   constructor^(^) {
echo     this.baseURL = API_BASE;
echo   }
echo.
echo   /**
echo    * Get consistent auth headers using Supabase session
echo    */
echo   async getAuthHeaders^(^) {
echo     try {
echo       const { data: { session }, error } = await supabase.auth.getSession^(^);
echo       
echo       if ^(error ^|^| !session?.access_token^) {
echo         console.warn^('No valid session for API calls'^);
echo         return {
echo           'Content-Type': 'application/json',
echo           'Accept': 'application/json',
echo           'Origin': window.location.origin
echo         };
echo       }
echo       
echo       return {
echo         'Content-Type': 'application/json',
echo         'Accept': 'application/json',
echo         'Authorization': `Bearer ${session.access_token}`,
echo         'Origin': window.location.origin
echo       };
echo     } catch ^(error^) {
echo       console.error^('Failed to get auth headers:', error^);
echo       return {
echo         'Content-Type': 'application/json',
echo         'Accept': 'application/json',
echo         'Origin': window.location.origin
echo       };
echo     }
echo   }
echo.
echo   // TODO: Add request method, error handling, timeout logic
echo }
echo.
echo // Create singleton instance
echo export const apiClient = new ApiClient^(^);
echo export default apiClient;
) > "services\api\apiClient.js"

REM Video API
(
echo import { apiClient } from './apiClient';
echo.
echo export const videoApi = {
echo   extractTranscript: async ^(videoData^) =^> {
echo     return apiClient.post^('/api/video2promo/extract-transcript', videoData^);
echo   },
echo   analyzeBenefits: async ^(transcriptData^) =^> {
echo     return apiClient.post^('/api/video2promo/analyze-benefits', transcriptData^);
echo   },
echo   generateAssets: async ^(assetData^) =^> {
echo     return apiClient.post^('/api/video2promo/generate-assets', assetData^);
echo   }
echo };
) > "services\api\videoApi.js"

REM Email API
(
echo import { apiClient } from './apiClient';
echo.
echo export const emailApi = {
echo   scanPage: async ^(pageData^) =^> {
echo     return apiClient.post^('/api/email-generator/scan-page', pageData^);
echo   },
echo   generateEmails: async ^(emailData^) =^> {
echo     return apiClient.post^('/api/email-generator/generate', emailData^);
echo   }
echo };
) > "services\api\emailApi.js"

REM Usage API
(
echo import { apiClient } from './apiClient';
echo.
echo export const usageApi = {
echo   getLimits: async ^(^) =^> {
echo     return apiClient.get^('/api/usage/limits'^);
echo   },
echo   trackUsage: async ^(usageData^) =^> {
echo     return apiClient.post^('/api/usage/track', usageData^);
echo   },
echo   getHistory: async ^(params = {}^) =^> {
echo     const query = new URLSearchParams^(params^).toString^(^);
echo     return apiClient.get^(`/api/usage/history${query ? '?' + query : ''}`^);
echo   }
echo };
) > "services\api\usageApi.js"

REM Content Library API
(
echo import { apiClient } from './apiClient';
echo.
echo export const contentLibraryApi = {
echo   getItems: async ^(params = {}^) =^> {
echo     const query = new URLSearchParams^(params^).toString^(^);
echo     return apiClient.get^(`/api/content-library/items${query ? '?' + query : ''}`^);
echo   },
echo   createItem: async ^(itemData^) =^> {
echo     return apiClient.post^('/api/content-library/items', itemData^);
echo   },
echo   deleteItem: async ^(itemId^) =^> {
echo     return apiClient.delete^(`/api/content-library/item/${itemId}`^);
echo   },
echo   toggleFavorite: async ^(itemId, isFavorited^) =^> {
echo     return apiClient.post^(`/api/content-library/item/${itemId}/favorite`, {
echo       is_favorited: isFavorited
echo     }^);
echo   }
echo };
) > "services\api\contentLibraryApi.js"

REM API Index
(
echo // API services barrel export
echo export { apiClient } from './apiClient';
echo export { videoApi } from './videoApi';
echo export { emailApi } from './emailApi';
echo export { usageApi } from './usageApi';
echo export { contentLibraryApi } from './contentLibraryApi';
) > "services\api\index.js"

echo   ✅ API service layer created!

echo.
echo ✅ Creating Supabase Services...

REM Supabase Client
(
echo // TODO: Move your existing supabase client here
echo // import { createClient } from '@supabase/supabase-js'
echo //
echo // const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
echo // const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
echo //
echo // export const supabase = createClient^(supabaseUrl, supabaseKey^)
echo.
echo console.log^('TODO: Implement Supabase client'^);
) > "services\supabase\supabaseClient.js"

REM Supabase Auth
(
echo // TODO: Move your existing auth service here
echo console.log^('TODO: Implement Supabase auth service'^);
) > "services\supabase\auth.js"

REM Supabase DB
(
echo // TODO: Move your existing database service here
echo console.log^('TODO: Implement Supabase database service'^);
) > "services\supabase\db.js"

REM Supabase Profiles
(
echo // TODO: Move your existing profiles service here
echo console.log^('TODO: Implement Supabase profiles service'^);
) > "services\supabase\profiles.js"

REM Supabase Subscriptions
(
echo // TODO: Move your existing subscriptions service here
echo console.log^('TODO: Implement Supabase subscriptions service'^);
) > "services\supabase\subscriptions.js"

REM Supabase Index
(
echo // Supabase services barrel export
echo export { supabase } from './supabaseClient';
echo export { auth } from './auth';
echo export { db } from './db';
echo export { profiles } from './profiles';
echo export { subscriptions } from './subscriptions';
) > "services\supabase\index.js"

REM WebSocket Service
(
echo // WebSocket service for real-time features
echo const WS_URL = import.meta.env.VITE_WS_URL ^|^| 'wss://aiworkers.onrender.com/ws';
echo.
echo class WebSocketService {
echo   // TODO: Implement WebSocket connection management
echo }
echo.
echo export const wsService = new WebSocketService^(^);
) > "services\websocket.js"

echo   ✅ Supabase services created!

echo.
echo ✅ Creating Hook Files...

REM useEmailGenerator
(
echo // TODO: Move your existing useEmailGenerator hook here
echo // Update to use emailApi from '../services/api'
echo.
echo import { emailApi } from '../services/api';
echo.
echo export const useEmailGenerator = ^(options^) =^> {
echo   // TODO: Implement using emailApi
echo   console.log^('TODO: Update useEmailGenerator to use emailApi'^);
echo };
) > "hooks\useEmailGenerator.js"

REM useAssetGeneration
(
echo // TODO: Move your existing useAssetGeneration hook here
echo // Update to use videoApi from '../services/api'
echo.
echo import { videoApi } from '../services/api';
echo.
echo export const useAssetGeneration = ^(^) =^> {
echo   // TODO: Implement using videoApi
echo   console.log^('TODO: Update useAssetGeneration to use videoApi'^);
echo };
) > "hooks\useAssetGeneration.js"

REM useContentLibrary
(
echo // TODO: Move your existing useContentLibrary hook here
echo // Update to use contentLibraryApi from '../services/api'
echo.
echo import { contentLibraryApi } from '../services/api';
echo.
echo export const useContentLibrary = ^(^) =^> {
echo   // TODO: Implement using contentLibraryApi
echo   console.log^('TODO: Update useContentLibrary to use contentLibraryApi'^);
echo };
) > "hooks\useContentLibrary.js"

REM useUsageTracking
(
echo // TODO: Move your existing useUsageTracking hook here
echo // Update to use usageApi and add WebSocket
echo.
echo import { usageApi } from '../services/api';
echo.
echo export const useUsageTracking = ^(^) =^> {
echo   // TODO: Implement using usageApi + WebSocket
echo   console.log^('TODO: Update useUsageTracking to use usageApi'^);
echo };
) > "hooks\useUsageTracking.js"

REM New hooks
(
echo // Centralized error handling hook
echo import { useCallback } from 'react';
echo.
echo export const useErrorHandler = ^(^) =^> {
echo   const handleError = useCallback^(^(error, context^) =^> {
echo     console.error^(`Error in ${context}:`, error^);
echo     // TODO: Add user-friendly error handling
echo   }, []^);
echo.
echo   return { handleError };
echo };
) > "hooks\useErrorHandler.js"

(
echo // React Query-like caching hook
echo import { useState, useEffect } from 'react';
echo.
echo export const useApiQuery = ^(queryKey, queryFn, options^) =^> {
echo   const [data, setData] = useState^(null^);
echo   const [loading, setLoading] = useState^(false^);
echo   const [error, setError] = useState^(null^);
echo.
echo   // TODO: Add caching and state management logic
echo.
echo   return { data, loading, error };
echo };
) > "hooks\useApiQuery.js"

(
echo // WebSocket connection management hook
echo import { useState, useEffect } from 'react';
echo.
echo export const useWebSocket = ^(url, options^) =^> {
echo   const [readyState, setReadyState] = useState^(null^);
echo   const [lastMessage, setLastMessage] = useState^(null^);
echo.
echo   // TODO: Add WebSocket connection logic
echo.
echo   return { readyState, lastMessage };
echo };
) > "hooks\useWebSocket.js"

echo   ✅ Hook files created!

echo.
echo ✅ Creating Common Components...

REM ErrorBoundary
(
echo import React from 'react';
echo.
echo class ErrorBoundary extends React.Component {
echo   constructor^(props^) {
echo     super^(props^);
echo     this.state = { hasError: false };
echo   }
echo.
echo   static getDerivedStateFromError^(error^) {
echo     return { hasError: true };
echo   }
echo.
echo   componentDidCatch^(error, errorInfo^) {
echo     console.error^('Error Boundary caught an error:', error, errorInfo^);
echo   }
echo.
echo   render^(^) {
echo     if ^(this.state.hasError^) {
echo       return ^<div^>Something went wrong.^</div^>;
echo     }
echo     return this.props.children;
echo   }
echo }
echo.
echo export default ErrorBoundary;
) > "components\Common\ErrorBoundary.jsx"

REM UsageMeter
(
echo import React from 'react';
echo import { useUsageTracking } from '../../hooks/useUsageTracking';
echo.
echo const UsageMeter = ^({ type = 'daily_tokens' }^) =^> {
echo   // TODO: Implement usage meter with real-time updates
echo   return ^<div^>Usage Meter Component^</div^>;
echo };
echo.
echo export default UsageMeter;
) > "components\Common\UsageMeter.jsx"

REM UpgradePrompt
(
echo import React from 'react';
echo.
echo const UpgradePrompt = ^({ feature, tokensRequired }^) =^> {
echo   // TODO: Implement upgrade prompt based on usage limits
echo   return ^<div^>Upgrade Prompt Component^</div^>;
echo };
echo.
echo export default UpgradePrompt;
) > "components\Common\UpgradePrompt.jsx"

REM SystemStatus
(
echo import React from 'react';
echo.
echo const SystemStatus = ^(^) =^> {
echo   // TODO: Implement system status monitoring
echo   return ^<div^>System Status Component^</div^>;
echo };
echo.
echo export default SystemStatus;
) > "components\Common\SystemStatus.jsx"

echo   ✅ Common components created!

echo.
echo ✅ Creating Layout Components...

(
echo // TODO: Move your existing MainLayout component here
echo import React from 'react';
echo import ErrorBoundary from '../Common/ErrorBoundary';
echo.
echo const MainLayout = ^({ children }^) =^> {
echo   return ^(
echo     ^<ErrorBoundary^>
echo       ^<div^>Main Layout Component^</div^>
echo       {children}
echo     ^</ErrorBoundary^>
echo   ^);
echo };
echo.
echo export default MainLayout;
) > "components\Layout\MainLayout.jsx"

(
echo // TODO: Move your existing Header component here
echo export const Header = ^(^) =^> ^<div^>Header Component^</div^>;
) > "components\Layout\Header.jsx"

(
echo // TODO: Move your existing Sidebar component here
echo export const Sidebar = ^(^) =^> ^<div^>Sidebar Component^</div^>;
) > "components\Layout\Sidebar.jsx"

(
echo // TODO: Move your existing Footer component here
echo export const Footer = ^(^) =^> ^<div^>Footer Component^</div^>;
) > "components\Layout\Footer.jsx"

echo   ✅ Layout components created!

echo.
echo ✅ Creating Main App Files...

(
echo // TODO: Move your existing App.jsx here
echo // Add WebSocketProvider wrapper and ErrorBoundary
echo import React from 'react';
echo import { BrowserRouter } from 'react-router-dom';
echo import ErrorBoundary from './components/Common/ErrorBoundary';
echo.
echo function App^(^) {
echo   return ^(
echo     ^<ErrorBoundary^>
echo       ^<BrowserRouter^>
echo         ^<div^>App Component - TODO: Add your providers here^</div^>
echo       ^</BrowserRouter^>
echo     ^</ErrorBoundary^>
echo   ^);
echo }
echo.
echo export default App;
) > "App.jsx"

(
echo // TODO: Move your existing main.jsx here
echo import React from 'react';
echo import ReactDOM from 'react-dom/client';
echo import App from './App.jsx';
echo import './index.css';
echo.
echo ReactDOM.createRoot^(document.getElementById^('root'^)^).render^(
echo   ^<React.StrictMode^>
echo     ^<App /^>
echo   ^</React.StrictMode^>
echo ^);
) > "main.jsx"

(
echo /* TODO: Move your existing index.css here */
echo @tailwind base;
echo @tailwind components;
echo @tailwind utilities;
echo.
echo /* Add your existing global styles */
) > "index.css"

echo   ✅ Main app files created!

echo.
echo ✅ Creating Routes...

(
echo // TODO: Move your existing AppRoutes here
echo import React from 'react';
echo import { Routes, Route } from 'react-router-dom';
echo import ErrorBoundary from '../components/Common/ErrorBoundary';
echo.
echo const AppRoutes = ^(^) =^> {
echo   return ^(
echo     ^<ErrorBoundary^>
echo       ^<Routes^>
echo         ^<Route path="/" element={^<div^>Home^</div^>} /^>
echo       ^</Routes^>
echo     ^</ErrorBoundary^>
echo   ^);
echo };
echo.
echo export default AppRoutes;
) > "routes\AppRoutes.jsx"

echo   ✅ Routes created!

REM Change back to root directory
cd ..

echo.
echo ✅ Creating helper files...

REM Create quick start guide
(
echo # QUICK START GUIDE - Frontend Streamlining
echo.
echo ## 🚀 What was created:
echo - ✅ src_new/ folder with complete structure
echo - ✅ 20+ directories organized by feature
echo - ✅ 30+ placeholder files with TODO comments
echo - ✅ API service layer ready for implementation
echo - ✅ Modern React architecture
echo.
echo ## 🔴 CRITICAL - Do these FIRST:
echo.
echo ### 1. Complete the API Client
echo Edit: src_new/services/api/apiClient.js
echo - Add request method implementation
echo - Add error handling and timeout logic
echo.
echo ### 2. Move your Supabase files
echo Copy: src/services/supabase/* to src_new/services/supabase/
echo.
echo ### 3. Update and move core hooks
echo Move and update these files to use new API services:
echo - src/hooks/useEmailGenerator.js
echo - src/hooks/useAssetGeneration.js  
echo - src/hooks/useContentLibrary.js
echo.
echo ### 4. Move main app files
echo - src/App.jsx to src_new/App.jsx
echo - src/main.jsx to src_new/main.jsx
echo - src/index.css to src_new/index.css
echo.
echo ### 5. Test that the app starts
echo npm run dev
echo.
echo ## 📁 When everything works:
echo 1. Rename src to src_old
echo 2. Rename src_new to src
echo 3. Test everything works
echo 4. Delete src_old when confident
echo.
echo ## 📦 Install these dependencies:
echo npm install ws reconnecting-websocket react-error-boundary
echo.
echo ## 🌐 Add to your .env file:
echo VITE_WS_URL=wss://aiworkers.onrender.com/ws
echo VITE_ENABLE_WEBSOCKET=true
echo.
echo Good luck! 🎉
) > "QUICK_START.md"

REM Create simple file list
(
echo # Created Files List
echo.
echo ## API Services:
echo src_new/services/api/apiClient.js
echo src_new/services/api/videoApi.js
echo src_new/services/api/emailApi.js
echo src_new/services/api/usageApi.js
echo src_new/services/api/contentLibraryApi.js
echo src_new/services/api/index.js
echo.
echo ## Hooks:
echo src_new/hooks/useEmailGenerator.js
echo src_new/hooks/useAssetGeneration.js
echo src_new/hooks/useContentLibrary.js
echo src_new/hooks/useUsageTracking.js
echo src_new/hooks/useErrorHandler.js
echo src_new/hooks/useApiQuery.js
echo src_new/hooks/useWebSocket.js
echo.
echo ## Components:
echo src_new/components/Common/ErrorBoundary.jsx
echo src_new/components/Common/UsageMeter.jsx
echo src_new/components/Common/UpgradePrompt.jsx
echo src_new/components/Common/SystemStatus.jsx
echo src_new/components/Layout/MainLayout.jsx
echo src_new/components/Layout/Header.jsx
echo src_new/components/Layout/Sidebar.jsx
echo src_new/components/Layout/Footer.jsx
echo.
echo ## Main App:
echo src_new/App.jsx
echo src_new/main.jsx
echo src_new/index.css
echo src_new/routes/AppRoutes.jsx
echo.
echo **Total: 25+ key files created**
) > "FILES_CREATED.md"

echo.
echo ========================================
echo ✅ CLEAN FRONTEND STRUCTURE CREATED!
echo ========================================
echo.
echo 📁 **LOCATION:** src_new/ folder
echo 📄 **FILES:** 25+ key files with proper structure
echo 📋 **GUIDES:** QUICK_START.md and FILES_CREATED.md
echo.
echo ## 🔴 **CRITICAL NEXT STEPS:**
echo.
echo 1. 📝 **Complete API Client:** Edit src_new/services/api/apiClient.js
echo 2. 📁 **Move Supabase files:** Copy src/services/supabase/* to src_new/services/supabase/
echo 3. 🔄 **Update hooks:** Move and update your existing hooks to use new API services
echo 4. 📱 **Move main files:** App.jsx, main.jsx, index.css
echo 5. 🧪 **Test:** Run npm run dev to verify it works
echo.
echo ## 📖 **READ:** QUICK_START.md for detailed instructions
echo.
echo **The structure is now clean and ready for implementation!** 🎉
echo.
pause