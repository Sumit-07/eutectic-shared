/**
 * @eutectic/tokens — the single source of truth for every design value.
 *
 * Normative spec: frontend-spec.md §5. Values live in `src/*.ts` only; the
 * files under `generated/` are build outputs and are never hand-edited.
 *
 * Web consumes `@eutectic/tokens/tokens.css`; native consumes
 * `@eutectic/tokens/theme`; tooling and the contrast gate consume
 * `@eutectic/tokens/tokens.json`. This entry point exists for TypeScript
 * consumers that need the model itself.
 *
 * No barrel re-exports (`export *`) — every symbol is named here on purpose.
 */
export type {
  AgentInkName,
  AgentInkPair,
  AgentInks,
  Dur,
  DurStep,
  Ease,
  EaseName,
  Hex,
  Radius,
  RadiusName,
  ResolvedTheme,
  SemanticColorName,
  SemanticColors,
  Shadow,
  ShadowName,
  Space,
  SpaceStep,
  ThemeName,
  Z,
  ZName,
} from './types.js';
export { agentInkNames, themeNames } from './types.js';

export { colors, darkColors, lightColors } from './palette.js';
export { agentInk, agentInks } from './agent-inks.js';
export { dur, ease, radius, shadow, space, z } from './scales.js';
export { kebab, resolveTheme, themes, tokens } from './tokens.js';

export {
  WCAG_AA_LARGE,
  WCAG_AA_NORMAL,
  contrastRatio,
  meetsContrast,
  parseHex,
  relativeLuminance,
} from './contrast.js';

export type { TokensJson, TokensJsonTheme } from './emit/json.js';
export { buildTokensJson } from './emit/json.js';
export type { ContrastResult } from './report.js';
export { checkAgentInkContrast, formatContrastTable } from './report.js';
