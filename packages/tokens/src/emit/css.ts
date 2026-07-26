/**
 * tokens.css — CSS custom properties per theme, plus a Tailwind v4 binding.
 *
 * Two layers of naming, on purpose:
 *   `--eu-*`      raw values. Plain CSS, Storybook, anything without Tailwind.
 *   `@theme inline` maps them onto Tailwind's namespaces so utilities resolve
 *                 through the var — a theme switch is a cascade change, never a
 *                 rebuild.
 * The `--eu-` prefix exists so raw names cannot collide with Tailwind's own
 * `--radius-*`, `--shadow-*`, `--ease-*` namespaces.
 */
import { agentInks } from '../agent-inks.js';
import { colors } from '../palette.js';
import { dur, ease, radius, shadow, space, z } from '../scales.js';
import { GENERATED_SOURCE, GENERATED_WARNING, kebab } from '../tokens.js';
import type { SemanticColorName, ThemeName } from '../types.js';
import { agentInkNames } from '../types.js';

const VAR = '--eu-';

function decl(name: string, value: string | number, indent = '    '): string {
  return `${indent}${name}: ${value};`;
}

function semanticDecls(theme: ThemeName): string[] {
  const set = colors[theme];
  return (Object.keys(set) as SemanticColorName[]).map((name) =>
    decl(`${VAR}${kebab(name)}`, set[name]),
  );
}

function agentInkDecls(theme: ThemeName): string[] {
  return agentInkNames.map((name) =>
    decl(`${VAR}agent-${name}`, agentInks[name][theme]),
  );
}

function themeBlock(theme: ThemeName, selector: string): string {
  return [
    `  ${selector} {`,
    decl('color-scheme', theme),
    '',
    '    /* frontend-spec §5.1 / §5.3 — surfaces and ink */',
    ...semanticDecls(theme),
    '',
    '    /* frontend-spec §5.2 — agent inks, addressed by token name */',
    ...agentInkDecls(theme),
    '  }',
  ].join('\n');
}

function scaleBlock(): string {
  const lines: string[] = ['  :root {', '    /* frontend-spec §5.4 — space (px) */'];
  for (const [step, px] of Object.entries(space)) {
    lines.push(decl(`${VAR}space-${step}`, `${px}px`));
  }
  lines.push('', '    /* radius (px) */');
  for (const [name, px] of Object.entries(radius)) {
    lines.push(decl(`${VAR}radius-${kebab(name)}`, `${px}px`));
  }
  lines.push('', '    /* shadow */');
  for (const [name, value] of Object.entries(shadow)) {
    lines.push(decl(`${VAR}shadow-${kebab(name)}`, value));
  }
  lines.push('', '    /* z */');
  for (const [name, value] of Object.entries(z)) {
    lines.push(decl(`${VAR}z-${kebab(name)}`, value));
  }
  lines.push('', '    /* motion — ms, nothing longer than dur-3; no springs */');
  for (const [step, ms] of Object.entries(dur)) {
    lines.push(decl(`${VAR}dur-${step}`, `${ms}ms`));
  }
  for (const [name, value] of Object.entries(ease)) {
    lines.push(decl(`${VAR}ease-${kebab(name)}`, value));
  }
  lines.push('  }');
  return lines.join('\n');
}

function tailwindThemeBlock(): string {
  const lines: string[] = ['@theme inline {'];
  lines.push('  /* colours — utilities follow [data-theme] through the var */');
  for (const name of Object.keys(colors.light) as SemanticColorName[]) {
    lines.push(decl(`--color-${kebab(name)}`, `var(${VAR}${kebab(name)})`, '  '));
  }
  for (const name of agentInkNames) {
    lines.push(decl(`--color-agent-${name}`, `var(${VAR}agent-${name})`, '  '));
  }
  lines.push('');
  lines.push('  /* spacing — p-4, gap-4, m-4 … resolve to the §5.4 scale */');
  for (const step of Object.keys(space)) {
    lines.push(decl(`--spacing-${step}`, `var(${VAR}space-${step})`, '  '));
  }
  lines.push('');
  for (const name of Object.keys(radius)) {
    lines.push(decl(`--radius-${kebab(name)}`, `var(${VAR}radius-${kebab(name)})`, '  '));
  }
  lines.push('');
  for (const name of Object.keys(shadow)) {
    lines.push(decl(`--shadow-${kebab(name)}`, `var(${VAR}shadow-${kebab(name)})`, '  '));
  }
  lines.push('');
  for (const name of Object.keys(ease)) {
    lines.push(decl(`--ease-${kebab(name)}`, `var(${VAR}ease-${kebab(name)})`, '  '));
  }
  lines.push('}');
  return lines.join('\n');
}

function utilityBlock(): string {
  const lines: string[] = [];
  for (const name of Object.keys(z)) {
    lines.push(`@utility z-${kebab(name)} {`, `  z-index: var(${VAR}z-${kebab(name)});`, '}');
  }
  for (const step of Object.keys(dur)) {
    lines.push(
      `@utility dur-${step} {`,
      `  transition-duration: var(${VAR}dur-${step});`,
      '}',
    );
  }
  return lines.join('\n');
}

export function renderTokensCss(): string {
  return [
    '/*',
    ` * ${GENERATED_WARNING}`,
    ` * Source: ${GENERATED_SOURCE}`,
    ' */',
    '',
    '/* frontend-spec §4.2 — cascade layer order. */',
    '@layer reset, tokens, base, components, utilities;',
    '',
    '@layer tokens {',
    scaleBlock(),
    '',
    themeBlock('light', ":root,\n  [data-theme='light']"),
    '',
    themeBlock('dark', "[data-theme='dark']"),
    '}',
    '',
    '/* Tailwind v4 binding. `inline` keeps the var reference in the utility. */',
    tailwindThemeBlock(),
    '',
    '/* Tailwind has no z-index or duration theme namespace. These exist so §5.4',
    '   is reachable without an arbitrary value (CLAUDE.md rule 2). */',
    utilityBlock(),
    '',
  ].join('\n');
}
