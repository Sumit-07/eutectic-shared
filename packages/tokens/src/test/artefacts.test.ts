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
import { colors } from '../palette.js';
import { agentInkNames, themeNames } from '../types.js';

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
