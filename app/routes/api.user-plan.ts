import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { withSecurity } from '~/lib/security';
import { requireSupabaseUser } from '~/lib/supabase/auth.server';
import { ensureUserPlanExists, getRemainingCredits } from '~/lib/services/userPlan.server';

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
}

export const loader = withSecurity(userPlanLoader, {
  allowedMethods: ['GET'],
  rateLimit: true,
});
