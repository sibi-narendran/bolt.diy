import { globSync } from 'fast-glob';
import fs from 'node:fs/promises';
import { basename } from 'node:path';
import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss';

const iconPaths = globSync('./icons/*.svg');

const collectionName = 'appza';

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
    ...Object.keys(customIconCollection[collectionName] || {}).map((x) => `i-appza:${x}`),
    'i-ph:arrow-right',
    'i-ph:arrow-right-bold',
    'i-ph:stop-circle-bold',
    'i-ph:sign-in',
    'i-ph:rocket-launch',
  ],
  shortcuts: {
    'appza-ease-cubic-bezier': 'ease-[cubic-bezier(0.4,0,0.2,1)]',
    'transition-theme': 'transition-[background-color,border-color,color] duration-150 appza-ease-cubic-bezier',
    kdb: 'bg-appza-elements-code-background text-appza-elements-code-text py-1 px-1.5 rounded-md',
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
      appza: {
        elements: {
          borderColor: 'var(--appza-elements-borderColor)',
          borderColorActive: 'var(--appza-elements-borderColorActive)',
          background: {
            depth: {
              1: 'var(--appza-elements-bg-depth-1)',
              2: 'var(--appza-elements-bg-depth-2)',
              3: 'var(--appza-elements-bg-depth-3)',
              4: 'var(--appza-elements-bg-depth-4)',
            },
          },
          textPrimary: 'var(--appza-elements-textPrimary)',
          textSecondary: 'var(--appza-elements-textSecondary)',
          textTertiary: 'var(--appza-elements-textTertiary)',
          code: {
            background: 'var(--appza-elements-code-background)',
            text: 'var(--appza-elements-code-text)',
          },
          button: {
            primary: {
              background: 'var(--appza-elements-button-primary-background)',
              backgroundHover: 'var(--appza-elements-button-primary-backgroundHover)',
              text: 'var(--appza-elements-button-primary-text)',
            },
            secondary: {
              background: 'var(--appza-elements-button-secondary-background)',
              backgroundHover: 'var(--appza-elements-button-secondary-backgroundHover)',
              text: 'var(--appza-elements-button-secondary-text)',
            },
            danger: {
              background: 'var(--appza-elements-button-danger-background)',
              backgroundHover: 'var(--appza-elements-button-danger-backgroundHover)',
              text: 'var(--appza-elements-button-danger-text)',
            },
          },
          item: {
            contentDefault: 'var(--appza-elements-item-contentDefault)',
            contentActive: 'var(--appza-elements-item-contentActive)',
            contentAccent: 'var(--appza-elements-item-contentAccent)',
            contentDanger: 'var(--appza-elements-item-contentDanger)',
            backgroundDefault: 'var(--appza-elements-item-backgroundDefault)',
            backgroundActive: 'var(--appza-elements-item-backgroundActive)',
            backgroundAccent: 'var(--appza-elements-item-backgroundAccent)',
            backgroundDanger: 'var(--appza-elements-item-backgroundDanger)',
          },
          actions: {
            background: 'var(--appza-elements-actions-background)',
            code: {
              background: 'var(--appza-elements-actions-code-background)',
            },
          },
          artifacts: {
            background: 'var(--appza-elements-artifacts-background)',
            backgroundHover: 'var(--appza-elements-artifacts-backgroundHover)',
            borderColor: 'var(--appza-elements-artifacts-borderColor)',
            inlineCode: {
              background: 'var(--appza-elements-artifacts-inlineCode-background)',
              text: 'var(--appza-elements-artifacts-inlineCode-text)',
            },
          },
          messages: {
            background: 'var(--appza-elements-messages-background)',
            linkColor: 'var(--appza-elements-messages-linkColor)',
            code: {
              background: 'var(--appza-elements-messages-code-background)',
            },
            inlineCode: {
              background: 'var(--appza-elements-messages-inlineCode-background)',
              text: 'var(--appza-elements-messages-inlineCode-text)',
            },
          },
          icon: {
            success: 'var(--appza-elements-icon-success)',
            error: 'var(--appza-elements-icon-error)',
            primary: 'var(--appza-elements-icon-primary)',
            secondary: 'var(--appza-elements-icon-secondary)',
            tertiary: 'var(--appza-elements-icon-tertiary)',
          },
          preview: {
            addressBar: {
              background: 'var(--appza-elements-preview-addressBar-background)',
              backgroundHover: 'var(--appza-elements-preview-addressBar-backgroundHover)',
              backgroundActive: 'var(--appza-elements-preview-addressBar-backgroundActive)',
              text: 'var(--appza-elements-preview-addressBar-text)',
              textActive: 'var(--appza-elements-preview-addressBar-textActive)',
            },
          },
          terminals: {
            background: 'var(--appza-elements-terminals-background)',
            buttonBackground: 'var(--appza-elements-terminals-buttonBackground)',
          },
          dividerColor: 'var(--appza-elements-dividerColor)',
          loader: {
            background: 'var(--appza-elements-loader-background)',
            progress: 'var(--appza-elements-loader-progress)',
          },
          prompt: {
            background: 'var(--appza-elements-prompt-background)',
          },
          sidebar: {
            dropdownShadow: 'var(--appza-elements-sidebar-dropdownShadow)',
            buttonBackgroundDefault: 'var(--appza-elements-sidebar-buttonBackgroundDefault)',
            buttonBackgroundHover: 'var(--appza-elements-sidebar-buttonBackgroundHover)',
            buttonText: 'var(--appza-elements-sidebar-buttonText)',
          },
          cta: {
            background: 'var(--appza-elements-cta-background)',
            text: 'var(--appza-elements-cta-text)',
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
