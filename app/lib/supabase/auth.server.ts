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

  const supabase = createServerSupabaseClientForRequest(request);
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data?.user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return {
    supabase,
    user: data.user,
    accessToken,
  };
}
