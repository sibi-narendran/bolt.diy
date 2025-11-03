import type { ITheme } from '@xterm/xterm';

const style = getComputedStyle(document.documentElement);
const cssVar = (token: string) => style.getPropertyValue(token) || undefined;

export function getTerminalTheme(overrides?: ITheme): ITheme {
  return {
    cursor: cssVar('--appzap-elements-terminal-cursorColor'),
    cursorAccent: cssVar('--appzap-elements-terminal-cursorColorAccent'),
    foreground: cssVar('--appzap-elements-terminal-textColor'),
    background: cssVar('--appzap-elements-terminal-backgroundColor'),
    selectionBackground: cssVar('--appzap-elements-terminal-selection-backgroundColor'),
    selectionForeground: cssVar('--appzap-elements-terminal-selection-textColor'),
    selectionInactiveBackground: cssVar('--appzap-elements-terminal-selection-backgroundColorInactive'),

    // ansi escape code colors
    black: cssVar('--appzap-elements-terminal-color-black'),
    red: cssVar('--appzap-elements-terminal-color-red'),
    green: cssVar('--appzap-elements-terminal-color-green'),
    yellow: cssVar('--appzap-elements-terminal-color-yellow'),
    blue: cssVar('--appzap-elements-terminal-color-blue'),
    magenta: cssVar('--appzap-elements-terminal-color-magenta'),
    cyan: cssVar('--appzap-elements-terminal-color-cyan'),
    white: cssVar('--appzap-elements-terminal-color-white'),
    brightBlack: cssVar('--appzap-elements-terminal-color-brightBlack'),
    brightRed: cssVar('--appzap-elements-terminal-color-brightRed'),
    brightGreen: cssVar('--appzap-elements-terminal-color-brightGreen'),
    brightYellow: cssVar('--appzap-elements-terminal-color-brightYellow'),
    brightBlue: cssVar('--appzap-elements-terminal-color-brightBlue'),
    brightMagenta: cssVar('--appzap-elements-terminal-color-brightMagenta'),
    brightCyan: cssVar('--appzap-elements-terminal-color-brightCyan'),
    brightWhite: cssVar('--appzap-elements-terminal-color-brightWhite'),

    ...overrides,
  };
}
