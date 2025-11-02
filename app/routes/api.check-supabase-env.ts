import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env as any;

  // Function to safely truncate a key for verification
  const getPartialKey = (key: string | undefined): string | null => {
    if (!key) return null;
    if (key.length < 16) return 'Invalid key (too short)';
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

  const variables = {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL ?? null,
    VITE_SUPABASE_ANON_KEY_PARTIAL: getPartialKey(env.VITE_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY_SET: !!env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL_SET: !!env.DATABASE_URL,
  };

  return json(variables);
};
