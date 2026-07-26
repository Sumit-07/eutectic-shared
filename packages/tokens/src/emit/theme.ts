/**
 * theme.ts — a standalone, dependency-free TypeScript module for native.
 *
 * Emitted rather than re-exported so `apps/native` can import it through Metro
 * without depending on this package's build order or on Node resolution.
 */
import { agentInks } from '../agent-inks.js';
import { colors } from '../palette.js';
import { dur, ease, radius, shadow, space, z } from '../scales.js';
import { GENERATED_SOURCE, GENERATED_WARNING } from '../tokens.js';
import type { SemanticColorName, ThemeName } from '../types.js';
import { agentInkNames, themeNames } from '../types.js';

function quote(value: string): string {
  return `'${value.replace(/'/g, "\\'")}'`;
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
    ...constBlock('space', space, '/** px */'),
    ...constBlock('radius', radius, '/** px */'),
    ...constBlock('shadow', shadow),
    ...constBlock('z', z),
    ...constBlock('dur', dur, '/** ms — nothing longer */'),
    ...constBlock('ease', ease),
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
