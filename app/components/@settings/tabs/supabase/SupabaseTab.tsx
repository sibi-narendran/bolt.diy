import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSupabaseConnection } from '~/lib/hooks/useSupabaseConnection';
import { classNames } from '~/utils/classNames';

export default function SupabaseTab() {
  const { connection, fetchingStats, fetchingApiKeys, refresh, selectProject } = useSupabaseConnection();

  const projects = connection.stats?.projects ?? [];
  const activeProject = connection.project;

  const activeMetrics = useMemo(() => {
    if (!activeProject?.stats) {
      return [];
    }

    const { stats } = activeProject;

    return [
      { label: 'Tables', value: stats.database?.tables ?? '--' },
      { label: 'Storage Buckets', value: stats.storage?.buckets ?? '--' },
      { label: 'Functions', value: stats.functions?.deployed ?? '--' },
      { label: 'Auth Users', value: stats.auth?.users ?? '--' },
    ];
  }, [activeProject]);

  return (
    <div className="space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-lg font-medium text-appzap-elements-textPrimary">Supabase Integration</h2>
          <p className="text-sm text-appzap-elements-textSecondary">
            Managed Supabase access for production tenants. Credentials remain server-side.
          </p>
        </div>
        <button
          onClick={() => refresh().catch(console.error)}
          className="px-3 py-1.5 rounded-md text-xs bg-[#F0F0F0] dark:bg-[#252525] text-appzap-elements-textSecondary hover:bg-[#E5E5E5] dark:hover:bg-[#333333] flex items-center gap-1"
        >
          <div className="i-ph:arrows-clockwise w-3 h-3" />
          Refresh
        </button>
      </motion.div>

      <motion.div
        className="rounded-lg border border-appzap-elements-borderColor bg-appzap-elements-background-depth-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-6 space-y-4">
          {!connection.isConnected ? (
            <div className="rounded-md border border-dashed border-appzap-elements-borderColor p-4 text-sm text-appzap-elements-textSecondary">
              <p className="font-medium text-appzap-elements-textPrimary">Supabase is not configured.</p>
              <p className="mt-2">
                Set the environment variables <code>SUPABASE_MANAGEMENT_TOKEN</code>,{' '}
                <code>SUPABASE_DEFAULT_PROJECT_ID</code>,<code>VITE_SUPABASE_URL</code>, and{' '}
                <code>VITE_SUPABASE_ANON_KEY</code> on the server to enable managed queries.
              </p>
              {connection.error ? (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">{connection.error}</p>
              ) : null}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 rounded-md border border-appzap-elements-borderColor bg-appzap-elements-background-depth-2 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-appzap-elements-textSecondary">Active Project</p>
                  <p className="text-sm font-semibold text-appzap-elements-textPrimary">{activeProject?.name}</p>
                  <p className="text-xs text-appzap-elements-textSecondary">
                    {activeProject?.region?.toUpperCase()} • {activeProject?.status?.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeProject?.id && (
                    <a
                      href={`https://supabase.com/dashboard/project/${activeProject.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md text-xs bg-[#3ECF8E] text-white hover:bg-[#3BBF84] flex items-center gap-1"
                    >
                      <div className="i-ph:arrow-square-out w-3 h-3" />
                      Open Dashboard
                    </a>
                  )}
                  <span className="text-xs text-appzap-elements-textSecondary">
                    Credentials stored server-side • client only receives anon access when required.
                  </span>
                </div>
              </div>

              {connection.credentials?.supabaseUrl && (
                <div className="rounded-md border border-appzap-elements-borderColor bg-appzap-elements-background-depth-2 p-4">
                  <p className="text-xs font-medium text-appzap-elements-textSecondary">Supabase URL</p>
                  <p className="mt-1 truncate text-sm text-appzap-elements-textPrimary">
                    {connection.credentials.supabaseUrl}
                  </p>
                  <p className="mt-3 text-xs font-medium text-appzap-elements-textSecondary">Anon Key</p>
                  <p className="text-xs text-appzap-elements-textSecondary">
                    Managed on the server and never exposed in this UI.
                  </p>
                </div>
              )}

              {activeMetrics.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {activeMetrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-md border border-appzap-elements-borderColor bg-appzap-elements-background-depth-2 p-3"
                    >
                      <p className="text-xs text-appzap-elements-textSecondary">{metric.label}</p>
                      <p className="text-lg font-semibold text-appzap-elements-textPrimary">{metric.value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-appzap-elements-textPrimary">Projects</p>
                  <p className="text-xs text-appzap-elements-textSecondary">
                    {fetchingStats ? 'Loading…' : `${projects.length} available`}
                  </p>
                </div>

                <div className="space-y-2">
                  {projects.length === 0 && !fetchingStats ? (
                    <p className="text-xs text-appzap-elements-textSecondary">No projects available for this token.</p>
                  ) : (
                    projects.map((project) => {
                      const isSelected = project.id === connection.selectedProjectId;

                      return (
                        <div
                          key={project.id}
                          className={classNames(
                            'rounded-md border px-3 py-2 text-xs transition-colors',
                            isSelected
                              ? 'border-[#3ECF8E] bg-[#3ECF8E0f] text-appzap-elements-textPrimary'
                              : 'border-appzap-elements-borderColor hover:border-[#3ECF8E] text-appzap-elements-textSecondary',
                          )}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-medium text-appzap-elements-textPrimary">{project.name}</p>
                              <p className="mt-1 text-[11px] text-appzap-elements-textSecondary">
                                {project.region?.toUpperCase()} • {new Date(project.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            {!isSelected && (
                              <button
                                onClick={() => selectProject(project.id)}
                                disabled={fetchingApiKeys}
                                className="rounded-md border border-appzap-elements-borderColor px-2 py-1 text-[11px] hover:border-[#3ECF8E] hover:text-[#3ECF8E] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Use project
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
