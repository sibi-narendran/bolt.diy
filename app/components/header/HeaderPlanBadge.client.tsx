'use client';

import { useStore } from '@nanostores/react';
import { useEffect, useRef } from 'react';
import { Badge } from '~/components/ui/Badge';
import { authStore } from '~/lib/stores/auth';
import { refreshUserPlan, resetUserPlan, userPlanStore } from '~/lib/stores/userPlan';

export function HeaderPlanBadge() {
  const auth = useStore(authStore);
  const planState = useStore(userPlanStore);
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const token = auth.session?.access_token ?? null;

    if (!auth.isAuthenticated || !token) {
      resetUserPlan();
      lastTokenRef.current = null;

      return;
    }

    const shouldFetch = lastTokenRef.current !== token || (!planState.plan && !planState.isLoading);

    if (!shouldFetch) {
      return;
    }

    lastTokenRef.current = token;
    refreshUserPlan(token).catch(() => {
      // Errors are handled inside the store; no-op
    });
  }, [auth.isAuthenticated, auth.session?.access_token, planState.plan, planState.isLoading]);

  if (!auth.isAuthenticated) {
    return null;
  }

  if (planState.isLoading && !planState.plan) {
    return (
      <Badge variant="subtle" size="sm" className="animate-pulse">
        Loading credits…
      </Badge>
    );
  }

  if (planState.error) {
    return (
      <Badge variant="warning" size="sm" icon="i-ph:warning-duotone">
        Plan unavailable
      </Badge>
    );
  }

  if (!planState.plan) {
    return null;
  }

  const { planTier, monthlyCreditLimit, remainingCredits } = planState.plan;
  const remaining =
    remainingCredits ?? (monthlyCreditLimit > 0 ? monthlyCreditLimit - planState.plan.creditsUsed : null);

  let variant: 'secondary' | 'warning' | 'danger' | 'subtle' | 'primary' = 'subtle';
  let message: string;

  if (remaining === null) {
    message = `${capitalize(planTier)} · Unlimited`;
    variant = 'primary';
  } else if (remaining <= 0) {
    message = `${capitalize(planTier)} · No credits left`;
    variant = 'danger';
  } else {
    message = `${capitalize(planTier)} · ${remaining} credit${remaining === 1 ? '' : 's'} left`;
    variant = remaining <= 5 ? 'warning' : 'secondary';
  }

  return (
    <Badge
      variant={variant}
      size="sm"
      icon="i-ph:lightning-duotone"
      title="Your current plan and remaining managed credits"
    >
      {message}
    </Badge>
  );
}

function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
