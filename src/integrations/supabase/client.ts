// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://obaciqwsgwfbbnphgqyk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iYWNpcXdzZ3dmYmJucGhncXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NDk2NzAsImV4cCI6MjA1MTQyNTY3MH0.q8TrbE7amxquXbr8GdJhQxw6MKGk3fGAoLEgPKxZBDo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);