import { AnimatePresence, motion } from 'framer-motion';
import type { SupabaseAlert } from '~/types/actions';
import { classNames } from '~/utils/classNames';
import { supabaseConnection } from '~/lib/stores/supabase';
import { useStore } from '@nanostores/react';
import { useState } from 'react';

interface Props {
  alert: SupabaseAlert;
  clearAlert: () => void;
  postMessage: (message: string) => void;
}

export function SupabaseChatAlert({ alert, clearAlert, postMessage }: Props) {
  const { content } = alert;
  const connection = useStore(supabaseConnection);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Determine connection state
  const isConnected = !!(connection.project?.id && connection.credentials?.anonKey);

  // Set title and description based on connection state
  const title = isConnected ? 'Supabase Query' : 'Supabase Connection Required';
  const description = isConnected ? 'Execute database query' : 'Supabase connection required';
  const message = isConnected
    ? 'Please review the proposed changes and apply them to your database.'
    : 'Supabase integration is unavailable right now. Please try again later or contact support.';

  const executeSupabaseAction = async (sql: string) => {
    if (!connection.project?.id) {
      console.error('No Supabase project available for execution');
      return;
    }

    setIsExecuting(true);

    try {
      const response = await fetch('/api/supabase/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: connection.project.id,
          query: sql,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as any;
        throw new Error(`Supabase query failed: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('Supabase query executed successfully:', result);
      clearAlert();
    } catch (error) {
      console.error('Failed to execute Supabase action:', error);
      postMessage(
        `*Error executing Supabase query please fix and return the query again*\n\`\`\`\n${error instanceof Error ? error.message : String(error)}\n\`\`\`\n`,
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const cleanSqlContent = (content: string) => {
    if (!content) {
      return '';
    }

    let cleaned = content.replace(/\/\*[\s\S]*?\*\//g, '');

    cleaned = cleaned.replace(/(--).*$/gm, '').replace(/(#).*$/gm, '');

    const statements = cleaned
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)
      .join(';\n\n');

    return statements;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="max-w-chat rounded-lg border-l-2 border-l-[#098F5F] border border-appza-elements-borderColor bg-appza-elements-background-depth-2"
      >
        {/* Header */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <img height="10" width="18" crossOrigin="anonymous" src="https://cdn.simpleicons.org/supabase" />
            <h3 className="text-sm font-medium text-[#3DCB8F]">{title}</h3>
          </div>
        </div>

        {/* SQL Content */}
        <div className="px-4">
          {!isConnected ? (
            <div className="p-3 rounded-md bg-appza-elements-background-depth-3">
              <span className="text-sm text-appza-elements-textPrimary">
                Supabase integration is currently unavailable. Our team has been notified.
              </span>
            </div>
          ) : (
            <>
              <div
                className="flex items-center p-2 rounded-md bg-appza-elements-background-depth-3 cursor-pointer"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <div className="i-ph:database text-appza-elements-textPrimary mr-2"></div>
                <span className="text-sm text-appza-elements-textPrimary flex-grow">
                  {description || 'Create table and setup auth'}
                </span>
                <div
                  className={`i-ph:caret-up text-appza-elements-textPrimary transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                ></div>
              </div>

              {!isCollapsed && content && (
                <div className="mt-2 p-3 bg-appza-elements-background-depth-4 rounded-md overflow-auto max-h-60 font-mono text-xs text-appza-elements-textSecondary">
                  <pre>{cleanSqlContent(content)}</pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Message and Actions */}
        <div className="p-4">
          <p className="text-sm text-appza-elements-textSecondary mb-4">{message}</p>

          <div className="flex gap-2">
            <button
              onClick={() => executeSupabaseAction(content)}
              disabled={!isConnected || isExecuting}
              className={classNames(
                `px-3 py-2 rounded-md text-sm font-medium`,
                'bg-[#098F5F]',
                'hover:bg-[#0aa06c]',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
                'text-white',
                'flex items-center gap-1.5',
                !isConnected || isExecuting ? 'opacity-70 cursor-not-allowed' : '',
              )}
            >
              {isExecuting ? 'Applying...' : 'Apply Changes'}
            </button>
            <button
              onClick={clearAlert}
              disabled={isExecuting}
              className={classNames(
                `px-3 py-2 rounded-md text-sm font-medium`,
                'bg-[#503B26]',
                'hover:bg-[#774f28]',
                'focus:outline-none',
                'text-[#F79007]',
                isExecuting ? 'opacity-70 cursor-not-allowed' : '',
              )}
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
