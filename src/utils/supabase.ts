import { createClient } from '@supabase/supabase-js';
import { server$ } from '@builder.io/qwik-city';

export const createSupabaseClient = server$(() => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL and key must be defined in environment variables');
    throw new Error('Missing Supabase configuration. Please check your environment variables.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Ensure the auth module is initialized
  if (!supabase.auth) {
    throw new Error('Supabase client auth module not initialized');
  }

  return supabase;
});