import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { withSecurity } from '~/lib/security';
import { createServerSupabaseClient } from '~/lib/supabase/client';

async function logoutAction({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Silent fail - client will clear local state
  }

  return json({ success: true }, { status: 200 });
}

export const action = withSecurity(logoutAction, {
  rateLimit: true,
  allowedMethods: ['POST'],
});
