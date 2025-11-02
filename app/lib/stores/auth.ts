import { atom, onMount } from 'nanostores';
import type { User, Session } from '@supabase/supabase-js';
import { refreshUserPlan } from './userPlan'; // Import the refresh function

export interface AuthUser {
  id: string;
  email: string;
  createdAt?: string;
  lastSignInAt?: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
};

export const authStore = atom<AuthState>(initialState);

onMount(authStore, () => {
  initializeAuth();
});

export async function initializeAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const { getSupabaseClient } = await import('~/lib/supabase/client');
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.getSession();

    if (!error && data.session?.user) {
      updateAuthState({
        user: {
          id: data.session.user.id,
          email: data.session.user.email || '',
          createdAt: data.session.user.created_at,
          lastSignInAt: data.session.user.last_sign_in_at,
        },
        session: data.session,
        isLoading: false,
        isAuthenticated: true,
      });
      refreshUserPlan(data.session.access_token); // Refresh plan on auth initialization
    } else {
      updateAuthState({
        ...initialState,
        isLoading: false,
      });
    }
  } catch {
    updateAuthState({
      ...initialState,
      isLoading: false,
    });
  }
}

export function updateAuthState(updates: Partial<AuthState>) {
  const currentState = authStore.get();
  const newState = { ...currentState, ...updates };
  authStore.set(newState);

  // When auth state changes, also trigger a refresh of the user plan
  if (newState.isAuthenticated && newState.session) {
    refreshUserPlan(newState.session.access_token);
  } else {
    refreshUserPlan(null);
  }

  /*
   * Supabase client automatically persists sessions via localStorage
   * No need to manually store - Supabase handles it
   */
}

export function setAuthUser(user: User, session: Session) {
  updateAuthState({
    user: {
      id: user.id,
      email: user.email || '',
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
    },
    session,
    isLoading: false,
    isAuthenticated: true,
  });
}

export function clearAuth() {
  updateAuthState({
    user: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
  });
}
