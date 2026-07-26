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

export type FaceRole = 'prose' | 'ui' | 'mono';

export type TypeScaleName =
  | 'display'
  | 'title'
  | 'head'
  | 'idea'
  | 'bodySerif'
  | 'body'
  | 'bodyMono'
  | 'label'
  | 'meta'
  | 'micro';

export type VoiceName = 'serif' | 'mono' | 'terse' | 'plain';

export type WeightName = 'regular' | 'medium' | 'emphasis';

export type MeasureName = 'default' | 'idea' | 'argument';

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

/** frontend-spec §6.1. Self-hosted face + fallback stack; primary face added by M0-FE-02. */
export const fontStacks = {
  prose: '\'Newsreader\', Georgia, \'Iowan Old Style\', serif',
  ui: '\'Instrument Sans\', system-ui, sans-serif',
  mono: '\'Commit Mono\', ui-monospace, \'IBM Plex Mono\', monospace',
} as const;

/** frontend-spec §6.3 — 400/500 general use; `emphasis` (600) is names/buttons only, never 700+. */
export const weight = {
  regular: 400,
  medium: 500,
  emphasis: 600,
} as const;

/** frontend-spec §6.3 — px, raw (native keeps px; web converts to rem). */
export const typeScale = {
  display: {
    size: 40,
    lineHeight: 1.1,
    face: 'prose',
  },
  title: {
    size: 27,
    lineHeight: 1.2,
    face: 'prose',
  },
  head: {
    size: 22,
    lineHeight: 1.25,
    face: 'prose',
  },
  idea: {
    size: 19,
    lineHeight: 1.4,
    face: 'prose',
  },
  bodySerif: {
    size: 17,
    lineHeight: 1.65,
    face: 'prose',
  },
  body: {
    size: 15,
    lineHeight: 1.6,
    face: 'ui',
  },
  bodyMono: {
    size: 13.5,
    lineHeight: 1.68,
    face: 'mono',
  },
  label: {
    size: 13,
    lineHeight: 1.4,
    face: 'ui',
  },
  meta: {
    size: 12,
    lineHeight: 1.4,
    face: 'ui',
  },
  micro: {
    size: 10.5,
    lineHeight: 1.3,
    face: 'mono',
  },
} as const;

/** frontend-spec §6.2 — the four agent voices. `agent.voice` is DATA from the API. */
export const voices = {
  serif: {
    face: 'prose',
    size: 17,
    lineHeight: 1.65,
    tracking: 0,
  },
  mono: {
    face: 'mono',
    size: 13.5,
    lineHeight: 1.68,
    tracking: 0,
  },
  terse: {
    face: 'ui',
    size: 15,
    lineHeight: 1.5,
    tracking: -0.1,
  },
  plain: {
    face: 'ui',
    size: 15,
    lineHeight: 1.62,
    tracking: 0,
  },
} as const;

/** frontend-spec §6.3 / §1 rule 12 — prose measure, ch. No native analogue for `ch`; kept for parity. */
export const measure = {
  default: 64,
  idea: 58,
  argument: 44,
} as const;

/** frontend-spec §7.2 — viewport breakpoints, px. Web shells; kept for parity. */
export const breakpoint = {
  sm: 480,
  md: 780,
  lg: 1180,
} as const;

/** frontend-spec §7.1 — shell column widths, px. Web shells; kept for parity. */
export const shell = {
  railStart: 236,
  railEnd: 300,
  column: 720,
  columnPrivate: 640,
} as const;

/** frontend-spec §7.2 — container-query thresholds, px. Web-only; kept for parity. */
export const container = {
  sm: 480,
} as const;

/** frontend-spec §7.4 — the gutter initial’s leading (unitless). */
export const leadingInitial = 0.85;

/** frontend-spec §11 — skeleton shimmer cycle, ms. Idle loop, opacity only. */
export const shimmerDuration = 1400;

/** frontend-spec §9.1 — tooltip reveal delay, ms. */
export const tooltipDelay = 400;

/** frontend-spec §13 — minimum touch target, px, both axes — including native. */
export const touchTarget = 44;

/** frontend-spec §11 — sheet backdrop, absolute on purpose: never inverts with theme. */
export const sheetBackdrop = 'rgb(22 23 26/.32)';

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
