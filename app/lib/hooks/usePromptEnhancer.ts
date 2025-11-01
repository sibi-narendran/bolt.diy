import { useState } from 'react';
import type { ProviderInfo } from '~/types/model';
import { createScopedLogger } from '~/utils/logger';
import { refreshUserPlan, updatePlanFromHeaders } from '~/lib/stores/userPlan';

const logger = createScopedLogger('usePromptEnhancement');

export function usePromptEnhancer() {
  const [enhancingPrompt, setEnhancingPrompt] = useState(false);
  const [promptEnhanced, setPromptEnhanced] = useState(false);

  const resetEnhancer = () => {
    setEnhancingPrompt(false);
    setPromptEnhanced(false);
  };

  const enhancePrompt = async (
    input: string,
    setInput: (value: string) => void,
    model: string,
    provider: ProviderInfo,
    apiKeys?: Record<string, string>,
    accessToken?: string | null,
  ) => {
    setEnhancingPrompt(true);
    setPromptEnhanced(false);

    const requestBody: any = {
      message: input,
      model,
      provider,
    };

    if (apiKeys) {
      requestBody.apiKeys = apiKeys;
    }

    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch('/api/enhancer', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    updatePlanFromHeaders(response.headers);

    if (accessToken) {
      refreshUserPlan(accessToken).catch(() => {
        // Errors handled inside the store
      });
    }

    const reader = response.body?.getReader();

    const originalInput = input;

    if (reader) {
      const decoder = new TextDecoder();

      let _input = '';
      let _error;

      try {
        setInput('');

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          _input += decoder.decode(value);

          logger.trace('Set input', _input);

          setInput(_input);
        }
      } catch (error) {
        _error = error;
        setInput(originalInput);
      } finally {
        if (_error) {
          logger.error(_error);
        }

        setEnhancingPrompt(false);
        setPromptEnhanced(true);

        setTimeout(() => {
          setInput(_input);
        });
      }
    }
  };

  return { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer };
}
