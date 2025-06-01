// src/services/supabase/index.js
import { supabase } from './supabaseClient';
import { auth } from './auth';
import { db } from './db';
import { profiles } from './profiles';

/**
 * Supabase services barrel file
 * Exports all Supabase-related services
 */
export {
  supabase,
  auth,
  db,
  profiles
};
