'use client';

import { atom } from 'nanostores';

export interface UserPlanSummary {
  planTier: string;
  monthlyCreditLimit: number;
  creditsUsed: number;
  remainingCredits: number | null;
  resetAt: string;
  updatedAt: string;
}

interface UserPlanState {
  plan: UserPlanSummary | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserPlanState = {
  plan: null,
  isLoading: false,
  error: null,
};

export const userPlanStore = atom<UserPlanState>(initialState);

function setState(updater: (state: UserPlanState) => UserPlanState) {
  const current = userPlanStore.get();
  userPlanStore.set(updater(current));
}

export function resetUserPlan() {
  userPlanStore.set(initialState);
}

export function updatePlanFromHeaders(headers: Headers) {
  const planTier = headers.get('X-User-Plan-Tier');
  const remainingRaw = headers.get('X-User-Credits-Remaining');

  if (!planTier && !remainingRaw) {
    return;
  }

  setState((state) => {
    const remaining = remainingRaw !== null ? Number.parseInt(remainingRaw, 10) : null;
    const prevPlan = state.plan;
    const now = new Date().toISOString();
    const basePlan: UserPlanSummary = {
      planTier: planTier ?? prevPlan?.planTier ?? 'unknown',
      monthlyCreditLimit: prevPlan?.monthlyCreditLimit ?? 0,
      creditsUsed: prevPlan?.creditsUsed ?? 0,
      remainingCredits: remaining ?? prevPlan?.remainingCredits ?? null,
      resetAt: prevPlan?.resetAt ?? now,
      updatedAt: now,
    };

    const calculatedCreditsUsed =
      remaining !== null && basePlan.monthlyCreditLimit > 0
        ? Math.max(basePlan.monthlyCreditLimit - remaining, 0)
        : basePlan.creditsUsed;

    return {
      ...state,
      plan: {
        ...basePlan,
        planTier: planTier ?? basePlan.planTier,
        remainingCredits: remaining ?? basePlan.remainingCredits,
        creditsUsed: calculatedCreditsUsed,
        updatedAt: now,
      },
    };
  });
}

export async function refreshUserPlan(accessToken: string | null | undefined) {
  if (!accessToken) {
    resetUserPlan();
    return;
  }

  setState((state) => ({ ...state, isLoading: true, error: null }));

  try {
    const response = await fetch('/api/user-plan', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    const data = (await response.json()) as {
      plan: {
        userId: string;
        planTier: string;
        monthlyCreditLimit: number;
        creditsUsed: number;
        remainingCredits: number | null;
        resetAt: string;
        updatedAt: string;
      };
    };

    setState((state) => ({
      ...state,
      plan: {
        planTier: data.plan.planTier,
        monthlyCreditLimit: data.plan.monthlyCreditLimit,
        creditsUsed: data.plan.creditsUsed,
        remainingCredits: data.plan.remainingCredits,
        resetAt: data.plan.resetAt,
        updatedAt: data.plan.updatedAt,
      },
      isLoading: false,
      error: null,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load plan details';

    setState((state) => ({
      ...state,
      isLoading: false,
      error: message,
    }));
  }
}
