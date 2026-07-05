import { createClient } from '@supabase/supabase-js';
import { fetchWithRetry } from '@/lib/supabase/fetch-retry';

function assertServerOnly() {
  if (typeof window !== 'undefined') {
    throw new Error('This Supabase helper is server-only and must not be imported by Client Components.');
  }
}

function readPublicSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return { supabaseUrl, supabaseAnonKey };
}

function readServiceRoleSupabaseEnv() {
  const { supabaseUrl } = readPublicSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY.');
  }

  return { supabaseUrl, serviceRoleKey };
}

export function createServerSupabaseClient() {
  assertServerOnly();

  const { supabaseUrl, supabaseAnonKey } = readPublicSupabaseEnv();

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: fetchWithRetry },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createServiceRoleSupabaseClient() {
  assertServerOnly();

  const { supabaseUrl, serviceRoleKey } = readServiceRoleSupabaseEnv();

  return createClient(supabaseUrl, serviceRoleKey, {
    global: { fetch: fetchWithRetry },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
