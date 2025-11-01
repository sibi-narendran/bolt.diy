import { json } from '@remix-run/cloudflare';
import { LLMManager } from '~/lib/modules/llm/manager';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { ProviderInfo } from '~/types/model';
import { getApiKeysFromCookie, getProviderSettingsFromCookie } from '~/lib/api/cookies';
import { MODEL_POLICY, MANAGED_MODEL_ID_SET } from '~/config/modelPolicy';

interface ModelsResponse {
  modelList: ModelInfo[];
  providers: ProviderInfo[];
  defaultProvider: ProviderInfo;
}

let cachedProviders: ProviderInfo[] | null = null;
let cachedDefaultProvider: ProviderInfo | null = null;

function getProviderInfo(llmManager: LLMManager) {
  const allowedProviderNames = new Set([MODEL_POLICY.provider]);

  if (!cachedProviders) {
    cachedProviders = llmManager
      .getAllProviders()
      .filter((provider) => allowedProviderNames.has(provider.name))
      .map((provider) => ({
        name: provider.name,
        staticModels: provider.staticModels,
        getApiKeyLink: provider.getApiKeyLink,
        labelForGetApiKey: provider.labelForGetApiKey,
        icon: provider.icon,
      }));
  }

  if (!cachedDefaultProvider) {
    const defaultProvider = llmManager.getProvider(MODEL_POLICY.provider);

    if (!defaultProvider) {
      throw new Error(`MODEL_POLICY provider "${MODEL_POLICY.provider}" not registered.`);
    }

    cachedDefaultProvider = {
      name: defaultProvider.name,
      staticModels: defaultProvider.staticModels,
      getApiKeyLink: defaultProvider.getApiKeyLink,
      labelForGetApiKey: defaultProvider.labelForGetApiKey,
      icon: defaultProvider.icon,
    };
  }

  return { providers: cachedProviders, defaultProvider: cachedDefaultProvider };
}

export async function loader({
  request,
  params,
  context,
}: {
  request: Request;
  params: { provider?: string };
  context: {
    cloudflare?: {
      env: Record<string, string>;
    };
  };
}): Promise<Response> {
  const llmManager = LLMManager.getInstance(context.cloudflare?.env);

  // Get client side maintained API keys and provider settings from cookies
  const cookieHeader = request.headers.get('Cookie');
  const apiKeys = getApiKeysFromCookie(cookieHeader);
  const providerSettings = getProviderSettingsFromCookie(cookieHeader);

  const { providers, defaultProvider } = getProviderInfo(llmManager);

  let modelList: ModelInfo[] = [];

  if (params.provider) {
    // Only update models for the specific provider
    const provider = llmManager.getProvider(params.provider);

    if (provider) {
      modelList = await llmManager.getModelListFromProvider(provider, {
        apiKeys,
        providerSettings,
        serverEnv: context.cloudflare?.env,
      });
    }
  } else {
    // Update all models
    modelList = await llmManager.updateModelList({
      apiKeys,
      providerSettings,
      serverEnv: context.cloudflare?.env,
    });
  }

  const managedModelOverrides = new Map(MODEL_POLICY.managedModels.map((model) => [model.id, model]));

  let filteredModelList = modelList
    .filter((model) => MANAGED_MODEL_ID_SET.has(`${model.provider}::${model.name}`))
    .map((model) => {
      const override = managedModelOverrides.get(model.name);

      return {
        ...model,
        label: override?.label ?? model.label,
        maxTokenAllowed: override?.maxTokenAllowed ?? model.maxTokenAllowed,
      };
    });

  if (filteredModelList.length === 0) {
    filteredModelList = MODEL_POLICY.managedModels.map((model) => ({
      name: model.id,
      provider: model.provider,
      label: model.label ?? model.id,
      maxTokenAllowed: model.maxTokenAllowed ?? 128000,
    }));
  }

  return json<ModelsResponse>({
    modelList: filteredModelList,
    providers,
    defaultProvider,
  });
}
