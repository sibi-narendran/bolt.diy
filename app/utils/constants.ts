import { LLMManager } from '~/lib/modules/llm/manager';
import type { Template } from '~/types/template';
import { MODEL_POLICY } from '~/config/modelPolicy';
import type { ManagedModelConfig } from '~/types/model-policy';

export const WORK_DIR_NAME = 'project';
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;
export const MODIFICATIONS_TAG_NAME = 'appza_file_modifications';
export const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/;
export const PROVIDER_REGEX = /\[Provider: (.*?)\]\n\n/;
export const DEFAULT_MODEL = MODEL_POLICY.defaultModelId;
export const PROMPT_COOKIE_KEY = 'cachedPrompt';
export const TOOL_EXECUTION_APPROVAL = {
  APPROVE: 'Yes, approved.',
  REJECT: 'No, rejected.',
} as const;
export const TOOL_NO_EXECUTE_FUNCTION = 'Error: No execute function found on tool';
export const TOOL_EXECUTION_DENIED = 'Error: User denied access to tool execution';
export const TOOL_EXECUTION_ERROR = 'Error: An error occured while calling tool';

const llmManager = LLMManager.getInstance(import.meta.env);
const allProviders = llmManager.getAllProviders();
const allowedProviderNames = new Set(MODEL_POLICY.managedModels.map((model) => model.provider));
allowedProviderNames.add(MODEL_POLICY.provider);

export const PROVIDER_LIST = allProviders.filter((provider) => allowedProviderNames.has(provider.name));

if (PROVIDER_LIST.length === 0) {
  throw new Error(`MODEL_POLICY provider "${MODEL_POLICY.provider}" is not registered.`);
}

const resolvedDefaultProvider = PROVIDER_LIST.find((provider) => provider.name === MODEL_POLICY.provider);

if (!resolvedDefaultProvider) {
  throw new Error(`MODEL_POLICY default provider "${MODEL_POLICY.provider}" was filtered out.`);
}

export const DEFAULT_PROVIDER = resolvedDefaultProvider;

export const MANAGED_MODELS: ManagedModelConfig[] = MODEL_POLICY.managedModels;
export const MANAGED_MODEL_MAP = new Map(MANAGED_MODELS.map((model) => [model.id, model]));

export const providerBaseUrlEnvKeys: Record<string, { baseUrlKey?: string; apiTokenKey?: string }> = {};
PROVIDER_LIST.forEach((provider) => {
  providerBaseUrlEnvKeys[provider.name] = {
    baseUrlKey: provider.config.baseUrlKey,
    apiTokenKey: provider.config.apiTokenKey,
  };
});

// starter Templates

export const STARTER_TEMPLATES: Template[] = [
  {
    name: 'Expo App',
    label: 'Expo App',
    description: 'Expo starter template for building cross-platform mobile apps',
    githubRepo: 'xKevIsDev/appzap-expo-template',
    tags: ['mobile', 'expo', 'mobile-app', 'android', 'iphone'],
    icon: 'i-appzap:expo',
  },
  {
    name: 'Basic Astro',
    label: 'Astro Basic',
    description: 'Lightweight Astro starter template for building fast static websites',
    githubRepo: 'xKevIsDev/appzap-astro-basic-template',
    tags: ['astro', 'blog', 'performance'],
    icon: 'i-appzap:astro',
  },
  {
    name: 'NextJS Shadcn',
    label: 'Next.js with shadcn/ui',
    description: 'Next.js starter fullstack template integrated with shadcn/ui components and styling system',
    githubRepo: 'xKevIsDev/appzap-nextjs-shadcn-template',
    tags: ['nextjs', 'react', 'typescript', 'shadcn', 'tailwind'],
    icon: 'i-appzap:nextjs',
  },
  {
    name: 'Vite Shadcn',
    label: 'Vite with shadcn/ui',
    description: 'Vite starter fullstack template integrated with shadcn/ui components and styling system',
    githubRepo: 'xKevIsDev/vite-shadcn',
    tags: ['vite', 'react', 'typescript', 'shadcn', 'tailwind'],
    icon: 'i-appzap:shadcn',
  },
  {
    name: 'Qwik Typescript',
    label: 'Qwik TypeScript',
    description: 'Qwik framework starter with TypeScript for building resumable applications',
    githubRepo: 'xKevIsDev/appzap-qwik-ts-template',
    tags: ['qwik', 'typescript', 'performance', 'resumable'],
    icon: 'i-appzap:qwik',
  },
  {
    name: 'Remix Typescript',
    label: 'Remix TypeScript',
    description: 'Remix framework starter with TypeScript for full-stack web applications',
    githubRepo: 'xKevIsDev/appzap-remix-ts-template',
    tags: ['remix', 'typescript', 'fullstack', 'react'],
    icon: 'i-appzap:remix',
  },
  {
    name: 'Slidev',
    label: 'Slidev Presentation',
    description: 'Slidev starter template for creating developer-friendly presentations using Markdown',
    githubRepo: 'xKevIsDev/appzap-slidev-template',
    tags: ['slidev', 'presentation', 'markdown'],
    icon: 'i-appzap:slidev',
  },
  {
    name: 'Sveltekit',
    label: 'SvelteKit',
    description: 'SvelteKit starter template for building fast, efficient web applications',
    githubRepo: 'appzap-sveltekit-template',
    tags: ['svelte', 'sveltekit', 'typescript'],
    icon: 'i-appzap:svelte',
  },
  {
    name: 'Vanilla Vite',
    label: 'Vanilla + Vite',
    description: 'Minimal Vite starter template for vanilla JavaScript projects',
    githubRepo: 'xKevIsDev/vanilla-vite-template',
    tags: ['vite', 'vanilla-js', 'minimal'],
    icon: 'i-appzap:vite',
  },
  {
    name: 'Vite React',
    label: 'React + Vite + typescript',
    description: 'React starter template powered by Vite for fast development experience',
    githubRepo: 'xKevIsDev/appzap-vite-react-ts-template',
    tags: ['react', 'vite', 'frontend', 'website', 'app'],
    icon: 'i-appzap:react',
  },
  {
    name: 'Vite Typescript',
    label: 'Vite + TypeScript',
    description: 'Vite starter template with TypeScript configuration for type-safe development',
    githubRepo: 'xKevIsDev/appzap-vite-ts-template',
    tags: ['vite', 'typescript', 'minimal'],
    icon: 'i-appzap:typescript',
  },
  {
    name: 'Vue',
    label: 'Vue.js',
    description: 'Vue.js starter template with modern tooling and best practices',
    githubRepo: 'xKevIsDev/appzap-vue-template',
    tags: ['vue', 'typescript', 'frontend'],
    icon: 'i-appzap:vue',
  },
  {
    name: 'Angular',
    label: 'Angular Starter',
    description: 'A modern Angular starter template with TypeScript support and best practices configuration',
    githubRepo: 'xKevIsDev/appzap-angular-template',
    tags: ['angular', 'typescript', 'frontend', 'spa'],
    icon: 'i-appzap:angular',
  },
  {
    name: 'SolidJS',
    label: 'SolidJS Tailwind',
    description: 'Lightweight SolidJS starter template for building fast static websites',
    githubRepo: 'xKevIsDev/solidjs-ts-tw',
    tags: ['solidjs'],
    icon: 'i-appzap:solidjs',
  },
];
