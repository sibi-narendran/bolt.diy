import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { withSecurity } from '~/lib/security';
import { requireSupabaseUser } from '~/lib/supabase/auth.server';
import {
  ensureUserPlanExists,
  getRemainingCredits,
  UnauthorizedPlanAccessError,
  UserPlanServiceError,
} from '~/lib/services/userPlan.server';

async function userPlanLoader({ request }: LoaderFunctionArgs) {
  let authContext;

  try {
    authContext = await requireSupabaseUser(request);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    throw error;
  }

  try {
    const plan = await ensureUserPlanExists(authContext.supabase, authContext.user.id);

    return json({
      plan: {
        userId: plan.user_id,
        planTier: plan.plan_tier,
        monthlyCreditLimit: plan.monthly_credit_limit,
        creditsUsed: plan.credits_used,
        remainingCredits: getRemainingCredits(plan),
        resetAt: plan.reset_at,
        updatedAt: plan.updated_at,
      },
    });
  } catch (error) {
    // Log the full error object for detailed debugging in production
    console.error(
      '[PROD_DEBUG] Critical error in userPlanLoader:',
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );

    // Handle specific plan service errors
    if (error instanceof UnauthorizedPlanAccessError) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (error instanceof UserPlanServiceError) {
      // Log the error for debugging but return a generic message
      console.error('User plan service error:', error.message);
      return new Response(
        JSON.stringify({
          error: true,
          message: 'Failed to load user plan',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Re-throw other errors to be handled by withSecurity
    throw error;
  }
}

export const loader = withSecurity(userPlanLoader, {
  allowedMethods: ['GET'],
  rateLimit: true,
});
