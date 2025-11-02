import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { z } from 'zod';
import { withSecurity } from '~/lib/security';
import { createServerSupabaseClient } from '~/lib/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

async function loginAction({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const supabase = createServerSupabaseClient(context.cloudflare.env);
    const url = new URL(request.url);

    const { error } = await supabase.auth.signInWithOtp({
      email: validatedData.email,
      options: {
        emailRedirectTo: `${url.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Supabase login error:', error);
      const errorMessage =
        error.message.includes('rate limit') || error.message.includes('too many')
          ? 'Too many requests. Please try again later.'
          : 'Failed to send magic link. Please try again.';

      return json({ error: errorMessage }, { status: 400 });
    }

    return json(
      {
        success: true,
        message: 'Check your email for the magic link',
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json(
        {
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    console.error('Unexpected login error:', error);
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export const action = withSecurity(loginAction, {
  rateLimit: true,
  allowedMethods: ['POST'],
});
