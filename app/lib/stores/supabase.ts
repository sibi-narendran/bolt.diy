import { atom } from 'nanostores';
import type { SupabaseUser, SupabaseStats, SupabaseCredentials, SupabaseProject } from '~/types/supabase';

export interface SupabaseConnectionState {
  user: SupabaseUser | null;
  stats?: SupabaseStats;
  selectedProjectId?: string;
  project?: SupabaseProject;
  credentials?: SupabaseCredentials;
  isConnected: boolean;
  isServerManaged: boolean;
  error?: string;
  lastSyncedAt?: number;
}

const initialState: SupabaseConnectionState = {
  user: null,
  stats: undefined,
  selectedProjectId: undefined,
  project: undefined,
  credentials: undefined,
  isConnected: false,
  isServerManaged: false,
  error: undefined,
  lastSyncedAt: undefined,
};

export const supabaseConnection = atom<SupabaseConnectionState>(initialState);

export const isConnecting = atom(false);
export const isFetchingStats = atom(false);
export const isFetchingApiKeys = atom(false);

function resolveProjectFromStats(
  stats: SupabaseStats | undefined,
  selectedProjectId?: string,
): SupabaseProject | undefined {
  if (!stats?.projects?.length) {
    return undefined;
  }

  if (selectedProjectId) {
    const project = stats.projects.find((p) => p.id === selectedProjectId);

    if (project) {
      return project;
    }
  }

  return stats.projects[0];
}

export function updateSupabaseConnection(patch: Partial<SupabaseConnectionState>) {
  const current = supabaseConnection.get();
  const next: SupabaseConnectionState = {
    ...current,
    ...patch,
  };

  if (patch.stats || patch.selectedProjectId !== undefined) {
    const stats = patch.stats ?? current.stats;
    const selectedProjectId =
      patch.selectedProjectId !== undefined
        ? patch.selectedProjectId || undefined
        : current.selectedProjectId || patch.stats?.projects?.[0]?.id;

    next.stats = stats;
    next.selectedProjectId = selectedProjectId;
    next.project = resolveProjectFromStats(stats, selectedProjectId);
  }

  if (patch.credentials !== undefined) {
    next.credentials = patch.credentials;
  }

  if (patch.error !== undefined) {
    next.error = patch.error;
  }

  if (patch.user !== undefined) {
    next.user = patch.user;
  }

  if (patch.isServerManaged !== undefined) {
    next.isServerManaged = patch.isServerManaged;
  }

  next.isConnected = !!next.project;

  if (!next.isConnected) {
    next.credentials = undefined;
  }

  supabaseConnection.set(next);
}

async function requestSupabaseStats() {
  isFetchingStats.set(true);

  try {
    const response = await fetch('/api/supabase', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(errorData.error || `Failed to fetch Supabase projects (${response.status})`);
    }

    const data = (await response.json()) as {
      user?: SupabaseUser | null;
      stats?: SupabaseStats;
      defaultProjectId?: string | null;
      isServerManaged?: boolean;
    };

    updateSupabaseConnection({
      user: data.user ?? null,
      stats: data.stats,
      selectedProjectId: data.defaultProjectId ?? data.stats?.projects?.[0]?.id,
      isServerManaged: data.isServerManaged ?? true,
      error: undefined,
      lastSyncedAt: Date.now(),
    });

    return data;
  } finally {
    isFetchingStats.set(false);
  }
}

export async function refreshSupabaseConnection() {
  try {
    const data = await requestSupabaseStats();
    const projectId = data.defaultProjectId ?? data.stats?.projects?.[0]?.id;

    if (projectId) {
      await fetchProjectApiKeys(projectId);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to refresh Supabase connection';
    updateSupabaseConnection({
      user: null,
      stats: undefined,
      selectedProjectId: undefined,
      project: undefined,
      credentials: undefined,
      isServerManaged: false,
      error: message,
      lastSyncedAt: Date.now(),
    });

    throw error;
  }
}

export async function initializeSupabaseConnection() {
  return refreshSupabaseConnection();
}

export async function fetchSupabaseStats() {
  return refreshSupabaseConnection();
}

export async function fetchProjectApiKeys(projectId: string) {
  isFetchingApiKeys.set(true);

  try {
    const response = await fetch(`/api/supabase/variables?projectId=${encodeURIComponent(projectId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(errorData.error || `Failed to fetch Supabase credentials (${response.status})`);
    }

    const data = (await response.json()) as {
      apiKeys: Array<{ name: string; api_key: string }>;
      projectId: string;
    };

    const anonKey = data.apiKeys.find((key) => key.name === 'anon' || key.name === 'public');

    if (anonKey) {
      const supabaseUrl = `https://${data.projectId}.supabase.co`;

      updateSupabaseConnection({
        selectedProjectId: data.projectId,
        credentials: {
          anonKey: anonKey.api_key,
          supabaseUrl,
        },
      });
    }

    return data;
  } finally {
    isFetchingApiKeys.set(false);
  }
}
