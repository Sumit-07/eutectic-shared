/**
 * tokens.json — the machine-readable artefact.
 *
 * Two consumers: Figma sync, and the contrast gate (frontend-spec §13 says the
 * CI script reads tokens.json, so the gate checks what actually ships rather
 * than what the TS source claims).
 */
import { agentInks } from '../agent-inks.js';
import { WCAG_AA_NORMAL } from '../contrast.js';
import { fontStacks } from '../fonts.js';
import { measure } from '../measure.js';
import { colors } from '../palette.js';
import { dur, ease, radius, shadow, space, z } from '../scales.js';
import { typeScale } from '../type-scale.js';
import { GENERATED_SOURCE, GENERATED_WARNING } from '../tokens.js';
import type {
  AgentInkName,
  FontStacks,
  Hex,
  Measure,
  SemanticColorName,
  SemanticColors,
  ThemeName,
  TypeScale,
  Voices,
  Weight,
} from '../types.js';
import { agentInkNames, themeNames } from '../types.js';
import { voices } from '../voices.js';
import { weight } from '../weight.js';

export interface TokensJsonTheme {
  colors: SemanticColors;
  agentInks: Record<AgentInkName, Hex>;
}

export interface TokensJson {
  $generated: string;
  $source: string;
  contrast: { standard: string; minRatio: number; foreground: string; background: string };
  themeNames: readonly ThemeName[];
  agentInkNames: readonly AgentInkName[];
  themes: Record<ThemeName, TokensJsonTheme>;
  space: Record<string, number>;
  radius: Record<string, number>;
  shadow: Record<string, string>;
  z: Record<string, number>;
  dur: Record<string, number>;
  ease: Record<string, string>;
  fontStacks: FontStacks;
  typeScale: TypeScale;
  voices: Voices;
  weight: Weight;
  measure: Measure;
}

function themeEntry(theme: ThemeName): TokensJsonTheme {
  const semantic = {} as SemanticColors;
  for (const name of Object.keys(colors[theme]) as SemanticColorName[]) {
    semantic[name] = colors[theme][name];
  }
  const inks = {} as Record<AgentInkName, Hex>;
  for (const name of agentInkNames) {
    inks[name] = agentInks[name][theme];
  }
  return { colors: semantic, agentInks: inks };
}

export function buildTokensJson(): TokensJson {
  return {
    $generated: GENERATED_WARNING,
    $source: GENERATED_SOURCE,
    contrast: {
      standard: 'WCAG 2.2 AA, normal text',
      minRatio: WCAG_AA_NORMAL,
      foreground: 'themes.<theme>.agentInks.*',
      background: 'themes.<theme>.colors.paper',
    },
    themeNames,
    agentInkNames,
    themes: { light: themeEntry('light'), dark: themeEntry('dark') },
    space,
    radius,
    shadow,
    z,
    dur,
    ease,
    fontStacks,
    typeScale,
    voices,
    weight,
    measure,
  };
}

export function renderTokensJson(): string {
  return `${JSON.stringify(buildTokensJson(), null, 2)}\n`;
}
