import { createClient } from '@supabase/supabase-js';

// These are public keys - safe to expose in frontend
// Get these from your Supabase project settings
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a dummy client if not configured to avoid errors
let supabase: any = null;

try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    // Create dummy client that won't be used
    supabase = createClient('https://dummy.supabase.co', 'dummy_key');
  }
} catch (err) {
  console.warn('Supabase initialization warning:', err);
}

export { supabase };

export const isSupabaseConfigured = () => {
  return SUPABASE_URL && SUPABASE_ANON_KEY;
};
