import type { ITheme } from '@xterm/xterm';

const style = getComputedStyle(document.documentElement);
const cssVar = (token: string) => style.getPropertyValue(token) || undefined;

export function getTerminalTheme(overrides?: ITheme): ITheme {
  return {
    cursor: cssVar('--appza-elements-terminal-cursorColor'),
    cursorAccent: cssVar('--appza-elements-terminal-cursorColorAccent'),
    foreground: cssVar('--appza-elements-terminal-textColor'),
    background: cssVar('--appza-elements-terminal-backgroundColor'),
    selectionBackground: cssVar('--appza-elements-terminal-selection-backgroundColor'),
    selectionForeground: cssVar('--appza-elements-terminal-selection-textColor'),
    selectionInactiveBackground: cssVar('--appza-elements-terminal-selection-backgroundColorInactive'),

    // ansi escape code colors
    black: cssVar('--appza-elements-terminal-color-black'),
    red: cssVar('--appza-elements-terminal-color-red'),
    green: cssVar('--appza-elements-terminal-color-green'),
    yellow: cssVar('--appza-elements-terminal-color-yellow'),
    blue: cssVar('--appza-elements-terminal-color-blue'),
    magenta: cssVar('--appza-elements-terminal-color-magenta'),
    cyan: cssVar('--appza-elements-terminal-color-cyan'),
    white: cssVar('--appza-elements-terminal-color-white'),
    brightBlack: cssVar('--appza-elements-terminal-color-brightBlack'),
    brightRed: cssVar('--appza-elements-terminal-color-brightRed'),
    brightGreen: cssVar('--appza-elements-terminal-color-brightGreen'),
    brightYellow: cssVar('--appza-elements-terminal-color-brightYellow'),
    brightBlue: cssVar('--appza-elements-terminal-color-brightBlue'),
    brightMagenta: cssVar('--appza-elements-terminal-color-brightMagenta'),
    brightCyan: cssVar('--appza-elements-terminal-color-brightCyan'),
    brightWhite: cssVar('--appza-elements-terminal-color-brightWhite'),

    ...overrides,
  };
}
