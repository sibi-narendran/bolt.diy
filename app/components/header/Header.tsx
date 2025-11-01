import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { HeaderAuth } from './HeaderAuth.client';
import { HeaderPlanBadge } from './HeaderPlanBadge.client';
import { useSidebar } from '~/lib/hooks';

export function Header() {
  const chat = useStore(chatStore);
  const { toggleSidebar } = useSidebar();

  return (
    <header
      className={classNames('flex items-center gap-3 px-3 sm:px-4 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 text-bolt-elements-textPrimary">
        <button
          type="button"
          onClick={toggleSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary transition-theme hover:bg-bolt-elements-background-depth-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 lg:hidden"
          aria-label="Open sidebar"
        >
          <div className="i-ph:list text-lg" />
        </button>
        <a href="/" className="flex items-center gap-2 text-accent">
          <span className="text-lg font-semibold">Appzap</span>
        </a>
      </div>
      {chat.started ? (
        <span className="hidden flex-1 px-2 sm:px-4 truncate text-center text-sm sm:text-base text-bolt-elements-textPrimary md:block">
          <ClientOnly>{() => <ChatDescription />}</ClientOnly>
        </span>
      ) : (
        <div className="flex-1" />
      )}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {chat.started && (
          <ClientOnly>
            {() => (
              <div className="hidden md:flex">
                <HeaderActionButtons chatStarted={chat.started} />
              </div>
            )}
          </ClientOnly>
        )}
        <ClientOnly>
          {() => (
            <div className="flex items-center gap-2">
              <HeaderPlanBadge />
              <HeaderAuth />
            </div>
          )}
        </ClientOnly>
      </div>
    </header>
  );
}
