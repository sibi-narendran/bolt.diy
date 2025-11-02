import { createClient } from '@supabase/supabase-js';

export function getSupabaseConfig() {
  const supabaseUrl =
    typeof window !== 'undefined'
      ? (window as any).ENV?.VITE_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL
      : process.env.VITE_SUPABASE_URL;

  const supabaseAnonKey =
    typeof window !== 'undefined'
      ? (window as any).ENV?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY
      : process.env.VITE_SUPABASE_ANON_KEY;

  if (typeof window === 'undefined') {
    console.log('[PROD_DEBUG] Server-side Supabase URL:', supabaseUrl);
    console.log('[PROD_DEBUG] Server-side Supabase Anon Key:', !!supabaseAnonKey);

    const allSupabaseKeys = Object.keys(process.env).filter((key) => key.includes('SUPABASE'));
    console.log('[PROD_DEBUG] Available Supabase ENV Keys:', allSupabaseKeys);
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function createSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.',
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
}

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error(
      'getSupabaseClient can only be called on the client side. Use createServerSupabaseClient in API routes.',
    );
  }

  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }

  return supabaseClient;
}

export function createServerSupabaseClient(env: any) {
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.',
    );
  }

  // On the server, use the service role key for elevated privileges.
  return createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createServerSupabaseClientForRequest(
  request: Request,
  env?: any,
  options?: { supabaseUrl?: string; supabaseAnonKey?: string },
) {
  const config = getSupabaseConfig();
  const url =
    options?.supabaseUrl || env?.VITE_SUPABASE_URL || config.supabaseUrl;
  const key =
    options?.supabaseAnonKey || env?.VITE_SUPABASE_ANON_KEY || config.supabaseAnonKey;

  if (!url || !key) {
    throw new Error(
      'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.',
    );
  }

  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.replace(/Bearer\s+/i, '').trim();

  const globalHeaders: Record<string, string> = {};

  if (accessToken) {
    /*
     * Set Authorization header for all requests including RPC calls
     * This is critical for RPC functions with security definer that use auth.uid()
     */
    globalHeaders.Authorization = `Bearer ${accessToken}`;

    // Also set the apikey header which Supabase might need
    globalHeaders.apikey = key;
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: globalHeaders,
    },
  });
}
