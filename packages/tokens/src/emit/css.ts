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
import { fontStacks } from '../fonts.js';
import { sheetBackdrop, shimmerDuration, tooltipDelay, touchTarget } from '../interaction.js';
import { breakpoint, container, shell } from '../layout.js';
import { measure } from '../measure.js';
import { colors } from '../palette.js';
import { dur, ease, radius, shadow, space, z } from '../scales.js';
import { leadingInitial, typeScale } from '../type-scale.js';
import { GENERATED_SOURCE, GENERATED_WARNING, kebab } from '../tokens.js';
import type { FaceRole, SemanticColorName, ThemeName } from '../types.js';
import { agentInkNames, measureNames, typeScaleNames, voiceNames } from '../types.js';
import { voices } from '../voices.js';
import { weight } from '../weight.js';

const VAR = '--eu-';

function decl(name: string, value: string | number, indent = '    '): string {
  return `${indent}${name}: ${value};`;
}

/** px → rem, ÷16. Every §6.3 size is a decimal multiple of 0.5, so this is exact. */
function rem(px: number): string {
  return `${px / 16}rem`;
}

/** `measure`'s bare/default entry has no name suffix: `measure`, not `measure-default`. */
function measureSuffix(name: string): string {
  return name === 'default' ? '' : `-${kebab(name)}`;
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
  lines.push('', '    /* frontend-spec §6.1 — font stacks (face self-hosted by M0-FE-02) */');
  for (const [role, stack] of Object.entries(fontStacks)) {
    lines.push(decl(`${VAR}font-${kebab(role)}`, stack));
  }
  lines.push(
    '',
    '    /* frontend-spec §6.3 — weight; emphasis (600) is names/buttons only, never 700+ */',
  );
  for (const [name, value] of Object.entries(weight)) {
    lines.push(decl(`${VAR}weight-${kebab(name)}`, value));
  }
  lines.push('', '    /* frontend-spec §6.3 — type scale, rem (px source ÷16) */');
  for (const name of typeScaleNames) {
    const entry = typeScale[name];
    lines.push(decl(`${VAR}text-${kebab(name)}-size`, rem(entry.size)));
    lines.push(decl(`${VAR}text-${kebab(name)}-line-height`, entry.lineHeight));
  }
  lines.push(
    '',
    '    /* frontend-spec §6.2 — voices: composite family (via font-*) + size + lineHeight + tracking */',
  );
  for (const name of voiceNames) {
    const voice = voices[name];
    lines.push(decl(`${VAR}voice-${name}-size`, rem(voice.size)));
    lines.push(decl(`${VAR}voice-${name}-line-height`, voice.lineHeight));
    lines.push(decl(`${VAR}voice-${name}-tracking`, `${voice.tracking}px`));
  }
  lines.push('', '    /* frontend-spec §6.3 / §1 rule 12 — prose measure, ch */');
  for (const name of measureNames) {
    lines.push(decl(`${VAR}measure${measureSuffix(name)}`, `${measure[name]}ch`));
  }
  lines.push('', '    /* frontend-spec §7.1 — shell columns: rails 236/300, centre 720, private 640 */');
  for (const [name, px] of Object.entries(shell)) {
    lines.push(decl(`${VAR}shell-${kebab(name)}`, `${px}px`));
  }
  lines.push(
    '',
    '    /* frontend-spec §7.4 — the gutter initial’s leading; the one value below 1 */',
  );
  lines.push(decl(`${VAR}leading-initial`, leadingInitial));
  lines.push(
    '',
    '    /* frontend-spec §9.1 / §11 / §13 — interaction constants outside the §5.4 scales */',
  );
  lines.push(decl(`${VAR}shimmer-duration`, `${shimmerDuration / 1000}s`));
  lines.push(decl(`${VAR}sheet-backdrop`, sheetBackdrop));
  lines.push(decl(`${VAR}tooltip-delay`, `${tooltipDelay}ms`));
  lines.push(decl(`${VAR}touch-target`, `${touchTarget}px`));
  lines.push('  }');
  return lines.join('\n');
}

/**
 * Breakpoints, container thresholds and the shimmer animation live in a plain
 * `@theme` (not `@theme inline`, no `--eu-` indirection for the widths): a
 * media or container query condition cannot contain `var()`, so Tailwind must
 * see these as literals to build `sm:`/`md:`/`lg:` and `@eu-sm:` variants.
 */
function shellThemeBlock(): string {
  const lines: string[] = ['@theme {'];
  lines.push('  /* frontend-spec §7.2 — 480/780/1180. Tailwind’s own 640/768/1024/1280/1536');
  lines.push('     scale is not this product’s scale, so the defaults are cleared rather than');
  lines.push('     shadowed: an off-spec `xl:`/`2xl:` variant must not silently compile. Base');
  lines.push('     declarations are xs (<480); media queries are for shells only. */');
  lines.push(decl('--breakpoint-*', 'initial', '  '));
  for (const [name, px] of Object.entries(breakpoint)) {
    lines.push(decl(`--breakpoint-${kebab(name)}`, `${px}px`, '  '));
  }
  lines.push('');
  lines.push('  /* frontend-spec §7.2 — the same thresholds measured against the component’s');
  lines.push('     own column: components use container queries, only shells use media');
  lines.push('     queries. Prefixed `eu-` because Tailwind’s default `--container-*` scale');
  lines.push('     also backs `max-w-*`. */');
  for (const [name, px] of Object.entries(container)) {
    lines.push(decl(`--container-eu-${kebab(name)}`, `${px}px`, '  '));
  }
  lines.push('');
  lines.push('  /* frontend-spec §11 — "Skeleton | 1.4s linear shimmer, static under');
  lines.push('     reduced-motion". Opacity only — gradients are banned (CLAUDE.md §4).');
  lines.push('     "Static under reduced-motion" is the caller’s `motion-safe:` variant. */');
  lines.push(decl('--animate-shimmer', `eu-shimmer var(${VAR}shimmer-duration) linear infinite`, '  '));
  lines.push('');
  lines.push('  @keyframes eu-shimmer {');
  lines.push('    /* Trough is an animation depth, not a surface value. */');
  lines.push('    0%,');
  lines.push('    100% {');
  lines.push('      opacity: 1;');
  lines.push('    }');
  lines.push('    50% {');
  lines.push('      opacity: 0.5;');
  lines.push('    }');
  lines.push('  }');
  lines.push('}');
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
  lines.push('');
  lines.push('  /* frontend-spec §6.1 — font-prose/ui/mono utilities */');
  for (const role of Object.keys(fontStacks) as FaceRole[]) {
    lines.push(decl(`--font-${kebab(role)}`, `var(${VAR}font-${kebab(role)})`, '  '));
  }
  lines.push('');
  lines.push('  /* frontend-spec §6.3 — weight; emphasis (600) is names/buttons only */');
  for (const name of Object.keys(weight)) {
    lines.push(decl(`--font-weight-${kebab(name)}`, `var(${VAR}weight-${kebab(name)})`, '  '));
  }
  lines.push('');
  lines.push('  /* frontend-spec §6.3 — text-display…text-micro (size + line-height paired) */');
  for (const name of typeScaleNames) {
    lines.push(decl(`--text-${kebab(name)}`, `var(${VAR}text-${kebab(name)}-size)`, '  '));
    lines.push(
      decl(`--text-${kebab(name)}--line-height`, `var(${VAR}text-${kebab(name)}-line-height)`, '  '),
    );
  }
  lines.push('');
  lines.push('  /* frontend-spec §7.4 — leading-initial, the gutter initial’s .85 */');
  lines.push(decl('--leading-initial', `var(${VAR}leading-initial)`, '  '));
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
  // frontend-spec §6.2 — composite voice utilities. Tailwind v4 has no
  // namespace for "family+size+lineHeight+tracking together", so this is the
  // same shape as the z/dur utilities above (CLAUDE.md rule 2).
  for (const name of voiceNames) {
    const voice = voices[name];
    lines.push(
      `@utility voice-${name} {`,
      `  font-family: var(${VAR}font-${kebab(voice.face)});`,
      `  font-size: var(${VAR}voice-${name}-size);`,
      `  line-height: var(${VAR}voice-${name}-line-height);`,
      `  letter-spacing: var(${VAR}voice-${name}-tracking);`,
      '}',
    );
  }
  // frontend-spec §6.3 / §1 rule 12 — prose measure. Retires D-012's local
  // `@utility measure` in apps/web (deletion happens in M0-FE-02).
  for (const name of measureNames) {
    lines.push(
      `@utility measure${measureSuffix(name)} {`,
      `  max-inline-size: var(${VAR}measure${measureSuffix(name)});`,
      '}',
    );
  }
  // frontend-spec §7.1 — shell grids and column caps (M0-SH-13; retires the
  // local-tokens block in apps/web). Tailwind has no theme namespace for
  // explicit grid tracks, so these are the same D-010 @utility shape.
  lines.push(
    '@utility shell-grid-3 {',
    `  grid-template-columns: var(${VAR}shell-rail-start) minmax(0, 1fr) var(${VAR}shell-rail-end);`,
    '}',
  );
  // §7.2 md — the right rail is gone; the remaining tracks keep their widths
  // so the centre column does not jump when the rail drops.
  lines.push(
    '@utility shell-grid-2 {',
    `  grid-template-columns: var(${VAR}shell-rail-start) minmax(0, 1fr);`,
    '}',
  );
  lines.push(
    '@utility shell-column {',
    `  max-inline-size: var(${VAR}shell-column);`,
    '}',
  );
  lines.push(
    '@utility shell-column-private {',
    `  max-inline-size: var(${VAR}shell-column-private);`,
    '}',
  );
  // §11's sheet backdrop, reachable through Tailwind's `backdrop:` variant so
  // the value stays in tokens and the component only names it.
  lines.push(
    '@utility sheet-backdrop {',
    `  background-color: var(${VAR}sheet-backdrop);`,
    '}',
  );
  // §9.1's 400ms tooltip delay — reveal state only; the base state keeps a 0
  // delay so a tooltip disappears the moment pointer or focus leaves.
  lines.push(
    '@utility delay-tooltip {',
    `  transition-delay: var(${VAR}tooltip-delay);`,
    '}',
  );
  // §13's 44×44 minimum, logical so it survives a writing-mode change.
  lines.push(
    '@utility touch-target {',
    `  min-inline-size: var(${VAR}touch-target);`,
    `  min-block-size: var(${VAR}touch-target);`,
    '}',
  );
  // One line box of whatever type scale is in effect. Not a token — `lh` is a
  // CSS unit Tailwind has no namespace for — but it is what makes a Skeleton
  // exactly as tall as the text it stands in for (§14 CLS ≤ 0.02).
  lines.push('@utility block-lh {', '  block-size: 1lh;', '}');
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
    '/* Query-side values — literals by necessity (M0-SH-13). */',
    shellThemeBlock(),
    '',
    '/* Tailwind has no z-index or duration theme namespace. These exist so §5.4',
    '   is reachable without an arbitrary value (CLAUDE.md rule 2). */',
    utilityBlock(),
    '',
  ].join('\n');
}
