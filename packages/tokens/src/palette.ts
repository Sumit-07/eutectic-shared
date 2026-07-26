/**
 * Surfaces and ink. Normative source: frontend-spec.md §5.1 (light) and §5.3 (dark).
 * Copy these values from the spec; never invent or round one.
 */
import type { SemanticColors, ThemeName } from './types.js';

/** frontend-spec §5.1 — light (default) */
export const lightColors = {
  paper: '#FCFCFA', // page
  paperRaise: '#FFFFFF', // overlays, sheets
  paperSink: '#F4F4F1', // inset strips, composer
  paperHover: '#F8F8F5',
  rule: '#E4E4DF',
  ruleStrong: '#CECEC7',
  ruleSoft: '#EFEFEA',
  ink: '#16171A',
  inkSoft: '#4A4C52',
  inkQuiet: '#6F7178',
  inkFaint: '#9B9DA4',
  positive: '#2F6E38',
  negative: '#A2374C',
  caution: '#8A5A12',
  focus: '#33489E',
} as const satisfies SemanticColors;

/** frontend-spec §5.3 — dark */
export const darkColors = {
  paper: '#0F0F11',
  paperRaise: '#17171A',
  paperSink: '#141417',
  paperHover: '#131316',
  rule: '#232327',
  ruleStrong: '#33333A',
  ruleSoft: '#1C1C20',
  ink: '#EDEAE3',
  inkSoft: '#C3C1BB',
  inkQuiet: '#83838D',
  inkFaint: '#5A5A63',
  positive: '#6FA85F',
  negative: '#CE7D8E',
  caution: '#D9A34E',
  focus: '#8296D6',
} as const satisfies SemanticColors;

export const colors: Record<ThemeName, SemanticColors> = {
  light: lightColors,
  dark: darkColors,
};
