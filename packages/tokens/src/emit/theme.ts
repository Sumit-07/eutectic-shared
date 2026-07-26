/**
 * theme.ts — a standalone, dependency-free TypeScript module for native.
 *
 * Emitted rather than re-exported so `apps/native` can import it through Metro
 * without depending on this package's build order or on Node resolution.
 */
import { agentInks } from '../agent-inks.js';
import { fontStacks } from '../fonts.js';
import { measure } from '../measure.js';
import { colors } from '../palette.js';
import { dur, ease, radius, shadow, space, z } from '../scales.js';
import { typeScale } from '../type-scale.js';
import { GENERATED_SOURCE, GENERATED_WARNING } from '../tokens.js';
import type { SemanticColorName, ThemeName } from '../types.js';
import {
  agentInkNames,
  measureNames,
  themeNames,
  typeScaleNames,
  voiceNames,
} from '../types.js';
import { voices } from '../voices.js';
import { weight } from '../weight.js';

function quote(value: string): string {
  return `'${value.replace(/'/g, "\\'")}'`;
}

/** One flat scalar value, rendered as a TS literal. */
function scalar(value: string | number): string {
  return typeof value === 'number' ? String(value) : quote(value);
}

/** `{ a: 1, b: 'x' }` rendered as an indented TS object literal (one level deep). */
function objectLiteral(record: Record<string, string | number>, indent: string): string {
  const entries = Object.entries(record)
    .map(([key, value]) => `${indent}  ${key}: ${scalar(value)},`)
    .join('\n');
  return `{\n${entries}\n${indent}}`;
}

/** A const of one-level-nested scalar objects — same shape as the existing `constBlock`. */
function nestedConstBlock<T extends Record<string, string | number>>(
  name: string,
  record: Record<string, T>,
  doc?: string,
): string[] {
  const lines: string[] = [];
  if (doc) lines.push(doc);
  lines.push(`export const ${name} = {`);
  for (const [key, value] of Object.entries(record)) {
    lines.push(`  ${key}: ${objectLiteral(value, '  ')},`);
  }
  lines.push('} as const;', '');
  return lines;
}

function literalRecord(
  entries: readonly (readonly [string, string | number])[],
  indent: string,
): string {
  return entries
    .map(([name, value]) => {
      const rendered = typeof value === 'number' ? String(value) : quote(value);
      return `${indent}${name}: ${rendered},`;
    })
    .join('\n');
}

function constBlock(
  name: string,
  record: Record<string, string | number>,
  doc?: string,
): string[] {
  const lines: string[] = [];
  if (doc) lines.push(doc);
  lines.push(
    `export const ${name} = {`,
    literalRecord(Object.entries(record), '  '),
    '} as const;',
    '',
  );
  return lines;
}

function themeLiteral(theme: ThemeName): string {
  const semantic = literalRecord(
    (Object.keys(colors[theme]) as SemanticColorName[]).map(
      (name) => [name, colors[theme][name]] as const,
    ),
    '    ',
  );
  const inks = literalRecord(
    agentInkNames.map((name) => [name, agentInks[name][theme]] as const),
    '      ',
  );
  return [
    `  ${theme}: {`,
    semantic,
    '    agentInk: {',
    inks,
    '    },',
    '  },',
  ].join('\n');
}

export function renderThemeTs(): string {
  return [
    '/*',
    ` * ${GENERATED_WARNING}`,
    ` * Source: ${GENERATED_SOURCE}`,
    ' */',
    '',
    `export type ThemeName = ${themeNames.map(quote).join(' | ')};`,
    '',
    'export type AgentInkName =',
    `${agentInkNames.map((name) => `  | ${quote(name)}`).join('\n')};`,
    '',
    `export type FaceRole = ${(['prose', 'ui', 'mono'] as const).map(quote).join(' | ')};`,
    '',
    `export type TypeScaleName =`,
    `${typeScaleNames.map((name) => `  | ${quote(name)}`).join('\n')};`,
    '',
    `export type VoiceName = ${voiceNames.map(quote).join(' | ')};`,
    '',
    `export type WeightName = ${(['regular', 'medium', 'emphasis'] as const).map(quote).join(' | ')};`,
    '',
    `export type MeasureName = ${measureNames.map(quote).join(' | ')};`,
    '',
    ...constBlock('space', space, '/** px */'),
    ...constBlock('radius', radius, '/** px */'),
    ...constBlock('shadow', shadow),
    ...constBlock('z', z),
    ...constBlock('dur', dur, '/** ms — nothing longer */'),
    ...constBlock('ease', ease),
    ...constBlock(
      'fontStacks',
      fontStacks,
      '/** frontend-spec §6.1. Self-hosted face + fallback stack; primary face added by M0-FE-02. */',
    ),
    ...constBlock(
      'weight',
      weight,
      '/** frontend-spec §6.3 — 400/500 general use; `emphasis` (600) is names/buttons only, never 700+. */',
    ),
    ...nestedConstBlock(
      'typeScale',
      typeScale,
      '/** frontend-spec §6.3 — px, raw (native keeps px; web converts to rem). */',
    ),
    ...nestedConstBlock(
      'voices',
      voices,
      '/** frontend-spec §6.2 — the four agent voices. `agent.voice` is DATA from the API. */',
    ),
    ...constBlock(
      'measure',
      measure,
      '/** frontend-spec §6.3 / §1 rule 12 — prose measure, ch. No native analogue for `ch`; kept for parity. */',
    ),
    '/** Surfaces, ink and agent inks, resolved per theme. */',
    'export const themes = {',
    ...themeNames.map((name) => themeLiteral(name)),
    '} as const;',
    '',
    'export type Theme = (typeof themes)[ThemeName];',
    '',
    'export function theme(name: ThemeName): Theme {',
    '  return themes[name];',
    '}',
    '',
    '/** Agent inks are addressed by token name, never by hex. */',
    'export function agentInk(name: AgentInkName, themeName: ThemeName): string {',
    '  return themes[themeName].agentInk[name];',
    '}',
    '',
  ].join('\n');
}
