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

export function createServerSupabaseClient(supabaseUrl?: string, supabaseAnonKey?: string) {
  const config = getSupabaseConfig();
  const url = supabaseUrl || config.supabaseUrl;
  const key = supabaseAnonKey || config.supabaseAnonKey;

  if (!url || !key) {
    throw new Error(
      'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.',
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createServerSupabaseClientForRequest(
  request: Request,
  options?: { supabaseUrl?: string; supabaseAnonKey?: string },
) {
  const config = getSupabaseConfig();
  const url = options?.supabaseUrl || config.supabaseUrl;
  const key = options?.supabaseAnonKey || config.supabaseAnonKey;

  if (!url || !key) {
    throw new Error(
      'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.',
    );
  }

  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.replace(/Bearer\s+/i, '').trim();

  const globalHeaders: Record<string, string> = {};

  if (accessToken) {
    globalHeaders.Authorization = `Bearer ${accessToken}`;
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
