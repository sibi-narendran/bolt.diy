import { useEffect } from 'react';
import { useSupabaseConnection } from '~/lib/hooks/useSupabaseConnection';
import { fetchProjectApiKeys } from '~/lib/stores/supabase';

export function SupabaseConnection() {
  const { connection, fetchingApiKeys, isConnected } = useSupabaseConnection();

  useEffect(() => {
    if (isConnected && connection.project?.id && !connection.credentials && !fetchingApiKeys) {
      fetchProjectApiKeys(connection.project.id).catch((error) => {
        console.error('Failed to hydrate Supabase credentials:', error);
      });
    }
  }, [isConnected, connection.project?.id, connection.credentials, fetchingApiKeys]);

  return null;
}
