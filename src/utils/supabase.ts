import { createClient } from '@supabase/supabase-js';
import { server$ } from '@builder.io/qwik-city';

export const createSupabaseClient = server$(() => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration. Please check your environment variables.');
  }

  return createClient(supabaseUrl, supabaseKey);
});