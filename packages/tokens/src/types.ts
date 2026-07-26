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

/**
 * frontend-spec §6.1 — the three faces. Every type-scale entry and voice
 * names its face; the actual stacks live in `fonts.ts`.
 */
export type FaceRole = 'prose' | 'ui' | 'mono';
export type FontStacks = Record<FaceRole, string>;

/** frontend-spec §6.3 — the ten-step type scale, verbatim. */
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

export const typeScaleNames: readonly TypeScaleName[] = [
  'display',
  'title',
  'head',
  'idea',
  'bodySerif',
  'body',
  'bodyMono',
  'label',
  'meta',
  'micro',
] as const;

export interface TypeScaleEntry {
  /** px, as authored in frontend-spec §6.3. Web output converts to rem (÷16). */
  size: number;
  /** unitless multiplier. */
  lineHeight: number;
  face: FaceRole;
}

export type TypeScale = Record<TypeScaleName, TypeScaleEntry>;

/**
 * frontend-spec §6.2 — the four agent voices. `agent.voice` is DATA from the
 * API (the name → voice assignment); this package only defines what each
 * voice name renders as.
 */
export type VoiceName = 'serif' | 'mono' | 'terse' | 'plain';

export const voiceNames: readonly VoiceName[] = ['serif', 'mono', 'terse', 'plain'] as const;

export interface Voice {
  face: FaceRole;
  /** px. */
  size: number;
  /** unitless multiplier. */
  lineHeight: number;
  /** px. Zero for every voice except `terse`, which is exactly −0.1px. */
  tracking: number;
}

export type Voices = Record<VoiceName, Voice>;

/**
 * frontend-spec §6.3 — "400 prose; 400/500 UI; 600 only for names and
 * buttons. Never 700+." `emphasis` is the deliberately scoped name for 600 —
 * nothing in this package maps a 700.
 */
export type WeightName = 'regular' | 'medium' | 'emphasis';

export const weightNames: readonly WeightName[] = ['regular', 'medium', 'emphasis'] as const;

export type Weight = Record<WeightName, number>;

/**
 * frontend-spec §6.3 / §1 rule 12 — prose measure, in `ch`. Web-only concept
 * (no native analogue for the `ch` unit); kept here anyway as the single
 * source, per FE §3's "single source, three outputs".
 */
export type MeasureName = 'default' | 'idea' | 'argument';

export const measureNames: readonly MeasureName[] = ['default', 'idea', 'argument'] as const;

export type Measure = Record<MeasureName, number>;
