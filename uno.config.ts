import { globSync } from 'fast-glob';
import fs from 'node:fs/promises';
import { basename } from 'node:path';
import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss';

const iconPaths = globSync('./icons/*.svg');

const collectionName = 'appzap';

const customIconCollection = iconPaths.reduce(
  (acc, iconPath) => {
    const [iconName] = basename(iconPath).split('.');

    acc[collectionName] ??= {};
    acc[collectionName][iconName] = async () => fs.readFile(iconPath, 'utf8');

    return acc;
  },
  {} as Record<string, Record<string, () => Promise<string>>>,
);

const BASE_COLORS = {
  white: '#FFFFFF',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  accent: {
    50: '#FFF6E6',
    100: '#FFE7C2',
    200: '#FFD28A',
    300: '#FFB755',
    400: '#FF9C2A',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
    800: '#8A360A',
    900: '#6C2A09',
    950: '#431A05',
  },
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },
  orange: {
    50: '#FFFAEB',
    100: '#FEEFC7',
    200: '#FEDF89',
    300: '#FEC84B',
    400: '#FDB022',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
    800: '#93370D',
    900: '#792E0D',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },
};

const COLOR_PRIMITIVES = {
  ...BASE_COLORS,
  alpha: {
    white: generateAlphaPalette(BASE_COLORS.white),
    gray: generateAlphaPalette(BASE_COLORS.gray[900]),
    red: generateAlphaPalette(BASE_COLORS.red[500]),
    accent: generateAlphaPalette(BASE_COLORS.accent[500]),
  },
};

export default defineConfig({
  safelist: [
    ...Object.keys(customIconCollection[collectionName] || {}).map((x) => `i-appzap:${x}`),
    'i-ph:arrow-right',
    'i-ph:arrow-right-bold',
    'i-ph:stop-circle-bold',
    'i-ph:sign-in',
    'i-ph:rocket-launch',
  ],
  shortcuts: {
    'appzap-ease-cubic-bezier': 'ease-[cubic-bezier(0.4,0,0.2,1)]',
    'transition-theme': 'transition-[background-color,border-color,color] duration-150 appzap-ease-cubic-bezier',
    kdb: 'bg-appzap-elements-code-background text-appzap-elements-code-text py-1 px-1.5 rounded-md',
    'max-w-chat': 'max-w-[var(--chat-max-width)]',
  },
  rules: [
    /**
     * This shorthand doesn't exist in Tailwind and we overwrite it to avoid
     * any conflicts with minified CSS classes.
     */
    ['b', {}],
  ],
  theme: {
    colors: {
      ...COLOR_PRIMITIVES,
      appzap: {
        elements: {
          borderColor: 'var(--appzap-elements-borderColor)',
          borderColorActive: 'var(--appzap-elements-borderColorActive)',
          background: {
            depth: {
              1: 'var(--appzap-elements-bg-depth-1)',
              2: 'var(--appzap-elements-bg-depth-2)',
              3: 'var(--appzap-elements-bg-depth-3)',
              4: 'var(--appzap-elements-bg-depth-4)',
            },
          },
          textPrimary: 'var(--appzap-elements-textPrimary)',
          textSecondary: 'var(--appzap-elements-textSecondary)',
          textTertiary: 'var(--appzap-elements-textTertiary)',
          code: {
            background: 'var(--appzap-elements-code-background)',
            text: 'var(--appzap-elements-code-text)',
          },
          button: {
            primary: {
              background: 'var(--appzap-elements-button-primary-background)',
              backgroundHover: 'var(--appzap-elements-button-primary-backgroundHover)',
              text: 'var(--appzap-elements-button-primary-text)',
            },
            secondary: {
              background: 'var(--appzap-elements-button-secondary-background)',
              backgroundHover: 'var(--appzap-elements-button-secondary-backgroundHover)',
              text: 'var(--appzap-elements-button-secondary-text)',
            },
            danger: {
              background: 'var(--appzap-elements-button-danger-background)',
              backgroundHover: 'var(--appzap-elements-button-danger-backgroundHover)',
              text: 'var(--appzap-elements-button-danger-text)',
            },
          },
          item: {
            contentDefault: 'var(--appzap-elements-item-contentDefault)',
            contentActive: 'var(--appzap-elements-item-contentActive)',
            contentAccent: 'var(--appzap-elements-item-contentAccent)',
            contentDanger: 'var(--appzap-elements-item-contentDanger)',
            backgroundDefault: 'var(--appzap-elements-item-backgroundDefault)',
            backgroundActive: 'var(--appzap-elements-item-backgroundActive)',
            backgroundAccent: 'var(--appzap-elements-item-backgroundAccent)',
            backgroundDanger: 'var(--appzap-elements-item-backgroundDanger)',
          },
          actions: {
            background: 'var(--appzap-elements-actions-background)',
            code: {
              background: 'var(--appzap-elements-actions-code-background)',
            },
          },
          artifacts: {
            background: 'var(--appzap-elements-artifacts-background)',
            backgroundHover: 'var(--appzap-elements-artifacts-backgroundHover)',
            borderColor: 'var(--appzap-elements-artifacts-borderColor)',
            inlineCode: {
              background: 'var(--appzap-elements-artifacts-inlineCode-background)',
              text: 'var(--appzap-elements-artifacts-inlineCode-text)',
            },
          },
          messages: {
            background: 'var(--appzap-elements-messages-background)',
            linkColor: 'var(--appzap-elements-messages-linkColor)',
            code: {
              background: 'var(--appzap-elements-messages-code-background)',
            },
            inlineCode: {
              background: 'var(--appzap-elements-messages-inlineCode-background)',
              text: 'var(--appzap-elements-messages-inlineCode-text)',
            },
          },
          icon: {
            success: 'var(--appzap-elements-icon-success)',
            error: 'var(--appzap-elements-icon-error)',
            primary: 'var(--appzap-elements-icon-primary)',
            secondary: 'var(--appzap-elements-icon-secondary)',
            tertiary: 'var(--appzap-elements-icon-tertiary)',
          },
          preview: {
            addressBar: {
              background: 'var(--appzap-elements-preview-addressBar-background)',
              backgroundHover: 'var(--appzap-elements-preview-addressBar-backgroundHover)',
              backgroundActive: 'var(--appzap-elements-preview-addressBar-backgroundActive)',
              text: 'var(--appzap-elements-preview-addressBar-text)',
              textActive: 'var(--appzap-elements-preview-addressBar-textActive)',
            },
          },
          terminals: {
            background: 'var(--appzap-elements-terminals-background)',
            buttonBackground: 'var(--appzap-elements-terminals-buttonBackground)',
          },
          dividerColor: 'var(--appzap-elements-dividerColor)',
          loader: {
            background: 'var(--appzap-elements-loader-background)',
            progress: 'var(--appzap-elements-loader-progress)',
          },
          prompt: {
            background: 'var(--appzap-elements-prompt-background)',
          },
          sidebar: {
            dropdownShadow: 'var(--appzap-elements-sidebar-dropdownShadow)',
            buttonBackgroundDefault: 'var(--appzap-elements-sidebar-buttonBackgroundDefault)',
            buttonBackgroundHover: 'var(--appzap-elements-sidebar-buttonBackgroundHover)',
            buttonText: 'var(--appzap-elements-sidebar-buttonText)',
          },
          cta: {
            background: 'var(--appzap-elements-cta-background)',
            text: 'var(--appzap-elements-cta-text)',
          },
        },
      },
    },
  },
  transformers: [transformerDirectives()],
  presets: [
    presetUno({
      dark: {
        light: '[data-theme="light"]',
        dark: '[data-theme="dark"]',
      },
    }),
    presetIcons({
      warn: true,
      collections: {
        ...customIconCollection,
        ph: () => import('@iconify-json/ph/icons.json').then((i) => i.default),
        'svg-spinners': () => import('@iconify-json/svg-spinners/icons.json').then((i) => i.default),
      },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
      unit: 'em',
    }),
  ],
});

/**
 * Generates an alpha palette for a given hex color.
 *
 * @param hex - The hex color code (without alpha) to generate the palette from.
 * @returns An object where keys are opacity percentages and values are hex colors with alpha.
 *
 * Example:
 *
 * ```
 * {
 *   '1': '#FFFFFF03',
 *   '2': '#FFFFFF05',
 *   '3': '#FFFFFF08',
 * }
 * ```
 */
function generateAlphaPalette(hex: string) {
  return [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].reduce(
    (acc, opacity) => {
      const alpha = Math.round((opacity / 100) * 255)
        .toString(16)
        .padStart(2, '0');

      acc[opacity] = `${hex}${alpha}`;

      return acc;
    },
    {} as Record<number, string>,
  );
}
