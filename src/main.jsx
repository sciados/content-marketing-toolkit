// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Clear any existing auth tokens on app start
if (window.localStorage) {
  // Clear Supabase auth tokens
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-')) {
      console.log("Clearing Supabase token:", key);
      localStorage.removeItem(key);
    }
  });
  console.log("Cleared any existing auth tokens");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
