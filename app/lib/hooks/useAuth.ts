import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { useNavigate } from '@remix-run/react';
import { authStore, initializeAuth, clearAuth, setAuthUser } from '~/lib/stores/auth';
import { getSupabaseClient } from '~/lib/supabase/client';

export function useAuth() {
  const auth = useStore(authStore);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    initializeAuth();

    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        clearAuth();
      } else if (event === 'SIGNED_IN' && session?.user) {
        setAuthUser(session.user, session);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setAuthUser(session.user, session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });

      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // Silent fail - clear local state anyway
    } finally {
      clearAuth();
      navigate('/');
    }
  };

  return {
    ...auth,
    logout,
  };
}
