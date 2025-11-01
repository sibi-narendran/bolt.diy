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

        // Supabase automatically handles session from URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session || !data.session.user) {
          navigate('/login?error=auth_failed');
          return;
        }

        setAuthUser(data.session.user, data.session);
        navigate('/');
      } catch {
        navigate('/login?error=auth_failed');
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen w-full bg-bolt-elements-background-depth-1 items-center justify-center">
      <div className="text-center space-y-4">
        <div className="i-ph:spinner animate-spin text-4xl text-accent mx-auto" />
        <p className="text-bolt-elements-textPrimary">Authenticating...</p>
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
