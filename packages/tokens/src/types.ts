/**
 * Token type vocabulary.
 *
 * These types describe the shape of the design system; the values themselves
 * live in `palette.ts`, `agent-inks.ts` and `scales.ts` and are normative in
 * `frontend-spec.md` §5. Nothing in this package may hold a value outside
 * `src/*.ts` — the CSS/TS/JSON artefacts are build outputs.
 */

/** A 6-digit sRGB hex string, e.g. `#FCFCFA`. */
export type Hex = `#${string}`;

export type ThemeName = 'light' | 'dark';

export const themeNames: readonly ThemeName[] = ['light', 'dark'] as const;

/** frontend-spec §5.1 / §5.3 — surfaces and ink, one set per theme. */
export type SemanticColorName =
  | 'paper'
  | 'paperRaise'
  | 'paperSink'
  | 'paperHover'
  | 'rule'
  | 'ruleStrong'
  | 'ruleSoft'
  | 'ink'
  | 'inkSoft'
  | 'inkQuiet'
  | 'inkFaint'
  | 'positive'
  | 'negative'
  | 'caution'
  | 'focus';

export type SemanticColors = Record<SemanticColorName, Hex>;

/**
 * frontend-spec §5.2 — agent inks are keyed by token NAME.
 * The API sends `agent.ink` as one of these names, never a hex; a new agent
 * must not require a client release.
 */
export type AgentInkName =
  | 'bricklayer'
  | 'ledger'
  | 'marguerite'
  | 'sprout'
  | 'grouse'
  | 'vellum'
  | 'neutral';

export const agentInkNames: readonly AgentInkName[] = [
  'bricklayer',
  'ledger',
  'marguerite',
  'sprout',
  'grouse',
  'vellum',
  'neutral',
] as const;

/** Both variants are required — contrast is verified in both themes. */
export type AgentInkPair = Record<ThemeName, Hex>;

export type AgentInks = Record<AgentInkName, AgentInkPair>;

/** frontend-spec §5.4 — space, radius, shadow, z, motion. */
export type SpaceStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
/** Values are px. */
export type Space = Record<SpaceStep, number>;

export type RadiusName = 'none' | 'sm' | 'md' | 'full';
/** Values are px. */
export type Radius = Record<RadiusName, number>;

export type ShadowName = 'sheet' | 'pop' | 'inset';
export type Shadow = Record<ShadowName, string>;

export type ZName = 'sticky' | 'pill' | 'sheet' | 'toast';
export type Z = Record<ZName, number>;

export type DurStep = 1 | 2 | 3;
/** Values are ms. Nothing longer than `dur[3]`. */
export type Dur = Record<DurStep, number>;

export type EaseName = 'out' | 'inOut';
export type Ease = Record<EaseName, string>;

/** A theme flattened for a single mode — the shape native consumes. */
export interface ResolvedTheme extends SemanticColors {
  agentInk: Record<AgentInkName, Hex>;
}
