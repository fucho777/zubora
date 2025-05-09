import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Validate Supabase configuration
if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL. Please ensure it is properly set in your ' +
    'environment variables (.env file).'
  );
}

try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    'Invalid VITE_SUPABASE_URL. Please ensure it is a valid URL starting with ' +
    'http:// or https:// and is properly set in your environment variables.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY. Please ensure it is properly set in your ' +
    'environment variables (.env file).'
  );
}

if (supabaseAnonKey.length < 20) {
  throw new Error(
    'Invalid VITE_SUPABASE_ANON_KEY. The provided key appears to be invalid. ' +
    'Please check your environment variables.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);