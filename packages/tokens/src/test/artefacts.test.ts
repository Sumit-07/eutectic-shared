/**
 * The generated artefacts must be exactly what src renders today.
 *
 * Round-trip rather than golden-file: the emitters are pure, so re-rendering
 * and comparing catches both a stale artefact and a hand-edit, without a second
 * copy of every value to keep in step.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { artefactUrl, artefacts } from '../artefacts.js';
import { agentInks } from '../agent-inks.js';
import { fontStacks } from '../fonts.js';
import { sheetBackdrop, shimmerDuration, tooltipDelay, touchTarget } from '../interaction.js';
import { breakpoint, shell } from '../layout.js';
import { measure } from '../measure.js';
import { colors } from '../palette.js';
import { leadingInitial, typeScale } from '../type-scale.js';
import {
  agentInkNames,
  measureNames,
  themeNames,
  typeScaleNames,
  voiceNames,
} from '../types.js';
import { voices } from '../voices.js';
import { weight } from '../weight.js';

for (const artefact of artefacts) {
  test(`${artefact.file} is in sync with src`, async () => {
    const onDisk = await readFile(artefactUrl(artefact.file), 'utf8');
    assert.equal(
      onDisk,
      artefact.render(),
      `${artefact.file} is stale or hand-edited. Run: pnpm --filter @eutectic/tokens build`,
    );
  });
}

test('every agent ink reaches all three artefacts, in both themes', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  const themeTs = await readFile(artefactUrl('generated/theme.ts'), 'utf8');
  const json = await readFile(artefactUrl('generated/tokens.json'), 'utf8');

  for (const name of agentInkNames) {
    assert.match(css, new RegExp(`--eu-agent-${name}:`), `tokens.css lacks ${name}`);
    assert.match(css, new RegExp(`--color-agent-${name}:`), `@theme lacks ${name}`);
    assert.match(themeTs, new RegExp(`\\b${name}:`), `theme.ts lacks ${name}`);
    for (const theme of themeNames) {
      const hex = agentInks[name][theme];
      assert.ok(css.includes(hex), `tokens.css lacks ${name}.${theme} (${hex})`);
      assert.ok(themeTs.includes(hex), `theme.ts lacks ${name}.${theme} (${hex})`);
      assert.ok(json.includes(hex), `tokens.json lacks ${name}.${theme} (${hex})`);
    }
  }
});

test('agent inks are addressable by token name, never by hex', async () => {
  const themeTs = await readFile(artefactUrl('generated/theme.ts'), 'utf8');
  // The native helper takes a name and a theme; consumers never see a hex.
  assert.match(themeTs, /export function agentInk\(name: AgentInkName, themeName: ThemeName\)/);
  assert.match(themeTs, /export type AgentInkName =/);
});

test('every semantic colour reaches tokens.css in both themes', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  for (const theme of themeNames) {
    for (const hex of Object.values(colors[theme])) {
      assert.ok(css.includes(hex), `tokens.css lacks ${theme} ${hex}`);
    }
  }
});

// M0-SH-09 — type scale, font stacks, voices, weight, measure.

test('font stacks (prose/ui/mono) reach all three artefacts, §6.1 fallbacks verbatim', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  const themeTs = await readFile(artefactUrl('generated/theme.ts'), 'utf8');
  const json = await readFile(artefactUrl('generated/tokens.json'), 'utf8');

  for (const [role, stack] of Object.entries(fontStacks)) {
    assert.match(css, new RegExp(`--eu-font-${role}:`), `tokens.css lacks --eu-font-${role}`);
    assert.match(css, new RegExp(`--font-${role}: var\\(--eu-font-${role}\\)`), `@theme lacks font-${role}`);
    // CSS and JSON carry the stack as an unescaped string; theme.ts (a TS
    // source literal) backslash-escapes the single quotes the stack contains,
    // so compare against that form there instead of the raw stack.
    const themeTsEscaped = stack.replace(/'/g, "\\'");
    assert.ok(css.includes(stack), `tokens.css lacks the ${role} stack verbatim`);
    assert.ok(themeTs.includes(themeTsEscaped), `theme.ts lacks the ${role} stack (escaped for a TS string literal)`);
    assert.ok(json.includes(stack), `tokens.json lacks the ${role} stack verbatim`);
  }
});

test('type scale reaches text-display…text-micro (Tailwind), rem on web, raw px on native', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  const themeTs = await readFile(artefactUrl('generated/theme.ts'), 'utf8');
  const json = await readFile(artefactUrl('generated/tokens.json'), 'utf8');

  for (const name of typeScaleNames) {
    const entry = typeScale[name];
    assert.match(css, new RegExp(`--text-${name === 'bodySerif' ? 'body-serif' : name === 'bodyMono' ? 'body-mono' : name}: var\\(`), `@theme lacks text-${name}`);
    assert.match(
      css,
      new RegExp(`--text-${name === 'bodySerif' ? 'body-serif' : name === 'bodyMono' ? 'body-mono' : name}--line-height: var\\(`),
      `@theme lacks text-${name}'s paired line-height`,
    );
    // rem = px ÷ 16, exact for every §6.3 size.
    assert.ok(css.includes(`${entry.size / 16}rem`), `tokens.css lacks ${name} at ${entry.size / 16}rem`);
    assert.ok(themeTs.includes(`size: ${entry.size},`), `theme.ts lacks raw px ${entry.size} for ${name}`);
    assert.ok(json.includes(`"size": ${entry.size},`), `tokens.json lacks raw px ${entry.size} for ${name}`);
  }
});

test('voices are composite (family+size+lineHeight+tracking); terse tracking is exactly −0.1px', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  const themeTs = await readFile(artefactUrl('generated/theme.ts'), 'utf8');
  const json = await readFile(artefactUrl('generated/tokens.json'), 'utf8');

  for (const name of voiceNames) {
    assert.match(css, new RegExp(`@utility voice-${name} \\{`), `tokens.css lacks @utility voice-${name}`);
    assert.match(css, new RegExp(`@utility voice-${name} \\{\\n  font-family: var\\(--eu-font-${voices[name].face}\\);`), `voice-${name} does not use the ${voices[name].face} face`);
    assert.ok(themeTs.includes(`${name}: {`), `theme.ts lacks the ${name} voice object`);
  }
  assert.match(css, /--eu-voice-terse-tracking: -0\.1px;/, 'terse tracking must be exactly -0.1px in tokens.css');
  assert.equal(voices.terse.tracking, -0.1, 'terse tracking must be exactly -0.1 in src');
  assert.ok(json.includes('"tracking": -0.1'), 'tokens.json lacks terse tracking -0.1');
});

test('weight: 400/500 available, 600 only under a scoped name, 700+ never emitted', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  const themeTs = await readFile(artefactUrl('generated/theme.ts'), 'utf8');
  const json = await readFile(artefactUrl('generated/tokens.json'), 'utf8');

  assert.deepEqual(Object.values(weight), [400, 500, 600]);
  assert.match(css, /--eu-weight-regular: 400;/);
  assert.match(css, /--eu-weight-medium: 500;/);
  assert.match(css, /--eu-weight-emphasis: 600;/);
  // 700 may appear in a doc comment warning against it; it must never appear
  // as an emitted VALUE — a CSS declaration or a JS/JSON property assignment.
  for (const artefact of [css, themeTs, json]) {
    assert.ok(!/[:=]\s*700\b/.test(artefact), 'no artefact may assign a 700 weight value');
  }
});

test('measure utilities: 64ch default, 58ch idea, 44ch argument', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  assert.deepEqual(measure, { default: 64, idea: 58, argument: 44 });
  assert.match(css, /@utility measure \{\n {2}max-inline-size: var\(--eu-measure\);\n\}/);
  assert.match(css, /@utility measure-idea \{\n {2}max-inline-size: var\(--eu-measure-idea\);\n\}/);
  assert.match(
    css,
    /@utility measure-argument \{\n {2}max-inline-size: var\(--eu-measure-argument\);\n\}/,
  );
  assert.match(css, /--eu-measure: 64ch;/);
  assert.match(css, /--eu-measure-idea: 58ch;/);
  assert.match(css, /--eu-measure-argument: 44ch;/);
});

test('every new namespace (fonts, type scale, voices, weight, measure) reaches tokens.json', async () => {
  const json = await readFile(artefactUrl('generated/tokens.json'), 'utf8');
  const parsed: unknown = JSON.parse(json);
  const keys = Object.keys(parsed as Record<string, unknown>);
  for (const key of ['fontStacks', 'typeScale', 'voices', 'weight', 'measure']) {
    assert.ok(keys.includes(key), `tokens.json lacks top-level "${key}"`);
  }
  for (const name of measureNames) {
    assert.ok(json.includes(`"${name}"`), `tokens.json lacks measure name ${name}`);
  }
});

// M0-SH-13 — the D-018 consolidation list: §7.2 breakpoints, §7.1 shell
// columns, the container threshold, the FE-05 interaction literals and
// §7.4's leading-initial. These retire apps/web's local-tokens block.

test('breakpoints: defaults cleared, then 480/780/1180 as literals (query conditions cannot var())', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  assert.deepEqual(breakpoint, { sm: 480, md: 780, lg: 1180 });
  const reset = css.indexOf('--breakpoint-*: initial;');
  assert.ok(reset >= 0, 'tokens.css must clear Tailwind’s default breakpoint scale');
  for (const [name, px] of Object.entries(breakpoint)) {
    const idx = css.indexOf(`--breakpoint-${name}: ${px}px;`);
    assert.ok(idx > reset, `--breakpoint-${name} must be a literal, after the reset`);
  }
  assert.ok(!/--breakpoint-[a-z]+: var\(/.test(css), 'a breakpoint must never be a var() reference');
  assert.match(css, /--container-eu-sm: 480px;/, 'the §7.2 container threshold must be a literal');
  assert.ok(!/--container-eu-sm: var\(/.test(css), 'the container threshold must never be a var() reference');
});

test('shell columns: 236/300/720/640 vars and the four §7.1 utilities', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  assert.deepEqual(shell, { railStart: 236, railEnd: 300, column: 720, columnPrivate: 640 });
  assert.match(css, /--eu-shell-rail-start: 236px;/);
  assert.match(css, /--eu-shell-rail-end: 300px;/);
  assert.match(css, /--eu-shell-column: 720px;/);
  assert.match(css, /--eu-shell-column-private: 640px;/);
  assert.match(
    css,
    /@utility shell-grid-3 \{\n {2}grid-template-columns: var\(--eu-shell-rail-start\) minmax\(0, 1fr\) var\(--eu-shell-rail-end\);\n\}/,
  );
  assert.match(
    css,
    /@utility shell-grid-2 \{\n {2}grid-template-columns: var\(--eu-shell-rail-start\) minmax\(0, 1fr\);\n\}/,
  );
  // Logical properties, like `measure` (§1 "Always").
  assert.match(css, /@utility shell-column \{\n {2}max-inline-size: var\(--eu-shell-column\);\n\}/);
  assert.match(
    css,
    /@utility shell-column-private \{\n {2}max-inline-size: var\(--eu-shell-column-private\);\n\}/,
  );
});

test('shimmer: 1.4s idle loop, opacity-only keyframes — never a gradient', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  assert.equal(shimmerDuration, 1400);
  assert.match(css, /--eu-shimmer-duration: 1\.4s;/);
  assert.match(css, /--animate-shimmer: eu-shimmer var\(--eu-shimmer-duration\) linear infinite;/);
  const keyframes = /@keyframes eu-shimmer \{[\s\S]*?\n {2}\}/.exec(css)?.[0] ?? '';
  assert.notEqual(keyframes, '', 'tokens.css lacks @keyframes eu-shimmer');
  assert.match(keyframes, /opacity: 1;/);
  assert.match(keyframes, /opacity: 0\.5;/);
  assert.ok(!/gradient/i.test(keyframes), 'shimmer keyframes must not animate a gradient');
  assert.ok(!/background/.test(keyframes), 'shimmer keyframes must move opacity only');
});

test('sheet backdrop is §11’s absolute rgb, verbatim, and never theme-relative', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  assert.equal(sheetBackdrop, 'rgb(22 23 26/.32)');
  assert.match(css, /--eu-sheet-backdrop: rgb\(22 23 26\/\.32\);/);
  assert.ok(
    !/--eu-sheet-backdrop: (?:var|color-mix)\(/.test(css),
    'the backdrop must not read ink — it would invert with the theme',
  );
  assert.match(css, /@utility sheet-backdrop \{\n {2}background-color: var\(--eu-sheet-backdrop\);\n\}/);
});

test('tooltip delay 400ms, touch target 44px logical both axes, block-lh 1lh', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  assert.equal(tooltipDelay, 400);
  assert.equal(touchTarget, 44);
  assert.match(css, /--eu-tooltip-delay: 400ms;/);
  assert.match(css, /@utility delay-tooltip \{\n {2}transition-delay: var\(--eu-tooltip-delay\);\n\}/);
  assert.match(css, /--eu-touch-target: 44px;/);
  assert.match(
    css,
    /@utility touch-target \{\n {2}min-inline-size: var\(--eu-touch-target\);\n {2}min-block-size: var\(--eu-touch-target\);\n\}/,
  );
  assert.match(css, /@utility block-lh \{\n {2}block-size: 1lh;\n\}/);
});

test('leading-initial is §7.4’s .85, mapped into Tailwind’s --leading-* namespace', async () => {
  const css = await readFile(artefactUrl('generated/tokens.css'), 'utf8');
  assert.equal(leadingInitial, 0.85);
  assert.match(css, /--eu-leading-initial: 0\.85;/);
  assert.match(css, /--leading-initial: var\(--eu-leading-initial\);/);
});

test('the SH-13 namespaces reach tokens.json and theme.ts', async () => {
  const json = await readFile(artefactUrl('generated/tokens.json'), 'utf8');
  const themeTs = await readFile(artefactUrl('generated/theme.ts'), 'utf8');
  const parsed = JSON.parse(json) as Record<string, unknown>;
  for (const key of [
    'breakpoint',
    'shell',
    'container',
    'leadingInitial',
    'shimmerDuration',
    'tooltipDelay',
    'touchTarget',
    'sheetBackdrop',
  ]) {
    assert.ok(key in parsed, `tokens.json lacks top-level "${key}"`);
    assert.match(themeTs, new RegExp(`export const ${key}[ :=]`), `theme.ts lacks ${key}`);
  }
  assert.equal(parsed.leadingInitial, 0.85);
  assert.equal(parsed.touchTarget, 44);
});
