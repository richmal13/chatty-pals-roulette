import { createClient } from '@supabase/supabase-js';

// @ts-ignore - секреты добавляются автоматически в window._env_
const supabaseUrl = window._env_?.SUPABASE_URL;
const supabaseKey = window._env_?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');