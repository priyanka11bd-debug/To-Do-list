import { createClient, SupabaseClient } from '@supabase/supabase-js';

function isValidSupabaseUrl(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('MY_')) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function isValidAnonKey(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.startsWith('MY_');
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  isValidSupabaseUrl(supabaseUrl) && isValidAnonKey(supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl.trim(), supabaseAnonKey.trim())
  : null;
