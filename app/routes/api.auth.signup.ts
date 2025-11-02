import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { z } from 'zod';
import { withSecurity } from '~/lib/security';
import { createServerSupabaseClient } from '~/lib/supabase/client';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
});

async function signupAction({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    const supabase = createServerSupabaseClient();
    const url = new URL(request.url);

    const { error } = await supabase.auth.signInWithOtp({
      email: validatedData.email,
      options: {
        emailRedirectTo: `${url.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      const messageLower = error.message.toLowerCase();
      let errorMessage = 'Failed to send magic link. Please try again.';

      if (messageLower.includes('rate limit') || messageLower.includes('too many')) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (messageLower.includes('redirect')) {
        errorMessage =
          'Supabase rejected the redirect URL. Add the callback URL to Auth → URL Configuration in your Supabase project settings.';
      } else if (messageLower.includes('smtp') || messageLower.includes('email provider')) {
        errorMessage =
          'Email delivery is not configured for this Supabase project. Configure an SMTP provider or disable email confirmations.';
      } else if (error.message.trim()) {
        errorMessage = error.message;
      }

      return json({ error: errorMessage }, { status: 400 });
    }

    console.info('Supabase magic-link signup triggered', {
      email: validatedData.email,
      redirectUrl: `${url.origin}/auth/callback`,
    });

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

    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export const action = withSecurity(signupAction, {
  rateLimit: true,
  allowedMethods: ['POST'],
});
