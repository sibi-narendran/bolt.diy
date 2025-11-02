import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

export const loader = async ({ context }: LoaderFunctionArgs) => {
  // In Cloudflare, environment variables are on context.cloudflare.env
  const env = context.cloudflare.env;

  const variables = {
    VITE_SUPABASE_URL: !!env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: !!env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: !!env.DATABASE_URL,
  };

  return json(variables);
};
