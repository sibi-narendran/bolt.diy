import { useCallback } from 'react';
import { useStore } from '@nanostores/react';

import { chatStore } from '~/lib/stores/chat';

export function useSidebar() {
  const { sidebarOpen } = useStore(chatStore);

  const openSidebar = useCallback(() => {
    chatStore.setKey('sidebarOpen', true);
  }, []);

  const closeSidebar = useCallback(() => {
    chatStore.setKey('sidebarOpen', false);
  }, []);

  const toggleSidebar = useCallback(() => {
    const current = chatStore.get().sidebarOpen;
    chatStore.setKey('sidebarOpen', !current);
  }, []);

  return { sidebarOpen, openSidebar, closeSidebar, toggleSidebar };
}
