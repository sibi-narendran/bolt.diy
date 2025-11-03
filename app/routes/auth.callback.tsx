import { json, type MetaFunction } from '@remix-run/cloudflare';
import { useNavigate } from '@remix-run/react';
import { useEffect } from 'react';
import { getSupabaseClient } from '~/lib/supabase/client';
import { setAuthUser } from '~/lib/stores/auth';
import { ClientOnly } from 'remix-utils/client-only';

export const meta: MetaFunction = () => {
  return [{ title: 'Authenticating - Appzap' }];
};

export const loader = () => json({});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const supabase = getSupabaseClient();

        /*
         * Supabase automatically handles session from URL hash
         * Wait for the session to be properly set
         * This will extract tokens from both URL hash and localStorage
         */
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session || !data.session.user) {
          navigate('/login?error=auth_failed');
          return;
        }

        // Ensure session is fully initialized
        if (!data.session.access_token) {
          navigate('/login?error=auth_failed');
          return;
        }

        // Set the auth user in the store
        setAuthUser(data.session.user, data.session);

        /*
         * Wait for session to be fully persisted and initialized
         * This ensures components that depend on auth state are ready
         */
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Clean up URL hash if present
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        navigate('/');
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=auth_failed');
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen w-full bg-appzap-elements-background-depth-1 items-center justify-center">
      <div className="text-center space-y-4">
        <div className="i-ph:spinner animate-spin text-4xl text-accent mx-auto" />
        <p className="text-appzap-elements-textPrimary">Authenticating...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <ClientOnly fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      {() => <AuthCallback />}
    </ClientOnly>
  );
}
