import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { getApiKeysFromCookie } from '~/lib/api/cookies';

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

async function resolveProjectId(request: Request, body?: { projectId?: string }) {
  if (body?.projectId) {
    return body.projectId;
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId');

  if (projectId) {
    return projectId;
  }

  return process.env.SUPABASE_DEFAULT_PROJECT_ID || '';
}

async function fetchProjectKeys(projectId: string, token: string) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/api-keys`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch API keys (${response.status}): ${errorText}`);
  }

  const apiKeys = (await response.json()) as Array<{ name: string; api_key: string }>;

  // Only return non-sensitive keys to the client
  return apiKeys.filter((key) => key.name === 'anon' || key.name === 'public');
}

async function buildResponse(args: LoaderFunctionArgs | ActionFunctionArgs) {
  const { request, context } = args;
  const body = request.method === 'POST' ? ((await request.json()) as { projectId?: string }) : undefined;
  const managementToken = await resolveManagementToken(request, context);
  const projectId = await resolveProjectId(request, body);

  if (!managementToken) {
    return json({ error: 'Supabase management token is not configured' }, { status: 503 });
  }

  if (!projectId) {
    return json({ error: 'Supabase project ID is required' }, { status: 400 });
  }

  try {
    const apiKeys = await fetchProjectKeys(projectId, managementToken);
    return json({ apiKeys, projectId });
  } catch (error) {
    console.error('Error fetching project API keys:', error);
    return json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 502 },
    );
  }
}

export async function loader(args: LoaderFunctionArgs) {
  return buildResponse(args);
}

export async function action(args: ActionFunctionArgs) {
  return buildResponse(args);
}
