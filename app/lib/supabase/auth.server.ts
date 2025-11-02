import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createServerSupabaseClientForRequest } from '~/lib/supabase/client';

export interface SupabaseAuthContext {
  supabase: SupabaseClient;
  user: User;
  accessToken: string;
}

export function extractAccessToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  return null;
}

export async function requireSupabaseUser(request: Request): Promise<SupabaseAuthContext> {
  const accessToken = extractAccessToken(request);

  if (!accessToken) {
    throw new Response('Unauthorized', { status: 401 });
  }

  // Create client with Authorization header first
  let supabase = createServerSupabaseClientForRequest(request);
  
  // Validate the token first
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data?.user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  // For Supabase RPC calls, the Authorization header should be sufficient.
  // Optionally, if a refresh token is available in cookies, we can set the
  // session more formally, but it's not critical for this flow.
  try {
    const cookieHeader = request.headers.get('Cookie');
    let refreshToken: string | undefined;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {} as Record<string, string>);
      
      refreshToken = cookies['sb-refresh-token'] || cookies['sb-access-token'] || cookies['supabase-auth-token'];
    }

    // Try to set session if we have a valid refresh token
    if (refreshToken && refreshToken !== accessToken && refreshToken.length > 50) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  } catch (sessionError) {
    // Non-critical error, continue with the Authorization header.
    console.warn('Error attempting to set session (non-critical):', sessionError);
  }

  return {
    supabase,
    user: data.user,
    accessToken,
  };
}
