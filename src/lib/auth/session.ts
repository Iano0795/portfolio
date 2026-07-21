import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { fetchWithRetry } from '@/lib/supabase/fetch-retry';

export const ADMIN_ACCESS_TOKEN_COOKIE = 'ianos_admin_access_token';
export const ADMIN_REFRESH_TOKEN_COOKIE = 'ianos_admin_refresh_token';

const adminCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/admin',
};

function readPublicSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return { supabaseUrl, supabaseAnonKey };
}

export async function createAdminSupabaseClient(accessToken?: string): Promise<SupabaseClient> {
  const { supabaseUrl, supabaseAnonKey } = readPublicSupabaseEnv();

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: fetchWithRetry,
      ...(accessToken
        ? {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        : {}),
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return client;
}

export async function getAdminSessionTokens() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

function decodeJwtExpiryMs(token: string): number | null {
  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const { exp } = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as { exp?: number };

    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Epoch ms when the current admin access token expires, or null when there is no session. */
export async function getAdminSessionExpiresAt(): Promise<number | null> {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return null;
  }

  return decodeJwtExpiryMs(tokens.accessToken);
}

export async function setAdminSessionCookies(session: { access_token: string; refresh_token: string; expires_in?: number }) {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_ACCESS_TOKEN_COOKIE, session.access_token, {
    ...adminCookieOptions,
    maxAge: session.expires_in ?? 3600,
  });

  cookieStore.set(ADMIN_REFRESH_TOKEN_COOKIE, session.refresh_token, {
    ...adminCookieOptions,
    maxAge: 60 * 60 * 24 * 60,
  });
}

export async function clearAdminSessionCookies() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_ACCESS_TOKEN_COOKIE, '', {
    ...adminCookieOptions,
    maxAge: 0,
  });

  cookieStore.set(ADMIN_REFRESH_TOKEN_COOKIE, '', {
    ...adminCookieOptions,
    maxAge: 0,
  });
}
