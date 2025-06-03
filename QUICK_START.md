# QUICK START GUIDE - Frontend Streamlining

## 🚀 What was created:
- ✅ src_new/ folder with complete structure
- ✅ 20+ directories organized by feature
- ✅ 30+ placeholder files with TODO comments
- ✅ API service layer ready for implementation
- ✅ Modern React architecture

## 🔴 CRITICAL - Do these FIRST:

### 1. Complete the API Client
Edit: src_new/services/api/apiClient.js
- Add request method implementation
- Add error handling and timeout logic

### 2. Move your Supabase files
Copy: src/services/supabase/* to src_new/services/supabase/

### 3. Update and move core hooks
Move and update these files to use new API services:
- src/hooks/useEmailGenerator.js
- src/hooks/useAssetGeneration.js  
- src/hooks/useContentLibrary.js

### 4. Move main app files
- src/App.jsx to src_new/App.jsx
- src/main.jsx to src_new/main.jsx
- src/index.css to src_new/index.css

### 5. Test that the app starts
npm run dev

## 📁 When everything works:
1. Rename src to src_old
2. Rename src_new to src
3. Test everything works
4. Delete src_old when confident

## 📦 Install these dependencies:
npm install ws reconnecting-websocket react-error-boundary

## 🌐 Add to your .env file:
VITE_WS_URL=wss://aiworkers.onrender.com/ws
VITE_ENABLE_WEBSOCKET=true

Good luck! 🎉
