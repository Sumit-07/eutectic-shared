/**
 * The assembled token model — one object, three artefacts.
 *
 * Everything downstream (tokens.css, theme.ts, tokens.json, the contrast gate)
 * is derived from this. Adding a token means adding it to `palette.ts`,
 * `agent-inks.ts` or `scales.ts`; nothing else needs to change.
 */
import { agentInks } from './agent-inks.js';
import { colors } from './palette.js';
import { dur, ease, radius, shadow, space, z } from './scales.js';
import type {
  AgentInkName,
  Hex,
  ResolvedTheme,
  ThemeName,
} from './types.js';
import { agentInkNames, themeNames } from './types.js';

/** Flatten one theme into the shape native consumes. */
export function resolveTheme(theme: ThemeName): ResolvedTheme {
  const inks = {} as Record<AgentInkName, Hex>;
  for (const name of agentInkNames) {
    inks[name] = agentInks[name][theme];
  }
  return { ...colors[theme], agentInk: inks };
}

export const themes: Record<ThemeName, ResolvedTheme> = {
  light: resolveTheme('light'),
  dark: resolveTheme('dark'),
};

/** The whole system, in declaration order. Artefact emitters walk this. */
export const tokens = {
  themeNames,
  agentInkNames,
  colors,
  agentInks,
  space,
  radius,
  shadow,
  z,
  dur,
  ease,
} as const;

/** `paperRaise` → `paper-raise`. Used for every emitted CSS custom property. */
export function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Provenance banner stamped onto every generated artefact.
 * `commentOpen`/`commentClose` differ per format.
 */
export const GENERATED_BY = '@eutectic/tokens';
export const GENERATED_SOURCE = 'packages/tokens/src/*.ts (frontend-spec.md §5)';
export const GENERATED_WARNING =
  'GENERATED FILE — do not edit. Run `pnpm --filter @eutectic/tokens build`.';
