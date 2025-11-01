import type { ManagedModelConfig } from '~/types/model-policy';

export const MODEL_POLICY: {
  provider: string;
  defaultModelId: string;
  managedModels: ManagedModelConfig[];
} = {
  provider: 'OpenRouter',
  defaultModelId: 'anthropic/claude-3.5-sonnet',
  managedModels: [
    {
      id: 'anthropic/claude-3.5-sonnet',
      provider: 'OpenRouter',
      label: 'Claude 3.5 Sonnet',
      description: 'Balanced flagship Claude model for coding and reasoning.',
      maxTokenAllowed: 200000,
    },
    {
      id: 'openai/gpt-4o-mini',
      provider: 'OpenRouter',
      label: 'GPT-4o mini',
      description: 'Fast GPT-4o variant tuned for lightweight work.',
      maxTokenAllowed: 128000,
    },
  ],
};

export const MANAGED_PROVIDER_SET = new Set([MODEL_POLICY.provider]);
export const MANAGED_MODEL_ID_SET = new Set(
  MODEL_POLICY.managedModels.map((model) => `${model.provider}::${model.id}`),
);
