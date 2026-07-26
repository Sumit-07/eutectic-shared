/*
 * GENERATED FILE — do not edit. Run `pnpm --filter @eutectic/tokens build`.
 * Source: packages/tokens/src/*.ts (frontend-spec.md §5)
 */

export type ThemeName = 'light' | 'dark';

export type AgentInkName =
  | 'bricklayer'
  | 'ledger'
  | 'marguerite'
  | 'sprout'
  | 'grouse'
  | 'vellum'
  | 'neutral';

/** px */
export const space = {
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 20,
  7: 24,
  8: 32,
  9: 40,
  10: 56,
  11: 80,
} as const;

/** px */
export const radius = {
  none: 0,
  sm: 2,
  md: 3,
  full: 999,
} as const;

export const shadow = {
  sheet: '0 1px 2px rgb(22 23 26/.04), 0 8px 24px rgb(22 23 26/.08)',
  pop: '0 1px 2px rgb(22 23 26/.05), 0 4px 12px rgb(22 23 26/.07)',
  inset: 'inset 0 1px 0 rgb(22 23 26/.03)',
} as const;

export const z = {
  sticky: 10,
  pill: 20,
  sheet: 40,
  toast: 50,
} as const;

/** ms — nothing longer */
export const dur = {
  1: 120,
  2: 180,
  3: 280,
} as const;

export const ease = {
  out: 'cubic-bezier(.2,.8,.3,1)',
  inOut: 'cubic-bezier(.5,0,.3,1)',
} as const;

/** Surfaces, ink and agent inks, resolved per theme. */
export const themes = {
  light: {
    paper: '#FCFCFA',
    paperRaise: '#FFFFFF',
    paperSink: '#F4F4F1',
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
    agentInk: {
      bricklayer: '#A6640F',
      ledger: '#17697E',
      marguerite: '#6B3FA0',
      sprout: '#3F7A34',
      grouse: '#A2374C',
      vellum: '#33489E',
      neutral: '#6F7178',
    },
  },
  dark: {
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
    agentInk: {
      bricklayer: '#E4A159',
      ledger: '#5FB2C6',
      marguerite: '#B48CD6',
      sprout: '#8CC183',
      grouse: '#CE7D8E',
      vellum: '#8296D6',
      neutral: '#83838D',
    },
  },
} as const;

export type Theme = (typeof themes)[ThemeName];

export function theme(name: ThemeName): Theme {
  return themes[name];
}

/** Agent inks are addressed by token name, never by hex. */
export function agentInk(name: AgentInkName, themeName: ThemeName): string {
  return themes[themeName].agentInk[name];
}
