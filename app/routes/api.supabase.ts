import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { getApiKeysFromCookie } from '~/lib/api/cookies';
import type { SupabaseProject } from '~/types/supabase';

async function resolveManagementToken(request: Request, context: any) {
  const cookieHeader = request.headers.get('Cookie');
  const apiKeys = getApiKeysFromCookie(cookieHeader);

  return (
    apiKeys.SUPABASE_MANAGEMENT_TOKEN ||
    apiKeys.VITE_SUPABASE_ACCESS_TOKEN ||
    context?.cloudflare?.env?.SUPABASE_MANAGEMENT_TOKEN ||
    context?.cloudflare?.env?.VITE_SUPABASE_ACCESS_TOKEN ||
    process.env.SUPABASE_MANAGEMENT_TOKEN ||
    process.env.VITE_SUPABASE_ACCESS_TOKEN ||
    ''
  );
}

async function fetchSupabaseProjects(token: string) {
  const response = await fetch('https://api.supabase.com/v1/projects', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Projects fetch failed:', errorText);
    throw new Error(`Failed to fetch projects (${response.status})`);
  }

  const projects = (await response.json()) as SupabaseProject[];
  const uniqueProjectsMap = new Map<string, SupabaseProject>();

  for (const project of projects) {
    if (!uniqueProjectsMap.has(project.id)) {
      uniqueProjectsMap.set(project.id, project);
    }
  }

  const uniqueProjects = Array.from(uniqueProjectsMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return uniqueProjects;
}

async function buildResponse(request: Request, context: any) {
  const managementToken = await resolveManagementToken(request, context);

  if (!managementToken) {
    return json({ error: 'Supabase management token is not configured' }, { status: 503 });
  }

  try {
    const projects = await fetchSupabaseProjects(managementToken);

    return json({
      user: {
        email: 'supabase@system.local',
        role: 'Service Account',
      },
      stats: {
        projects,
        totalProjects: projects.length,
      },
      isServerManaged: true,
      defaultProjectId: projects[0]?.id ?? null,
    });
  } catch (error) {
    console.error('Supabase API error:', error);
    return json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch Supabase data',
      },
      { status: 502 },
    );
  }
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  return buildResponse(request, context);
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  return buildResponse(request, context);
}
