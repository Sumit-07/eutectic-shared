/**
 * Contrast results and their table rendering — shared by the CLI gate and the
 * unit test so both report identical numbers.
 */
import { WCAG_AA_NORMAL, contrastRatio } from './contrast.js';
import type { TokensJson } from './emit/json.js';
import { inkThemePairs } from './read-tokens-json.js';
import type { AgentInkName, ThemeName } from './types.js';

export interface ContrastResult {
  ink: AgentInkName;
  theme: ThemeName;
  foreground: string;
  background: string;
  ratio: number;
  passes: boolean;
}

export function checkAgentInkContrast(
  tokens: TokensJson,
  threshold: number = WCAG_AA_NORMAL,
): ContrastResult[] {
  return inkThemePairs().map(([ink, theme]) => {
    const foreground = tokens.themes[theme].agentInks[ink];
    const background = tokens.themes[theme].colors.paper;
    const ratio = contrastRatio(foreground, background);
    return { ink, theme, foreground, background, ratio, passes: ratio >= threshold };
  });
}

export function formatContrastTable(results: readonly ContrastResult[]): string {
  const width = Math.max(...results.map((r) => r.ink.length));
  const lines = results.map(
    (r) =>
      `  ${r.passes ? 'pass' : 'FAIL'}  ${r.ink.padEnd(width)}  ${r.theme.padEnd(5)}  ` +
      `${r.foreground} on ${r.background}  ${r.ratio.toFixed(2)}:1`,
  );
  return `Agent ink contrast against paper (WCAG 2.2 AA, ≥ ${WCAG_AA_NORMAL}:1)\n${lines.join('\n')}\n`;
}
