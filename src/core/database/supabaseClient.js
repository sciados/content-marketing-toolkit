// src/services/supabase/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

console.log('🔧 supabaseClient.js: Loading...');

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
  console.error('Available env vars:', Object.keys(import.meta.env));
  throw new Error('Supabase URL is required. Please check your environment variables.');
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
  console.error('Available env vars:', Object.keys(import.meta.env));
  throw new Error('Supabase anon key is required. Please check your environment variables.');
}

// Log for debugging (you can remove this later)
console.log('Environment:', import.meta.env.MODE);
console.log('Custom App Env:', import.meta.env.VITE_APP_ENV);
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence
    autoRefreshToken: true // Automatically refresh token
  }
});

// Export a custom interface for database operations
export const supabaseDatabase = {
  /**
   * Get a reference to a table
   * @param {string} table - The table name
   * @returns {Object} - Supabase query builder
   */
  table: (table) => supabase.from(table),
  
  /**
   * Execute a raw SQL query (use with caution)
   * @param {string} query - The SQL query to execute
   * @param {Array} params - Query parameters
   * @returns {Promise} - Query result
   */
  query: (query, params) => supabase.rpc('execute_sql', { query, params }),
  
  /**
   * Check if the database connection is healthy
   * @returns {Promise<boolean>} - True if connection is healthy
   */
  healthCheck: async () => {
    try {
      const { error } = await supabase.from('email_series').select('id').limit(1);
      return !error;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
};

export default supabase;
