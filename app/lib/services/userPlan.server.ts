import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

export interface UserPlan {
  user_id: string;
  plan_tier: string;
  monthly_credit_limit: number;
  credits_used: number;
  reset_at: string;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_PLAN_TIER = 'free';
export const DEFAULT_MONTHLY_CREDIT_LIMIT = 1000;
export const CREDITS_PER_LLM_CALL = 1;

export class CreditLimitExceededError extends Error {
  constructor(message = 'Credit limit exceeded') {
    super(message);
    this.name = 'CreditLimitExceededError';
  }
}

export class UnauthorizedPlanAccessError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedPlanAccessError';
  }
}

export class InvalidCreditAmountError extends Error {
  constructor(message = 'Credits must be a positive integer') {
    super(message);
    this.name = 'InvalidCreditAmountError';
  }
}

export class UserPlanServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserPlanServiceError';
  }
}

function handlePlanRpcError(error: PostgrestError): never {
  const message = error.message || 'Failed to update user plan';

  if (message.includes('CREDIT_LIMIT_EXCEEDED')) {
    throw new CreditLimitExceededError();
  }

  if (message.includes('FORBIDDEN')) {
    throw new UnauthorizedPlanAccessError();
  }

  if (message.includes('INVALID_CREDITS')) {
    throw new InvalidCreditAmountError();
  }

  throw new UserPlanServiceError(message);
}

export async function ensureUserPlanExists(supabase: SupabaseClient, userId: string): Promise<UserPlan> {
  const { data, error } = await supabase.rpc('ensure_user_plan', {
    p_user_id: userId,
  });

  if (error) {
    handlePlanRpcError(error);
  }

  if (!data) {
    throw new UserPlanServiceError('Supabase returned no plan data');
  }

  return data as UserPlan;
}

export async function consumeUserPlanCredits(
  supabase: SupabaseClient,
  userId: string,
  credits: number,
): Promise<UserPlan> {
  const { data, error } = await supabase.rpc('consume_user_plan_credits', {
    p_user_id: userId,
    p_credits: credits,
  });

  if (error) {
    handlePlanRpcError(error);
  }

  if (!data) {
    throw new UserPlanServiceError('Supabase returned no plan data');
  }

  return data as UserPlan;
}

export function getRemainingCredits(plan: UserPlan): number | null {
  if (!plan || plan.monthly_credit_limit <= 0) {
    return null;
  }

  return Math.max(plan.monthly_credit_limit - plan.credits_used, 0);
}
