import { useCallback, useEffect, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import {
  supabaseConnection,
  isConnecting,
  isFetchingStats,
  isFetchingApiKeys,
  refreshSupabaseConnection,
  fetchProjectApiKeys,
  updateSupabaseConnection,
} from '~/lib/stores/supabase';

export function useSupabaseConnection() {
  const connection = useStore(supabaseConnection);
  const connecting = useStore(isConnecting);
  const fetchingStats = useStore(isFetchingStats);
  const fetchingApiKeys = useStore(isFetchingApiKeys);

  useEffect(() => {
    if (!connection.lastSyncedAt && !fetchingStats) {
      refreshSupabaseConnection().catch((error) => {
        console.error('Failed to initialize Supabase connection:', error);
      });
    }
  }, [connection.lastSyncedAt, fetchingStats]);

  const refresh = useCallback(async () => {
    await refreshSupabaseConnection();
  }, []);

  const selectProject = useCallback(async (projectId: string) => {
    updateSupabaseConnection({ selectedProjectId: projectId });

    if (projectId) {
      await fetchProjectApiKeys(projectId);
    }
  }, []);

  const isConnected = useMemo(() => connection.isConnected && !!connection.project, [connection]);

  return {
    connection,
    connecting,
    fetchingStats,
    fetchingApiKeys,
    refresh,
    selectProject,
    isConnected,
  };
}
